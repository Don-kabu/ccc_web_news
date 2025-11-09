import { httpService } from './http.service.js'
import { API_ENDPOINTS, createApiResponse, API_RESPONSE_TYPES, buildApiUrl } from './api.config.js'

class NotificationService {
  constructor() {
    this.cache = new Map()
    this.cacheTimeout = 2 * 60 * 1000 // 2 minutes
    this.subscribers = new Set()
    this.reconnectionTimeout = null
    
    // Variables pour le polling (remplace SSE)
    this.pollingInterval = null
    this.lastUnreadCount = 0
    this.lastNotificationTimestamp = null
    this.lastNotificationIds = new Set()
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
      console.log('🔔 getNotifications() response:', response.results)
      if (response.success || response.results || Array.isArray(response)) {
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
      return response.success ? response.results?.unread_count || 0 : 0
    } catch (error) {
      console.error('Erreur lors de la récupération du nombre non lu:', error)
      return 0
    }
  }

  // Initialiser les notifications en temps réel (Polling sur /notifications/)
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
      console.warn('❌ Aucun token d\'authentification pour les notifications')
      return
    }

    // Utiliser polling sur /notifications/ au lieu de SSE
    console.log('🔄 Initialisation polling sur /api/v1/notifications/ (pas de SSE disponible)')
    this.startPolling()
  }

  // Démarrer le polling sur /notifications/
  async startPolling() {
    try {
      console.log('📡 Démarrage polling notifications...')
      
      // Variables pour le polling
      this.lastUnreadCount = 0
      this.lastNotificationTimestamp = null
      this.lastNotificationIds = new Set()
      
      // Récupérer l'état initial
      await this.loadInitialNotificationState()
      
      // Polling toutes les 15 secondes sur /notifications/
      this.pollingInterval = setInterval(async () => {
        try {
          await this.checkForNewNotifications()
        } catch (error) {
          console.error('❌ Erreur polling notifications:', error)
        }
      }, 15000) // 15 secondes
      
      console.log('✅ Polling notifications démarré (15s)')
      
    } catch (error) {
      console.error('❌ Erreur initialisation polling:', error)
      
      // Retry après 30 secondes
      setTimeout(() => {
        console.log('🔄 Retry initialisation polling...')
        this.startPolling()
      }, 30000)
    }
  }

  // Charger l'état initial des notifications
  async loadInitialNotificationState() {
    try {
      console.log('📊 Chargement état initial notifications...')
      
      // Charger les stats pour le count initial
      const stats = await this.getStatistics()
      if (stats.success && stats.data?.unread_count) {
        this.lastUnreadCount = stats.data.unread_count
        console.log('📈 Count initial:', this.lastUnreadCount)
      }
      
      // Charger les notifications récentes pour éviter les doublons
      const notifications = await this.getNotifications({ 
        limit: 10,
        ordering: '-created_at' 
      })
      
      if (notifications.success || notifications.results || Array.isArray(notifications)) {
        let notificationsList = []
        
        if (Array.isArray(notifications)) {
          notificationsList = notifications
        } else if (notifications.results) {
          if (Array.isArray(notifications.results)) {
            notificationsList = notifications.results
          }
        } else if (notifications.results && notifications.results) {
          notificationsList = notifications.results
        }
        
        // Stocker les IDs des notifications existantes
        notificationsList.forEach(notif => {
          if (notif.id) {
            this.lastNotificationIds.add(notif.id.toString())
          }
        })
        
        // Garder le timestamp de la plus récente
        if (notificationsList.length > 0) {
          this.lastNotificationTimestamp = notificationsList[0].created_at
        }
        
        console.log('📝 État initial:', {
          count: this.lastUnreadCount,
          notifications: notificationsList.length,
          lastTimestamp: this.lastNotificationTimestamp
        })
      }
      
    } catch (error) {
      console.error('❌ Erreur chargement état initial:', error)
    }
  }

  // Vérifier les nouvelles notifications
  async checkForNewNotifications() {
    try {
      console.log('🔍 Vérification nouvelles notifications...')
      
      // Stats pour détecter les changements de count
      const statsResponse = await this.getStatistics()
      const currentUnreadCount = statsResponse.success && statsResponse.data?.unread_count || 0
      
      console.log('📊 Comparaison counts:', {
        previous: this.lastUnreadCount,
        current: currentUnreadCount,
        changed: currentUnreadCount !== this.lastUnreadCount
      })
      
      // Si le count a changé, récupérer les nouvelles notifications
      if (currentUnreadCount !== this.lastUnreadCount) {
        console.log('📈 Nouveau count détecté:', this.lastUnreadCount, '->', currentUnreadCount)
        
        // Récupérer les notifications récentes
        const notificationsResponse = await this.getNotifications({ 
          limit: Math.max(10, currentUnreadCount),
          ordering: '-created_at' 
        })
        
        console.log('📥 Response notifications polling:', notificationsResponse)
        
        if (notificationsResponse.success || notificationsResponse.results || Array.isArray(notificationsResponse)) {
          let notificationsList = []
          
          if (Array.isArray(notificationsResponse)) {
            notificationsList = notificationsResponse
          } else if (notificationsResponse.results) {
            if (Array.isArray(notificationsResponse.results)) {
              notificationsList = notificationsResponse.results
            }
          } else if (notificationsResponse.results && notificationsResponse.results) {
            notificationsList = notificationsResponse.results
          }
          
          // Identifier les nouvelles notifications
          const newNotifications = []
          
          for (const notification of notificationsList) {
            if (!this.lastNotificationIds.has(notification.id.toString())) {
              newNotifications.push(notification)
              this.lastNotificationIds.add(notification.id.toString())
            }
          }
          
          // Si on a de nouvelles notifications, les publier
          if (newNotifications.length > 0) {
            console.log('🔔 Nouvelles notifications détectées:', newNotifications.length)
            
            for (const notification of newNotifications) {
              this.publishToSubscribers({
                type: 'notification',
                data: notification
              })
            }
          }
        }
        
        // Mettre à jour le count et publier les stats
        if (currentUnreadCount !== this.lastUnreadCount) {
          this.publishToSubscribers({
            type: 'stats',
            data: {
              unread_count: currentUnreadCount,
              total_count: statsResponse.data?.total_count || currentUnreadCount
            }
          })
          
          this.lastUnreadCount = currentUnreadCount
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur vérification nouvelles notifications:', error)
    }
  }

  // Lire le stream SSE en continu
  async readSSEStream(readableStream) {
    const reader = readableStream.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    
    try {
      console.log('� Début de la lecture du stream SSE...')
      
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          console.log('🔚 Stream SSE fermé par le serveur')
          break
        }
        
        // Décoder les données reçues
        buffer += decoder.decode(value, { stream: true })
        
        // Traiter les événements complets (délimités par \n\n)
        let eventEnd = buffer.indexOf('\n\n')
        while (eventEnd !== -1) {
          const eventData = buffer.substring(0, eventEnd)
          buffer = buffer.substring(eventEnd + 2)
          
          // Parser et traiter l'événement
          await this.processSSEEvent(eventData)
          
          eventEnd = buffer.indexOf('\n\n')
        }
      }
    } catch (streamError) {
      console.error('❌ Erreur lors de la lecture du stream SSE:', streamError)
      throw streamError
    } finally {
      // Nettoyer le reader
      if (reader) {
        try {
          reader.cancel()
        } catch (cancelError) {
          console.warn('⚠️ Erreur lors de l\'annulation du reader:', cancelError)
        }
      }
      
      // Programmer la reconnexion
      this.scheduleSSEReconnection()
    }
  }

  // Traiter un événement SSE
  async processSSEEvent(eventData) {
    if (!eventData.trim()) {
      return // Ignorer les événements vides
    }
    
    try {
      console.log('📨 Événement SSE reçu:', eventData)
      
      const lines = eventData.split('\n')
      let eventType = null
      let data = null
      let id = null
      
      // Parser les lignes de l'événement SSE
      for (const line of lines) {
        if (line.startsWith('event: ')) {
          eventType = line.substring(7).trim()
        } else if (line.startsWith('data: ')) {
          const jsonData = line.substring(6)
          if (jsonData === '[DONE]') {
            console.log('🏁 Événement de fin SSE reçu')
            return
          }
          
          try {
            data = JSON.parse(jsonData)
          } catch (parseError) {
            console.warn('⚠️ Données SSE non-JSON:', jsonData)
            data = jsonData
          }
        } else if (line.startsWith('id: ')) {
          id = line.substring(4).trim()
        }
      }
      
      // Traiter selon le type d'événement
      await this.handleSSEEvent(eventType, data, id)
      
    } catch (error) {
      console.error('❌ Erreur lors du traitement de l\'événement SSE:', error, eventData)
    }
  }

  // Gérer les différents types d'événements SSE
  async handleSSEEvent(eventType, data, eventId) {
    console.log(`🎯 Traitement événement SSE: ${eventType}`, data)
    
    switch (eventType) {
      case 'notification':
      case 'new_notification':
        // Nouvelle notification reçue
        if (data) {
          this.handleNewNotification(data)
        }
        break
        
      case 'notification_read':
        // Notification marquée comme lue
        if (data && data.notification_id) {
          this.handleNotificationRead(data.notification_id)
        }
        break
        
      case 'notifications_count':
        // Mise à jour du count non lu
        if (data && typeof data.unread_count === 'number') {
          this.handleUnreadCountUpdate(data.unread_count)
        }
        break
        
      case 'ping':
      case 'heartbeat':
        // Keepalive du serveur
        console.log('💓 Heartbeat SSE reçu')
        break
        
      case 'error':
        // Erreur côté serveur
        console.error('❌ Erreur SSE du serveur:', data)
        break
        
      default:
        // Événement par défaut (traiter comme nouvelle notification)
        if (data) {
          console.log('🔔 Événement SSE générique traité comme notification:', eventType)
          this.handleNewNotification(data)
        }
        break
    }
  }

  // Programmer une reconnexion SSE
  scheduleSSEReconnection() {
    // Éviter les reconnexions multiples
    if (this.reconnectionTimeout) {
      clearTimeout(this.reconnectionTimeout)
    }
    
    const delay = 5000 // 5 secondes
    console.log(`⏰ Reconnexion SSE programmée dans ${delay}ms`)
    
    this.reconnectionTimeout = setTimeout(() => {
      console.log('🔄 Tentative de reconnexion SSE...')
      this.connectSSE()
    }, delay)
  }

  // Gérer la notification read depuis SSE
  handleNotificationRead(notificationId) {
    console.log('✅ Notification SSE marquée comme lue:', notificationId)
    
    // Invalider le cache
    this.invalidateCache()
    
    // Notifier les subscribers
    this.notifySubscribers('read', { notificationId })
    
    // Émettre l'événement
    window.dispatchEvent(new CustomEvent('notification:read', {
      detail: { notificationId },
      bubbles: true
    }))
  }

  // Gérer la mise à jour du count depuis SSE
  handleUnreadCountUpdate(newCount) {
    console.log('🔢 Mise à jour count non lu SSE:', newCount)
    
    // Invalider le cache des stats
    this.cache.delete('notification_stats')
    
    // Notifier les subscribers
    this.notifySubscribers('count_update', { count: newCount })
    
    // Émettre l'événement
    window.dispatchEvent(new CustomEvent('notification:count_update', {
      detail: { count: newCount },
      bubbles: true
    }))
  }

    // S'abonner aux événements de notifications
  subscribe(callback) {
    this.subscribers.add(callback)
    
    // Retourner une fonction de désabonnement
    return () => {
      this.subscribers.delete(callback)
    }
  }

  // Méthode obsolète supprimée - SSE fonctionne uniquement avec headers maintenant
  // EventSource ne supporte pas les headers personnalisés, donc fallback direct vers polling
  tryEventSourceSSE(baseUrl, endpoint, token) {
    console.warn('⚠️ EventSource avec token en paramètre non supporté - Basculement vers polling')
    this.fallbackToPolling()
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

        if (response.success && response.results) {
          // Traiter chaque nouvelle notification
          response.results.forEach(notification => {
            // Vérifier si c'est vraiment une nouvelle notification
            if (!this.lastNotificationTimestamp || 
                new Date(notification.created_at) > new Date(this.lastNotificationTimestamp)) {
              this.handleNewNotification(notification)
            }
          })

          // Mettre à jour le timestamp de la dernière notification
          if (response.results.length > 0) {
            this.lastNotificationTimestamp = response.results[0].created_at
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
    console.log('🔔 Traitement nouvelle notification:', notification)
    
    // Invalider le cache pour forcer la mise à jour
    this.invalidateCache()
    
    // Sauvegarder la notification dans localStorage pour persistance
    try {
      const savedNotifications = JSON.parse(localStorage.getItem('ccc_notifications') || '[]')
      const formattedNotification = this.formatNotification(notification)
      
      // Éviter les doublons
      const exists = savedNotifications.find(n => n.id === formattedNotification.id)
      if (!exists) {
        savedNotifications.unshift(formattedNotification)
        
        // Limiter à 50 notifications en cache
        if (savedNotifications.length > 50) {
          savedNotifications.splice(50)
        }
        
        localStorage.setItem('ccc_notifications', JSON.stringify(savedNotifications))
        console.log('💾 Notification sauvée dans localStorage')
      }
    } catch (storageError) {
      console.warn('⚠️ Erreur sauvegarde localStorage:', storageError)
    }
    
    // Émettre un événement pour la nouvelle notification
    window.dispatchEvent(new CustomEvent('notification:new', {
      detail: notification,
      bubbles: true
    }))
    
  // Notifier les subscribers avec vérification d'erreur
  try {
    console.log('📢 Notification des subscribers:', {
      event: 'new',
      notification: notification,
      subscribersCount: this.subscribers.size
    })
    this.notifySubscribers('new', notification)
  } catch (subscribeError) {
    console.error('❌ Erreur notification subscribers:', subscribeError)
  }    // Log pour le debug
    console.log('🔔 Nouvelle notification traitée:', notification.title || notification.message)
  }

  // Fermer la connexion temps réel
  disconnectRealTime() {
    // Arrêter le polling
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
    
    // Annuler le timeout de reconnexion
    if (this.reconnectionTimeout) {
      clearTimeout(this.reconnectionTimeout)
      this.reconnectionTimeout = null
    }
    
    // Nettoyer l'état
    this.lastUnreadCount = 0
    this.lastNotificationTimestamp = null
    this.lastNotificationIds.clear()
    
    console.log('🔌 Polling notifications arrêté')
  }

  // S'abonner aux événements de notifications
  subscribe(callback) {
    this.subscribers.add(callback)
    
    // Retourner une fonction de désabonnement
    return () => {
      this.subscribers.delete(callback)
    }
  }

  // Publier un événement à tous les subscribers
  publishToSubscribers(eventData) {
    console.log(`📡 Publication événement: ${eventData.type}`, eventData)
    
    this.subscribers.forEach((callback, index) => {
      try {
        callback(eventData.type, eventData.data)
        console.log(`✅ Subscriber ${index} notifié: ${eventData.type}`)
      } catch (error) {
        console.error(`❌ Erreur subscriber ${index}:`, error)
      }
    })
  }

  // Notifier tous les subscribers
  notifySubscribers(event, data = null) {
    console.log(`🔔 Notification subscribers: ${event}`, `(${this.subscribers.size} abonnés)`)
    
    if (this.subscribers.size === 0) {
      console.warn('⚠️ Aucun subscriber pour recevoir l\'événement:', event)
      return
    }
    
    this.subscribers.forEach((callback, index) => {
      try {
        callback(event, data)
        console.log(`✅ Subscriber ${index} notifié avec succès`)
      } catch (error) {
        console.error(`❌ Erreur dans le callback subscriber ${index}:`, error)
        // Ne pas interrompre les autres callbacks en cas d'erreur
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

// Exposer globalement en mode développement pour le debugging
if (import.meta.env.DEV) {
  window.notificationService = notificationService
  console.log('🔔 Service notifications exposé globalement (mode dev)')
}