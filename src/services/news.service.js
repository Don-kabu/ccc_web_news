import { httpService } from './http.service.js'
import { API_ENDPOINTS, createApiResponse, API_RESPONSE_TYPES } from './api.config.js'

// Service de gestion des actualités
class NewsService {
  constructor() {
    this.cache = new Map()
    this.cacheTimeout = 5 * 60 * 1000 // 5 minutes
  }

    // Obtenir toutes les actualités avec filtres
  async getNews(params = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status = null,
        category = null,
        university_id = null,
        author_id = null,
        search = null,
        date_from = null,
        date_to = null,
        featured = null,
        sort_by = null,
        sort_order = null
      } = params

      // Construire les paramètres de façon plus conservative
      const queryParams = {}
      
      // Paramètres de base toujours inclus
      if (page > 1) queryParams.page = page  // Éviter page=1 par défaut
      if (limit !== 10) queryParams.limit = limit  // Éviter limit=10 par défaut
      
      // Ajouter les filtres seulement s'ils sont spécifiés
      if (status) queryParams.status = status
      if (category) queryParams.category = category
      if (university_id) queryParams.university_id = university_id
      if (author_id) queryParams.author_id = author_id
      if (search) queryParams.search = search
      if (date_from) queryParams.date_from = date_from
      if (date_to) queryParams.date_to = date_to
      if (featured !== null) queryParams.featured = featured
      if (sort_by) queryParams.sort_by = sort_by
      if (sort_order) queryParams.sort_order = sort_order

      console.log('📰 Paramètres API news:', queryParams)
      
