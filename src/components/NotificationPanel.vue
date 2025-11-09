<template>
  <div class="notifications-panel" :class="{ 'dark': isDark }">
    <div class="notifications-header">
      <h3>Notifications</h3>
      <div class="header-actions">
        <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
        <button @click="markAllAsRead" class="mark-all-read" v-if="unreadCount > 0">
          Tout marquer comme lu
        </button>
      </div>
    </div>

    <div class="notifications-list">
      <div v-if="notifications.length === 0" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" stroke-width="2"/>
          <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" stroke-width="2"/>
        </svg>
        <p>Aucune notification pour le moment</p>
      </div>

      <div v-else>
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item"
          :class="{
            'unread': !notification.read,
            'urgent': notification.importance === 'urgente',
            'digest': notification.type.includes('digest')
          }"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-icon">
            <svg v-if="notification.type === 'urgent'" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2"/>
            </svg>
            <svg v-else-if="notification.type.includes('digest')" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
              <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
            </svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>

          <div class="notification-content">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-text">{{ notification.content }}</div>
            <div class="notification-meta">
              <span class="notification-time">{{ formatTime(notification.sent_at) }}</span>
              <span v-if="notification.type.includes('digest')" class="notification-type">
                {{ getTypeLabel(notification.type) }}
              </span>
            </div>
          </div>

          <div class="notification-actions">
            <button 
              v-if="!notification.read"
              @click.stop="markAsRead(notification.id)"
              class="mark-read-btn"
              title="Marquer comme lu"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="notifications-footer">
      <button @click="$emit('settings-click')" class="settings-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
          <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2579 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.01127 9.77251C4.28054 9.5799 4.48571 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.87653 6.85425 4.02405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" stroke-width="2"/>
        </svg>
        Paramètres de notification
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { notificationService } from '../services/notificationService.js'
import { useTheme } from '../composables/useTheme.js'

// Composable pour le thème
const { isDark } = useTheme()

