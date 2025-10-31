<template>
  <div id="app">
    <div class="app-container">
      <!-- Vue d'authentification -->
      <div v-if="!isAuthenticated" class="auth-container">
        <div class="auth-wrapper">
          <!-- En-tête avec titre -->
          <div class="auth-header">
            <div class="logo-section">
              <img src="/favicon.ico" width="80px" height="80px" alt="logo">
              <!-- <div class="logo">
              </div> -->
              <div class="title-section">
                <h1>CCC Web News</h1>
                <p>Plateforme de gestion des actualités universitaires</p>
              </div>
            </div>
          </div>

          <!-- Navigation entre login/register -->
          <div class="auth-nav">
            <button 
              @click="currentView = 'login'"
              :class="['nav-button', { active: currentView === 'login' }]"
            >
              Connexion
            </button>
            <button 
              @click="currentView = 'register'"
              :class="['nav-button', { active: currentView === 'register' }]"
            >
              Nouvelle Institution
            </button>
          </div>

          <!-- Composants d'authentification -->
          <LoginForm 
            v-if="currentView === 'login'"
            @login-success="handleLoginSuccess"
            @switch-to-register="currentView = 'register'"
          />
          
          <RegisterForm 
            v-if="currentView === 'register'"
            @register-success="handleRegisterSuccess"
            @switch-to-login="currentView = 'login'"
          />
        </div>
      </div>

      <!-- Interface principale -->
      <div v-else class="main-interface">
        <!-- Barre de navigation -->
        <Navbar 
          :current-user="currentUser"
          :active-tab="activeTab"
          :unread-count="unreadNotificationCount"
          @tab-change="handleTabChange"
          @logout="handleLogout"
          @profile-click="handleProfileClick"
          @settings-click="handleSettingsClick"
          @notifications-click="handleNotificationClick"
        />

        <!-- Contenu principal -->
        <main class="main-content">
          <!-- Panneau de notifications -->
          <div v-if="showNotifications" class="notifications-overlay" @click="showNotifications = false">
            <div class="notifications-container" @click.stop>
              <NotificationPanel 
                :current-user="currentUser"
                @settings-click="handleNotificationSettings"
              />
            </div>
          </div>

          <!-- Modal des paramètres de notification -->
          <div v-if="showNotificationSettings" class="modal-overlay" @click="showNotificationSettings = false">
            <div class="modal-content" @click.stop>
              <NotificationSettings 
                :current-user="currentUser"
                @close="showNotificationSettings = false"
              />
            </div>
          </div>
          <HomePage 
            v-if="activeTab === 'accueil'"
            :current-user="currentUser"
            @tab-change="handleTabChange"
            @settings-click="handleSettingsClick"
          />
          
          <NewsPage 
            v-if="activeTab === 'news'"
            :current-user="currentUser"
            @tab-change="handleTabChange"
          />
          
          <!-- Page de profil -->
          <UserProfile 
            v-if="activeTab === 'profile'"
            :current-user="currentUser"
            @user-updated="handleUserUpdated"
          />
          
          <!-- Page publication protégée -->
          <PublishPage 
            v-if="activeTab === 'publier' && canCreateNews"
            :current-user="currentUser"
            @article-published="handleArticlePublished"
            @tab-change="handleTabChange"
          />
          
          <!-- Page de modération protégée -->
          <ModerationPage 
            v-if="activeTab === 'moderation' && canModerate"
            :current-user="currentUser"
          />
          
          <!-- Page d'administration protégée -->
          <AdminPage 
            v-if="activeTab === 'admin' && canManageUsers"
            :current-user="currentUser"
          />
          
          <!-- Message d'accès refusé pour publier -->
          <div v-if="activeTab === 'publier' && !canCreateNews" class="access-denied">
            <div class="access-denied-content">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
              </svg>
              <h2>Accès refusé</h2>
              <p>Vous n'avez pas les permissions nécessaires pour publier des actualités.</p>
              <p>Contactez un administrateur pour obtenir le rôle de "Publiant".</p>
              <button @click="activeTab = 'accueil'" class="primary-button">
                Retour à l'accueil
              </button>
            </div>
          </div>
          
          <!-- Message d'accès refusé pour modération -->
          <div v-if="activeTab === 'moderation' && !canModerate" class="access-denied">
            <div class="access-denied-content">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
              </svg>
              <h2>Accès refusé</h2>
              <p>Vous n'avez pas les permissions nécessaires pour modérer les actualités.</p>
              <p>Contactez un administrateur pour obtenir le rôle de "Modérateur".</p>
              <button @click="activeTab = 'accueil'" class="primary-button">
                Retour à l'accueil
              </button>
            </div>
          </div>
          
          <!-- Message d'accès refusé pour administration -->
          <div v-if="activeTab === 'admin' && !canManageUsers" class="access-denied">
            <div class="access-denied-content">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
              </svg>
              <h2>Accès refusé</h2>
              <p>Vous n'avez pas les permissions nécessaires pour accéder à l'administration.</p>
              <p>Seuls les administrateurs peuvent accéder à cette section.</p>
              <button @click="activeTab = 'accueil'" class="primary-button">
                Retour à l'accueil
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import LoginForm from './components/auth/LoginForm.vue'
import RegisterForm from './components/auth/RegisterForm.vue'
import Navbar from './components/layout/Navbar.vue'
import HomePage from './components/pages/HomePage.vue'
import NewsPage from './components/pages/NewsPage.vue'
import PublishPage from './components/pages/PublishPage.vue'
import ModerationPage from './components/pages/ModerationPage.vue'
import AdminPage from './components/pages/AdminPage.vue'
import UserProfile from './components/pages/UserProfile.vue'
import NotificationPanel from './components/NotificationPanel.vue'
import NotificationSettings from './components/pages/NotificationSettings.vue'
import { usePermissions } from './composables/usePermissions.js'
import { PERMISSIONS } from './composables/usePermissions.js'
import { notificationService } from './services/notificationService.js'

