# 👑 Administration et Gestion des Utilisateurs

## 🎯 Vue d'ensemble

L'administration permet aux **ADMIN** de gérer l'ensemble du système : **utilisateurs**, **universités**, **permissions** et **paramètres**.

## 👤 Gestion des utilisateurs

### 🏠 AdminPage.vue - Interface principale

Le composant d'administration centralise toutes les fonctions de gestion.

### 🔧 Code du composant principal

```javascript
<!-- src/components/AdminPage.vue -->
<template>
  <div class="admin-page">
    <!-- Header avec navigation -->
    <div class="admin-header">
      <h1>👑 Administration</h1>
      <nav class="admin-nav">
        <button 
          v-for="tab in adminTabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="{ active: activeTab === tab.id }"
        >
          {{ tab.icon }} {{ tab.label }}
        </button>
      </nav>
    </div>
    
    <!-- Tableau de bord -->
    <div v-if="activeTab === 'dashboard'" class="dashboard">
      <h2>📊 Tableau de bord</h2>
      
      <!-- Statistiques rapides -->
      <div class="stats-grid">
        <div class="stat-card users">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.total_users }}</div>
            <div class="stat-label">Utilisateurs totaux</div>
          </div>
        </div>
        
        <div class="stat-card universities">
          <div class="stat-icon">🏫</div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.total_universities }}</div>
            <div class="stat-label">Universités</div>
          </div>
        </div>
        
        <div class="stat-card articles">
          <div class="stat-icon">📰</div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.total_articles }}</div>
            <div class="stat-label">Articles publiés</div>
          </div>
        </div>
        
        <div class="stat-card pending">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.pending_articles }}</div>
            <div class="stat-label">En modération</div>
          </div>
        </div>
      </div>
      
      <!-- Activité récente -->
      <div class="recent-activity">
        <h3>📈 Activité récente</h3>
        <div class="activity-list">
          <div 
            v-for="activity in recentActivities" 
            :key="activity.id"
            class="activity-item"
          >
            <div class="activity-icon">{{ activity.icon }}</div>
            <div class="activity-content">
              <div class="activity-text">{{ activity.description }}</div>
              <div class="activity-time">{{ formatTime(activity.created_at) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Gestion des utilisateurs -->
    <div v-if="activeTab === 'users'" class="users-management">
      <div class="section-header">
        <h2>👥 Gestion des utilisateurs</h2>
        <button @click="showCreateUserModal = true" class="btn btn-primary">
          ➕ Nouvel utilisateur
        </button>
      </div>
      
      <!-- Filtres et recherche -->
      <div class="filters-bar">
        <input
          v-model="userFilters.search"
          type="text"
          placeholder="🔍 Rechercher un utilisateur..."
          class="search-input"
        >
        
        <select v-model="userFilters.role">
          <option value="">Tous les rôles</option>
          <option value="ADMIN">👑 Admin</option>
          <option value="MODERATOR">🛡️ Modérateur</option>
          <option value="PUBLIANT">✍️ Publiant</option>
          <option value="STUDENT">🎓 Étudiant</option>
        </select>
        
        <select v-model="userFilters.university">
          <option value="">Toutes universités</option>
          <option v-for="uni in universities" :key="uni.id" :value="uni.id">
            {{ uni.name }}
          </option>
        </select>
        
        <select v-model="userFilters.status">
          <option value="">Tous statuts</option>
          <option value="active">✅ Actifs</option>
          <option value="inactive">❌ Inactifs</option>
          <option value="pending">⏳ En attente</option>
        </select>
      </div>
      
      <!-- Tableau des utilisateurs -->
      <div class="users-table">
        <table>
          <thead>
            <tr>
              <th>👤 Utilisateur</th>
              <th>🎭 Rôle</th>
              <th>🏫 Université</th>
              <th>📧 Email</th>
              <th>📅 Inscription</th>
              <th>🔘 Statut</th>
              <th>⚙️ Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id" class="user-row">
              <td class="user-info">
                <div class="user-avatar">
                  {{ user.username.charAt(0).toUpperCase() }}
                </div>
                <div class="user-details">
                  <div class="user-name">{{ user.username }}</div>
                  <div class="user-fullname">{{ user.full_name }}</div>
                </div>
              </td>
              
              <td>
                <span class="role-badge" :class="user.role.toLowerCase()">
                  {{ getRoleIcon(user.role) }} {{ user.role }}
                </span>
              </td>
              
              <td>{{ user.university?.name || 'Non assigné' }}</td>
              <td>{{ user.email }}</td>
              <td>{{ formatDate(user.created_at) }}</td>
              
              <td>
                <span class="status-badge" :class="user.status">
                  {{ getStatusIcon(user.status) }} {{ getStatusText(user.status) }}
                </span>
              </td>
              
              <td class="actions">
                <button 
                  @click="editUser(user)"
                  class="btn-icon"
                  title="Modifier"
                >
                  ✏️
                </button>
                
                <button 
                  @click="toggleUserStatus(user)"
                  class="btn-icon"
                  :title="user.status === 'active' ? 'Désactiver' : 'Activer'"
                >
                  {{ user.status === 'active' ? '❌' : '✅' }}
                </button>
                
                <button 
                  @click="resetUserPassword(user)"
                  class="btn-icon"
                  title="Réinitialiser mot de passe"
                >
                  🔑
                </button>
                
                <button 
                  @click="deleteUser(user)"
                  class="btn-icon danger"
                  title="Supprimer"
                  v-if="user.id !== currentUser.id"
                >
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="pagination">
        <button 
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
        >
          ⬅️ Précédent
        </button>
        
        <span class="page-info">
          Page {{ currentPage }} sur {{ totalPages }}
        </span>
        
        <button 
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
        >
          Suivant ➡️
        </button>
      </div>
    </div>
    
    <!-- Gestion des universités -->
    <div v-if="activeTab === 'universities'" class="universities-management">
      <div class="section-header">
        <h2>🏫 Gestion des universités</h2>
        <button @click="showCreateUniversityModal = true" class="btn btn-primary">
          ➕ Nouvelle université
        </button>
      </div>
      
      <!-- Liste des universités -->
      <div class="universities-grid">
        <div 
          v-for="university in universities" 
          :key="university.id"
          class="university-card"
        >
          <div class="university-header">
            <h3>{{ university.name }}</h3>
            <div class="university-actions">
              <button @click="editUniversity(university)">✏️</button>
              <button @click="deleteUniversity(university)" class="danger">🗑️</button>
            </div>
          </div>
          
          <div class="university-info">
            <p><strong>📍 Ville :</strong> {{ university.city }}</p>
            <p><strong>🌍 Site web :</strong> 
              <a :href="university.website" target="_blank">{{ university.website }}</a>
            </p>
            <p><strong>👥 Utilisateurs :</strong> {{ university.users_count }}</p>
            <p><strong>📰 Articles :</strong> {{ university.articles_count }}</p>
          </div>
          
          <div class="university-status">
            <span 
              class="status-badge" 
              :class="university.is_active ? 'active' : 'inactive'"
            >
              {{ university.is_active ? '✅ Active' : '❌ Inactive' }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Paramètres système -->
    <div v-if="activeTab === 'settings'" class="system-settings">
      <h2>⚙️ Paramètres système</h2>
      
      <div class="settings-sections">
        <!-- Paramètres généraux -->
        <div class="settings-section">
          <h3>🔧 Paramètres généraux</h3>
          
          <div class="setting-item">
            <label>
              <input 
                type="checkbox" 
                v-model="systemSettings.registration_enabled"
                @change="saveSettings"
              >
              ✅ Inscription ouverte
            </label>
            <p class="setting-description">
              Permettre aux nouveaux utilisateurs de s'inscrire
            </p>
          </div>
          
          <div class="setting-item">
            <label>
              <input 
                type="checkbox" 
                v-model="systemSettings.moderation_required"
                @change="saveSettings"
              >
              🛡️ Modération obligatoire
            </label>
            <p class="setting-description">
              Tous les articles doivent être modérés avant publication
            </p>
          </div>
          
          <div class="setting-item">
            <label for="max_articles_per_day">📊 Articles max par jour/utilisateur</label>
            <input
              id="max_articles_per_day"
              type="number"
              v-model="systemSettings.max_articles_per_day"
              @change="saveSettings"
              min="1"
              max="50"
            >
          </div>
        </div>
        
        <!-- Paramètres de notifications -->
        <div class="settings-section">
          <h3>🔔 Notifications</h3>
          
          <div class="setting-item">
            <label>
              <input 
                type="checkbox" 
                v-model="systemSettings.email_notifications"
                @change="saveSettings"
              >
              📧 Notifications email activées
            </label>
          </div>
          
          <div class="setting-item">
            <label for="notification_frequency">📅 Fréquence des emails de résumé</label>
            <select 
              id="notification_frequency"
              v-model="systemSettings.notification_frequency"
              @change="saveSettings"
            >
              <option value="immediate">Immédiate</option>
              <option value="daily">Quotidienne</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="never">Jamais</option>
            </select>
          </div>
        </div>
        
        <!-- Sécurité -->
        <div class="settings-section">
          <h3>🔐 Sécurité</h3>
          
          <div class="setting-item">
            <label for="session_timeout">⏰ Timeout de session (minutes)</label>
            <input
              id="session_timeout"
              type="number"
              v-model="systemSettings.session_timeout"
              @change="saveSettings"
              min="15"
              max="480"
            >
          </div>
          
          <div class="setting-item">
            <label for="password_min_length">🔑 Longueur minimale mot de passe</label>
            <input
              id="password_min_length"
              type="number"
              v-model="systemSettings.password_min_length"
              @change="saveSettings"
              min="6"
              max="20"
            >
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de création/édition utilisateur -->
    <UserModal
      v-if="showUserModal"
      :user="selectedUser"
      :universities="universities"
      @close="closeUserModal"
      @save="handleUserSave"
    />
    
    <!-- Modal de création/édition université -->
    <UniversityModal
      v-if="showUniversityModal"
      :university="selectedUniversity"
      @close="closeUniversityModal"
      @save="handleUniversitySave"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { userService } from '@/services/user.service'
import { universityService } from '@/services/university.service'
import { adminService } from '@/services/admin.service'
import { useAuth } from '@/composables/useAuth'
import { useNotifications } from '@/composables/useNotifications'
import UserModal from '@/components/modals/UserModal.vue'
import UniversityModal from '@/components/modals/UniversityModal.vue'

// Composables
const { currentUser } = useAuth()
const { addNotification } = useNotifications(currentUser)

// État de navigation
const activeTab = ref('dashboard')
const adminTabs = [
  { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
  { id: 'users', label: 'Utilisateurs', icon: '👥' },
  { id: 'universities', label: 'Universités', icon: '🏫' },
  { id: 'settings', label: 'Paramètres', icon: '⚙️' }
]

// Données
const stats = ref({
  total_users: 0,
  total_universities: 0,
  total_articles: 0,
  pending_articles: 0
})

const users = ref([])
const universities = ref([])
const recentActivities = ref([])

// Paramètres système
const systemSettings = reactive({
  registration_enabled: true,
  moderation_required: false,
  email_notifications: true,
  notification_frequency: 'daily',
  session_timeout: 120,
  password_min_length: 8,
  max_articles_per_day: 10
})

// Filtres utilisateurs
const userFilters = reactive({
  search: '',
  role: '',
  university: '',
  status: ''
})

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(20)
const totalItems = ref(0)

const totalPages = computed(() => 
  Math.ceil(totalItems.value / itemsPerPage.value)
)

// Modals
const showUserModal = ref(false)
const showUniversityModal = ref(false)
const selectedUser = ref(null)
const selectedUniversity = ref(null)

// Utilisateurs filtrés
const filteredUsers = computed(() => {
  let filtered = users.value
  
  if (userFilters.search) {
    const search = userFilters.search.toLowerCase()
    filtered = filtered.filter(user => 
      user.username.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.full_name?.toLowerCase().includes(search)
    )
  }
  
  if (userFilters.role) {
    filtered = filtered.filter(user => user.role === userFilters.role)
  }
  
  if (userFilters.university) {
    filtered = filtered.filter(user => user.university_id === userFilters.university)
  }
  
  if (userFilters.status) {
    filtered = filtered.filter(user => user.status === userFilters.status)
  }
  
  return filtered
})

// Méthodes de chargement
const loadDashboardStats = async () => {
  try {
    const response = await adminService.getDashboardStats()
    stats.value = response.data.stats
  } catch (error) {
    console.error('Erreur chargement stats:', error)
  }
}

const loadUsers = async (page = 1) => {
  try {
    const response = await userService.getUsers({
      page,
      limit: itemsPerPage.value,
      ...userFilters
    })
    
    users.value = response.data.users
    totalItems.value = response.data.total
    currentPage.value = page
  } catch (error) {
    console.error('Erreur chargement utilisateurs:', error)
  }
}

const loadUniversities = async () => {
  try {
    const response = await universityService.getUniversities()
    universities.value = response.data.universities
  } catch (error) {
    console.error('Erreur chargement universités:', error)
  }
}

const loadRecentActivities = async () => {
  try {
    const response = await adminService.getRecentActivities({ limit: 10 })
    recentActivities.value = response.data.activities
  } catch (error) {
    console.error('Erreur chargement activités:', error)
  }
}

const loadSystemSettings = async () => {
  try {
    const response = await adminService.getSystemSettings()
    Object.assign(systemSettings, response.data.settings)
  } catch (error) {
    console.error('Erreur chargement paramètres:', error)
  }
}

// Actions utilisateurs
const editUser = (user) => {
  selectedUser.value = user
  showUserModal.value = true
}

const toggleUserStatus = async (user) => {
  try {
    const newStatus = user.status === 'active' ? 'inactive' : 'active'
    
    await userService.updateUser(user.id, { status: newStatus })
    
    user.status = newStatus
    
    addNotification({
      type: 'success',
      message: `Utilisateur ${newStatus === 'active' ? 'activé' : 'désactivé'}`
    })
  } catch (error) {
    console.error('Erreur changement statut:', error)
    addNotification({
      type: 'error',
      message: 'Erreur lors du changement de statut'
    })
  }
}

const resetUserPassword = async (user) => {
  if (!confirm(`Réinitialiser le mot de passe de ${user.username} ?`)) {
    return
  }
  
  try {
    const response = await userService.resetPassword(user.id)
    
    addNotification({
      type: 'success',
      message: `Nouveau mot de passe : ${response.data.temporary_password}`
    })
  } catch (error) {
    console.error('Erreur reset password:', error)
    addNotification({
      type: 'error',
      message: 'Erreur lors de la réinitialisation'
    })
  }
}

const deleteUser = async (user) => {
  if (!confirm(`Supprimer définitivement ${user.username} ?`)) {
    return
  }
  
  try {
    await userService.deleteUser(user.id)
    
    users.value = users.value.filter(u => u.id !== user.id)
    
    addNotification({
      type: 'success',
      message: 'Utilisateur supprimé'
    })
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error)
    addNotification({
      type: 'error',
      message: 'Erreur lors de la suppression'
    })
  }
}

// Gestion des modals
const closeUserModal = () => {
  showUserModal.value = false
  selectedUser.value = null
}

const handleUserSave = async (userData) => {
  try {
    if (selectedUser.value) {
      // Modification
      await userService.updateUser(selectedUser.value.id, userData)
      
      // Mettre à jour localement
      const index = users.value.findIndex(u => u.id === selectedUser.value.id)
      if (index !== -1) {
        users.value[index] = { ...users.value[index], ...userData }
      }
    } else {
      // Création
      const response = await userService.createUser(userData)
      users.value.unshift(response.data.user)
    }
    
    addNotification({
      type: 'success',
      message: selectedUser.value ? 'Utilisateur modifié' : 'Utilisateur créé'
    })
    
    closeUserModal()
  } catch (error) {
    console.error('Erreur sauvegarde utilisateur:', error)
    addNotification({
      type: 'error',
      message: 'Erreur lors de la sauvegarde'
    })
  }
}

// Sauvegarder les paramètres
const saveSettings = async () => {
  try {
    await adminService.updateSystemSettings(systemSettings)
    
    addNotification({
      type: 'success',
      message: 'Paramètres sauvegardés'
    })
  } catch (error) {
    console.error('Erreur sauvegarde paramètres:', error)
    addNotification({
      type: 'error',
      message: 'Erreur lors de la sauvegarde'
    })
  }
}

// Utilitaires
const getRoleIcon = (role) => {
  const icons = {
    ADMIN: '👑',
    MODERATOR: '🛡️',
    PUBLIANT: '✍️',
    STUDENT: '🎓'
  }
  return icons[role] || '❓'
}

const getStatusIcon = (status) => {
  const icons = {
    active: '✅',
    inactive: '❌',
    pending: '⏳'
  }
  return icons[status] || '❓'
}

const getStatusText = (status) => {
  const texts = {
    active: 'Actif',
    inactive: 'Inactif',
    pending: 'En attente'
  }
  return texts[status] || status
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const formatTime = (dateString) => {
  const now = new Date()
  const date = new Date(dateString)
  const diff = now - date
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 60) return `Il y a ${minutes}min`
  if (hours < 24) return `Il y a ${hours}h`
  return `Il y a ${days}j`
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    loadUsers(page)
  }
}

// Watchers pour rechargement automatique
watch(() => activeTab.value, (newTab) => {
  switch (newTab) {
    case 'dashboard':
      loadDashboardStats()
      loadRecentActivities()
      break
    case 'users':
      loadUsers()
      break
    case 'universities':
      loadUniversities()
      break
    case 'settings':
      loadSystemSettings()
      break
  }
})

watch(userFilters, () => {
  if (activeTab.value === 'users') {
    loadUsers(1)
  }
}, { deep: true })

// Initialisation
onMounted(() => {
  loadDashboardStats()
  loadRecentActivities()
  loadUniversities()
})
</script>
```

