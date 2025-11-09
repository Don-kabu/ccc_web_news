// Test manuel des notifications
// À utiliser dans la console du navigateur pour débugger

// 1. Tester l'envoi d'une notification manuelle
window.testNotification = (type = 'test') => {
  const testNotification = {
    id: Date.now(),
    title: `Test Notification ${type}`,
    message: `Ceci est une notification de test créée à ${new Date().toLocaleTimeString()}`,
    type: type.toUpperCase(),
    priority: 'medium',
    is_read: false,
    created_at: new Date().toISOString(),
    author: {
      first_name: 'Test',
      last_name: 'User'
    }
  }
  
  console.log('🧪 Envoi notification test:', testNotification)
  
  // Simuler l'événement comme s'il venait du service
  window.dispatchEvent(new CustomEvent('notification:new', {
    detail: testNotification,
    bubbles: true
  }))
  
  return testNotification
}

// 2. Vérifier l'état des notifications
window.checkNotificationState = () => {
  const service = window.notificationService || 
                  (window.Vue && window.Vue.config?.globalProperties?.$notificationService)
  
  console.log('🔍 État du service notifications:', {
    service: !!service,
    subscribers: service?.subscribers?.size || 'Non disponible',
    cache: service?.cache?.size || 'Non disponible'
  })
  
  // Vérifier localStorage
  try {
    const saved = localStorage.getItem('ccc_notifications')
    const parsed = saved ? JSON.parse(saved) : []
    console.log('💾 Notifications en localStorage:', parsed.length)
  } catch (error) {
    console.error('❌ Erreur lecture localStorage:', error)
  }
  
  return {
    serviceAvailable: !!service,
    subscribers: service?.subscribers?.size || 0,
    localStorage: localStorage.getItem('ccc_notifications') ? 'Présent' : 'Absent'
  }
}

// 3. Nettoyer les notifications de test
window.clearTestNotifications = () => {
  try {
    const saved = localStorage.getItem('ccc_notifications')
    if (saved) {
      const parsed = JSON.parse(saved)
      const filtered = parsed.filter(n => !n.title?.includes('Test Notification'))
      localStorage.setItem('ccc_notifications', JSON.stringify(filtered))
      console.log('🧹 Notifications de test supprimées')
    }
  } catch (error) {
    console.error('❌ Erreur nettoyage:', error)
  }
}

// 4. Simuler une connexion SSE
window.simulateSSEMessage = (message) => {
  const sseData = {
    id: Date.now(),
    title: 'SSE Test',
    message: message || 'Message SSE simulé',
    type: 'SSE_TEST',
    created_at: new Date().toISOString(),
    is_read: false
  }
  
  console.log('📡 Simulation SSE:', sseData)
  
  // Simuler handleNewNotification
  if (window.notificationService?.handleNewNotification) {
    window.notificationService.handleNewNotification(sseData)
  } else {
    window.dispatchEvent(new CustomEvent('notification:new', {
      detail: sseData,
      bubbles: true
    }))
  }
}

console.log(`
🧪 Fonctions de test des notifications disponibles:

1. testNotification(type) - Crée une notification de test
2. checkNotificationState() - Vérifie l'état du système
3. clearTestNotifications() - Nettoie les notifications de test  
4. simulateSSEMessage(message) - Simule un message SSE

Exemples:
- testNotification('urgent')
- checkNotificationState()
- simulateSSEMessage('Test de connexion')
`)