// État de navigation
const currentView = ref('login') // 'login', 'register'
const currentUser = ref(null)
const activeTab = ref('accueil') // 'accueil', 'news', 'publier', 'moderation', 'admin'

// État des notifications
const showNotifications = ref(false)
const showNotificationSettings = ref(false)
const unreadNotificationCount = ref(0)

// Système de permissions - créer une instance réactive
const { hasPermission } = usePermissions(currentUser)

// Permissions calculées
const canCreateNews = computed(() => {
  return currentUser.value && hasPermission(PERMISSIONS.CREATE_NEWS)
})

const canModerate = computed(() => {
  return currentUser.value && hasPermission(PERMISSIONS.MODERATE_NEWS)
})

const canManageUsers = computed(() => {
  return currentUser.value && hasPermission(PERMISSIONS.MANAGE_USERS)
})

// État d'authentification
const isAuthenticated = computed(() => currentUser.value !== null)

// Gestion de l'authentification
const handleLoginSuccess = (user) => {
  // Enrichir l'utilisateur avec les données de l'université
  const universities = JSON.parse(localStorage.getItem('ccc_universities') || '[]')
  const university = universities.find(u => u.id === user.university_id)
  
  if (university) {
    user.university = university
  }
  
  currentUser.value = user
  localStorage.setItem('currentUser', JSON.stringify(user))
  
  // Initialiser le service de notifications
  notificationService.initializeUser(user.id)
  updateNotificationCount()
}

const handleRegisterSuccess = ({ user, university }) => {
  alert('Institution créée avec succès ! Vous pouvez maintenant vous connecter.')
  currentView.value = 'login'
}

const handleLogout = () => {
  currentUser.value = null
  activeTab.value = 'accueil'
  showNotifications.value = false
  showNotificationSettings.value = false
  localStorage.removeItem('currentUser')
}

// Gestion de la navigation
const handleTabChange = (tab) => {
  // Vérifier les permissions avant de changer d'onglet
  if (tab === 'publier' && !canCreateNews.value) {
    alert('Vous n\'avez pas les permissions nécessaires pour publier des actualités.')
    return
  }
  
  if (tab === 'moderation' && !canModerate.value) {
    alert('Vous n\'avez pas les permissions nécessaires pour modérer les actualités.')
    return
  }
  
  if (tab === 'admin' && !canManageUsers.value) {
    alert('Vous n\'avez pas les permissions nécessaires pour accéder à l\'administration.')
    return
  }
  
  activeTab.value = tab
}

const handleProfileClick = () => {
  activeTab.value = 'profile'
}

const handleUserUpdated = (updatedUser) => {
  // Mettre à jour l'utilisateur courant
  currentUser.value = updatedUser
  
  // Mettre à jour dans localStorage
  localStorage.setItem('currentUser', JSON.stringify(updatedUser))
}

const handleSettingsClick = () => {
  showNotificationSettings.value = true
}

const handleArticlePublished = (article) => {
  // L'article est déjà sauvegardé dans le composant PublishPage
  console.log('Article publié:', article)
  
  // Notifier les modérateurs d'un nouvel article à modérer
  if (article.status === 'pending') {
    notificationService.handleNewNews({
      ...article,
      importance: 'normale',
      type: 'new_article'
    })
  }
  
  updateNotificationCount()
}

