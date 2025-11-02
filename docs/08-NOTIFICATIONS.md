# 🔔 Système de Notifications et Communication

## 🎯 Vue d'ensemble

Le système de notifications informe les utilisateurs des **événements importants** : nouveaux articles, modération, changements de statut, etc.

## 📨 Types de notifications

### 📰 Notifications d'actualités

```javascript
const NEWS_NOTIFICATIONS = {
  // Pour les étudiants
  NEW_ARTICLE: {
    type: 'new_article',
    recipients: ['STUDENT', 'PUBLIANT', 'MODERATOR', 'ADMIN'],
    message: 'Nouvel article publié : {title}',
    icon: '📰'
  },
  
  // Pour les auteurs
  ARTICLE_APPROVED: {
    type: 'article_approved',
    recipients: ['author'],
    message: 'Votre article "{title}" a été approuvé !',
    icon: '✅'
  },
  
  ARTICLE_REJECTED: {
    type: 'article_rejected',
    recipients: ['author'],
    message: 'Votre article "{title}" a été rejeté. Raison : {reason}',
    icon: '❌'
  }
}
```

### 🛡️ Notifications de modération

```javascript
const MODERATION_NOTIFICATIONS = {
  // Pour les modérateurs
  ARTICLE_PENDING: {
    type: 'article_pending',
    recipients: ['MODERATOR', 'ADMIN'],
    message: 'Nouvel article en attente de modération : {title}',
    icon: '⏳'
  },
  
  // Pour les admins
  MODERATION_NEEDED: {
    type: 'moderation_needed',
    recipients: ['ADMIN'],
    message: '{count} articles en attente de modération',
    icon: '🚨'
  }
}
```

### 👥 Notifications système

```javascript
const SYSTEM_NOTIFICATIONS = {
  // Nouveaux utilisateurs
  NEW_USER_REGISTERED: {
    type: 'new_user',
    recipients: ['ADMIN'],
    message: 'Nouvel utilisateur inscrit : {username} ({university})',
    icon: '👤'
  },
  
  // Maintenance
  SYSTEM_MAINTENANCE: {
    type: 'maintenance',
    recipients: ['ALL'],
    message: 'Maintenance programmée le {date} à {time}',
    icon: '⚙️'
  }
}
```

## 🔔 useNotifications.js - Le Composable

### 🎯 Rôle principal

Gère l'**affichage**, la **réception** et l'**interaction** avec les notifications.

### 🔧 Code du composable

