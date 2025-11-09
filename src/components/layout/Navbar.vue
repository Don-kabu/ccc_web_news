<template>
  <nav class="navbar" :class="{ 'dark': isDark }">
    <div class="navbar-container" >
      <!-- Logo et nom -->
      <div class="navbar-brand">
        <div class="logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M3 17L12 22L21 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M3 12L12 17L21 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="brand-info">
          <h2>{{ currentUser.university?.name || 'CCC Web News' }}</h2>
          <span class="brand-subtitle">{{ currentUser.university?.city || 'Actualités Universitaires' }}</span>
        </div>
      </div>

      <!-- Navigation -->
      <div class="navbar-nav">
        <button
          @click="$emit('tab-change', 'accueil')"
          :class="['nav-tab', { active: activeTab === 'accueil' }]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 12L12 3L21 12V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V12Z" stroke="currentColor" stroke-width="2"/>
            <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>Accueil</span>
        </button>
        
        <button
          @click="$emit('tab-change', 'news')"
          :class="['nav-tab', { active: activeTab === 'news' }]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
            <path d="M14 2V8H20" stroke="currentColor" stroke-width="2"/>
            <path d="M16 13H8" stroke="currentColor" stroke-width="2"/>
            <path d="M16 17H8" stroke="currentColor" stroke-width="2"/>
            <path d="M10 9H8" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>News</span>
        </button>
        
        <button
          v-if="canPublish()"
          @click="$emit('tab-change', 'publier')"
          :class="['nav-tab', { active: activeTab === 'publier' }]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M14.828 14.828C15.2928 14.3633 15.5787 13.7412 15.6364 13.0813C15.6941 12.4214 15.5197 11.7647 15.1456 11.2207C14.7715 10.6767 14.2235 10.2804 13.5857 10.0938C12.9479 9.90719 12.2591 9.94194 11.6464 10.1934L7.52893 6.07598C7.78943 5.46327 7.82418 4.77454 7.63757 4.13676C7.45096 3.49898 7.05464 2.95103 6.51065 2.57695C5.96666 2.20287 5.30996 2.02845 4.65007 2.08612C3.99018 2.1438 3.36808 2.42966 2.90337 2.89437C2.43866 3.35908 2.1528 3.98118 2.09513 4.64107C2.03746 5.30096 2.21188 5.95766 2.58596 6.50165C2.96004 7.04564 3.50799 7.44196 4.14577 7.62857C4.78355 7.81518 5.47228 7.78043 6.08499 7.51993L10.2024 11.6374C9.95097 12.2501 9.91622 12.9388 10.1028 13.5766C10.2894 14.2144 10.6857 14.7624 11.2297 15.1365C11.7737 15.5106 12.4304 15.685 13.0903 15.6273C13.7502 15.5696 14.3723 15.2837 14.837 14.819L18.9544 18.9364C18.6939 19.5491 18.6592 20.2379 18.8458 20.8756C19.0324 21.5134 19.4287 22.0614 19.9727 22.4355C20.5167 22.8096 21.1734 22.984 21.8333 22.9263C22.4932 22.8686 23.1153 22.5827 23.58 22.118C24.0447 21.6533 24.3306 21.0312 24.3883 20.3713C24.446 19.7114 24.2715 19.0547 23.8974 18.5107C23.5233 17.9667 22.9754 17.5704 22.3376 17.3838C21.6998 17.1972 21.0111 17.2319 20.3984 17.4924L16.281 13.375C16.5324 12.7623 16.5671 12.0736 16.3805 11.4358C16.1939 10.798 15.7976 10.25 15.2536 9.87591C14.7096 9.50183 14.0529 9.32741 13.393 9.38508C12.7331 9.44275 12.111 9.72861 11.6463 10.1933L7.52893 6.07598Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Publier</span>
        </button>
        
        <button
          v-if="canModerate()"
          @click="$emit('tab-change', 'moderation')"
          :class="['nav-tab', { active: activeTab === 'moderation' }]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>Modération</span>
        </button>
        
        <button
          v-if="canManageUsers()"
          @click="$emit('tab-change', 'admin')"
          :class="['nav-tab', { active: activeTab === 'admin' }]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2"/>
            <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2579 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.01127 9.77251C4.28054 9.5799 4.48571 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>Administration</span>
        </button>
      </div>

      <!-- Menu utilisateur -->
      <div class="navbar-user" >
        <!-- Bouton de thème -->
        <ThemeToggle />
        
        <!-- Bouton notifications -->
        <div class="notifications-wrapper">
          <!-- Indicateur au-dessus -->
          <div v-if="props.unreadCount > 0" class="notification-indicator">
            <span class="indicator-count">{{ props.unreadCount > 99 ? '99+' : props.unreadCount }}</span>
            <span class="indicator-label">Non lues</span>
          </div>
          
          <!-- NotificationBell -->
          <NotificationBell 
            :current-user="currentUser"
            @notification-click="handleNotificationClick"
            @view-all="handleViewAllNotifications"
          />
        </div>

        <div class="user-dropdown" :class="{ open: showUserMenu }">
          <button @click="toggleUserMenu" class="user-button">
            <div class="user-avatar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="user-info">
              <span class="user-name">{{ currentUser.first_name }} {{ currentUser.last_name }}</span>
              <span class="user-role">{{ getRoleLabel(currentUser.role) }}</span>
            </div>
            <svg class="dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <div v-if="showUserMenu" class="dropdown-menu">
            <button @click="handleProfileClick" class="dropdown-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
              </svg>
              Mon Profil
            </button>
            
            <button @click="handleSettingsClick" class="dropdown-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="2"/>
              </svg>
              Paramètres
            </button>
            
            <!-- Bouton Gérer (Admin uniquement) -->
            <button 
              v-if="canManageUsers()" 
              @click="handleAdminClick" 
              class="dropdown-item admin-manage"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Gérer API
            </button>
            
            <div class="dropdown-divider"></div>
            
            <button @click="handleLogout" class="dropdown-item logout">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 17L21 12L16 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePermissions } from '../../composables/usePermissions.js'
