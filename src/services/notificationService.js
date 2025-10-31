/**
 * Service de gestion des notifications selon le cahier des charges
 * Gère les fréquences : immediate, daily, weekly
 * Respecte les préférences utilisateur et l'importance des actualités
 */

export class NotificationService {
  constructor() {
    this.notifications = this.loadNotifications()
    this.currentUserId = null
    this.init()
  }

  init() {
    // Planifier les digest quotidiens et hebdomadaires
    this.scheduleDailyDigest()
    this.scheduleWeeklyDigest()
    
    // Écouter les nouvelles actualités pour notifications immédiates
    window.addEventListener('news-published', (event) => {
      this.handleNewNews(event.detail)
    })
  }

  /**
   * Initialiser l'utilisateur courant
   */
  initializeUser(userId) {
    this.currentUserId = userId
    return this
  }

  /**
   * Méthode alias pour initialize
   */
  initialize() {
    // Cette méthode existe déjà mais sans faire grand chose
    // On peut l'utiliser comme alias pour la compatibilité
    return this
  }

  /**
   * Gérer une nouvelle actualité publiée
   */
  async handleNewNews(article) {
    if (article.status !== 'approved') return

    const users = this.getAllUsers()
    
    for (const user of users) {
      const settings = this.getUserNotificationSettings(user.id)
      
      // Vérifier si l'utilisateur veut être notifié de ce type d'actualité
      if (!this.shouldNotifyUser(user, article, settings)) continue
      
      // Notifications immédiates
      if (settings.frequency === 'immediate') {
        await this.sendImmediateNotification(user, article, settings)
      }
      // Pour les urgentes, toujours notifier immédiatement (même en mode digest)
      else if (article.importance === 'urgente') {
        await this.sendUrgentNotification(user, article, settings)
      }
      // Sinon, ajouter au digest
      else {
        this.addToDigest(user.id, article)
      }
    }
  }

  /**
   * Vérifier si un utilisateur doit être notifié d'une actualité
   */
  shouldNotifyUser(user, article, settings) {
    // Vérifier l'importance
    if (!settings.importance[article.importance]) return false
    
    // Vérifier l'université (même université)
    if (user.university_id !== article.university_id) return false
    
    return true
  }

  /**
   * Envoyer une notification immédiate
   */
  async sendImmediateNotification(user, article, settings) {
    const notification = {
      id: Date.now(),
      user_id: user.id,
      article_id: article.id,
      type: 'immediate',
      title: this.getNotificationTitle(article),
      content: this.getNotificationContent(article),
      importance: article.importance,
      sent_at: new Date().toISOString(),
      read: false
    }

    // Envoyer selon les canaux préférés
    if (settings.channels.web) {
      await this.sendWebNotification(notification)
    }
    
    if (settings.channels.email) {
      await this.sendEmailNotification(user, notification)
    }
    
    // Sauvegarder la notification
    this.saveNotification(notification)
  }

  /**
   * Envoyer une notification urgente (toujours immédiate)
   */
  async sendUrgentNotification(user, article, settings) {
    const notification = {
      id: Date.now(),
      user_id: user.id,
      article_id: article.id,
      type: 'urgent',
      title: `🚨 URGENT: ${article.title}`,
      content: article.excerpt,
      importance: 'urgente',
      sent_at: new Date().toISOString(),
      read: false
    }

    // Force l'envoi web même si pas configuré (pour les urgentes)
    await this.sendWebNotification(notification)
    
    if (settings.channels.email) {
      await this.sendEmailNotification(user, notification)
    }
    
    this.saveNotification(notification)
  }

  /**
   * Ajouter une actualité au digest
   */
  addToDigest(userId, article) {
    const digestKey = `digest_${userId}`
    const digest = JSON.parse(localStorage.getItem(digestKey) || '[]')
    
    digest.push({
      article_id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      importance: article.importance,
      added_at: new Date().toISOString()
    })
    
    localStorage.setItem(digestKey, JSON.stringify(digest))
  }

  /**
   * Planifier le digest quotidien
   */
  scheduleDailyDigest() {
    setInterval(() => {
      this.sendDailyDigests()
    }, 60000) // Vérifier chaque minute
  }

  /**
   * Envoyer les digest quotidiens
   */
  async sendDailyDigests() {
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    const users = this.getAllUsers()
    
    for (const user of users) {
      const settings = this.getUserNotificationSettings(user.id)
      
      if (settings.frequency === 'daily' && settings.dailyTime === currentTime) {
        await this.sendDailyDigest(user, settings)
      }
    }
  }

  /**
   * Envoyer un digest quotidien à un utilisateur
   */
  async sendDailyDigest(user, settings) {
    const digestKey = `digest_${user.id}`
    const digest = JSON.parse(localStorage.getItem(digestKey) || '[]')
    
    if (digest.length === 0) return
    
    const digestNotification = {
      id: Date.now(),
      user_id: user.id,
      type: 'daily_digest',
      title: `📰 Digest quotidien - ${digest.length} actualité(s)`,
      content: this.formatDigest(digest),
      sent_at: new Date().toISOString(),
      read: false,
      articles: digest
    }

    if (settings.channels.web) {
      await this.sendWebNotification(digestNotification)
    }
    
    if (settings.channels.email) {
      await this.sendEmailNotification(user, digestNotification)
    }
    
    // Vider le digest après envoi
    localStorage.removeItem(digestKey)
    
    this.saveNotification(digestNotification)
  }