```javascript
// src/composables/useNotifications.js
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { notificationService } from '@/services/notification.service'

export function useNotifications(currentUser) {
  // État des notifications
  const notifications = ref([])
  const unreadCount = computed(() => 
    notifications.value.filter(n => !n.read).length
  )
  
  // Paramètres
  const settings = reactive({
    enabled: true,
    sound: true,
    desktop: false,
    email: true
  })
  
  // WebSocket pour notifications en temps réel
  let socket = null
  
  // Charger les notifications
  const loadNotifications = async () => {
    try {
      const response = await notificationService.getNotifications({
        limit: 50,
        status: 'all'
      })
      
      notifications.value = response.data.notifications
    } catch (error) {
      console.error('Erreur chargement notifications:', error)
    }
  }
  
  // Marquer comme lue
  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId)
      
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.read = true
      }
    } catch (error) {
      console.error('Erreur marquage lecture:', error)
    }
  }
  
  // Marquer toutes comme lues
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      
      notifications.value.forEach(notification => {
        notification.read = true
      })
    } catch (error) {
      console.error('Erreur marquage global:', error)
    }
  }
  
  // Supprimer une notification
  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId)
      
      notifications.value = notifications.value.filter(
        n => n.id !== notificationId
      )
    } catch (error) {
      console.error('Erreur suppression notification:', error)
    }
  }
  
  // Ajouter une nouvelle notification
  const addNotification = (notification) => {
    notifications.value.unshift({
      id: Date.now(),
      read: false,
      created_at: new Date().toISOString(),
      ...notification
    })
    
    // Limiter à 100 notifications
    if (notifications.value.length > 100) {
      notifications.value = notifications.value.slice(0, 100)
    }
    
    // Jouer un son si activé
    if (settings.sound && settings.enabled) {
      playNotificationSound()
    }
    
    // Notification desktop si activée
    if (settings.desktop && settings.enabled) {
      showDesktopNotification(notification)
    }
  }
  
  // Son de notification
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3')
      audio.volume = 0.3
      audio.play()
    } catch (error) {
      console.warn('Impossible de jouer le son de notification')
    }
  }
  
  // Notification desktop
  const showDesktopNotification = (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('CCC Web News', {
        body: notification.message,
        icon: '/icon-192x192.png',
        tag: notification.type
      })
    }
  }
  
  // Demander permission notifications desktop
  const requestDesktopPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      settings.desktop = permission === 'granted'
      return permission === 'granted'
    }
    return false
  }
  
  // Connexion WebSocket pour temps réel
  const connectWebSocket = () => {
    if (!currentUser.value) return
    
    const wsUrl = `ws://127.0.0.1:8000/ws/notifications/${currentUser.value.id}`
    socket = new WebSocket(wsUrl)
    
    socket.onopen = () => {
      console.log('🔔 WebSocket notifications connecté')
    }
    
    socket.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data)
        addNotification(notification)
      } catch (error) {
        console.error('Erreur parsing notification WebSocket:', error)
      }
    }
    
    socket.onclose = () => {
      console.log('🔔 WebSocket notifications fermé')
      
      // Reconnexion automatique après 5 secondes
      setTimeout(() => {
        if (currentUser.value) {
          connectWebSocket()
        }
      }, 5000)
    }
    
    socket.onerror = (error) => {
      console.error('Erreur WebSocket notifications:', error)
    }
  }
  
  // Fermer la connexion WebSocket
  const disconnectWebSocket = () => {
    if (socket) {
      socket.close()
      socket = null
    }
  }
  
  // Sauvegarder les paramètres
  const saveSettings = async () => {
    try {
      await notificationService.updateSettings(settings)
      localStorage.setItem('notification-settings', JSON.stringify(settings))
    } catch (error) {
      console.error('Erreur sauvegarde paramètres:', error)
    }
  }
  
  // Charger les paramètres
  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('notification-settings')
      if (saved) {
        Object.assign(settings, JSON.parse(saved))
      }
    } catch (error) {
      console.warn('Erreur chargement paramètres notifications')
    }
  }
  
  // Initialisation
  onMounted(() => {
    loadSettings()
    loadNotifications()
    connectWebSocket()
  })
  
  // Nettoyage
  onUnmounted(() => {
    disconnectWebSocket()
  })
  
  return {
    notifications,
    unreadCount,
    settings,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    requestDesktopPermission,
    saveSettings,
    connectWebSocket,
    disconnectWebSocket
  }
}
```

## 🔔 NotificationPanel.vue - Le Composant

### 🎯 Rôle principal

Interface utilisateur pour **afficher** et **gérer** les notifications.

### 🔧 Code du composant

```javascript
<!-- src/components/NotificationPanel.vue -->
<template>
  <div class="notification-panel">
    <!-- Bouton de notification avec badge -->
    <button 
      @click="togglePanel" 
      class="notification-button"
      :class="{ 'has-unread': unreadCount > 0 }"
    >
      🔔
      <span v-if="unreadCount > 0" class="badge">
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>
    
    <!-- Panel des notifications -->
    <div v-if="isOpen" class="notification-dropdown">
      <!-- Header -->
      <div class="notification-header">
        <h3>🔔 Notifications</h3>
        <div class="header-actions">
          <button @click="markAllAsRead" v-if="unreadCount > 0">
            ✅ Tout marquer lu
          </button>
          <button @click="showSettings = !showSettings">
            ⚙️ Paramètres
          </button>
        </div>
      </div>
      
      <!-- Paramètres -->
      <div v-if="showSettings" class="notification-settings">
        <label>
          <input 
            type="checkbox" 
            v-model="settings.enabled"
            @change="saveSettings"
          >
          🔔 Notifications activées
        </label>
        
        <label>
          <input 
            type="checkbox" 
            v-model="settings.sound"
            @change="saveSettings"
            :disabled="!settings.enabled"
          >
          🔊 Son
        </label>
        
        <label>
          <input 
            type="checkbox" 
            v-model="settings.desktop"
            @change="handleDesktopToggle"
            :disabled="!settings.enabled"
          >
          💻 Notifications bureau
        </label>
        
        <label>
          <input 
            type="checkbox" 
            v-model="settings.email"
            @change="saveSettings"
            :disabled="!settings.enabled"
          >
          📧 Notifications email
        </label>
      </div>
      
      <!-- Liste des notifications -->
      <div class="notification-list">
        <div 
          v-for="notification in notifications" 
          :key="notification.id"
          class="notification-item"
          :class="{ 
            'unread': !notification.read,
            [notification.type]: true 
          }"
        >
          <!-- Icon -->
          <div class="notification-icon">
            {{ getNotificationIcon(notification.type) }}
          </div>
          
          <!-- Contenu -->
          <div class="notification-content">
            <div class="notification-message">
              {{ notification.message }}
            </div>
            <div class="notification-time">
              {{ formatTime(notification.created_at) }}
            </div>
          </div>
          
          <!-- Actions -->
          <div class="notification-actions">
            <button 
              v-if="!notification.read"
              @click="markAsRead(notification.id)"
              title="Marquer comme lu"
            >
              ✅
            </button>
            <button 
              @click="deleteNotification(notification.id)"
              title="Supprimer"
            >
              🗑️
            </button>
          </div>
        </div>
        
        <!-- Message si vide -->
        <div v-if="notifications.length === 0" class="empty-state">
          <div class="empty-icon">🔔</div>
          <p>Aucune notification</p>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="notification-footer">
        <button @click="loadMoreNotifications" v-if="hasMoreNotifications">
          📄 Charger plus
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useNotifications } from '@/composables/useNotifications'
import { useAuth } from '@/composables/useAuth'

