<template>
  <div class="notifications-page">
    <div class="page-header">
      <h1>Notifications</h1>
      <p class="subtitle">Gérez toutes vos notifications</p>
    </div>

    <!-- Filtres et actions -->
    <div class="controls">
      <div class="filters">
        <select v-model="selectedFilter" @change="loadNotifications" class="filter-select">
          <option value="all">Toutes les notifications</option>
          <option value="unread">Non lues</option>
          <option value="read">Lues</option>
        </select>
        
        <select v-model="selectedType" @change="loadNotifications" class="filter-select">
          <option value="">Tous les types</option>
          <option value="NEWS_PUBLISHED">Articles publiés</option>
          <option value="NEWS_APPROVED">Articles approuvés</option>
          <option value="NEWS_REJECTED">Articles rejetés</option>
          <option value="NEWS_NEEDS_REVISION">Révisions demandées</option>
          <option value="COMMENT_ADDED">Commentaires</option>
          <option value="USER_MENTIONED">Mentions</option>
          <option value="SYSTEM_UPDATE">Mises à jour système</option>
        </select>
      </div>
      
      <div class="actions">
        <button 
          v-if="unreadCount > 0" 
          @click="markAllAsRead" 
          :disabled="isLoading"
          class="btn-mark-all"
        >
          Tout marquer comme lu ({{ unreadCount }})
        </button>
        
        <button @click="loadNotifications" :disabled="isLoading" class="btn-refresh">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M23 4v6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Actualiser
        </button>
      </div>
    </div>

    <!-- État de chargement -->
    <div v-if="isLoading && notifications.length === 0" class="loading-state">
      <div class="spinner"></div>
      <p>Chargement des notifications...</p>
    </div>

    <!-- État d'erreur -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Erreur de chargement</h3>
      <p>{{ error }}</p>
      <button @click="loadNotifications" class="retry-btn">
        Réessayer
      </button>
    </div>

    <!-- Liste des notifications -->
    <div v-else-if="notifications.length > 0" class="notifications-container">
      <div class="notifications-list">
        <div 
          v-for="notification in notifications" 
          :key="notification.id"
          class="notification-card"
          :class="{ 
            'unread': !notification.is_read,
            'recent': notification.isRecent 
          }"
        >
          <div class="notification-header">
            <div class="notification-icon" :style="{ color: notification.color }">
              {{ notification.icon }}
            </div>
            
            <div class="notification-meta">
              <span class="notification-type">{{ notification.typeLabel }}</span>
              <span class="notification-time">{{ notification.timeAgo }}</span>
            </div>
            
            <div class="notification-actions">
              <button 
                v-if="!notification.is_read"
                @click="markAsRead(notification.id)"
                class="mark-read-btn"
                title="Marquer comme lu"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="notification-content">
            <h3 class="notification-title">{{ notification.title }}</h3>
            <p class="notification-message">{{ notification.message }}</p>
            
            <div v-if="notification.action_url" class="notification-action">
              <button 
                @click="handleNotificationAction(notification)"
                class="action-btn"
              >
                {{ notification.action_text || 'Voir plus' }}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M7 17L17 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M7 7H17V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div v-if="!notification.is_read" class="unread-indicator"></div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="hasMore" class="pagination">
        <button 
          @click="loadMore" 
          :disabled="isLoadingMore"
          class="load-more-btn"
        >
          <span v-if="!isLoadingMore">Charger plus</span>
          <span v-else>Chargement...</span>
        </button>
      </div>
    </div>

    <!-- État vide -->
    <div v-else class="empty-state">
      <div class="empty-icon">🔔</div>
      <h3>Aucune notification</h3>
      <p v-if="selectedFilter === 'unread'">
        Vous avez lu toutes vos notifications !
      </p>
      <p v-else-if="selectedType">
        Aucune notification de ce type trouvée.
      </p>
      <p v-else>
        Vous n'avez encore reçu aucune notification.
      </p>
    </div>
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

const emit = defineEmits(['notificationClick'])

// État réactif
const notifications = ref([])
const selectedFilter = ref('all')
const selectedType = ref('')
const isLoading = ref(false)
const isLoadingMore = ref(false)
const error = ref(null)
const currentPage = ref(1)
const hasMore = ref(true)
const unreadCount = ref(0)

// Pagination
const pageSize = 20

onMounted(async () => {
  await loadNotifications()
  await loadUnreadCount()
  
  // Initialiser les notifications temps réel
  initializeRealTime()
})

onUnmounted(() => {
  notificationService.disconnectRealTime()
})

