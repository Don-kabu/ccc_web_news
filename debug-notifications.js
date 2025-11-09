// Script de test pour les notifications
// À exécuter dans la console du navigateur

console.log('🧪 Script de test des notifications')

// Fonction pour tester manuellement le système
window.testNotifications = async function() {
  console.log('🔔 Test du système de notifications')
  
  // 1. Vérifier si le service est disponible
  if (!window.notificationService) {
    console.error('❌ notificationService non disponible')
    return
  }
  
  console.log('✅ Service de notifications disponible')
  console.log('📊 Subscribers:', notificationService.subscribers.size)
  console.log('🔄 Polling actif:', !!notificationService.pollingInterval)
  
  // 2. Charger les notifications manuellement
  try {
    console.log('📥 Chargement des notifications...')
    const notifications = await notificationService.getNotifications()
    console.log('📋 Notifications récupérées:', notifications)
    
    // 3. Vérifier la structure de réponse
    if (Array.isArray(notifications)) {
      console.log('✅ Structure: Array direct - ', notifications.length, 'notifications')
    } else if (notifications.results) {
      console.log('✅ Structure: response.results - ', notifications.results.length, 'notifications')
    } else if (notifications.data) {
      console.log('✅ Structure: response.data - ', notifications.data)
    } else {
      console.log('⚠️ Structure inconnue:', notifications)
    }
    
  } catch (error) {
    console.error('❌ Erreur chargement notifications:', error)
  }
  
  // 4. Vérifier les stats
  try {
    console.log('📊 Chargement des stats...')
    const stats = await notificationService.getStatistics()
    console.log('📈 Stats:', stats)
  } catch (error) {
    console.error('❌ Erreur stats:', error)
  }
  
  // 5. Simuler une nouvelle notification
  console.log('🔔 Simulation d\'une nouvelle notification...')
  const testNotification = {
    id: Math.random().toString(),
    title: 'Test notification',
    message: 'Ceci est un test',
    type: 'NEWS_PUBLISHED',
    is_read: false,
    created_at: new Date().toISOString(),
    action_url: null
  }
  
  // Déclencher manuellement handleNewNotification
  try {
    notificationService.handleNewNotification(testNotification)
    console.log('✅ Notification test déclenchée')
  } catch (error) {
    console.error('❌ Erreur simulation:', error)
  }
}

// Fonction pour forcer le rechargement
window.forceRefreshNotifications = async function() {
  console.log('🔄 Force refresh notifications...')
  
  if (!window.notificationService) {
    console.error('❌ Service non disponible')
    return
  }
  
  // Vider le cache
  notificationService.invalidateCache()
  
  // Forcer une vérification
  if (notificationService.checkForNewNotifications) {
    try {
      await notificationService.checkForNewNotifications()
      console.log('✅ Vérification forcée terminée')
    } catch (error) {
      console.error('❌ Erreur vérification:', error)
    }
  } else {
    console.log('⚠️ Méthode checkForNewNotifications non disponible')
  }
}

// Fonction pour diagnostiquer
window.debugNotifications = function() {
  console.log('🔍 Diagnostic des notifications')
  
  if (!window.notificationService) {
    console.error('❌ Service non disponible')
    return
  }
  
  const service = notificationService
  
  console.log('📊 État du service:', {
    subscribers: service.subscribers.size,
    pollingInterval: !!service.pollingInterval,
    lastUnreadCount: service.lastUnreadCount,
    lastNotificationTimestamp: service.lastNotificationTimestamp,
    lastNotificationIds: service.lastNotificationIds.size,
    cacheSize: service.cache.size
  })
  
  // Vérifier le localStorage
  try {
    const saved = localStorage.getItem('ccc_notifications')
    const notifications = saved ? JSON.parse(saved) : []
    console.log('💾 LocalStorage:', notifications.length, 'notifications')
  } catch (error) {
    console.error('❌ Erreur localStorage:', error)
  }
}

console.log('🎯 Fonctions de test disponibles:')
console.log('- testNotifications(): Test complet du système')
console.log('- forceRefreshNotifications(): Force le refresh')
console.log('- debugNotifications(): Diagnostic de l\'état')
console.log('')
console.log('🚀 Lancez testNotifications() pour commencer')