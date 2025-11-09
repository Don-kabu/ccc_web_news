<template>
  <div class="notification-bell" ref="bellRef">
    <!-- Icône de notification -->
    <button @click="toggleDropdown" class="bell-button" :class="{ 'has-unread': unreadCount > 0 }">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      
      <!-- Badge de notifications non lues -->
      <span v-if="unreadCount > 0" class="unread-badge">
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown des notifications -->
    <div v-if="showDropdown" class="notification-dropdown">
      <!-- En-tête -->
      <div class="dropdown-header">
        <h3>Notifications</h3>
        <div class="header-actions">
          <button 
            v-if="unreadCount > 0" 
            @click="markAllAsRead" 
            class="mark-all-read-btn"
            :disabled="isLoading"
          >
            Tout marquer comme lu
          </button>
        </div>
      </div>

      <!-- Contenu -->
      <div class="dropdown-content">
        <!-- État de chargement -->
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Chargement des notifications...</p>
        </div>

        <!-- État d'erreur -->
        <div v-else-if="error" class="error-state">
          <div class="error-icon">⚠️</div>
          <p>{{ error }}</p>
          <button @click="loadNotifications" class="retry-btn">
            Réessayer
          </button>
        </div>

        <!-- Liste des notifications -->
        <div v-else-if="notifications.length > 0" class="notifications-list">
          <div 
            v-for="notification in notifications" 
            :key="notification.id"
            class="notification-item"
            :class="{ 
              'unread': !notification.is_read,
              'recent': notification.isRecent 
            }"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-icon">
              {{ notification.icon }}
            </div>
            
            <div class="notification-content">
              <div class="notification-header">
                <h4>{{ notification.title }}</h4>
                <span class="notification-time">{{ notification.timeAgo }}</span>
              </div>
              
              <p class="notification-message">{{ notification.message }}</p>
              
              <div v-if="notification.action_url" class="notification-action">
                <span class="action-text">{{ notification.action_text || 'Voir plus' }}</span>
              </div>
            </div>

            <div v-if="!notification.is_read" class="unread-indicator"></div>
          </div>
        </div>

        <!-- État vide -->
        <div v-else class="empty-state">
          <div class="empty-icon">🔔</div>
          <h4>Aucune notification</h4>
          <p>Vous êtes à jour ! Aucune nouvelle notification.</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="dropdown-footer">
        <button @click="viewAllNotifications" class="view-all-btn">
          Voir toutes les notifications
        </button>
      </div>
    </div>

    <!-- Overlay pour fermer le dropdown -->
    <div v-if="showDropdown" class="dropdown-overlay" @click="closeDropdown"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { notificationService } from '@/services/notification.service.js'

