/**
 * Service de validation API basé sur le schéma OpenAPI
 * Valide les requêtes et réponses selon les spécifications
 */

// Import conditionnel pour éviter les problèmes avec Node.js
let API_ENDPOINTS = {}
try {
  const apiConfig = await import('./api.config.js')
  API_ENDPOINTS = apiConfig.API_ENDPOINTS || {}
} catch (error) {
  // Fallback si l'import échoue (ex: dans Node.js)
  console.warn('API_ENDPOINTS non disponible, utilisation des définitions locales')
}

class ApiSchemaValidator {
  constructor() {
    this.schemas = new Map()
    this.endpoints = new Map()
    this.loadSchemaDefinitions()
  }

  /**
   * Charge les définitions depuis le schéma OpenAPI
   */
  loadSchemaDefinitions() {
    // Définitions des endpoints avec leurs schémas attendus (extraits du schéma OpenAPI)
    this.endpoints.set('/auth/login/', {
      method: 'POST',
      requestSchema: {
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 1 },
          rememberMe: { type: 'boolean', default: false }
        }
      },
      responseSchema: {
        properties: {
          access: { type: 'string' },
          refresh: { type: 'string' },
          user: { type: 'object' }
        }
      }
    })

    this.endpoints.set('/auth/register/university/', {
      method: 'POST',
      requestSchema: {
        required: [
          'university_name', 'university_city', 'university_country',
          'admin_first_name', 'admin_last_name', 'admin_email', 'admin_password'
        ],
        properties: {
          university_name: { type: 'string', minLength: 1 },
          university_type: { type: 'string', default: 'Université' },
          university_city: { type: 'string', minLength: 1 },
          university_country: { type: 'string', minLength: 1 },
          university_website: { type: 'string', format: 'uri' },
          university_description: { type: 'string' },
          admin_first_name: { type: 'string', minLength: 1 },
          admin_last_name: { type: 'string', minLength: 1 },
          admin_email: { type: 'string', format: 'email' },
          admin_password: { type: 'string', minLength: 8 },
          admin_phone: { type: 'string' }
        }
      }
    })

    this.endpoints.set('/universities/', {
      method: 'GET',
      queryParams: {
        properties: {
          page: { type: 'integer', minimum: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100 },
          search: { type: 'string' },
          country: { type: 'string' },
          city: { type: 'string' },
          status: { type: 'string', enum: ['active', 'inactive'] }
        }
      },
      responseSchema: {
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              count: { type: 'integer' },
              results: { type: 'array' }
            }
          }
        }
      }
    })

    this.endpoints.set('/news/', {
      method: 'GET',
      queryParams: {
        properties: {
          page: { type: 'integer', minimum: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 50 },
          status: { type: 'string', enum: ['draft', 'published', 'archived'] },
          university_id: { type: 'integer' },
          author_id: { type: 'integer' }
        }
      }
    })
  }

  /**
   * Valide une requête avant envoi
   */
  validateRequest(endpoint, method, data = {}) {
    const endpointDef = this.endpoints.get(endpoint)
    
    if (!endpointDef) {
      console.warn(`⚠️ Endpoint non défini dans le schéma: ${method} ${endpoint}`)
      return { valid: true, warnings: [`Endpoint non validé: ${endpoint}`] }
    }

    if (endpointDef.method !== method) {
      return {
        valid: false,
        errors: [`Méthode incorrecte. Attendue: ${endpointDef.method}, reçue: ${method}`]
      }
    }

    const errors = []
    const warnings = []

    // Valider le corps de la requête
    if (endpointDef.requestSchema) {
      const validation = this.validateObject(data, endpointDef.requestSchema)
      errors.push(...validation.errors)
      warnings.push(...validation.warnings)
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Valide une réponse reçue
   */
  validateResponse(endpoint, response) {
    const endpointDef = this.endpoints.get(endpoint)
    
    if (!endpointDef || !endpointDef.responseSchema) {
      return { valid: true, warnings: ['Réponse non validée'] }
    }

    return this.validateObject(response, endpointDef.responseSchema)
  }

  /**
   * Valide un objet contre un schéma
   */
  validateObject(obj, schema) {
    const errors = []
    const warnings = []

    // Vérifier les champs requis
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in obj) || obj[field] === null || obj[field] === undefined) {
          errors.push(`Champ requis manquant: ${field}`)
        }
      }
    }

    // Vérifier les types et formats
    if (schema.properties) {
      for (const [field, fieldSchema] of Object.entries(schema.properties)) {
        if (field in obj) {
          const validation = this.validateField(obj[field], fieldSchema, field)
          errors.push(...validation.errors)
          warnings.push(...validation.warnings)
        }
      }
    }

    return { valid: errors.length === 0, errors, warnings }
  }

  /**
   * Valide un champ individuel
   */
  validateField(value, schema, fieldName) {
    const errors = []
    const warnings = []

    if (value === null || value === undefined) {
      return { errors, warnings }
    }

    // Validation du type
    switch (schema.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push(`${fieldName} doit être une chaîne de caractères`)
          break
        }
        
        // Validation de la longueur minimale
        if (schema.minLength && value.length < schema.minLength) {
          errors.push(`${fieldName} doit contenir au moins ${schema.minLength} caractères`)
        }
        
        // Validation du format email
        if (schema.format === 'email' && !this.isValidEmail(value)) {
          errors.push(`${fieldName} doit être un email valide`)
        }
        
        // Validation du format URI
        if (schema.format === 'uri' && !this.isValidUrl(value)) {
          warnings.push(`${fieldName} ne semble pas être une URL valide`)
        }
        
        // Validation des enum
        if (schema.enum && !schema.enum.includes(value)) {
          errors.push(`${fieldName} doit être l'une des valeurs: ${schema.enum.join(', ')}`)
        }
        break

      case 'integer':
      case 'number':
        if (typeof value !== 'number' || (schema.type === 'integer' && !Number.isInteger(value))) {
          errors.push(`${fieldName} doit être un ${schema.type === 'integer' ? 'entier' : 'nombre'}`)
          break
        }
        
        if (schema.minimum !== undefined && value < schema.minimum) {
          errors.push(`${fieldName} doit être supérieur ou égal à ${schema.minimum}`)
        }
        
        if (schema.maximum !== undefined && value > schema.maximum) {
          errors.push(`${fieldName} doit être inférieur ou égal à ${schema.maximum}`)
        }
        break

      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push(`${fieldName} doit être un booléen`)
        }
        break

      case 'array':
        if (!Array.isArray(value)) {
          errors.push(`${fieldName} doit être un tableau`)
        }
        break

      case 'object':
        if (typeof value !== 'object' || Array.isArray(value)) {
          errors.push(`${fieldName} doit être un objet`)
        }
        break
    }

    return { errors, warnings }
  }

  /**
   * Valide un email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Valide une URL
   */
  isValidUrl(url) {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Obtient les informations d'un endpoint
   */
  getEndpointInfo(endpoint) {
    return this.endpoints.get(endpoint) || null
  }

  /**
   * Liste tous les endpoints disponibles
   */
  getAvailableEndpoints() {
    return Array.from(this.endpoints.keys())
  }
}

// Instance singleton
export const apiSchemaValidator = new ApiSchemaValidator()

// Fonction utilitaire pour valider avant envoi
export function validateApiRequest(endpoint, method, data) {
  const result = apiSchemaValidator.validateRequest(endpoint, method, data)
  
  if (!result.valid) {
    console.error(`❌ Validation échouée pour ${method} ${endpoint}:`, result.errors)
    throw new Error(`Données invalides: ${result.errors.join(', ')}`)
  }
  
  if (result.warnings.length > 0) {
    console.warn(`⚠️ Avertissements pour ${method} ${endpoint}:`, result.warnings)
  }
  
  return result
}

// Fonction utilitaire pour valider les réponses
export function validateApiResponse(endpoint, response) {
  const result = apiSchemaValidator.validateResponse(endpoint, response)
  
  if (!result.valid) {
    console.error(`❌ Réponse invalide pour ${endpoint}:`, result.errors)
  }
  
  if (result.warnings.length > 0) {
    console.warn(`⚠️ Avertissements réponse ${endpoint}:`, result.warnings)
  }
  
  return result
}