  /**
   * Planifier le digest hebdomadaire
   */
  scheduleWeeklyDigest() {
    setInterval(() => {
      this.sendWeeklyDigests()
    }, 60000) // Vérifier chaque minute
  }

  /**
   * Envoyer les digest hebdomadaires
   */
  async sendWeeklyDigests() {
    const now = new Date()
    const currentDay = now.getDay()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    const users = this.getAllUsers()
    
    for (const user of users) {
      const settings = this.getUserNotificationSettings(user.id)
      
      if (settings.frequency === 'weekly' && 
          settings.weeklyDay == currentDay && 
          settings.weeklyTime === currentTime) {
        await this.sendWeeklyDigest(user, settings)
      }
    }
  }

  /**
   * Envoyer un digest hebdomadaire à un utilisateur
   */
  async sendWeeklyDigest(user, settings) {
    const digestKey = `digest_${user.id}`
    const digest = JSON.parse(localStorage.getItem(digestKey) || '[]')
    
    if (digest.length === 0) return
    
    const digestNotification = {
      id: Date.now(),
      user_id: user.id,
      type: 'weekly_digest',
      title: `📅 Digest hebdomadaire - ${digest.length} actualité(s)`,
      content: this.formatDigest(digest),
      sent_at: new Date().toISOString(),
      read: false,
      articles: digest
    }

    if (settings.channels.web) {
      await this.sendWebNotification(digestNotification)
    }
    
    if (settings.channels.email) {
      await this.sendEmailNotification(user, digestNotification)
    }
    
    // Vider le digest après envoi
    localStorage.removeItem(digestKey)
    
    this.saveNotification(digestNotification)
  }

  /**
   * Envoyer une notification web
   */
  async sendWebNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.content,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `news-${notification.article_id}`,
        requireInteraction: notification.importance === 'urgente'
      })
    }
  }

  /**
   * Simuler l'envoi d'email
   */
  async sendEmailNotification(user, notification) {
    // Simulation - en production, ici vous appelleriez votre service d'email
    console.log(`📧 Email envoyé à ${user.email}:`, {
      subject: notification.title,
      content: notification.content,
      type: notification.type
    })
    
    return true
  }

  /**
   * Formater le contenu d'un digest
   */
  formatDigest(digest) {
    const urgentCount = digest.filter(a => a.importance === 'urgente').length
    const importantCount = digest.filter(a => a.importance === 'importante').length
    const totalCount = digest.length
    
    let summary = `${totalCount} actualité(s) cette période`
    if (urgentCount > 0) summary += ` • ${urgentCount} urgente(s)`
    if (importantCount > 0) summary += ` • ${importantCount} importante(s)`
    
    return summary
  }

  /**
   * Obtenir le titre d'une notification
   */
  getNotificationTitle(article) {
    const prefixes = {
      urgente: '🚨',
      importante: '⚠️',
      moyenne: 'ℹ️',
      faible: '💬'
    }
    
    return `${prefixes[article.importance] || ''} ${article.title}`
  }

  /**
   * Obtenir le contenu d'une notification
   */
  getNotificationContent(article) {
    return article.excerpt || article.title
  }

  /**
   * Obtenir tous les utilisateurs
   */
  getAllUsers() {
    return JSON.parse(localStorage.getItem('ccc_users') || '[]')
  }

  /**
   * Obtenir les paramètres de notification d'un utilisateur
   */
  getUserNotificationSettings(userId) {
    const defaultSettings = {
      frequency: 'daily',
      importance: {
        urgente: true,
        importante: true,
        moyenne: true,
        faible: false
      },
      channels: {
        web: true,
        email: false,
        mobile: false
      },
      dailyTime: '09:00',
      weeklyDay: '1',
      weeklyTime: '09:00'
    }
    
    const saved = localStorage.getItem(`notification_settings_${userId}`)
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings
  }

  /**
   * Sauvegarder une notification
   */
  saveNotification(notification) {
    this.notifications.push(notification)
    localStorage.setItem('ccc_notifications', JSON.stringify(this.notifications))
  }

  /**
   * Charger les notifications
   */
  loadNotifications() {
    return JSON.parse(localStorage.getItem('ccc_notifications') || '[]')
  }

  /**
   * Obtenir les notifications d'un utilisateur
   */
  getUserNotifications(userId, limit = 50) {
    return this.notifications
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at))
      .slice(0, limit)
  }

  /**
   * Marquer une notification comme lue
   */
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
      localStorage.setItem('ccc_notifications', JSON.stringify(this.notifications))
    }
  }

  /**
   * Obtenir le nombre de notifications non lues
   */
  getUnreadCount(userId) {
    return this.notifications.filter(n => n.user_id === userId && !n.read).length
  }

  /**
   * Demander la permission pour les notifications web
   */
  async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return Notification.permission === 'granted'
  }
}

// Instance singleton
export const notificationService = new NotificationService()