// Props
const props = defineProps({
  position: {
    type: String,
    default: 'top-right' // top-right, top-left, bottom-right, bottom-left
  }
})

// Composables
const { currentUser } = useAuth()
const {
  notifications,
  unreadCount,
  settings,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  requestDesktopPermission,
  saveSettings
} = useNotifications(currentUser)

// État local
const isOpen = ref(false)
const showSettings = ref(false)
const hasMoreNotifications = ref(true)

// Méthodes
const togglePanel = () => {
  isOpen.value = !isOpen.value
  showSettings.value = false
}

const handleDesktopToggle = async () => {
  if (settings.desktop) {
    const granted = await requestDesktopPermission()
    if (!granted) {
      settings.desktop = false
      alert('Permission refusée pour les notifications bureau')
    }
  }
  saveSettings()
}

const getNotificationIcon = (type) => {
  const icons = {
    new_article: '📰',
    article_approved: '✅',
    article_rejected: '❌',
    article_pending: '⏳',
    new_user: '👤',
    maintenance: '⚙️',
    comment: '💬',
    like: '❤️',
    follow: '👥'
  }
  
  return icons[type] || '🔔'
}

const formatTime = (timestamp) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diff = now - time
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'À l\'instant'
  if (minutes < 60) return `Il y a ${minutes}min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days < 7) return `Il y a ${days}j`
  
  return time.toLocaleDateString('fr-FR')
}

const loadMoreNotifications = async () => {
  // Implémenter la pagination
  // ...
}

// Fermer le panel en cliquant à l'extérieur
const handleClickOutside = (event) => {
  if (!event.target.closest('.notification-panel')) {
    isOpen.value = false
  }
}

// Écouter les clics à l'extérieur
document.addEventListener('click', handleClickOutside)

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.notification-panel {
  position: relative;
}

.notification-button {
  position: relative;
  background: #f0f0f0;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.notification-button:hover {
  background: #e0e0e0;
  transform: scale(1.1);
}

.notification-button.has-unread {
  animation: pulse 2s infinite;
}

.badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff4444;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

.notification-dropdown {
  position: absolute;
  top: 50px;
  right: 0;
  width: 350px;
  max-height: 500px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
  overflow: hidden;
}

.notification-header {
  padding: 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-header h3 {
  margin: 0;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.header-actions button {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 12px;
  padding: 5px;
  border-radius: 4px;
}

.header-actions button:hover {
  background: #e9ecef;
}

.notification-settings {
  padding: 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.notification-settings label {
  display: block;
  margin-bottom: 10px;
  font-size: 14px;
  cursor: pointer;
}

.notification-settings input {
  margin-right: 8px;
}

.notification-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background: #f8f9fa;
}

.notification-item.unread {
  background: #f0f8ff;
  border-left: 3px solid #007bff;
}

.notification-icon {
  font-size: 18px;
  margin-right: 12px;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
}

.notification-message {
  font-size: 14px;
  margin-bottom: 4px;
  line-height: 1.4;
}

.notification-time {
  font-size: 12px;
  color: #666;
}

.notification-actions {
  display: flex;
  gap: 5px;
  margin-left: 10px;
}

.notification-actions button {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  padding: 2px;
  border-radius: 3px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.notification-actions button:hover {
  opacity: 1;
  background: #f0f0f0;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 10px;
  opacity: 0.5;
}

.notification-footer {
  padding: 10px 15px;
  background: #f8f9fa;
  border-top: 1px solid #eee;
  text-align: center;
}

.notification-footer button {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 14px;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
</style>
```