// Méthodes de gestion des notifications
const updateNotificationCount = () => {
  if (currentUser.value) {
    const notifications = notificationService.getUserNotifications(currentUser.value.id)
    unreadNotificationCount.value = notifications.filter(n => !n.read).length
  } else {
    unreadNotificationCount.value = 0
  }
}

const handleNotificationClick = () => {
  showNotifications.value = !showNotifications.value
}

const handleNotificationSettings = () => {
  showNotifications.value = false
  showNotificationSettings.value = true
}

// Initialisation
onMounted(() => {
  // Vérifier si l'utilisateur est déjà connecté
  const savedUser = localStorage.getItem('currentUser')
  if (savedUser) {
    const user = JSON.parse(savedUser)
    
    // Enrichir avec les données de l'université si elles ne sont pas déjà présentes
    if (!user.university && user.university_id) {
      const universities = JSON.parse(localStorage.getItem('ccc_universities') || '[]')
      const university = universities.find(u => u.id === user.university_id)
      if (university) {
        user.university = university
        localStorage.setItem('currentUser', JSON.stringify(user))
      }
    }
    
    currentUser.value = user
    notificationService.initializeUser(currentUser.value.id)
    updateNotificationCount()
  }
  
  // Vérifier si l'utilisateur était mémorisé
  const rememberedUser = localStorage.getItem('remembered_user')
  if (rememberedUser && !currentUser.value) {
    const user = JSON.parse(rememberedUser)
    
    // Enrichir avec les données de l'université si elles ne sont pas déjà présentes
    if (!user.university && user.university_id) {
      const universities = JSON.parse(localStorage.getItem('ccc_universities') || '[]')
      const university = universities.find(u => u.id === user.university_id)
      if (university) {
        user.university = university
      }
    }
    
    currentUser.value = user
    notificationService.initializeUser(currentUser.value.id)
    updateNotificationCount()
  }
  
  // Initialiser le service de notifications
  notificationService.initialize()
  
  // Écouter les événements de notifications
  window.addEventListener('notification-received', updateNotificationCount)
  
  // Mettre à jour le compteur toutes les minutes
  setInterval(updateNotificationCount, 60000)
})
</script>

<style>
/* Variables CSS globales */
:root {
  --primary-color: #667eea;
  --primary-dark: #5a67d8;
  --primary-light: #e0e7ff;
  --secondary-color: #764ba2;
  --accent-color: #f093fb;
  --background-primary: #f8fafc;
  --background-secondary: #ffffff;
  --text-primary: #1a202c;
  --text-secondary: #4a5568;
  --text-muted: #718096;
  --border-color: #e2e8f0;
  --border-light: #f1f5f9;
  --success-color: #48bb78;
  --error-color: #f56565;
  --warning-color: #ed8936;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: var(--text-primary);
  line-height: 1.6;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.app-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

/* === AUTHENTIFICATION === */
.auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
}

