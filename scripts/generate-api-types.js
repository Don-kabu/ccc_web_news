#!/usr/bin/env node

/**
 * Générateur de types TypeScript basé sur le schéma OpenAPI
 * Utilise le fichier api-schema.yaml pour générer des types et interfaces
 */

import fs from 'fs'
import yaml from 'js-yaml'
import path from 'path'

const SCHEMA_FILE = './api-schema.yaml'
const OUTPUT_DIR = './src/types'
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'api.types.ts')

/**
 * Convertit un type OpenAPI en type TypeScript
 */
function convertType(property) {
  if (!property) return 'any'
  
  const { type, format, items, $ref } = property
  
  if ($ref) {
    // Référence vers un autre schéma
    const refName = $ref.split('/').pop()
    return refName
  }
  
  switch (type) {
    case 'string':
      if (format === 'date-time') return 'string' // ISO date string
      if (format === 'email') return 'string'
      if (format === 'uri') return 'string'
      return 'string'
    
    case 'number':
    case 'integer':
      return 'number'
    
    case 'boolean':
      return 'boolean'
    
    case 'array':
      if (items) {
        const itemType = convertType(items)
        return `${itemType}[]`
      }
      return 'any[]'
    
    case 'object':
      return 'Record<string, any>'
    
    default:
      return 'any'
  }
}

/**
 * Génère une interface TypeScript à partir d'un schéma
 */
function generateInterface(name, schema) {
  const { properties, required = [] } = schema
  
  if (!properties) return ''
  
  let interfaceCode = `export interface ${name} {\n`
  
  for (const [propName, propSchema] of Object.entries(properties)) {
    const isRequired = required.includes(propName)
    const optional = isRequired ? '' : '?'
    const type = convertType(propSchema)
    const description = propSchema.description ? `  /** ${propSchema.description} */\n` : ''
    
    interfaceCode += description
    interfaceCode += `  ${propName}${optional}: ${type}\n`
  }
  
  interfaceCode += '}\n\n'
  return interfaceCode
}

/**
 * Génère les types d'endpoints API
 */
function generateEndpointTypes(paths) {
  let endpointCode = `// API Endpoints\nexport const API_ENDPOINTS = {\n`
  
  for (const [path, methods] of Object.entries(paths)) {
    // Convertir le chemin en nom de constante
    const endpointName = path
      .replace('/api/v1/', '')
      .replace(/[{}]/g, '')
      .replace(/\//g, '_')
      .replace(/-/g, '_')
      .toUpperCase()
    
    endpointCode += `  ${endpointName}: '${path}',\n`
  }
  
  endpointCode += '} as const\n\n'
  return endpointCode
}

/**
 * Génère les types de réponse API
 */
function generateResponseTypes(paths) {
  let responseCode = `// API Response Types\n`
  
  const responseTypes = new Set()
  
  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, methodSpec] of Object.entries(methods)) {
      if (methodSpec.responses) {
        for (const [statusCode, response] of Object.entries(methodSpec.responses)) {
          if (response.content && response.content['application/json']) {
            const schema = response.content['application/json'].schema
            if (schema && schema.$ref) {
              const typeName = schema.$ref.split('/').pop()
              responseTypes.add(typeName)
            }
          }
        }
      }
    }
  }
  
  return responseCode
}

/**
 * Fonction principale
 */
async function generateApiTypes() {
  try {
    // Lire le schéma OpenAPI
    const schemaContent = fs.readFileSync(SCHEMA_FILE, 'utf8')
    const schema = yaml.load(schemaContent)
    
    // Créer le dossier de sortie s'il n'existe pas
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    }
    
    let outputCode = `/**
 * Types TypeScript générés automatiquement depuis le schéma OpenAPI
 * Generated from: ${SCHEMA_FILE}
 * Date: ${new Date().toISOString()}
 */

`
    
    // Générer les interfaces depuis les composants/schémas
    if (schema.components && schema.components.schemas) {
      outputCode += `// Generated Interfaces\n`
      
      for (const [schemaName, schemaSpec] of Object.entries(schema.components.schemas)) {
        outputCode += generateInterface(schemaName, schemaSpec)
      }
    }
    
    // Générer les types d'endpoints
    if (schema.paths) {
      outputCode += generateEndpointTypes(schema.paths)
      outputCode += generateResponseTypes(schema.paths)
    }
    
    // Types utilitaires
    outputCode += `
// Utility Types
export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  timestamp?: string
}

export type PaginatedResponse<T = any> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type RequestConfig = {
  method?: ApiMethod
  headers?: Record<string, string>
  params?: Record<string, any>
  data?: any
}
`
    
    // Écrire le fichier
    fs.writeFileSync(OUTPUT_FILE, outputCode)
    
    console.log(`✅ Types générés avec succès dans ${OUTPUT_FILE}`)
    console.log(`📄 Schémas trouvés: ${schema.components?.schemas ? Object.keys(schema.components.schemas).length : 0}`)
    console.log(`🛣️  Endpoints trouvés: ${schema.paths ? Object.keys(schema.paths).length : 0}`)
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération des types:', error.message)
    process.exit(1)
  }
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  generateApiTypes()
}

export { generateApiTypes }