## 🔧 Utilisation dans l'application

### 📱 Dans App.vue - Intégration

```javascript
<template>
  <div id="app">
    <header class="app-header">
      <h1>🏫 CCC Web News</h1>
      
      <!-- Panel de notifications -->
      <NotificationPanel />
      
      <div class="user-menu">
        <span>👤 {{ currentUser?.username }}</span>
        <button @click="logout">🚪 Déconnexion</button>
      </div>
    </header>
    
    <!-- Reste de l'app -->
    <main>
      <!-- ... -->
    </main>
  </div>
</template>

<script setup>
import NotificationPanel from '@/components/NotificationPanel.vue'
import { useAuth } from '@/composables/useAuth'

const { currentUser, logout } = useAuth()
</script>
```

### ✍️ Dans PublishPage.vue - Envoi de notifications

```javascript
<script setup>
import { useNotifications } from '@/composables/useNotifications'

const { addNotification } = useNotifications(currentUser)

const publishArticle = async () => {
  try {
    const response = await newsService.createNews(article)
    
    // Notification locale de succès
    addNotification({
      type: 'success',
      message: 'Article publié avec succès !',
      icon: '✅'
    })
    
    // Le backend enverra des notifications aux modérateurs
    // via WebSocket automatiquement
    
    resetForm()
  } catch (error) {
    addNotification({
      type: 'error',
      message: 'Erreur lors de la publication',
      icon: '❌'
    })
  }
}
</script>
```

### 🛡️ Dans ModerationPage.vue - Notifications de modération

```javascript
<script setup>
const moderateArticle = async (articleId, action, reason = '') => {
  try {
    await moderationService.moderateArticle(articleId, {
      action, // 'approve' ou 'reject'
      reason
    })
    
    // Le backend enverra automatiquement une notification
    // à l'auteur de l'article
    
    addNotification({
      type: 'success',
      message: `Article ${action === 'approve' ? 'approuvé' : 'rejeté'}`,
      icon: action === 'approve' ? '✅' : '❌'
    })
    
    // Recharger la liste
    await loadPendingArticles()
  } catch (error) {
    addNotification({
      type: 'error',
      message: 'Erreur lors de la modération',
      icon: '❌'
    })
  }
}
</script>
```

## 📧 notification.service.js - Le Service

### 🎯 Rôle principal

Interface avec l'API backend pour **envoyer**, **recevoir** et **gérer** les notifications.

### 🔧 Code du service