## 🔧 Services administratifs

### 👥 userService.js - Gestion des utilisateurs

```javascript
// Méthodes spécifiques à l'administration
class UserService {
  // ... méthodes existantes ...
  
  // Créer un utilisateur (admin seulement)
  async createUser(userData) {
    const response = await httpService.post('/admin/users', userData)
    return response
  }
  
  // Lister tous les utilisateurs avec filtres
  async getUsers(params = {}) {
    const response = await httpService.get('/admin/users', { params })
    return response
  }
  
  // Mettre à jour un utilisateur
  async updateUser(userId, userData) {
    const response = await httpService.put(`/admin/users/${userId}`, userData)
    return response
  }
  
  // Supprimer un utilisateur
  async deleteUser(userId) {
    const response = await httpService.delete(`/admin/users/${userId}`)
    return response
  }
  
  // Réinitialiser le mot de passe
  async resetPassword(userId) {
    const response = await httpService.post(`/admin/users/${userId}/reset-password`)
    return response
  }
  
  // Changer le rôle d'un utilisateur
  async changeUserRole(userId, newRole) {
    const response = await httpService.patch(`/admin/users/${userId}/role`, {
      role: newRole
    })
    return response
  }
  
  // Obtenir l'historique d'activité d'un utilisateur
  async getUserActivity(userId, params = {}) {
    const response = await httpService.get(`/admin/users/${userId}/activity`, { params })
    return response
  }
}
```