const props = defineProps({
  currentUser: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['settings-click'])

// État réactif
const notifications = ref([])
const refreshInterval = ref(null)

// Computed
const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

// Méthodes
const loadNotifications = () => {
  notifications.value = notificationService.getUserNotifications(props.currentUser.id)
}

const markAsRead = (notificationId) => {
  notificationService.markAsRead(notificationId)
  loadNotifications() // Recharger pour mettre à jour l'état
}

const markAllAsRead = () => {
  notifications.value
    .filter(n => !n.read)
    .forEach(n => notificationService.markAsRead(n.id))
  loadNotifications()
}

const handleNotificationClick = (notification) => {
  if (!notification.read) {
    markAsRead(notification.id)
  }
  
  // Si c'est une notification d'article, on pourrait naviguer vers l'article
  if (notification.article_id) {
    console.log('Navigation vers l\'article:', notification.article_id)
    // Ici vous pourriez émettre un événement pour naviguer vers l'article
  }
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'À l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`
  
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

const getTypeLabel = (type) => {
  const labels = {
    'daily_digest': 'Digest quotidien',
    'weekly_digest': 'Digest hebdomadaire',
    'immediate': 'Immédiat',
    'urgent': 'Urgent'
  }
  return labels[type] || type
}

// Lifecycle
onMounted(() => {
  loadNotifications()
  
  // Recharger les notifications toutes les 30 secondes
  refreshInterval.value = setInterval(loadNotifications, 30000)
  
  // Écouter les nouvelles notifications
  window.addEventListener('notification-received', loadNotifications)
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
  window.removeEventListener('notification-received', loadNotifications)
})
</script>

<style scoped>
.notifications-panel {
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  
  /* Variables CSS pour le mode clair */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;
  --bg-hover: #f9fafb;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --border-primary: #e5e7eb;
  --border-secondary: #f3f4f6;
  --shadow-primary: 0 8px 32px rgba(0, 0, 0, 0.1);
  --shadow-secondary: 0 4px 16px rgba(0, 0, 0, 0.08);
  
  /* Couleurs des notifications */
  --unread-bg: #fef7ff;
  --urgent-bg: #fef2f2;
  --digest-bg: #f0f9ff;
  --unread-border: #6366f1;
  --urgent-border: #ef4444;
  --digest-border: #0ea5e9;
  
  /* Couleurs des icônes */
  --icon-bg: #f3f4f6;
  --icon-text: #6b7280;
  --urgent-icon-bg: #fef2f2;
  --urgent-icon-text: #ef4444;
  --digest-icon-bg: #f0f9ff;
  --digest-icon-text: #0ea5e9;
  
  /* Couleurs des actions */
  --action-bg: #f3f4f6;
  --action-text: #6b7280;
  --action-hover-bg: #16a34a;
  --action-hover-text: #ffffff;
  --settings-hover-bg: #f8faff;
  --settings-hover-border: #6366f1;
  --settings-hover-text: #6366f1;
  
  background: var(--bg-primary);
  box-shadow: var(--shadow-primary);
}

.notifications-panel.dark {
  /* Variables CSS pour le mode sombre */
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --bg-hover: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --border-primary: #334155;
  --border-secondary: #475569;
  --shadow-primary: 0 8px 32px rgba(0, 0, 0, 0.4);
  --shadow-secondary: 0 4px 16px rgba(0, 0, 0, 0.3);
  
  /* Couleurs des notifications pour le mode sombre */
  --unread-bg: #312e81;
  --urgent-bg: #7f1d1d;
  --digest-bg: #164e63;
  --unread-border: #6366f1;
  --urgent-border: #dc2626;
  --digest-border: #0284c7;
  
  /* Couleurs des icônes pour le mode sombre */
  --icon-bg: #334155;
  --icon-text: #94a3b8;
  --urgent-icon-bg: #7f1d1d;
  --urgent-icon-text: #f87171;
  --digest-icon-bg: #164e63;
  --digest-icon-text: #38bdf8;
  
  /* Couleurs des actions pour le mode sombre */
  --action-bg: #334155;
  --action-text: #94a3b8;
  --action-hover-bg: #059669;
  --action-hover-text: #ffffff;
  --settings-hover-bg: #1e293b;
  --settings-hover-border: #6366f1;
  --settings-hover-text: #818cf8;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-secondary);
  transition: all 0.3s ease;
}

.notifications-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 600;
  transition: color 0.3s ease;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.unread-badge {
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  min-width: 1.5rem;
  text-align: center;
  box-shadow: var(--shadow-secondary);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.mark-all-read {
  background: none;
  border: none;
  color: #6366f1;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
}

.mark-all-read:hover {
  color: #4f46e5;
  background: var(--settings-hover-bg);
}

.notifications-list {
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--border-secondary) transparent;
}

.notifications-list::-webkit-scrollbar {
  width: 6px;
}

.notifications-list::-webkit-scrollbar-track {
  background: transparent;
}

.notifications-list::-webkit-scrollbar-thumb {
  background: var(--border-secondary);
  border-radius: 3px;
}

.notifications-list::-webkit-scrollbar-thumb:hover {
  background: var(--border-primary);
}

.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  color: var(--text-muted);
  transition: color 0.3s ease;
}

.empty-state svg {
  margin-bottom: 1rem;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
}

.notification-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.notification-item:hover {
  background: var(--bg-hover);
  transform: translateY(-1px);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item.unread {
  background: var(--unread-bg);
  border-left: 4px solid var(--unread-border);
  animation: slideIn 0.3s ease;
}

.notification-item.urgent {
  background: var(--urgent-bg);
  border-left: 4px solid var(--urgent-border);
  animation: urgentPulse 1s ease-in-out infinite;
}

.notification-item.digest {
  background: var(--digest-bg);
  border-left: 4px solid var(--digest-border);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes urgentPulse {
  0%, 100% {
    box-shadow: 0 0 0 0 var(--urgent-border);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2);
  }
}

.notification-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--icon-bg);
  color: var(--icon-text);
  transition: all 0.3s ease;
}