import { PERMISSIONS } from '../../composables/usePermissions.js'
import { useTheme } from '../../composables/useTheme.js'
import NotificationBell from '../NotificationBell.vue'
import ThemeToggle from '../ui/ThemeToggle.vue'

// Composable pour le thème
const { isDark } = useTheme()

const props = defineProps({
  currentUser: {
    type: Object,
    required: true
  },
  activeTab: {
    type: String,
    required: true
  },
  unreadCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['tab-change', 'logout', 'profile-click', 'settings-click', 'notifications-click', 'notification-click', 'view-all-notifications'])

const showUserMenu = ref(false)

// Système de permissions - créer une instance réactive
const { hasPermission, getRoleLabel: getRoleDisplayName } = usePermissions(computed(() => props.currentUser))

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const getRoleLabel = (role) => {
  return getRoleDisplayName(role)
}

// Vérifier si l'utilisateur peut publier
const canPublish = () => {
  return hasPermission.value(PERMISSIONS.CREATE_NEWS)
}

// Vérifier si l'utilisateur peut modérer
const canModerate = () => {
  return hasPermission.value(PERMISSIONS.MODERATE_NEWS)
}

// Vérifier si l'utilisateur peut gérer les utilisateurs
const canManageUsers = () => {
  return hasPermission.value(PERMISSIONS.MANAGE_USERS)
}

const handleProfileClick = () => {
  showUserMenu.value = false
  emit('profile-click')
}

const handleSettingsClick = () => {
  showUserMenu.value = false
  emit('settings-click')
}

const handleAdminClick = () => {
  showUserMenu.value = false
  // Ouvrir l'interface d'administration Django dans un nouvel onglet
  const adminUrl = 'https://univers-news-ccc-kabu.onrender.com/admin/'
  window.open(adminUrl, '_blank', 'noopener,noreferrer')
}

const handleLogout = () => {
  showUserMenu.value = false
  emit('logout')
}

const handleNotificationClick = (notification) => {
  emit('notification-click', notification)
}

const handleViewAllNotifications = () => {
  emit('view-all-notifications')
}
</script>

<style scoped>
.navbar {
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-primary);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;
  
  /* Variables CSS pour le mode clair */
  --bg-primary: rgba(255, 255, 255, 0.95);
  --bg-secondary: rgba(243, 244, 246, 0.8);
  --bg-tertiary: rgba(255, 255, 255, 0.8);
  --bg-hover: rgba(255, 255, 255, 0.95);
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --border-primary: rgba(226, 232, 240, 0.8);
  --border-secondary: rgba(255, 255, 255, 0.3);
  --shadow-primary: 0 8px 32px rgba(15, 23, 42, 0.1);
  --shadow-secondary: 0 4px 12px rgba(15, 23, 42, 0.08);
  --shadow-tertiary: 0 2px 8px rgba(99, 102, 241, 0.3);
  
  /* Couleurs d'accent */
  --accent-primary: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  --accent-shadow: rgba(99, 102, 241, 0.3);
  --logo-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
  
  /* États des boutons */
  --nav-tab-hover-bg: rgba(255, 255, 255, 0.7);
  --user-button-hover-bg: rgba(255, 255, 255, 0.95);
  --dropdown-bg: rgba(255, 255, 255, 0.95);
  --dropdown-hover-bg: rgba(248, 250, 252, 0.8);
  --logout-color: #ef4444;
  --logout-hover-bg: rgba(239, 68, 68, 0.1);
  --admin-color: #3b82f6;
  --admin-hover-bg: rgba(59, 130, 246, 0.1);
  
  background: var(--bg-primary);
  box-shadow: var(--shadow-primary);
}

