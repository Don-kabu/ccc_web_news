import { httpService } from './http.service.js'
import { API_ENDPOINTS, createApiResponse, API_RESPONSE_TYPES } from './api.config.js'

class NotificationService {
  constructor() {
    this.cache = new Map()
    this.cacheTimeout = 2 * 60 * 1000 // 2 minutes
    this.eventSource = null
    this.subscribers = new Set()
    
    // Variables pour le polling fallback
    this.pollingInterval = null
    this.lastUnreadCount = 0
    this.lastNotificationTimestamp = null
  }

  // Récupérer toutes les notifications
  async getNotifications(filters = {}) {
    try {
      const cacheKey = `notifications_${JSON.stringify(filters)}`
      
      // Vérifier le cache
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data
        }
      }

      const queryParams = {
        ...filters
      }

      const response = await httpService.get(API_ENDPOINTS.NOTIFICATIONS.BASE, queryParams)

      if (response.success || response.data || Array.isArray(response)) {
        // Mettre en cache seulement si on a des données valides
        this.cache.set(cacheKey, {
          data: response,
          timestamp: Date.now()
        })
        return response
      } else {
        // Si pas de succès mais pas d'erreur non plus, retourner une structure vide valide
        console.warn('⚠️ Réponse API notifications sans données:', response)
        return createApiResponse(API_RESPONSE_TYPES.SUCCESS, [], 'Aucune notification')
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error)
      
      // Tentative de récupération depuis le cache expiré si disponible
      const cacheKey = `notifications_${JSON.stringify(filters)}`
      if (this.cache.has(cacheKey)) {
        console.log('🔄 Utilisation du cache expiré en fallback')
        return this.cache.get(cacheKey).data
      }
      
