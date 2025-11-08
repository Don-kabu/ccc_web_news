import { httpService } from './http.service.js'
import { API_ENDPOINTS, createApiResponse, API_RESPONSE_TYPES } from './api.config.js'

// Service de gestion des universités
class UniversityService {
  constructor() {
    this.cache = new Map()
    this.cacheTimeout = 10 * 60 * 1000 // 10 minutes pour les universités
  }

  // Obtenir la liste des universités avec filtres et pagination
  async getUniversities(params = {}) {
    try {
      console.log('📡 getUniversities() appelé avec params:', params)
      const response = await httpService.get(API_ENDPOINTS.UNIVERSITIES.BASE, params)
      console.log('📡 getUniversities() réponse:', response)
      return response
    } catch (error) {
      console.error('❌ Erreur lors du chargement des universités:', error)
      throw error
    }
  }

  // Obtenir une université par ID
  async getUniversityById(id) {
    try {
      const response = await httpService.get(API_ENDPOINTS.UNIVERSITIES.BY_ID(id))
      return response
    } catch (error) {
      console.error('Erreur lors du chargement de l\'université:', error)
      throw error
    }
  }

  // Créer une nouvelle université
  async createUniversity(universityData) {
    try {
      const response = await httpService.post(API_ENDPOINTS.UNIVERSITIES.BASE, universityData)
      
      // Invalider le cache après création
      this.clearCache()
      
      return response
    } catch (error) {
      console.error('Erreur lors de la création de l\'université:', error)
      throw error
    }
  }

  // Obtenir les statistiques d'une université
  async getUniversityStatistics(id) {
    try {
      const response = await httpService.get(API_ENDPOINTS.UNIVERSITIES.STATISTICS(id))
      return response
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques de l\'université:', error)
      throw error
    }
  }

  // Cache management
  clearCache() {
    this.cache.clear()
  }

  // Fonction de test pour vérifier les headers d'authentification
  async testAuthHeaders() {
    try {
      console.log('🧪 Test des headers d\'authentification...')
      
      // Vérifier le token dans localStorage
      const token = localStorage.getItem('ccc_access_token')
      console.log('🔑 Token dans localStorage:', {
        exists: !!token,
        length: token ? token.length : 0,
        preview: token ? token.substring(0, 30) + '...' : 'Aucun token'
      })
      
      // Tester un appel simple
      const response = await this.getUniversities({ limit: 1 })
      console.log('✅ Test réussi - Réponse:', response)
      
      return response
    } catch (error) {
      console.error('❌ Test échoué:', error)
      
      if (error.status === 401) {
        console.log('🚨 Erreur 401 - Token invalide ou manquant dans les headers')
      }
      
      throw error
    }
  }

  getCacheKey(method, params = {}) {
    return `${method}_${JSON.stringify(params)}`
  }

  getCachedData(key) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }
    return null
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }
}

export const universityService = new UniversityService()