const props = defineProps({
  currentUser: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['notificationClick', 'viewAll'])

const bellRef = ref(null)
const showDropdown = ref(false)
const notifications = ref([])
const unreadCount = ref(0)
const isLoading = ref(false)
const error = ref(null)

// SSE uniquement - plus d'intervalles de rechargement périodique
// const refreshInterval = ref(null)
// const statsRefreshInterval = ref(null)
// const cleanupVisibilityListener = ref(null)

// Charger les notifications au montage
onMounted(async () => {
  console.log('🔔 Montage du composant NotificationBell (SSE uniquement)...')
  
  // Charger les données initiales
  await loadNotifications()
  await loadUnreadCount()
  
  console.log('🔔 Notifications initiales:', {
    total: notifications.value.length,
    unread: unreadCount.value,
    list: notifications.value.map(n => ({ id: n.id, title: n.title, read: n.is_read }))
  })
  
  // Initialiser les notifications SSE (temps réel uniquement)
  initializeRealTime()
  
  // Écouter les clics externes
  document.addEventListener('click', handleClickOutside)
  
  console.log('✅ NotificationBell SSE initialisé')
})

onUnmounted(() => {
  // Nettoyer les événements et connexions SSE
  document.removeEventListener('click', handleClickOutside)
  notificationService.disconnectRealTime()
  
  console.log('🧹 NotificationBell démonté (SSE fermé)')
})

const loadNotifications = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    console.log('🔔 Début du chargement des notifications...')
    
    const response = await notificationService.getNotifications({
      limit: 10,
      ordering: '-created_at'
    })
    
    console.log('🔔 Response notifications (type:', typeof response, '):', response)
    
    if (response.success || response.results || Array.isArray(response)) {
      // Gérer différentes structures de réponse API
      let notificationsList = []
      
      // Si response est directement un array
      if (Array.isArray(response)) {
        notificationsList = response
      }
      // Si response.results existe (structure principale pour notifications)
      else if (response.results) {
        if (Array.isArray(response.results)) {
          notificationsList = response.results
        }
      }
      // Si response.data existe (fallback)
      else if (response.data) {
        if (Array.isArray(response.data)) {
          // Si data est directement un array
          notificationsList = response.data
        } else if (response.data.results && Array.isArray(response.data.results)) {
          // Si data contient results (pagination)
          notificationsList = response.data.results
        } else if (response.data.notifications && Array.isArray(response.data.notifications)) {
          // Si data contient notifications
          notificationsList = response.data.notifications
        } else if (typeof response.data === 'object') {
          // Si data est un objet unique, le traiter comme une notification
          notificationsList = [response.data]
        }
      }
      // Fallback: chercher dans les autres propriétés possibles
      else if (response.notifications && Array.isArray(response.notifications)) {
        notificationsList = response.notifications
      }
      
      console.log('🔔 Notifications trouvées:', notificationsList.length, notificationsList)
      
      // Sécuriser le formatage
      notifications.value = notificationsList
        .filter(notif => notif && typeof notif === 'object') // Filtrer les objets valides
        .map(notification => {
          try {
            return notificationService.formatNotification(notification)
          } catch (formatError) {
            console.warn('⚠️ Erreur lors du formatage d\'une notification:', formatError, notification)
            // Retourner une notification par défaut en cas d'erreur de formatage
            return {
              id: notification.id || Math.random().toString(),
              title: 'Notification',
              message: 'Erreur de formatage',
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
        })
      
      console.log('🔔 Notifications formatées:', notifications.value)
    } else {
      console.warn('⚠️ Structure de réponse API non reconnue, chargement vide:', response)
      notifications.value = []
    }
    
  } catch (err) {
    console.error('Erreur lors du chargement des notifications:', err)
    error.value = 'Impossible de charger les notifications. Vérifiez votre connexion.'
    
    // Fallback : charger depuis localStorage si disponible
    try {
      const savedNotifications = localStorage.getItem('ccc_notifications')
      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications)
        const validNotifications = Array.isArray(parsed) ? parsed.slice(0, 10) : []
        
        if (validNotifications.length > 0) {
          notifications.value = validNotifications
          console.log('🔔 Notifications chargées depuis localStorage (fallback):', notifications.value.length)
        }
      } else {
        notifications.value = []
      }
    } catch (fallbackError) {
      console.warn('⚠️ Impossible de charger le fallback localStorage:', fallbackError)
      notifications.value = []
    }
  } finally {
    isLoading.value = false
  }
}

const loadUnreadCount = async () => {
  try {
    unreadCount.value = await notificationService.getUnreadCount()
  } catch (err) {
    console.error('Erreur lors du chargement du nombre non lu:', err)
  }
}

// SSE uniquement - pas de rechargement automatique par intervalles
const initializeSSEOnly = () => {
  console.log('� Initialisation SSE uniquement (sans polling ni intervalles)')
  
  // S'abonner aux événements SSE depuis le service
  const unsubscribe = notificationService.subscribe((event, data) => {
    console.log('🔔 NotificationBell - Événement reçu:', event, data)
    console.log('🔔 NotificationBell - État actuel:', {
      notificationsCount: notifications.value.length,
      unreadCount: unreadCount.value,
      subscribers: notificationService.subscribers ? notificationService.subscribers.size : 'unknown'
    })
    
    switch (event) {
      case 'new':
        // Nouvelle notification via SSE
        try {
          const formattedNotification = notificationService.formatNotification(data)
          console.log('🔔 Nouvelle notification SSE formatée:', formattedNotification)
          
          // Ajouter au début de la liste
          notifications.value.unshift(formattedNotification)
          
          // Limiter à 10 notifications visibles
          if (notifications.value.length > 10) {
            notifications.value = notifications.value.slice(0, 10)
          }
          
          // Incrémenter le compteur non lu
          unreadCount.value++
          
          // Forcer la réactivité de Vue
          notifications.value = [...notifications.value]
          
          console.log('🔔 Notification SSE ajoutée - Total:', notifications.value.length, 'Non lues:', unreadCount.value)
          
          // Afficher une notification native
          if (Notification.permission === 'granted' && data.title) {
            try {
              new Notification(data.title, {
                body: data.message || '',
                icon: '/favicon.ico',
                tag: `notification_${data.id}`
              })
            } catch (notifError) {
              console.warn('⚠️ Erreur notification native:', notifError)
            }
          }
        } catch (formatError) {
          console.error('❌ Erreur formatage notification SSE:', formatError, data)
        }
        break
        
      case 'read':
        // Notification marquée comme lue via SSE
        const notification = notifications.value.find(n => n.id === data.notificationId)
        if (notification) {
          notification.is_read = true
          unreadCount.value = Math.max(0, unreadCount.value - 1)
          
          // Forcer la réactivité
          notifications.value = [...notifications.value]
          console.log('🔔 Notification SSE marquée comme lue - Non lues:', unreadCount.value)
        }
        break
        
      case 'all_read':
        // Toutes les notifications marquées comme lues via SSE
        notifications.value.forEach(n => n.is_read = true)
        unreadCount.value = 0
        
        // Forcer la réactivité
        notifications.value = [...notifications.value]
        console.log('🔔 Toutes les notifications SSE marquées comme lues')
        break
        
      case 'count_update':
        // Mise à jour du count depuis SSE
        if (data && typeof data.count === 'number') {
          unreadCount.value = data.count
          console.log('🔢 Count SSE mis à jour:', data.count)
        }
        break
    }
  })
  
  // Initialiser la connexion SSE
  notificationService.initializeRealTimeNotifications()
  
  // Demander permission pour les notifications natives
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      console.log('🔔 Permission notifications:', permission)
    })
  }
  
  // Nettoyer lors de la destruction du composant
  onUnmounted(unsubscribe)
  
  console.log('✅ Notifications SSE uniquement initialisées')
}