const loadNotifications = async (reset = true) => {
  try {
    if (reset) {
      isLoading.value = true
      currentPage.value = 1
      notifications.value = []
    } else {
      isLoadingMore.value = true
    }
    
    error.value = null
    
    const filters = {
      page: currentPage.value,
      page_size: pageSize,
      ordering: '-created_at'
    }
    
    if (selectedFilter.value === 'unread') {
      filters.is_read = false
    } else if (selectedFilter.value === 'read') {
      filters.is_read = true
    }
    
    if (selectedType.value) {
      filters.type = selectedType.value
    }
    
    const response = await notificationService.getNotifications(filters)
    
    if (response.success) {
      const formattedNotifications = response.data.results.map(notification => 
        notificationService.formatNotification(notification)
      )
      
      if (reset) {
        notifications.value = formattedNotifications
      } else {
        notifications.value.push(...formattedNotifications)
      }
      
      hasMore.value = !!response.data.next
      currentPage.value++
    } else {
      throw new Error(response.message || 'Erreur lors du chargement')
    }
    
  } catch (err) {
    console.error('Erreur lors du chargement des notifications:', err)
    error.value = 'Impossible de se connecter à l\'API pour charger les notifications'
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

const loadMore = () => {
  if (hasMore.value && !isLoadingMore.value) {
    loadNotifications(false)
  }
}

const loadUnreadCount = async () => {
  try {
    unreadCount.value = await notificationService.getUnreadCount()
  } catch (err) {
    console.error('Erreur lors du chargement du nombre non lu:', err)
  }
}

const initializeRealTime = () => {
  // S'abonner aux événements de notifications
  const unsubscribe = notificationService.subscribe((event, data) => {
    switch (event) {
      case 'new':
        // Nouvelle notification
        const formattedNotification = notificationService.formatNotification(data)
        
        // Ajouter en début de liste si les filtres correspondent
        if (shouldShowNotification(formattedNotification)) {
          notifications.value.unshift(formattedNotification)
        }
        
        unreadCount.value++
        break
        
      case 'read':
        // Notification marquée comme lue
        const notification = notifications.value.find(n => n.id === data.notificationId)
        if (notification) {
          notification.is_read = true
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        }
        break
        
      case 'all_read':
        // Toutes les notifications marquées comme lues
        notifications.value.forEach(n => n.is_read = true)
        unreadCount.value = 0
        break
    }
  })
  
  // Initialiser la connexion temps réel
  notificationService.initializeRealTimeNotifications()
  
  // Nettoyer lors de la destruction du composant
  onUnmounted(unsubscribe)
}

const shouldShowNotification = (notification) => {
  // Vérifier les filtres de statut
  if (selectedFilter.value === 'unread' && notification.is_read) return false
  if (selectedFilter.value === 'read' && !notification.is_read) return false
  
  // Vérifier le filtre de type
  if (selectedType.value && notification.type !== selectedType.value) return false
  
  return true
}

const markAsRead = async (notificationId) => {
  try {
    await notificationService.markAsRead(notificationId)
  } catch (err) {
    console.error('Erreur lors du marquage comme lu:', err)
    alert('Erreur lors du marquage comme lu')
  }
}

const markAllAsRead = async () => {
  if (!confirm('Marquer toutes les notifications comme lues ?')) return
  
  try {
    isLoading.value = true
    await notificationService.markAllAsRead()
    await loadNotifications()
  } catch (err) {
    console.error('Erreur lors du marquage de toutes comme lues:', err)
    alert('Erreur lors du marquage comme lues')
  } finally {
    isLoading.value = false
  }
}

const handleNotificationAction = async (notification) => {
  // Marquer comme lue si pas encore lu
  if (!notification.is_read) {
    await markAsRead(notification.id)
  }
  
  // Émettre l'événement de clic
  emit('notificationClick', notification)
  
  // Naviguer vers l'action
  if (notification.action_url) {
    window.open(notification.action_url, '_blank')
  }
}
</script>

<style scoped>
.notifications-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: #6b7280;
  margin: 0;
}

/* Contrôles */
.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.filters {
  display: flex;
  gap: 1rem;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
}

.actions {
  display: flex;
  gap: 0.75rem;
}

.btn-mark-all, .btn-refresh {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-mark-all {
  background: #3b82f6;
  color: white;
}

.btn-mark-all:hover:not(:disabled) {
  background: #2563eb;
}

.btn-refresh {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-refresh:hover:not(:disabled) {
  background: #f3f4f6;
}

.btn-mark-all:disabled, .btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* États */
.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #6b7280;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-icon, .empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;
}

.retry-btn:hover {
  background: #2563eb;
}

/* Notifications - cards have individual styling */

.notification-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  position: relative;
  transition: all 0.2s;
}

.notification-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.notification-card.unread {
  border-left: 4px solid #3b82f6;
  background: #eff6ff;
}

.notification-card.recent {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.notification-icon {
  font-size: 1.5rem;
  margin-right: 1rem;
}

.notification-meta {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.notification-type {
  font-size: 0.8rem;
  font-weight: 500;
  color: #374151;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.notification-time {
  font-size: 0.8rem;
  color: #6b7280;
}

.notification-actions {
  display: flex;
  gap: 0.5rem;
}

.mark-read-btn {
  background: none;
  border: 1px solid #d1d5db;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.mark-read-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.notification-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.notification-message {
  color: #4b5563;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.notification-action {
  margin-top: 1rem;
}

.action-btn {
  background: none;
  border: 1px solid #3b82f6;
  color: #3b82f6;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn:hover {
  background: #3b82f6;
  color: white;
}

.unread-indicator {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
}

/* Pagination */
.pagination {
  text-align: center;
  margin-top: 2rem;
}

.load-more-btn {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.load-more-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .notifications-page {
    padding: 1rem;
  }
  
  .controls {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .filters, .actions {
    justify-content: center;
  }
  
  .notification-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .notification-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>