```javascript
// src/services/notification.service.js
import { httpService } from './http.service'

class NotificationService {
  
  // Récupérer les notifications
  async getNotifications(params = {}) {
    const response = await httpService.get('/notifications', { params })
    return response
  }
  
  // Marquer comme lue
  async markAsRead(notificationId) {
    const response = await httpService.patch(`/notifications/${notificationId}/read`)
    return response
  }
  
  // Marquer toutes comme lues
  async markAllAsRead() {
    const response = await httpService.patch('/notifications/read-all')
    return response
  }
  
  // Supprimer une notification
  async deleteNotification(notificationId) {
    const response = await httpService.delete(`/notifications/${notificationId}`)
    return response
  }
  
  // Mettre à jour les paramètres
  async updateSettings(settings) {
    const response = await httpService.put('/notifications/settings', settings)
    return response
  }
  
  // Récupérer les paramètres
  async getSettings() {
    const response = await httpService.get('/notifications/settings')
    return response
  }
  
  // Envoyer une notification (pour les admins)
  async sendNotification(notification) {
    const response = await httpService.post('/notifications/send', notification)
    return response
  }
  
  // S'abonner aux notifications push (Firebase/OneSignal)
  async subscribeToPush(subscription) {
    const response = await httpService.post('/notifications/push/subscribe', subscription)
    return response
  }
  
  // Se désabonner des notifications push
  async unsubscribeFromPush(subscription) {
    const response = await httpService.post('/notifications/push/unsubscribe', subscription)
    return response
  }
}

export const notificationService = new NotificationService()
```

## 🚀 Fonctionnalités avancées

### 📱 Notifications Push (mobile)

```javascript
// Service Worker pour notifications push
// public/sw.js
self.addEventListener('push', function(event) {
  const options = {
    body: event.data.text(),
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Voir l\'article',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/icons/xmark.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('CCC Web News', options)
  )
})
```

### 📧 Templates d'emails

```javascript
// Configuration des templates d'email
const EMAIL_TEMPLATES = {
  ARTICLE_APPROVED: {
    subject: '✅ Votre article a été approuvé',
    template: `
      <h2>Félicitations !</h2>
      <p>Votre article "<strong>{{title}}</strong>" a été approuvé et publié.</p>
      <p><a href="{{article_url}}">Voir l'article</a></p>
    `
  },
  
  ARTICLE_REJECTED: {
    subject: '❌ Votre article nécessite des modifications',
    template: `
      <h2>Article en attente</h2>
      <p>Votre article "<strong>{{title}}</strong>" nécessite des modifications.</p>
      <p><strong>Raison :</strong> {{reason}}</p>
      <p><a href="{{edit_url}}">Modifier l'article</a></p>
    `
  }
}
```

### 🔔 Notifications groupées

```javascript
// Grouper les notifications similaires
const groupNotifications = (notifications) => {
  const grouped = {}
  
  notifications.forEach(notification => {
    const key = `${notification.type}_${notification.date}`
    
    if (!grouped[key]) {
      grouped[key] = {
        type: notification.type,
        date: notification.date,
        count: 0,
        items: []
      }
    }
    
    grouped[key].count++
    grouped[key].items.push(notification)
  })
  
  return Object.values(grouped).map(group => {
    if (group.count === 1) {
      return group.items[0]
    }
    
    return {
      id: `group_${group.type}_${group.date}`,
      type: group.type,
      message: `${group.count} nouvelles notifications`,
      grouped: true,
      items: group.items,
      created_at: group.date
    }
  })
}
```

## 🐛 Debugging et monitoring

### 📊 Console de debug

```javascript
// Ajouter dans useNotifications.js
if (import.meta.env.DEV) {
  window.__DEBUG_NOTIFICATIONS__ = {
    notifications: notifications.value,
    settings,
    unreadCount: unreadCount.value,
    addTestNotification: () => {
      addNotification({
        type: 'test',
        message: 'Notification de test',
        icon: '🧪'
      })
    }
  }
}
```

### ⚠️ Erreurs communes

1. **WebSocket non connecté** : Vérifier la connexion réseau
2. **Permissions desktop refusées** : Guider l'utilisateur
3. **Trop de notifications** : Implémenter la pagination
4. **Notifications en doublon** : Déduplication côté client

---

> 💡 **Performance** : Limiter le nombre de notifications chargées et implémenter la pagination pour éviter les problèmes de performance.