### 🏫 universityService.js - Gestion des universités

```javascript
class UniversityService {
  // ... méthodes existantes ...
  
  // Créer une université
  async createUniversity(universityData) {
    const response = await httpService.post('/admin/universities', universityData)
    return response
  }
  
  // Mettre à jour une université
  async updateUniversity(universityId, universityData) {
    const response = await httpService.put(`/admin/universities/${universityId}`, universityData)
    return response
  }
  
  // Supprimer une université
  async deleteUniversity(universityId) {
    const response = await httpService.delete(`/admin/universities/${universityId}`)
    return response
  }
  
  // Obtenir les statistiques d'une université
  async getUniversityStats(universityId) {
    const response = await httpService.get(`/admin/universities/${universityId}/stats`)
    return response
  }
  
  // Obtenir les utilisateurs d'une université
  async getUniversityUsers(universityId, params = {}) {
    const response = await httpService.get(`/admin/universities/${universityId}/users`, { params })
    return response
  }
}
```

### ⚙️ adminService.js - Service d'administration

```javascript
// src/services/admin.service.js
import { httpService } from './http.service'

class AdminService {
  
  // Statistiques du tableau de bord
  async getDashboardStats() {
    const response = await httpService.get('/admin/dashboard/stats')
    return response
  }
  
  // Activité récente
  async getRecentActivities(params = {}) {
    const response = await httpService.get('/admin/activities', { params })
    return response
  }
  
  // Paramètres système
  async getSystemSettings() {
    const response = await httpService.get('/admin/settings')
    return response
  }
  
  async updateSystemSettings(settings) {
    const response = await httpService.put('/admin/settings', settings)
    return response
  }
  
  // Sauvegardes
  async createBackup() {
    const response = await httpService.post('/admin/backup')
    return response
  }
  
  async getBackups() {
    const response = await httpService.get('/admin/backups')
    return response
  }
  
  async restoreBackup(backupId) {
    const response = await httpService.post(`/admin/backups/${backupId}/restore`)
    return response
  }
  
  // Logs système
  async getSystemLogs(params = {}) {
    const response = await httpService.get('/admin/logs', { params })
    return response
  }
  
  // Maintenance
  async enableMaintenanceMode(message = '') {
    const response = await httpService.post('/admin/maintenance/enable', { message })
    return response
  }
  
  async disableMaintenanceMode() {
    const response = await httpService.post('/admin/maintenance/disable')
    return response
  }
  
  // Analytics avancées
  async getAdvancedAnalytics(params = {}) {
    const response = await httpService.get('/admin/analytics', { params })
    return response
  }
  
  // Envoi d'emails en masse
  async sendMassEmail(emailData) {
    const response = await httpService.post('/admin/emails/mass-send', emailData)
    return response
  }
  
  // Import/Export de données
  async exportData(type, format = 'csv') {
    const response = await httpService.get(`/admin/export/${type}`, {
      params: { format },
      responseType: 'blob'
    })
    return response
  }
  
  async importData(type, file) {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await httpService.post(`/admin/import/${type}`, formData)
    return response
  }
}

export const adminService = new AdminService()
```