const initializeRealTime = () => {
  console.log('🔔 Redirection vers initializeSSEOnly...')
  initializeSSEOnly()
}

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
  console.log('🔔 Dropdown togglé:', showDropdown.value ? 'ouvert' : 'fermé')
  
  // Plus de rechargement manuel - SSE gère tout en temps réel
}

const closeDropdown = () => {
  showDropdown.value = false
}

const handleClickOutside = (event) => {
  if (bellRef.value && !bellRef.value.contains(event.target)) {
    closeDropdown()
  }
}

const handleNotificationClick = async (notification) => {
  console.log('🔔 Clic sur notification:', notification)
  
  // Marquer comme lue si pas encore lu
  if (!notification.is_read) {
    try {
      await notificationService.markAsRead(notification.id)
      console.log('✅ Notification marquée comme lue')
    } catch (err) {
      console.error('Erreur lors du marquage comme lu:', err)
    }
  }
  
  // Émettre l'événement de clic vers le parent (App.vue via Navbar)
  emit('notificationClick', notification)
  
  // Fermer le dropdown
  closeDropdown()
}

const markAllAsRead = async () => {
  try {
    isLoading.value = true
    await notificationService.markAllAsRead()
    console.log('✅ Toutes les notifications marquées comme lues (SSE mettra à jour automatiquement)')
  } catch (err) {
    console.error('Erreur lors du marquage de toutes comme lues:', err)
    alert('Erreur lors du marquage comme lues')
  } finally {
    isLoading.value = false
  }
}

const viewAllNotifications = () => {
  emit('viewAll')
  closeDropdown()
}
</script>

<style scoped>
.notification-bell {
  position: relative;
}

.bell-button {
  position: relative;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.bell-button:hover {
  color: #374151;
  background: #f3f4f6;
}

.bell-button.has-unread {
  color: #3b82f6;
}

.unread-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  line-height: 1.2;
}

/* Dropdown */
.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 400px;
  max-width: 90vw;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  z-index: 1000;
  max-height: 500px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

.dropdown-header {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dropdown-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
}

.mark-all-read-btn {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.mark-all-read-btn:hover:not(:disabled) {
  background: #f3f4f6;
}

.mark-all-read-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dropdown-content {
  flex: 1;
  overflow-y: auto;
  max-height: 350px;
}

/* États */
.loading-state, .error-state, .empty-state {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-icon, .empty-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.retry-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1rem;
}

.retry-btn:hover {
  background: #2563eb;
}

/* Liste des notifications */
.notifications-list {
  padding: 0;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.notification-item:hover {
  background: #f9fafb;
}

.notification-item.unread {
  background: #eff6ff;
}

.notification-item.recent .notification-icon {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.notification-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.notification-header h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  line-height: 1.3;
}

.notification-time {
  font-size: 0.75rem;
  color: #6b7280;
  flex-shrink: 0;
}

.notification-message {
  font-size: 0.8rem;
  color: #4b5563;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.notification-action {
  font-size: 0.75rem;
  color: #3b82f6;
  font-weight: 500;
}

.unread-indicator {
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

/* Footer */
.dropdown-footer {
  padding: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.view-all-btn {
  width: 100%;
  background: none;
  border: 1px solid #e5e7eb;
  padding: 0.5rem;
  border-radius: 6px;
  color: #374151;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.view-all-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

/* Responsive */
@media (max-width: 768px) {
  .notification-dropdown {
    width: 350px;
    right: -50px;
  }
  
  .notification-item {
    padding: 0.75rem;
  }
  
  .notification-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>