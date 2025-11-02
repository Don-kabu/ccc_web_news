import { httpService } from './http.service.js'
import { API_ENDPOINTS, createApiResponse, API_RESPONSE_TYPES } from './api.config.js'

// Service de gestion des universités
class UniversityService {
  constructor() {
    this.cache = new Map()
    this.cacheTimeout = 15 * 60 * 1000 // 15 minutes (les universités changent rarement)
  }

  // Obtenir la liste des universités avec filtres et pagination
  async getUniversities(params = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        search = null,
        country = null,
        city = null,
        status = 'active',
        sort_by = 'name',
        sort_order = 'asc'
      } = params

      // Créer une clé de cache basée sur les paramètres
      const cacheKey = `universities_${JSON.stringify(params)}`
      const cached = this.cache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }

      const queryParams = {
        page,
        limit,
        sort_by,
        sort_order
      }

      // Ajouter les filtres optionnels
      if (search) queryParams.search = search
      if (country) queryParams.country = country
      if (city) queryParams.city = city
      if (status) queryParams.status = status

      const response = await httpService.get(API_ENDPOINTS.UNIVERSITIES.LIST, queryParams)
      
      // Mettre en cache
      this.cache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      })

      return response
    } catch (error) {
      console.error('Erreur lors du chargement des universités:', error)
      throw error
    }
  }

  // Obtenir une université par son ID
  async getUniversityById(id) {
    try {
      // Vérifier le cache
      const cacheKey = `university_${id}`
      const cached = this.cache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }

      const response = await httpService.get(API_ENDPOINTS.UNIVERSITIES.GET_BY_ID.replace(':id', id))
      
      // Mettre en cache
      this.cache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      })

      return response
    } catch (error) {
      console.error('Erreur lors du chargement de l\'université:', error)
      throw error
    }
  }

  // Créer une nouvelle université
  async createUniversity(universityData) {
    try {
      const response = await httpService.post(API_ENDPOINTS.UNIVERSITIES.CREATE, {
        name: universityData.name,
        acronym: universityData.acronym,
        description: universityData.description,
        website: universityData.website,
        email: universityData.email,
        phone: universityData.phone,
        address: universityData.address,
        city: universityData.city,
        country: universityData.country,
        postal_code: universityData.postal_code,
        logo_url: universityData.logo_url,
        banner_url: universityData.banner_url,
        founded_year: universityData.founded_year
      })

      if (response.status === API_RESPONSE_TYPES.SUCCESS) {
        // Invalider le cache des listes
        this.invalidateListCache()
        
        // Émettre un événement pour notifier la création
        window.dispatchEvent(new CustomEvent('university:created', {
          detail: { university: response.data }
        }))
      }

      return response
    } catch (error) {
      console.error('Erreur lors de la création de l\'université:', error)
      throw error
    }
  }

  // Mettre à jour une université
  async updateUniversity(id, updates) {
    try {
      const response = await httpService.put(
        API_ENDPOINTS.UNIVERSITIES.UPDATE.replace(':id', id),
        updates
      )

      if (response.status === API_RESPONSE_TYPES.SUCCESS) {
        // Invalider le cache
        this.cache.delete(`university_${id}`)
        this.invalidateListCache()
        
        // Émettre un événement pour notifier la mise à jour
        window.dispatchEvent(new CustomEvent('university:updated', {
          detail: { university: response.data }
        }))
      }

      return response
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'université:', error)
      throw error
    }
  }

  // Supprimer une université
  async deleteUniversity(id) {
    try {
      const response = await httpService.delete(
        API_ENDPOINTS.UNIVERSITIES.DELETE.replace(':id', id)
      )

      if (response.status === API_RESPONSE_TYPES.SUCCESS) {
        // Invalider le cache
        this.cache.delete(`university_${id}`)
        this.invalidateListCache()
        
        // Émettre un événement pour notifier la suppression
        window.dispatchEvent(new CustomEvent('university:deleted', {
          detail: { universityId: id }
        }))
      }

      return response
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'université:', error)
      throw error
    }
  }

  // Activer/désactiver une université
  async toggleUniversityStatus(id, active = true) {
    try {
      const endpoint = active 
        ? API_ENDPOINTS.UNIVERSITIES.ACTIVATE.replace(':id', id)
        : API_ENDPOINTS.UNIVERSITIES.DEACTIVATE.replace(':id', id)

      const response = await httpService.patch(endpoint)

      if (response.status === API_RESPONSE_TYPES.SUCCESS) {
        // Invalider le cache
        this.cache.delete(`university_${id}`)
        this.invalidateListCache()
        
        // Émettre un événement pour notifier le changement de statut
        window.dispatchEvent(new CustomEvent('university:status_changed', {
          detail: { universityId: id, active }
        }))
      }

      return response
    } catch (error) {
      console.error('Erreur lors du changement de statut de l\'université:', error)
      throw error
    }
  }

  // Obtenir les statistiques d'une université
  async getUniversityStats(id) {
    try {
      const response = await httpService.get(
        API_ENDPOINTS.UNIVERSITIES.STATS.replace(':id', id)
      )
      return response
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques de l\'université:', error)
      throw error
    }
  }

  // Obtenir les membres d'une université
  async getUniversityMembers(id, params = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        role = null,
        search = null
      } = params

      const queryParams = {
        page,
        limit
      }

      if (role) queryParams.role = role
      if (search) queryParams.search = search

      const response = await httpService.get(
        API_ENDPOINTS.UNIVERSITIES.MEMBERS.replace(':id', id),
        queryParams
      )
      return response
    } catch (error) {
      console.error('Erreur lors du chargement des membres de l\'université:', error)
      throw error
    }
  }

  // Obtenir les actualités d'une université
  async getUniversityNews(id, params = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status = 'approved'
      } = params

      const queryParams = {
        page,
        limit,
        status
      }

      const response = await httpService.get(
        API_ENDPOINTS.UNIVERSITIES.NEWS.replace(':id', id),
        queryParams
      )
      return response
    } catch (error) {
      console.error('Erreur lors du chargement des actualités de l\'université:', error)
      throw error
    }
  }

  // Rechercher des universités
  async searchUniversities(query, filters = {}) {
    try {
      const params = {
        search: query,
        ...filters
      }

      const response = await httpService.get(API_ENDPOINTS.UNIVERSITIES.SEARCH, params)
      return response
    } catch (error) {
      console.error('Erreur lors de la recherche d\'universités:', error)
      throw error
    }
  }

  // Obtenir les pays avec des universités
  async getCountries() {
    try {
      const cacheKey = 'university_countries'
      const cached = this.cache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }

      const response = await httpService.get(API_ENDPOINTS.UNIVERSITIES.COUNTRIES)
      
      // Mettre en cache
      this.cache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      })

      return response
    } catch (error) {
      console.error('Erreur lors du chargement des pays:', error)
      throw error
    }
  }

  // Obtenir les villes avec des universités pour un pays donné
  async getCitiesByCountry(country) {
    try {
      const cacheKey = `university_cities_${country}`
      const cached = this.cache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }

      const response = await httpService.get(API_ENDPOINTS.UNIVERSITIES.CITIES, {
        country
      })
      
      // Mettre en cache
      this.cache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      })

      return response
    } catch (error) {
      console.error('Erreur lors du chargement des villes:', error)
      throw error
    }
  }

  // Upload de logo d'université
  async uploadUniversityLogo(universityId, file, onProgress = null) {
    try {
      const response = await httpService.uploadFile(
        API_ENDPOINTS.MEDIA.UPLOAD_UNIVERSITY_LOGO.replace(':id', universityId),
        file,
        onProgress
      )

      if (response.status === API_RESPONSE_TYPES.SUCCESS) {
        // Invalider le cache de l'université
        this.cache.delete(`university_${universityId}`)
        
        // Émettre un événement pour notifier l'upload
        window.dispatchEvent(new CustomEvent('university:logo_uploaded', {
          detail: { universityId, logoUrl: response.data.url }
        }))
      }

      return response
    } catch (error) {
      console.error('Erreur lors de l\'upload du logo:', error)
      throw error
    }
  }

  // Upload de bannière d'université
  async uploadUniversityBanner(universityId, file, onProgress = null) {
    try {
      const response = await httpService.uploadFile(
        API_ENDPOINTS.MEDIA.UPLOAD_UNIVERSITY_BANNER.replace(':id', universityId),
        file,
        onProgress
      )

      if (response.status === API_RESPONSE_TYPES.SUCCESS) {
        // Invalider le cache de l'université
        this.cache.delete(`university_${universityId}`)
        
        // Émettre un événement pour notifier l'upload
        window.dispatchEvent(new CustomEvent('university:banner_uploaded', {
          detail: { universityId, bannerUrl: response.data.url }
        }))
      }

      return response
    } catch (error) {
      console.error('Erreur lors de l\'upload de la bannière:', error)
      throw error
    }
  }

  // Vérifier si un nom/acronyme d'université est disponible
  async checkAvailability(name = null, acronym = null, excludeId = null) {
    try {
      const params = {}
      if (name) params.name = name
      if (acronym) params.acronym = acronym
      if (excludeId) params.exclude_id = excludeId

      const response = await httpService.get(API_ENDPOINTS.UNIVERSITIES.CHECK_AVAILABILITY, params)
      return response
    } catch (error) {
      console.error('Erreur lors de la vérification de disponibilité:', error)
      throw error
    }
  }

  // Obtenir les universités populaires
  async getPopularUniversities(limit = 10) {
    try {
      const cacheKey = `popular_universities_${limit}`
      const cached = this.cache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }

      const response = await httpService.get(API_ENDPOINTS.UNIVERSITIES.POPULAR, {
        limit
      })
      
      // Mettre en cache
      this.cache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      })

      return response
    } catch (error) {
      console.error('Erreur lors du chargement des universités populaires:', error)
      throw error
    }
  }

  // Invalider le cache des listes
  invalidateListCache() {
    for (const key of this.cache.keys()) {
      if (key.startsWith('universities_') || key.includes('university_countries') || key.includes('university_cities') || key.includes('popular_universities')) {
        this.cache.delete(key)
      }
    }
  }

  // Nettoyer le cache expiré
  cleanExpiredCache() {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key)
      }
    }
  }

  // Vider tout le cache
  clearCache() {
    this.cache.clear()
  }
}

// Instance singleton du service universités
export const universityService = new UniversityService()

// Nettoyer le cache périodiquement
setInterval(() => {
  universityService.cleanExpiredCache()
}, 60000) // Chaque minute