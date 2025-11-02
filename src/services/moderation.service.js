import { httpService } from './http.service.js'
import { API_ENDPOINTS, createApiResponse, API_RESPONSE_TYPES } from './api.config.js'

// Service de modération
class ModerationService {
  constructor() {
    this.cache = new Map()
    this.cacheTimeout = 2 * 60 * 1000 // 2 minutes (les données de modération changent souvent)
  }

  // Obtenir les éléments en attente de modération
  async getPendingItems(params = {}) {
    try {
      const {
        type = 'all', // 'news', 'comments', 'users', 'all'
        page = 1,
        limit = 20,
        priority = null,
        assigned_to = null,
        sort_by = 'created_at',
        sort_order = 'desc'
      } = params

      const queryParams = {
        type,
        page,
        limit,
        sort_by,
        sort_order
      }

      if (priority) queryParams.priority = priority
      if (assigned_to) queryParams.assigned_to = assigned_to

      const response = await httpService.get(API_ENDPOINTS.MODERATION.PENDING, queryParams)
      return response
    } catch (error) {
      console.error('Erreur lors du chargement des éléments en modération:', error)
      throw error
    }
  }

  // Obtenir l'historique de modération
  async getModerationHistory(params = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        moderator_id = null,
        action = null,
        item_type = null,
        date_from = null,
        date_to = null
      } = params

      const queryParams = {
        page,
        limit
      }

      if (moderator_id) queryParams.moderator_id = moderator_id
      if (action) queryParams.action = action
      if (item_type) queryParams.item_type = item_type
      if (date_from) queryParams.date_from = date_from
      if (date_to) queryParams.date_to = date_to