.notification-item.urgent .notification-icon {
  background: var(--urgent-icon-bg);
  color: var(--urgent-icon-text);
}

.notification-item.digest .notification-icon {
  background: var(--digest-icon-bg);
  color: var(--digest-icon-text);
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  line-height: 1.3;
  transition: color 0.3s ease;
}

.notification-text {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.notification-time {
  transition: color 0.3s ease;
}

.notification-type {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.notification-actions {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.mark-read-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--action-bg);
  color: var(--action-text);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.7;
}

.mark-read-btn:hover {
  background: var(--action-hover-bg);
  color: var(--action-hover-text);
  opacity: 1;
  transform: scale(1.1);
}

.notifications-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-primary);
  background: var(--bg-secondary);
  transition: all 0.3s ease;
}

.settings-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: none;
  border: 2px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.settings-btn:hover {
  border-color: var(--settings-hover-border);
  color: var(--settings-hover-text);
  background: var(--settings-hover-bg);
  transform: translateY(-1px);
  box-shadow: var(--shadow-secondary);
}

/* Media queries responsives conservées avec les nouvelles variables */
@media (max-width: 768px) {
  .notifications-panel {
    max-width: none;
    width: 100%;
    right: 0;
    left: 0;
    top: 60px;
    border-radius: 0;
    max-height: calc(100vh - 60px);
  }
  
  .notifications-header {
    padding: 1rem;
  }
  
  .notifications-header h3 {
    font-size: 1.1rem;
  }
  
  .notification-item {
    padding: 0.75rem 1rem;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-end;
  }
  
  .mark-all-read {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .notifications-panel {
    top: 55px;
    max-height: calc(100vh - 55px);
  }
  
  .notifications-header {
    padding: 0.75rem;
  }
  
  .notifications-header h3 {
    font-size: 1rem;
  }
  
  .notification-item {
    padding: 0.6rem 0.75rem;
  }
  
  .notification-title {
    font-size: 0.85rem;
    line-height: 1.3;
  }
  
  .notification-text {
    font-size: 0.75rem;
  }
  
  .notification-meta {
    font-size: 0.7rem;
  }
  
  .unread-badge {
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
  }
  
  .header-actions {
    flex-direction: row;
    gap: 0.25rem;
  }
  
  .mark-all-read {
    padding: 0.4rem 0.6rem;
    font-size: 0.75rem;
  }
}

@media (max-width: 360px) {
  .notifications-panel {
    top: 50px;
    max-height: calc(100vh - 50px);
  }
  
  .notifications-header {
    padding: 0.5rem;
  }
  
  .notifications-header h3 {
    font-size: 0.9rem;
  }
  
  .notification-item {
    padding: 0.5rem;
  }
  
  .notification-title {
    font-size: 0.8rem;
  }
  
  .notification-text {
    font-size: 0.7rem;
  }
  
  .mark-all-read {
    padding: 0.3rem 0.5rem;
    font-size: 0.7rem;
  }
}

/* Optimisations pour orientation paysage */
@media (max-height: 500px) and (orientation: landscape) {
  .notifications-panel {
    max-height: 90vh;
    top: 45px;
  }
  
  .notifications-header {
    padding: 0.5rem 1rem;
  }
  
  .notification-item {
    padding: 0.5rem 1rem;
  }
}

/* Amélioration de l'accessibilité */
@media (prefers-reduced-motion: reduce) {
  .notifications-panel *,
  .notifications-panel *::before,
  .notifications-panel *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus visible pour l'accessibilité */
.mark-read-btn:focus-visible,
.settings-btn:focus-visible,
.mark-all-read:focus-visible {
  outline: 2px solid var(--unread-border);
  outline-offset: 2px;
}

.notification-item:focus-visible {
  outline: 2px solid var(--unread-border);
  outline-offset: -2px;
}
</style>