## 📊 Analytics et rapports

### 📈 Graphiques et métriques

```javascript
// Composant de graphiques pour l'admin
const AnalyticsCharts = {
  template: `
    <div class="analytics-charts">
      <div class="chart-container">
        <h3>📊 Évolution des utilisateurs</h3>
        <canvas ref="usersChart"></canvas>
      </div>
      
      <div class="chart-container">
        <h3>📰 Articles par catégorie</h3>
        <canvas ref="categoriesChart"></canvas>
      </div>
      
      <div class="chart-container">
        <h3>🏫 Répartition par université</h3>
        <canvas ref="universitiesChart"></canvas>
      </div>
    </div>
  `,
  
  async mounted() {
    await this.loadChartData()
    this.initializeCharts()
  },
  
  methods: {
    async loadChartData() {
      try {
        const response = await adminService.getAdvancedAnalytics({
          period: 'last_30_days'
        })
        
        this.chartData = response.data
      } catch (error) {
        console.error('Erreur chargement analytics:', error)
      }
    },
    
    initializeCharts() {
      // Graphique des utilisateurs
      new Chart(this.$refs.usersChart, {
        type: 'line',
        data: {
          labels: this.chartData.user_growth.labels,
          datasets: [{
            label: 'Nouveaux utilisateurs',
            data: this.chartData.user_growth.data,
            borderColor: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          }
        }
      })
      
      // Graphique des catégories
      new Chart(this.$refs.categoriesChart, {
        type: 'doughnut',
        data: {
          labels: this.chartData.categories.labels,
          datasets: [{
            data: this.chartData.categories.data,
            backgroundColor: [
              '#FF6384', '#36A2EB', '#FFCE56',
              '#4BC0C0', '#9966FF', '#FF9F40'
            ]
          }]
        }
      })
    }
  }
}
```