.navbar.dark {
  /* Variables CSS pour le mode sombre */
  --bg-primary: rgba(15, 23, 42, 0.95);
  --bg-secondary: rgba(30, 41, 59, 0.8);
  --bg-tertiary: rgba(51, 65, 85, 0.8);
  --bg-hover: rgba(30, 41, 59, 0.95);
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --border-primary: rgba(51, 65, 85, 0.8);
  --border-secondary: rgba(71, 85, 105, 0.3);
  --shadow-primary: 0 8px 32px rgba(0, 0, 0, 0.3);
  --shadow-secondary: 0 4px 12px rgba(0, 0, 0, 0.2);
  --shadow-tertiary: 0 2px 8px rgba(99, 102, 241, 0.4);
  
  /* Couleurs d'accent pour le mode sombre */
  --accent-primary: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  --accent-shadow: rgba(99, 102, 241, 0.4);
  --logo-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
  
  /* États des boutons pour le mode sombre */
  --nav-tab-hover-bg: rgba(51, 65, 85, 0.7);
  --user-button-hover-bg: rgba(30, 41, 59, 0.95);
  --dropdown-bg: rgba(15, 23, 42, 0.95);
  --dropdown-hover-bg: rgba(30, 41, 59, 0.8);
  --logout-color: #f87171;
  --logout-hover-bg: rgba(248, 113, 113, 0.15);
  --admin-color: #60a5fa;
  --admin-hover-bg: rgba(96, 165, 250, 0.15);
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  width: 48px;
  height: 48px;
  background: var(--accent-primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: var(--logo-shadow);
  transition: all 0.3s ease;
}

.logo:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px var(--accent-shadow);
}

.brand-info h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
  transition: color 0.3s ease;
}

.brand-subtitle {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
  transition: color 0.3s ease;
}

.navbar-nav {
  display: flex;
  gap: 0.5rem;
  background: var(--bg-secondary);
  padding: 0.5rem;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-radius: 12px;
  color: var(--text-secondary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  position: relative;
  overflow: hidden;
}

.nav-tab::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--nav-tab-hover-bg);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.nav-tab:hover::before {
  opacity: 1;
}

.nav-tab:hover {
  color: var(--text-primary);
  transform: translateY(-1px);
}

.nav-tab.active {
  background: var(--accent-primary);
  color: white;
  box-shadow: var(--shadow-secondary);
  transform: translateY(-1px);
}

.nav-tab.active::before {
  display: none;
}

.navbar-user {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-dropdown {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-secondary);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.user-button:hover {
  background: var(--user-button-hover-bg);
  box-shadow: var(--shadow-secondary);
  transform: translateY(-1px);
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: var(--accent-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: var(--shadow-tertiary);
  transition: all 0.3s ease;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
  line-height: 1.2;
  transition: color 0.3s ease;
}

.user-role {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
  transition: color 0.3s ease;
}

.dropdown-arrow {
  color: var(--text-muted);
  transition: all 0.3s ease;
}

.user-dropdown.open .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: var(--dropdown-bg);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-primary);
  min-width: 200px;
  overflow: hidden;
  animation: dropdownSlide 0.3s ease-out;
  backdrop-filter: blur(20px);
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  position: relative;
  overflow: hidden;
}

.dropdown-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  right: 0;
  bottom: 0;
  background: var(--dropdown-hover-bg);
  transition: left 0.3s ease;
  z-index: -1;
}

.dropdown-item:hover::before {
  left: 0;
}

.dropdown-item:hover {
  transform: translateX(2px);
}

.dropdown-item.logout {
  color: var(--logout-color);
}

.dropdown-item.logout::before {
  background: var(--logout-hover-bg);
}

.dropdown-item.admin-manage {
  color: var(--admin-color);
  font-weight: 500;
}

.dropdown-item.admin-manage::before {
  background: var(--admin-hover-bg);
}

.dropdown-divider {
  height: 1px;
  background: var(--border-primary);
  margin: 0.25rem 0;
}