      const response = await httpService.get(API_ENDPOINTS.NEWS.BASE, queryParams)
      return response
    } catch (error) {
      console.error('Erreur lors du chargement des actualités:', error)
      
      // Retourner une structure de fallback plutôt que de lever l'exception
      return {
        success: false,
        error: error.message,
        data: [],
        message: 'Impossible de charger les actualités depuis l\'API'
      }
    }
  }

  // Obtenir une actualité par son ID
  async getNewsById(id) {
    try {
      // Vérifier le cache
      const cacheKey = `news_${id}`
      const cached = this.cache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }

      const response = await httpService.get(API_ENDPOINTS.NEWS.BY_ID(id))
      
      // Mettre en cache
      this.cache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      })

      return response
    } catch (error) {
      console.error('Erreur lors du chargement de l\'actualité:', error)
      throw error
    }
  }

  // Créer une nouvelle actualité
  async createNews(newsData) {
    try {
      const response = await httpService.post(API_ENDPOINTS.NEWS.CREATE, {
        title: newsData.title,
        excerpt: newsData.excerpt,
        content: newsData.content,
        importance: newsData.importance,
        category: newsData.category,
        tags: newsData.tags || [],
        publish_now: newsData.publish_now || false,
        scheduled_at: newsData.scheduled_at || new Date().toISOString()
      })

      if (response.success) {
        // Invalider le cache des listes
        this.invalidateListCache()
        
        // Émettre un événement pour notifier la création
        window.dispatchEvent(new CustomEvent('news:created', {
          detail: { news: response.data }
        }))
      }

      return response
    } catch (error) {
      console.error('Erreur lors de la création de l\'actualité:', error)
      throw error
    }
  }

  // Mettre à jour une actualité
  async updateNews(id, updates) {
    try {
      const response = await httpService.put(API_ENDPOINTS.NEWS.UPDATE(id), updates)

      if (response.success) {
        // Invalider le cache
        this.cache.delete(`news_${id}`)
        this.invalidateListCache()
        
        // Émettre un événement pour notifier la mise à jour
        window.dispatchEvent(new CustomEvent('news:updated', {
          detail: { news: response.data }
        }))
      }

      return response
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'actualité:', error)
      throw error
    }
  }

  // Supprimer une actualité
  async deleteNews(id) {
    try {
      const response = await httpService.delete(API_ENDPOINTS.NEWS.DELETE(id))

      if (response.success) {
        // Invalider le cache
        this.cache.delete(`news_${id}`)
        this.invalidateListCache()
        
        // Émettre un événement pour notifier la suppression
        window.dispatchEvent(new CustomEvent('news:deleted', {
          detail: { newsId: id }
        }))
      }

      return response
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'actualité:', error)
      throw error
    }
  }

  // Publier une actualité (changer le statut vers 'approved')
  async publishNews(id) {
    try {
      const response = await httpService.patch(
        API_ENDPOINTS.NEWS.PUBLISH.replace(':id', id)
      )

      if (response.status === API_RESPONSE_TYPES.SUCCESS) {
        // Invalider le cache
        this.cache.delete(`news_${id}`)
        this.invalidateListCache()
        
        // Émettre un événement pour notifier la publication
        window.dispatchEvent(new CustomEvent('news:published', {
          detail: { news: response.data }
        }))
      }

      return response
    } catch (error) {
      console.error('Erreur lors de la publication de l\'actualité:', error)
      throw error
    }
  }

  // Dépublier une actualité (changer le statut vers 'draft')
  async unpublishNews(id) {
    try {
      const response = await httpService.patch(
        API_ENDPOINTS.NEWS.UNPUBLISH.replace(':id', id)
      )

      if (response.status === API_RESPONSE_TYPES.SUCCESS) {
        // Invalider le cache
        this.cache.delete(`news_${id}`)
        this.invalidateListCache()
        
        // Émettre un événement pour notifier la dépublication
        window.dispatchEvent(new CustomEvent('news:unpublished', {
          detail: { news: response.data }
        }))
      }

      return response
    } catch (error) {
      console.error('Erreur lors de la dépublication de l\'actualité:', error)
      throw error
    }
  }

  // Mettre une actualité en vedette
  async featureNews(id, featured = true) {
    try {
      const response = await httpService.patch(
        API_ENDPOINTS.NEWS.FEATURE.replace(':id', id),
        { featured }
      )

      if (response.status === API_RESPONSE_TYPES.SUCCESS) {
        // Invalider le cache
        this.cache.delete(`news_${id}`)
        this.invalidateListCache()
        
        // Émettre un événement pour notifier le changement
        window.dispatchEvent(new CustomEvent('news:featured', {
          detail: { news: response.data, featured }
        }))
      }

      return response
    } catch (error) {
      console.error('Erreur lors de la mise en vedette de l\'actualité:', error)
      throw error
    }
  }

  // Obtenir les actualités en vedette
  async getFeaturedNews(limit = 5) {
    try {
      const response = await httpService.get(API_ENDPOINTS.NEWS.FEATURED, {
        limit
      })
      return response
    } catch (error) {
      console.error('Erreur lors du chargement des actualités en vedette:', error)
      throw error
    }
  }

  // Obtenir les actualités récentes
  async getRecentNews(limit = 10) {
    try {
      const response = await httpService.get(API_ENDPOINTS.NEWS.RECENT, {
        limit
      })
      return response
    } catch (error) {
      console.error('Erreur lors du chargement des actualités récentes:', error)
      throw error
    }
  }

  // Obtenir les catégories d'actualités
  async getCategories() {
    try {
      const cacheKey = 'news_categories'
      const cached = this.cache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }

      const response = await httpService.get(API_ENDPOINTS.NEWS.CATEGORIES)
      
      // Mettre en cache
      this.cache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      })

      return response
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
      throw error
    }
  }

  // Obtenir les tags populaires
  async getPopularTags(limit = 20) {
    try {
      const response = await httpService.get(API_ENDPOINTS.NEWS.TAGS, {
        limit
      })
      return response
    } catch (error) {
      console.error('Erreur lors du chargement des tags:', error)
      throw error
    }
  }

  // Rechercher des actualités
  async searchNews(query, filters = {}) {
    try {
      const params = {
        search: query,
        ...filters
      }

      const response = await httpService.get(API_ENDPOINTS.NEWS.SEARCH, params)
      return response
    } catch (error) {
      console.error('Erreur lors de la recherche d\'actualités:', error)
      throw error
    }
  }

  // Obtenir les statistiques des actualités
  async getNewsStats(params = {}) {
    try {
      const response = await httpService.get(API_ENDPOINTS.NEWS.STATS, params)
      return response
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
      throw error
    }
  }

  // Upload d'image pour une actualité
  async uploadNewsImage(file, onProgress = null) {
    try {
      const response = await httpService.uploadFile(
        API_ENDPOINTS.MEDIA.UPLOAD_NEWS_IMAGE,
        file,
        onProgress
      )
      return response
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'image:', error)
      throw error
    }
  }

  // Mettre à jour le statut d'une actualité (pour la modération)
  async updateNewsStatus(id, statusData) {
    try {
      // Utiliser l'endpoint de statut de l'API
      const response = await httpService.put(API_ENDPOINTS.NEWS.STATUS(id), statusData)
      
      if (response.success) {
        // Invalider le cache
        this.cache.delete(`news_${id}`)
        this.invalidateListCache()
        
        // Émettre un événement pour notifier la mise à jour
        window.dispatchEvent(new CustomEvent('news:status_updated', {
          detail: { newsId: id, status: statusData.status }
        }))
      }

      return response
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
      throw error
    }
  }

  // Méthodes spécialisées pour la modération
  async approveArticle(id, comment = '') {
    return this.updateNewsStatus(id, {
      status: 'PUBLISHED',
      comment,
      moderated_by: 'current_user', // Sera défini côté API
      moderated_at: new Date().toISOString()
    })
  }

  async rejectArticle(id, reason) {
    return this.updateNewsStatus(id, {
      status: 'REJECTED',
      comment: reason,
      moderated_by: 'current_user', // Sera défini côté API
      moderated_at: new Date().toISOString()
    })
  }

  async requestChanges(id, feedback) {
    return this.updateNewsStatus(id, {
      status: 'NEEDS_REVISION',
      comment: feedback,
      moderated_by: 'current_user', // Sera défini côté API
      moderated_at: new Date().toISOString()
    })
  }

  async archiveArticle(id, reason = '') {
    return this.updateNewsStatus(id, {
      status: 'ARCHIVED',
      comment: reason,
      moderated_by: 'current_user', // Sera défini côté API
      moderated_at: new Date().toISOString()
    })
  }

  // Récupérer l'historique des modifications de statut
  async getStatusHistory(id) {
    try {
      const response = await httpService.get(`${API_ENDPOINTS.NEWS.STATUS(id)}history/`)
      return response
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error)
      throw error
    }
  }

  // Récupérer les articles par statut pour la modération
  async getArticlesByStatus(status, filters = {}) {
    try {
      const params = {
        status,
        ...filters
      }
      
      const response = await httpService.get(API_ENDPOINTS.NEWS.BASE, params)
      return response
    } catch (error) {
      console.error('Erreur lors de la récupération des articles par statut:', error)
      throw error
    }
  }

  // Invalider le cache des listes
  invalidateListCache() {
    for (const key of this.cache.keys()) {
      if (key.startsWith('news_list_') || key === 'news_categories') {
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

  // Enregistrer qu'un utilisateur a vu une actualité (pour les analytics)
  async recordNewsView(id) {
    try {
      const response = await httpService.post(API_ENDPOINTS.NEWS.VIEW(id))
      return response
    } catch (error) {
      // Ne pas faire échouer l'affichage de l'article si l'enregistrement de vue échoue
      console.warn('Erreur lors de l\'enregistrement de la vue:', error)
      return { success: false, error: error.message }
    }
  }

  // Vider tout le cache
  clearCache() {
    this.cache.clear()
  }
}

// Instance singleton du service news
export const newsService = new NewsService()

// Nettoyer le cache périodiquement
setInterval(() => {
  newsService.cleanExpiredCache()
}, 60000) // Chaque minute