## 🔒 Sécurité et permissions

### 🛡️ Middleware d'autorisation

```javascript
// Middleware pour vérifier les permissions admin
const requireAdmin = (requiredPermission) => {
  return (to, from, next) => {
    const { currentUser } = useAuth()
    const { hasPermission } = usePermissions(currentUser)
    
    if (!currentUser.value) {
      next('/login')
      return
    }
    
    if (currentUser.value.role !== 'ADMIN') {
      next('/unauthorized')
      return
    }
    
    if (requiredPermission && !hasPermission(requiredPermission)) {
      next('/forbidden')
      return
    }
    
    next()
  }
}

// Utilisation dans les routes
const adminRoutes = [
  {
    path: '/admin',
    component: AdminPage,
    beforeEnter: requireAdmin()
  },
  {
    path: '/admin/users',
    component: UserManagement,
    beforeEnter: requireAdmin(PERMISSIONS.MANAGE_USERS)
  },
  {
    path: '/admin/system',
    component: SystemSettings,
    beforeEnter: requireAdmin(PERMISSIONS.SYSTEM_CONFIG)
  }
]
```

## 🚨 Monitoring et alertes

### 📊 Surveillance système

```javascript
// Surveillance en temps réel
const SystemMonitor = {
  data() {
    return {
      systemHealth: {
        cpu_usage: 0,
        memory_usage: 0,
        disk_usage: 0,
        active_users: 0,
        response_time: 0
      },
      alerts: []
    }
  },
  
  mounted() {
    this.startMonitoring()
  },
  
  beforeUnmount() {
    this.stopMonitoring()
  },
  
  methods: {
    startMonitoring() {
      this.monitorInterval = setInterval(async () => {
        try {
          const response = await adminService.getSystemHealth()
          this.systemHealth = response.data.health
          
          this.checkAlerts()
        } catch (error) {
          console.error('Erreur monitoring:', error)
        }
      }, 30000) // Toutes les 30 secondes
    },
    
    stopMonitoring() {
      if (this.monitorInterval) {
        clearInterval(this.monitorInterval)
      }
    },
    
    checkAlerts() {
      const { cpu_usage, memory_usage, disk_usage } = this.systemHealth
      
      // Alertes de performance
      if (cpu_usage > 80) {
        this.addAlert('danger', '🔥 CPU usage élevé', `${cpu_usage}%`)
      }
      
      if (memory_usage > 85) {
        this.addAlert('warning', '💾 Mémoire faible', `${memory_usage}%`)
      }
      
      if (disk_usage > 90) {
        this.addAlert('danger', '💽 Espace disque critique', `${disk_usage}%`)
      }
    },
    
    addAlert(level, title, message) {
      this.alerts.unshift({
        id: Date.now(),
        level,
        title,
        message,
        timestamp: new Date()
      })
      
      // Limiter à 10 alertes
      if (this.alerts.length > 10) {
        this.alerts = this.alerts.slice(0, 10)
      }
    }
  }
}
```

---

> 🔐 **Sécurité** : L'administration doit être protégée par plusieurs couches de sécurité : authentification, autorisation, audit et monitoring.