@keyframes dropdownSlide {
  from {
    opacity: 0;
    transform: translateY(-0.5rem) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Pulse animation pour éléments importants */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.logo:active {
  animation: pulse 0.2s ease;
}

/* Media queries responsives avec les nouvelles variables */
@media (max-width: 768px) {
  .navbar-container {
    padding: 1rem;
    gap: 1rem;
    flex-wrap: wrap;
  }
  
  .brand-info h2 {
    font-size: 1rem;
  }
  
  .brand-subtitle {
    display: none;
  }
  
  .navbar-nav {
    order: 3;
    width: 100%;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .nav-tab {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    flex: 1;
    min-width: auto;
    justify-content: center;
  }
  
  .nav-tab span {
    display: none;
  }
  
  .navbar-user {
    gap: 0.75rem;
  }
  
  .user-info {
    display: none;
  }
  
  .dropdown-menu {
    right: 0;
    left: auto;
    min-width: 200px;
  }
}

@media (max-width: 480px) {
  .navbar-container {
    padding: 0.75rem;
    gap: 0.75rem;
  }
  
  .brand-info h2 {
    font-size: 0.9rem;
  }
  
  .navbar-nav {
    gap: 0.25rem;
  }
  
  .nav-tab {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    border-radius: 8px;
  }
  
  .nav-tab svg {
    width: 16px;
    height: 16px;
  }
  
  .user-button {
    padding: 0.5rem;
    border-radius: 16px;
  }
  
  .user-avatar {
    width: 36px;
    height: 36px;
  }
  
  .user-avatar svg {
    width: 20px;
    height: 20px;
  }
  
  .dropdown-menu {
    min-width: 180px;
    right: -0.5rem;
  }
  
  .dropdown-item {
    padding: 0.75rem;
    font-size: 0.875rem;
  }
}

@media (max-width: 360px) {
  .navbar-container {
    padding: 0.5rem;
  }
  
  .logo {
    width: 40px;
    height: 40px;
  }
  
  .brand-info h2 {
    font-size: 0.8rem;
  }
  
  .nav-tab {
    padding: 0.4rem 0.6rem;
    font-size: 0.7rem;
  }
  
  .nav-tab svg {
    width: 14px;
    height: 14px;
  }
  
  .user-avatar {
    width: 32px;
    height: 32px;
  }
  
  .user-avatar svg {
    width: 18px;
    height: 18px;
  }
}

/* Optimisations pour orientation paysage */
@media (max-height: 500px) and (orientation: landscape) {
  .navbar-container {
    padding: 0.5rem 1rem;
  }
  
  .logo {
    width: 36px;
    height: 36px;
  }
  
  .navbar-nav {
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .navbar-nav::-webkit-scrollbar {
    display: none;
  }
  
  .nav-tab {
    flex-shrink: 0;
    white-space: nowrap;
  }
}

/* Amélioration de l'accessibilité */
@media (prefers-reduced-motion: reduce) {
  .navbar *,
  .navbar *::before,
  .navbar *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus visible pour l'accessibilité */
.nav-tab:focus-visible,
.user-button:focus-visible,
.dropdown-item:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

/* Effets de hover plus prononcés pour de meilleurs contrastes */
.navbar.dark .nav-tab:hover {
  background: rgba(51, 65, 85, 0.8);
}

.navbar.dark .user-button:hover {
  border-color: rgba(99, 102, 241, 0.3);
}

/* Scrollbar pour la navigation responsive */
.navbar-nav::-webkit-scrollbar {
  height: 4px;
}

.navbar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.navbar-nav::-webkit-scrollbar-thumb {
  background: var(--border-primary);
  border-radius: 2px;
}

.navbar-nav::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

/* Wrapper et indicateur de notifications */
.notifications-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.notification-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.75rem;
  line-height: 1;
  color: #374151;
  transition: all 0.2s ease;
}

.navbar.dark .notification-indicator {
  color: #d1d5db;
}

.indicator-count {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
  font-size: 0.7rem;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
  animation: pulse-glow 2s ease-in-out infinite;
}

.indicator-label {
  font-size: 0.6rem;
  font-weight: 500;
  color: #6b7280;
  margin-top: 0.125rem;
  opacity: 0.8;
}

.navbar.dark .indicator-label {
  color: #9ca3af;
}

/* Animation de pulsation pour attirer l'attention */
@keyframes pulse-glow {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(239, 68, 68, 0.5);
  }
}

/* Responsive pour l'indicateur */
@media (max-width: 768px) {
  .notification-indicator {
    font-size: 0.7rem;
  }
  
  .indicator-count {
    font-size: 0.65rem;
    padding: 0.1rem 0.3rem;
  }
  
  .indicator-label {
    font-size: 0.55rem;
  }
}
</style>