      // Retourner une structure vide plutôt que de faire échouer
      return createApiResponse(API_RESPONSE_TYPES.ERROR, [], 'Impossible de charger les notifications')
    }
  }

  // Récupérer une notification spécifique
  async getNotification(id) {
    try {
      const cacheKey = `notification_${id}`
      
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data
        }
      }

      const response = await httpService.get(API_ENDPOINTS.NOTIFICATIONS.BY_ID(id))

      if (response.success) {
        this.cache.set(cacheKey, {
          data: response,
          timestamp: Date.now()
        })
      }

      return response
    } catch (error) {
      console.error('Erreur lors de la récupération de la notification:', error)
      throw error
    }
  }

  // Marquer une notification comme lue
  async markAsRead(notificationId) {
    try {
      const response = await httpService.post(API_ENDPOINTS.NOTIFICATIONS.MARK_READ, {
        notification_id: notificationId
      })

      if (response.success) {
        // Invalider le cache
        this.invalidateCache()
        
        // Émettre un événement pour notifier le changement
        window.dispatchEvent(new CustomEvent('notification:read', {
          detail: { notificationId }
        }))
        
        // Notifier les subscribers
        this.notifySubscribers('read', { notificationId })
      }

      return response
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error)
      throw error
    }
  }

  // Marquer toutes les notifications comme lues
  async markAllAsRead() {
    try {
      const response = await httpService.post(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ)

      if (response.success) {
        // Invalider le cache
        this.invalidateCache()
        
        // Émettre un événement pour notifier le changement
        window.dispatchEvent(new CustomEvent('notification:all_read'))
        
        // Notifier les subscribers
        this.notifySubscribers('all_read')
      }

      return response
    } catch (error) {
      console.error('Erreur lors du marquage de toutes comme lues:', error)
      throw error
    }
  }

  // Récupérer les statistiques des notifications
  async getStatistics() {
    try {
      const cacheKey = 'notification_stats'
      
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data
        }
      }

      const response = await httpService.get(API_ENDPOINTS.NOTIFICATIONS.STATISTICS)

      if (response.success) {
        this.cache.set(cacheKey, {
          data: response,
          timestamp: Date.now()
        })
      }

      return response
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      throw error
    }
  }

  // Récupérer le nombre de notifications non lues
  async getUnreadCount() {
    try {
      const response = await this.getStatistics()
      return response.success ? response.data?.unread_count || 0 : 0
    } catch (error) {
      console.error('Erreur lors de la récupération du nombre non lu:', error)
      return 0
    }
  }

  // Initialiser les notifications en temps réel (Polling fallback)
  initializeRealTimeNotifications() {
    // Fermer toute connexion SSE existante
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }

    // Arrêter tout polling existant
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }

    const token = localStorage.getItem('ccc_access_token')
    if (!token) {
      console.warn('Aucun token d\'authentification pour les notifications en temps réel')
      return
    }

    // Tentative de SSE avec gestion d'erreurs améliorée
    this.trySSEConnection()
  }

  // Tenter une connexion SSE avec fallback vers polling
  async trySSEConnection() {
    try {
      console.log('🔄 Tentative de connexion SSE...')
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://univers-news-ccc-kabu.onrender.com/api/v1'
      const token = localStorage.getItem('ccc_access_token')
      
      if (!token) {
        console.warn('⚠️ Pas de token disponible pour SSE, basculement vers polling')
        this.fallbackToPolling()
        return
      }
      
      // Essayer différents endpoints SSE possibles
      const sseEndpoints = [
        '/notifications/stream/',
        '/notifications/sse/', 
        '/notifications/live/',
        '/sse/notifications/'
      ]
      
      // Méthode 1: Fetch avec ReadableStream (support des headers)
      await this.tryFetchSSE(baseUrl, sseEndpoints[0], token)
      
    } catch (error) {
      console.error('❌ Erreur SSE:', error)
      this.fallbackToPolling()
    }
  }

  // Nouvelle méthode utilisant fetch pour supporter les headers
  async tryFetchSSE(baseUrl, endpoint, token) {
    try {
      const sseUrl = `${baseUrl}${endpoint}`
      
      console.log('🔗 Connexion SSE avec headers vers:', sseUrl)
      
      const response = await fetch(sseUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      if (!response.body) {
        throw new Error('ReadableStream non supporté')
      }
      
      console.log('✅ Connexion SSE établie avec headers')
      
      // Lire le stream
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      
      // Timeout de sécurité
      const sseTimeout = setTimeout(() => {
        console.log('⚠️ SSE fetch timeout - Basculement vers le polling')
        reader.cancel()
        this.fallbackToPolling()
      }, 5000)
      
      // Fonction pour traiter les données reçues
      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read()
            
            if (done) {
              console.log('� Stream SSE fermé')
              break
            }
            
            clearTimeout(sseTimeout) // Connection réussie
            
            // Décoder et traiter les chunks
            buffer += decoder.decode(value, { stream: true })
            
            // Traiter les événements complets
            let eventEnd = buffer.indexOf('\n\n')
            while (eventEnd !== -1) {
              const event = buffer.substring(0, eventEnd)
              buffer = buffer.substring(eventEnd + 2)
              
              // Parser l'événement SSE
              this.parseSSEEvent(event)
              
              eventEnd = buffer.indexOf('\n\n')
            }
          }
        } catch (streamError) {
          console.error('❌ Erreur lors de la lecture du stream:', streamError)
          throw streamError
        }
      }
      
      // Démarrer le traitement du stream
      processStream()
      
    } catch (fetchError) {
      console.warn('⚠️ Échec fetch SSE:', fetchError.message, '- Tentative EventSource classique')
      
      // Fallback vers EventSource classique avec token en paramètre
      this.tryEventSourceSSE(baseUrl, endpoint, token)
    }
  }

  // Fallback EventSource classique avec token en paramètre
  tryEventSourceSSE(baseUrl, endpoint, token) {
    try {
      const sseUrlWithToken = `${baseUrl}${endpoint}?token=${encodeURIComponent(token)}`
      
      console.log('🔗 Fallback EventSource vers:', sseUrlWithToken.replace(token, token.substring(0, 10) + '...'))
      
      this.eventSource = new EventSource(sseUrlWithToken)
      
      // Timeout pour basculer vers le polling si SSE ne fonctionne pas
      const sseTimeout = setTimeout(() => {
        console.log('⚠️ EventSource timeout - Basculement vers le polling')
        this.fallbackToPolling()
      }, 5000)
      
      this.eventSource.onopen = () => {
        console.log('✅ Connexion EventSource établie')
        clearTimeout(sseTimeout)
      }
      
      this.eventSource.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data)
          this.handleNewNotification(notification)
        } catch (error) {
          console.error('Erreur parsing notification SSE:', error)
        }
      }
      
      this.eventSource.onerror = (error) => {
        console.error('❌ Erreur EventSource:', error)
        this.fallbackToPolling()
      }
      
    } catch (eventSourceError) {
      console.error('❌ Erreur EventSource:', eventSourceError)
      this.fallbackToPolling()
    }
  }

  // Parser un événement SSE du format text/event-stream
  parseSSEEvent(eventText) {
    try {
      if (!eventText.trim()) return
      
      const lines = eventText.split('\n')
      const event = {}
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.substring(6)
          if (data === '[DONE]') return
          
          try {
            const notification = JSON.parse(data)
            this.handleNewNotification(notification)
          } catch (parseError) {
            console.warn('⚠️ Impossible de parser la notification SSE:', data)
          }
        } else if (line.startsWith('event: ')) {
          event.type = line.substring(7)
        } else if (line.startsWith('id: ')) {
          event.id = line.substring(4)
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors du parsing d\'événement SSE:', error)
    }
  }

  // Basculer vers le polling en cas d'échec SSE
  fallbackToPolling() {
    // Fermer la connexion SSE si elle existe
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }

    console.log('🔄 Activation du polling pour les notifications (30 secondes)')
    
    // Stocker le dernier count pour détecter les changements
    this.lastUnreadCount = 0
    this.lastNotificationTimestamp = null

    // Récupérer le count initial
    this.getUnreadCount().then(count => {
      this.lastUnreadCount = count
    })

    // Polling toutes les 30 secondes
    this.pollingInterval = setInterval(async () => {
      try {
        await this.checkForNewNotifications()
      } catch (error) {
        console.error('Erreur lors du polling:', error)
      }
    }, 30000) // 30 secondes
  }

  // Vérifier les nouvelles notifications via polling
  async checkForNewNotifications() {
    try {
      // Récupérer le nouveau count
      const currentCount = await this.getUnreadCount()
      
      // Si le count a augmenté, il y a de nouvelles notifications
      if (currentCount > this.lastUnreadCount) {
        console.log(`🔔 Nouvelles notifications détectées: ${currentCount - this.lastUnreadCount}`)
        
        // Récupérer les nouvelles notifications
        const response = await this.getNotifications({ 
          unread_only: true,
          limit: currentCount - this.lastUnreadCount
        })

        if (response.success && response.data?.results) {
          // Traiter chaque nouvelle notification
          response.data.results.forEach(notification => {
            // Vérifier si c'est vraiment une nouvelle notification
            if (!this.lastNotificationTimestamp || 
                new Date(notification.created_at) > new Date(this.lastNotificationTimestamp)) {
              this.handleNewNotification(notification)
            }
          })

          // Mettre à jour le timestamp de la dernière notification
          if (response.data.results.length > 0) {
            this.lastNotificationTimestamp = response.data.results[0].created_at
          }
        }

        this.lastUnreadCount = currentCount
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des nouvelles notifications:', error)
    }
  }

  // Gérer une nouvelle notification (commun à SSE et polling)
  handleNewNotification(notification) {
    // Invalider le cache
    this.invalidateCache()
    
    // Émettre un événement pour la nouvelle notification
    window.dispatchEvent(new CustomEvent('notification:new', {
      detail: notification
    }))
    
    // Notifier les subscribers
    this.notifySubscribers('new', notification)
    
    // Log pour le debug
    console.log('🔔 Nouvelle notification:', notification.title || notification.message)
  }

  // Fermer la connexion temps réel
  disconnectRealTime() {
    // Fermer la connexion SSE
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
    
    // Arrêter le polling
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
    
    console.log('🔌 Connexion notifications temps réel fermée')
  }

  // S'abonner aux événements de notifications
  subscribe(callback) {
    this.subscribers.add(callback)
    
    // Retourner une fonction de désabonnement
    return () => {
      this.subscribers.delete(callback)
    }
  }

  // Notifier tous les subscribers
  notifySubscribers(event, data = null) {
    this.subscribers.forEach(callback => {
      try {
        callback(event, data)
      } catch (error) {
        console.error('Erreur dans le callback de notification:', error)
      }
    })
  }

  // Invalider le cache
  invalidateCache() {
    this.cache.clear()
  }

  // Obtenir les types de notifications avec leurs icônes et couleurs
  getNotificationTypes() {
    return {
      'NEWS_PUBLISHED': {
        icon: '📰',
        color: '#10b981',
        label: 'Article publié'
      },
      'NEWS_APPROVED': {
        icon: '✅',
        color: '#059669',
        label: 'Article approuvé'
      },
      'NEWS_REJECTED': {
        icon: '❌',
        color: '#ef4444',
        label: 'Article rejeté'
      },
      'NEWS_NEEDS_REVISION': {
        icon: '🔄',
        color: '#3b82f6',
        label: 'Révision demandée'
      },
      'COMMENT_ADDED': {
        icon: '💬',
        color: '#8b5cf6',
        label: 'Nouveau commentaire'
      },
      'USER_MENTIONED': {
        icon: '@',
        color: '#f59e0b',
        label: 'Mention'
      },
      'SYSTEM_UPDATE': {
        icon: '🔧',
        color: '#6b7280',
        label: 'Mise à jour système'
      },
      'DEFAULT': {
        icon: '🔔',
        color: '#6b7280',
        label: 'Notification'
      }
    }
  }

  // Formater une notification pour l'affichage
  formatNotification(notification) {
    // Validation des données d'entrée
    if (!notification || typeof notification !== 'object') {
      console.warn('Notification invalide reçue:', notification)
      return {
        id: Math.random().toString(),
        title: 'Notification',
        message: 'Contenu non disponible',
        icon: '🔔',
        color: '#6b7280',
        typeLabel: 'Notification',
        timeAgo: 'Inconnue',
        isRecent: false,
        is_read: true,
        created_at: new Date().toISOString(),
        type: 'DEFAULT'
      }
    }

    const types = this.getNotificationTypes()
    const type = types[notification.type] || types.DEFAULT
    
    // Assurer que toutes les propriétés essentielles existent
    const formattedNotification = {
      // Propriétés de base (avec fallbacks)
      id: notification.id || Math.random().toString(),
      title: notification.title || 'Notification',
      message: notification.message || 'Pas de message',
      type: notification.type || 'DEFAULT',
      is_read: notification.is_read || false,
      created_at: notification.created_at || new Date().toISOString(),
      
      // Propriétés optionnelles
      action_url: notification.action_url || null,
      action_text: notification.action_text || null,
      
      // Propriétés formatées
      icon: type.icon,
      color: type.color,
      typeLabel: type.label,
      timeAgo: this.getTimeAgo(notification.created_at || new Date().toISOString()),
      isRecent: this.isRecent(notification.created_at || new Date().toISOString()),
      
      // Préserver les autres propriétés
      ...notification
    }
    
    return formattedNotification
  }

  // Calculer le temps écoulé depuis une notification
  getTimeAgo(dateString) {
    try {
      if (!dateString) return 'Date inconnue'
      
      const now = new Date()
      const notificationDate = new Date(dateString)
      
      // Vérifier si la date est valide
      if (isNaN(notificationDate.getTime())) {
        return 'Date invalide'
      }
      
      const diffMs = now - notificationDate
      
      // Si la date est dans le futur, retourner "À l'instant"
      if (diffMs < 0) {
        return 'À l\'instant'
      }
      
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)

      if (diffHours < 1) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60))
        return diffMinutes < 1 ? 'À l\'instant' : `Il y a ${diffMinutes} min`
      } else if (diffHours < 24) {
        return `Il y a ${diffHours}h`
      } else if (diffDays < 7) {
        return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`
      } else {
        return notificationDate.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short'
        })
      }
    } catch (error) {
      console.error('Erreur lors du calcul de timeAgo:', error)
      return 'Date inconnue'
    }
  }

  // Vérifier si une notification est récente (moins de 1 heure)
  isRecent(dateString) {
    try {
      if (!dateString) return false
      
      const now = new Date()
      const notificationDate = new Date(dateString)
      
      // Vérifier si la date est valide
      if (isNaN(notificationDate.getTime())) {
        return false
      }
      
      const diffMs = now - notificationDate
      return diffMs >= 0 && diffMs < (60 * 60 * 1000) // 1 heure et pas dans le futur
    } catch (error) {
      console.error('Erreur lors de la vérification isRecent:', error)
      return false
    }
  }
}

// Instance singleton
export const notificationService = new NotificationService()