#!/usr/bin/env node

/**
 * Script pour synchroniser le schéma OpenAPI depuis le backend
 * Met à jour le fichier api-schema.yaml et regénère les types
 */

import fs from 'fs'
import { execSync } from 'child_process'

const API_BASE_URL = 'https://univers-news-ccc-kabu.onrender.com'
const SCHEMA_FILE = './api-schema.yaml'

async function syncApiSchema() {
  try {
    console.log('🔄 Synchronisation du schéma OpenAPI...')
    
    // Récupérer le schéma depuis l'API
    console.log(`📡 Récupération depuis ${API_BASE_URL}/api/schema/`)
    
    const response = await fetch(`${API_BASE_URL}/api/schema/`)
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`)
    }
    
    const schemaContent = await response.text()
    
    // Sauvegarder le schéma
    fs.writeFileSync(SCHEMA_FILE, schemaContent)
    console.log(`✅ Schéma sauvegardé dans ${SCHEMA_FILE}`)
    
    // Vérifier si le schéma a changé
    try {
      const gitDiff = execSync(`git diff --name-only ${SCHEMA_FILE}`, { encoding: 'utf8' })
      if (gitDiff.trim()) {
        console.log('🔍 Changements détectés dans le schéma')
        
        // Regénérer les types automatiquement
        try {
          console.log('🔄 Régénération des types TypeScript...')
          execSync('npm run generate:api-types', { stdio: 'inherit' })
          console.log('✅ Types mis à jour')
        } catch (error) {
          console.warn('⚠️ Erreur lors de la génération des types:', error.message)
        }
      } else {
        console.log('✅ Aucun changement dans le schéma')
      }
    } catch (error) {
      // Git non disponible ou pas un dépôt git
      console.log('ℹ️ Impossible de vérifier les changements (git non disponible)')
    }
    
    // Afficher un résumé
    const lines = schemaContent.split('\n').length
    const endpointsCount = (schemaContent.match(/^\s+\/api\/v1\/.*:$/gm) || []).length
    
    console.log(`📊 Résumé du schéma:`)
    console.log(`   - ${lines} lignes`)
    console.log(`   - ${endpointsCount} endpoints`)
    
    console.log('🎉 Synchronisation terminée avec succès!')
    
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error.message)
    
    if (error.message.includes('fetch')) {
      console.log('💡 Vérifiez que l\'API est accessible et que l\'URL est correcte')
    }
    
    process.exit(1)
  }
}

// Options de ligne de commande
const args = process.argv.slice(2)
const isWatchMode = args.includes('--watch') || args.includes('-w')
const showHelp = args.includes('--help') || args.includes('-h')

if (showHelp) {
  console.log(`
Usage: node sync-api-schema.js [options]

Options:
  --watch, -w    Mode surveillance (sync toutes les 5 minutes)
  --help, -h     Afficher cette aide

Examples:
  node sync-api-schema.js           # Sync une fois
  node sync-api-schema.js --watch   # Sync en continu
`)
  process.exit(0)
}

if (isWatchMode) {
  console.log('👀 Mode surveillance activé (sync toutes les 5 minutes)')
  console.log('Appuyez sur Ctrl+C pour arrêter')
  
  // Sync initial
  await syncApiSchema()
  
  // Sync périodique
  setInterval(async () => {
    console.log('\n' + '='.repeat(50))
    console.log(new Date().toLocaleTimeString() + ' - Synchronisation automatique...')
    await syncApiSchema()
  }, 5 * 60 * 1000) // 5 minutes
  
} else {
  // Sync une seule fois
  await syncApiSchema()
}