.auth-wrapper {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 3rem;
  width: 100%;
  max-width: 900px;
  box-shadow: var(--shadow-xl);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.logo {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.title-section h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.title-section p {
  color: var(--text-secondary);
  font-size: 1rem;
}

.auth-nav {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: var(--background-primary);
  padding: 0.5rem;
  border-radius: var(--radius-lg);
}

.nav-button {
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-weight: 600;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-button.active {
  background: var(--background-secondary);
  color: var(--primary-color);
  box-shadow: var(--shadow-sm);
}

.nav-button:hover:not(.active) {
  background: rgba(255, 255, 255, 0.5);
}

/* === INTERFACE PRINCIPALE === */
.main-interface {
  min-height: 100vh;
  background: var(--background-primary);
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* === COMPOSANTS COMMUNS === */
.primary-button {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.primary-button:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.primary-button.large {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

.secondary-button {
  background: var(--background-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.secondary-button:hover {
  background: var(--background-primary);
  border-color: var(--primary-color);
}

.loading-spinner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* === RESPONSIVE === */
@media (max-width: 768px) {
  .auth-wrapper {
    padding: 2rem;
    margin: 1rem;
  }
  
  .logo-section {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .title-section h1 {
    font-size: 1.5rem;
  }
  
  .main-content {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .auth-nav {
    flex-direction: column;
  }
  
  .nav-button {
    text-align: center;
  }
}

/* === PAGE ACCÈS REFUSÉ === */
.access-denied {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
}

.access-denied-content {
  text-align: center;
  max-width: 400px;
}

.access-denied-content svg {
  color: var(--error-color);
  margin-bottom: 1rem;
}

.access-denied-content h2 {
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.access-denied-content p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.6;
}

.access-denied-content button {
  margin-top: 1rem;
}

/* === NOTIFICATIONS === */
.notifications-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 1rem;
  padding-top: 5rem; /* Espace pour la navbar */
}

.notifications-container {
  max-width: 400px;
  width: 100%;
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-content {
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlide 0.3s ease-out;
}

@keyframes modalSlide {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* === RESPONSIVE DESIGN === */

/* Large screens (desktops) */
@media (min-width: 1200px) {
  .app-container {
    max-width: 1600px;
  }
  
  .main-content {
    padding: 3rem;
  }
  
  .auth-wrapper {
    max-width: 1000px;
    padding: 4rem;
  }
}

/* Medium screens (laptops, large tablets) */
@media (max-width: 1024px) {
  .app-container {
    max-width: 100%;
  }
  
  .main-content {
    padding: 2rem 1.5rem;
  }
  
  .auth-wrapper {
    max-width: 800px;
    padding: 2.5rem;
  }
  
  .notifications-container {
    max-width: 350px;
  }
}

/* Small screens (tablets) */
@media (max-width: 768px) {
  #app {
    padding: 0.5rem;
    align-items: flex-start;
  }
  
  .auth-container {
    padding: 1rem;
    min-height: 100vh;
  }
  
  .auth-wrapper {
    padding: 2rem;
    margin: 1rem 0;
    border-radius: 16px;
    max-width: 100%;
  }
  
  .logo-section {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .title-section h1 {
    font-size: 1.5rem;
  }
  
  .title-section p {
    font-size: 0.9rem;
  }
  
  .auth-nav {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .nav-button {
    width: 100%;
    padding: 1rem;
    text-align: center;
  }
  
  .main-interface {
    min-height: 100vh;
  }
  
  .main-content {
    padding: 1rem;
    max-width: 100%;
  }
  
  .notifications-overlay {
    padding: 0.5rem;
    padding-top: 4rem;
    justify-content: center;
  }
  
  .notifications-container {
    max-width: 100%;
    width: 100%;
  }
  
  .modal-content {
    max-width: 100%;
    margin: 1rem;
    max-height: 85vh;
  }
  
  .access-denied {
    padding: 1rem;
    min-height: 50vh;
  }
  
  .access-denied-content {
    max-width: 100%;
    text-align: center;
  }
  
  .access-denied-content h2 {
    font-size: 1.25rem;
  }
  
  .access-denied-content svg {
    width: 48px;
    height: 48px;
  }
}

/* Extra small screens (phones) */
@media (max-width: 480px) {
  #app {
    padding: 0;
  }
  
  .auth-container {
    padding: 0.5rem;
  }
  
  .auth-wrapper {
    padding: 1.5rem;
    margin: 0.5rem;
    border-radius: 12px;
  }
  
  .title-section h1 {
    font-size: 1.25rem;
  }
  
  .title-section p {
    font-size: 0.85rem;
  }
  
  .logo-section img {
    width: 60px;
    height: 60px;
  }
  
  .nav-button {
    padding: 0.875rem;
    font-size: 0.9rem;
  }
  
  .main-content {
    padding: 0.75rem;
  }
  
  .notifications-overlay {
    padding: 0.25rem;
    padding-top: 3.5rem;
  }
  
  .modal-overlay {
    padding: 0.5rem;
  }
  
  .modal-content {
    margin: 0.5rem;
    border-radius: 12px;
  }
  
  .primary-button {
    padding: 0.875rem 1.25rem;
    font-size: 0.9rem;
  }
  
  .secondary-button {
    padding: 0.875rem 1.25rem;
    font-size: 0.9rem;
  }
}

/* Ultra small screens (very small phones) */
@media (max-width: 360px) {
  .auth-wrapper {
    padding: 1rem;
    margin: 0.25rem;
  }
  
  .title-section h1 {
    font-size: 1.125rem;
  }
  
  .logo-section img {
    width: 50px;
    height: 50px;
  }
  
  .nav-button {
    padding: 0.75rem;
    font-size: 0.85rem;
  }
  
  .primary-button,
  .secondary-button {
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
  }
}

/* Landscape orientation on mobile */
@media (max-height: 500px) and (orientation: landscape) {
  .auth-container {
    padding: 0.5rem;
    align-items: flex-start;
  }
  
  .auth-wrapper {
    margin: 0.5rem 0;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .logo-section {
    margin-bottom: 0.5rem;
  }
  
  .auth-nav {
    margin-bottom: 1rem;
  }
}

/* Print styles */
@media print {
  .auth-container,
  .main-interface {
    background: white !important;
  }
  
  .auth-wrapper {
    box-shadow: none !important;
    border: 1px solid #ccc !important;
  }
  
  .notifications-overlay,
  .modal-overlay {
    display: none !important;
  }
}
</style>