      const response = await httpService.get(API_ENDPOINTS.MODERATION.HISTORY, queryParams)
      return response
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique de modération:', error)
      throw error
    }
  }

  // Approuver un élément
  async approveItem(itemType, itemId, reason = null) {
    try {
      const response = await httpService.post(API_ENDPOINTS.MODERATION.APPROVE, {
        item_type: itemType,
        item_id: itemId,
        reason
      })

      if (response.status === API_RESPONSE_TYPES.SUCCESS) {
        // Invalider le cache
        this.invalidateCache()
        
        // Émettre un événement pour notifier l'approbation
        window.dispatchEvent(new CustomEvent('moderation:approved', {
          detail: { itemType, itemId, reason }
        }))
      }

      return response
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error)
      throw error
    }
  }

  // Rejeter un élément
  async rejectItem(itemType, itemId, reason) {
    try {
      const response = await httpService.post(API_ENDPOINTS.MODERATION.REJECT, {
        item_type: itemType,
        item_id: itemId,
        reason
      })

      if (response.status === API_RESPONSE_TYPES.SUCCESS) {
        // Invalider le cache
        this.invalidateCache()
        
        // Émettre un événement pour notifier le rejet
        window.dispatchEvent(new CustomEvent('moderation:rejected', {
          detail: { itemType, itemId, reason }
        }))
      }

      return response
    } catch (error) {
      console.error('Erreur lors du rejet:', error)
      throw error
    }
  }

  // Assigner un élément à un modérateur
  async assignItem(itemType, itemId, moderatorId) {
    try {
      const response = await httpService.post(API_ENDPOINTS.MODERATION.ASSIGN, {
        item_type: itemType,
        item_id: itemId,
        moderator_id: moderatorId
      })

      if (response.status === API_RESPONSE_TYPES.SUCCESS) {
        // Invalider le cache
        this.invalidateCache()
        
        // Émettre un événement pour notifier l'assignation
        window.dispatchEvent(new CustomEvent('moderation:assigned', {
          detail: { itemType, itemId, moderatorId }
        }))
      }

      return response
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error)
      throw error
    }
  }

  // Escalader un élément vers un niveau supérieur
  async escalateItem(itemType, itemId, reason) {
    try {
      const response = await httpService.post(API_ENDPOINTS.MODERATION.ESCALATE, {
        item_type: itemType,
        item_id: itemId,
        reason
      })

      if (response.status === API_RESPONSE_TYPES.SUCCESS) {
        // Invalider le cache
        this.invalidateCache()
        
        // Émettre un événement pour notifier l'escalade
        window.dispatchEvent(new CustomEvent('moderation:escalated', {
          detail: { itemType, itemId, reason }
        }))
      }

      return response
    } catch (error) {
      console.error('Erreur lors de l\'escalade:', error)
      throw error
    }
  }

  // Signaler un contenu
  async reportContent(contentType, contentId, reason, description = null) {
    try {
      const response = await httpService.post(API_ENDPOINTS.MODERATION.REPORT, {
        content_type: contentType,
        content_id: contentId,
        reason,
        description
      })

      if (response.status === API_RESPONSE_TYPES.SUCCESS) {
        // Émettre un événement pour notifier le signalement
        window.dispatchEvent(new CustomEvent('moderation:reported', {
          detail: { contentType, contentId, reason, description }
        }))
      }

      return response
    } catch (error) {
      console.error('Erreur lors du signalement:', error)
      throw error
    }
  }

  // Obtenir les signalements
  async getReports(params = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status = 'pending',
        content_type = null,
        reporter_id = null,
        sort_by = 'created_at',
        sort_order = 'desc'
      } = params

      const queryParams = {
        page,
        limit,
        status,
        sort_by,
        sort_order
      }

      if (content_type) queryParams.content_type = content_type
      if (reporter_id) queryParams.reporter_id = reporter_id

      const response = await httpService.get(API_ENDPOINTS.MODERATION.REPORTS, queryParams)
      return response
    } catch (error) {
      console.error('Erreur lors du chargement des signalements:', error)
      throw error
    }
  }

  // Traiter un signalement
  async processReport(reportId, action, reason = null) {
    try {
      const response = await httpService.patch(
        API_ENDPOINTS.MODERATION.PROCESS_REPORT.replace(':id', reportId),
        {
          action, // 'approve', 'reject', 'escalate'
          reason
        }
      )

      if (response.status === API_RESPONSE_TYPES.SUCCESS) {
        // Invalider le cache
        this.invalidateCache()
        
        // Émettre un événement pour notifier le traitement
        window.dispatchEvent(new CustomEvent('moderation:report_processed', {
          detail: { reportId, action, reason }
        }))
      }

      return response
    } catch (error) {
      console.error('Erreur lors du traitement du signalement:', error)
      throw error
    }
  }

  // Obtenir les statistiques de modération
  async getModerationStats(params = {}) {
    try {
      const {
        period = 'week', // 'day', 'week', 'month', 'year'
        moderator_id = null
      } = params

      const queryParams = { period }
      if (moderator_id) queryParams.moderator_id = moderator_id

      const response = await httpService.get(API_ENDPOINTS.MODERATION.STATS, queryParams)
      return response
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques de modération:', error)
      throw error
    }
  }

  // Obtenir les règles de modération
  async getModerationRules() {
    try {
      const cacheKey = 'moderation_rules'
      const cached = this.cache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout * 10) { // Cache plus long pour les règles
        return cached.data
      }

      const response = await httpService.get(API_ENDPOINTS.MODERATION.RULES)
      
      // Mettre en cache
      this.cache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      })

      return response
    } catch (error) {
      console.error('Erreur lors du chargement des règles de modération:', error)
      throw error
    }
  }

  // Mettre à jour les règles de modération (admin seulement)
  async updateModerationRules(rules) {
    try {
      const response = await httpService.put(API_ENDPOINTS.MODERATION.RULES, rules)

      if (response.status === API_RESPONSE_TYPES.SUCCESS) {
        // Invalider le cache des règles
        this.cache.delete('moderation_rules')
        
        // Émettre un événement pour notifier la mise à jour
        window.dispatchEvent(new CustomEvent('moderation:rules_updated', {
          detail: { rules: response.data }
        }))
      }

      return response
    } catch (error) {
      console.error('Erreur lors de la mise à jour des règles:', error)
      throw error
    }
  }

  // Obtenir les modérateurs disponibles
  async getAvailableModerators(universityId = null) {
    try {
      const params = {}
      if (universityId) params.university_id = universityId

      const response = await httpService.get(API_ENDPOINTS.MODERATION.MODERATORS, params)
      return response
    } catch (error) {
      console.error('Erreur lors du chargement des modérateurs:', error)
      throw error
    }
  }

  // Obtenir la charge de travail des modérateurs
  async getModeratorsWorkload(universityId = null) {
    try {
      const params = {}
      if (universityId) params.university_id = universityId

      const response = await httpService.get(API_ENDPOINTS.MODERATION.WORKLOAD, params)
      return response
    } catch (error) {
      console.error('Erreur lors du chargement de la charge de travail:', error)
      throw error
    }
  }

  // Marquer un élément comme prioritaire
  async setPriority(itemType, itemId, priority) {
    try {
      const response = await httpService.patch(API_ENDPOINTS.MODERATION.SET_PRIORITY, {
        item_type: itemType,
        item_id: itemId,
        priority // 'low', 'normal', 'high', 'urgent'
      })

      if (response.status === API_RESPONSE_TYPES.SUCCESS) {
        // Invalider le cache
        this.invalidateCache()
        
        // Émettre un événement pour notifier le changement de priorité
        window.dispatchEvent(new CustomEvent('moderation:priority_changed', {
          detail: { itemType, itemId, priority }
        }))
      }

      return response
    } catch (error) {
      console.error('Erreur lors du changement de priorité:', error)
      throw error
    }
  }

  // Ajouter un commentaire de modération
  async addModerationComment(itemType, itemId, comment, isInternal = true) {
    try {
      const response = await httpService.post(API_ENDPOINTS.MODERATION.ADD_COMMENT, {
        item_type: itemType,
        item_id: itemId,
        comment,
        is_internal: isInternal
      })

      if (response.status === API_RESPONSE_TYPES.SUCCESS) {
        // Émettre un événement pour notifier le nouveau commentaire
        window.dispatchEvent(new CustomEvent('moderation:comment_added', {
          detail: { itemType, itemId, comment, isInternal }
        }))
      }

      return response
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error)
      throw error
    }
  }

  // Obtenir l'activité de modération en temps réel
  async getModerationActivity(limit = 20) {
    try {
      const response = await httpService.get(API_ENDPOINTS.MODERATION.ACTIVITY, {
        limit
      })
      return response
    } catch (error) {
      console.error('Erreur lors du chargement de l\'activité de modération:', error)
      throw error
    }
  }

  // Invalider tout le cache
  invalidateCache() {
    this.cache.clear()
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
}

// Instance singleton du service de modération
export const moderationService = new ModerationService()

// Nettoyer le cache périodiquement
setInterval(() => {
  moderationService.cleanExpiredCache()
}, 30000) // Toutes les 30 secondes (cache court pour la modération)