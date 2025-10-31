<template>
  <div class="admin-page">
    <div class="page-header">
      <div class="header-content">
        <h1>Administration</h1>
        <p class="subtitle">Gérez les utilisateurs et les paramètres du système</p>
      </div>
    </div>

    <div class="admin-tabs">
      <button 
        @click="activeTab = 'users'"
        :class="['tab-button', { active: activeTab === 'users' }]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
          <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2045 16.7084C21.6935 16.0627 20.9877 15.6209 20.2 15.46" stroke="currentColor" stroke-width="2"/>
          <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 18.9078 6.11683 18.7147 6.94073C18.5216 7.76463 18.0532 8.49274 17.3803 9.01334C16.7073 9.53394 15.8733 9.81631 15.02 9.8" stroke="currentColor" stroke-width="2"/>
        </svg>
        Utilisateurs
      </button>
      
      <button 
        @click="activeTab = 'settings'"
        :class="['tab-button', { active: activeTab === 'settings' }]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
          <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2579 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.01127 9.77251C4.28054 9.5799 4.48571 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.87653 6.85425 4.02405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" stroke-width="2"/>
        </svg>
        Paramètres
      </button>
      
      <button 
        @click="activeTab = 'stats'"
        :class="['tab-button', { active: activeTab === 'stats' }]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M3 3V21H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9 9L12 6L16 10L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Statistiques
      </button>
    </div>

    <!-- Onglet Utilisateurs -->
    <div v-if="activeTab === 'users'" class="tab-content">
      <div class="users-header">
        <h2>Gestion des Utilisateurs</h2>
        <div class="users-actions">
          <div class="search-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <input 
              v-model="userSearchQuery" 
              type="text" 
              placeholder="Rechercher un utilisateur..."
            />
          </div>
          
          <select v-model="roleFilter" class="role-filter">
            <option value="">Tous les rôles</option>
            <option value="ADMIN">Administrateurs</option>
            <option value="MODERATOR">Modérateurs</option>
            <option value="PUBLIANT">Publiants</option>
            <option value="STUDENT">Étudiants</option>
          </select>
        </div>
      </div>

      <div class="users-stats">
        <div class="stat-card">
          <div class="stat-number">{{ users.length }}</div>
          <div class="stat-label">Total utilisateurs</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ getUsersByRole('ADMIN').length }}</div>
          <div class="stat-label">Administrateurs</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ getUsersByRole('MODERATOR').length }}</div>
          <div class="stat-label">Modérateurs</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ getUsersByRole('PUBLIANT').length }}</div>
          <div class="stat-label">Publiants</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ getUsersByRole('STUDENT').length }}</div>
          <div class="stat-label">Étudiants</div>
        </div>
      </div>

      <div class="users-table">
        <table>
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Université</th>
              <th>Date d'inscription</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>
                <div class="user-info">
                  <div class="user-avatar">
                    {{ user.first_name[0] }}{{ user.last_name[0] }}
                  </div>
                  <div class="user-details">
                    <div class="user-name">{{ user.first_name }} {{ user.last_name }}</div>
                    <div class="user-faculty" v-if="user.faculty">{{ user.faculty }}</div>
                  </div>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>
                <span class="role-badge" :class="`role-${user.role?.toLowerCase()}`">
                  {{ getRoleDisplayName(user.role) }}
                </span>
              </td>
              <td>{{ user.university?.name || 'Non définie' }}</td>
              <td>{{ formatDate(user.created_at) }}</td>
              <td>
                <div class="user-actions">
                  <button 
                    @click="editUser(user)"
                    class="action-btn edit"
                    title="Modifier"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                  
                  <button 
                    @click="deleteUser(user)"
                    class="action-btn delete"
                    title="Supprimer"
                    :disabled="user.role === 'ADMIN' && getUsersByRole('ADMIN').length === 1"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Onglet Paramètres -->
    <div v-if="activeTab === 'settings'" class="tab-content">
      <div class="settings-section">
        <h2>Paramètres du Système</h2>
        
        <div class="settings-grid">
          <div class="setting-card">
            <h3>Inscription des Nouveaux Utilisateurs</h3>
            <p>Rôle par défaut attribué aux nouveaux utilisateurs</p>
            <select v-model="defaultUserRole" class="setting-select">
              <option value="STUDENT">Étudiant</option>
              <option value="PUBLIANT">Publiant</option>
            </select>
          </div>
          
          <div class="setting-card">
            <h3>Modération des Articles</h3>
            <p>Les articles doivent-ils être modérés avant publication ?</p>
            <label class="toggle">
              <input type="checkbox" v-model="requireModeration">
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="setting-card">
            <h3>Notifications Email</h3>
            <p>Envoyer des notifications par email</p>
            <label class="toggle">
              <input type="checkbox" v-model="emailNotifications">
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="setting-card">
            <h3>Limite de Fichiers</h3>
            <p>Taille maximale des fichiers (en MB)</p>
            <input 
              type="number" 
              v-model="maxFileSize" 
              min="1" 
              max="100"
              class="setting-input"
            >
          </div>
        </div>
        
        <div class="settings-actions">
          <button @click="saveSettings" class="save-btn">
            Sauvegarder les Paramètres
          </button>
        </div>
      </div>
    </div>

    <!-- Onglet Statistiques -->
    <div v-if="activeTab === 'stats'" class="tab-content">
      <div class="stats-section">
        <h2>Statistiques de la Plateforme</h2>
        
        <div class="stats-overview">
          <div class="overview-card">
            <div class="overview-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
                <path d="M14 2V8H20" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="overview-info">
              <h3>{{ totalArticles }}</h3>
              <p>Articles publiés</p>
            </div>
          </div>
          
          <div class="overview-card">
            <div class="overview-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2045 16.7084C21.6935 16.0627 20.9877 15.6209 20.2 15.46" stroke="currentColor" stroke-width="2"/>
                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 18.9078 6.11683 18.7147 6.94073C18.5216 7.76463 18.0532 8.49274 17.3803 9.01334C16.7073 9.53394 15.8733 9.81631 15.02 9.8" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="overview-info">
              <h3>{{ activeUsers }}</h3>
              <p>Utilisateurs actifs</p>
            </div>
          </div>
          
          <div class="overview-card">
            <div class="overview-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="overview-info">
              <h3>{{ pendingArticles }}</h3>
              <p>En attente de modération</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'édition d'utilisateur -->
    <div v-if="editingUser" class="modal-overlay" @click="closeEditModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Modifier l'utilisateur</h3>
          <button @click="closeEditModal" class="close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>Prénom</label>
            <input v-model="editingUser.first_name" type="text" class="form-input">
          </div>
          
          <div class="form-group">
            <label>Nom</label>
            <input v-model="editingUser.last_name" type="text" class="form-input">
          </div>
          
          <div class="form-group">
            <label>Email</label>
            <input v-model="editingUser.email" type="email" class="form-input">
          </div>
          
          <div class="form-group">
            <label>Rôle</label>
            <select v-model="editingUser.role" class="form-select">
              <option value="STUDENT">Étudiant</option>
              <option value="PUBLIANT">Publiant</option>
              <option value="MODERATOR">Modérateur</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeEditModal" class="cancel-btn">Annuler</button>
          <button @click="saveUser" class="save-btn">Sauvegarder</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePermissions } from '../../composables/usePermissions.js'

const { getRoleDisplayName } = usePermissions()

// État réactif
const activeTab = ref('users')
const users = ref([])
const userSearchQuery = ref('')
const roleFilter = ref('')
const editingUser = ref(null)

// Paramètres
const defaultUserRole = ref('STUDENT')
const requireModeration = ref(true)
const emailNotifications = ref(false)
const maxFileSize = ref(50)

onMounted(() => {
  loadUsers()
  loadSettings()
})

const loadUsers = () => {
  const savedUsers = localStorage.getItem('ccc_users')
  if (savedUsers) {
    users.value = JSON.parse(savedUsers)
  }
}

const loadSettings = () => {
  const savedSettings = localStorage.getItem('ccc_settings')
  if (savedSettings) {
    const settings = JSON.parse(savedSettings)
    defaultUserRole.value = settings.defaultUserRole || 'STUDENT'
    requireModeration.value = settings.requireModeration !== false
    emailNotifications.value = settings.emailNotifications || false
    maxFileSize.value = settings.maxFileSize || 50
  }
}

const saveSettings = () => {
  const settings = {
    defaultUserRole: defaultUserRole.value,
    requireModeration: requireModeration.value,
    emailNotifications: emailNotifications.value,
    maxFileSize: maxFileSize.value
  }
  localStorage.setItem('ccc_settings', JSON.stringify(settings))
  
  // Notification de succès (simulation)
  alert('Paramètres sauvegardés avec succès!')
}

// Utilisateurs filtrés
const filteredUsers = computed(() => {
  let filtered = users.value

  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role === roleFilter.value)
  }

  if (userSearchQuery.value) {
    const query = userSearchQuery.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.first_name.toLowerCase().includes(query) ||
      user.last_name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    )
  }

  return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

// Statistiques
const getUsersByRole = (role) => {
  return users.value.filter(user => user.role === role)
}

const totalArticles = computed(() => {
  const savedNews = localStorage.getItem('ccc_news')
  return savedNews ? JSON.parse(savedNews).filter(article => article.status === 'approved').length : 0
})

const activeUsers = computed(() => {
  // Simuler les utilisateurs actifs (connectés dans les 7 derniers jours)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  return users.value.filter(user => 
    user.last_login && new Date(user.last_login) > weekAgo
  ).length
})

const pendingArticles = computed(() => {
  const savedNews = localStorage.getItem('ccc_news')
  return savedNews ? JSON.parse(savedNews).filter(article => article.status === 'pending').length : 0
})

// Actions utilisateurs
const editUser = (user) => {
  editingUser.value = { ...user }
}

const closeEditModal = () => {
  editingUser.value = null
}

const saveUser = () => {
  const index = users.value.findIndex(u => u.id === editingUser.value.id)
  if (index !== -1) {
    users.value[index] = { ...editingUser.value }
    localStorage.setItem('ccc_users', JSON.stringify(users.value))
  }
  closeEditModal()
}

const deleteUser = (user) => {
  if (user.role === 'ADMIN' && getUsersByRole('ADMIN').length === 1) {
    alert('Impossible de supprimer le dernier administrateur!')
    return
  }
  
  if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.first_name} ${user.last_name} ?`)) {
    users.value = users.value.filter(u => u.id !== user.id)
    localStorage.setItem('ccc_users', JSON.stringify(users.value))
  }
}

// Utilitaires
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<style scoped>
.admin-page {
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  margin: 0;
}

.admin-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.tab-button:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  transform: translateY(-2px);
}

.tab-button.active {
  background: rgba(255, 255, 255, 0.95);
  color: #374151;
  border-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.tab-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.users-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.users-header h2 {
  color: #1f2937;
  margin: 0;
}

.users-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-box {
  position: relative;
}

.search-box svg {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-box input {
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-size: 0.875rem;
  min-width: 250px;
  transition: all 0.2s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.role-filter {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-size: 0.875rem;
  min-width: 150px;
  transition: all 0.2s ease;
}

.role-filter:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.users-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

.users-table {
  overflow-x: auto;
}

.users-table table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.users-table th,
.users-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.users-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
}

.user-faculty {
  color: #6b7280;
  font-size: 0.875rem;
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.role-admin {
  background: #fef2f2;
  color: #dc2626;
}

.role-moderator {
  background: #fef3c7;
  color: #d97706;
}

.role-publiant {
  background: #dbeafe;
  color: #2563eb;
}

.role-student {
  background: #f0fdf4;
  color: #16a34a;
}

.user-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.edit {
  background: #dbeafe;
  color: #2563eb;
}

.action-btn.edit:hover {
  background: #2563eb;
  color: white;
}

.action-btn.delete {
  background: #fef2f2;
  color: #dc2626;
}

.action-btn.delete:hover {
  background: #dc2626;
  color: white;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn:disabled:hover {
  background: #fef2f2;
  color: #dc2626;
}

.settings-section h2 {
  color: #1f2937;
  margin: 0 0 2rem 0;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.setting-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.setting-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.setting-card h3 {
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.setting-card p {
  color: #6b7280;
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
}

.setting-select,
.setting-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  transition: all 0.2s ease;
}

.setting-select:focus,
.setting-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.toggle {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

.toggle input:checked + .toggle-slider {
  background-color: #6366f1;
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.settings-actions {
  text-align: center;
}

.save-btn {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
}

.stats-section h2 {
  color: #1f2937;
  margin: 0 0 2rem 0;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.overview-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.2s ease;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.overview-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.overview-info h3 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1;
}

.overview-info p {
  color: #6b7280;
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
  font-weight: 500;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  color: #1f2937;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f3f4f6;
}

.modal-body {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 600;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 2rem 2rem;
  border-top: 1px solid #e5e7eb;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

@media (max-width: 768px) {
  .admin-page {
    padding: 1rem;
  }
  
  .admin-tabs {
    flex-direction: column;
  }
  
  .users-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .users-actions {
    flex-direction: column;
  }
  
  .search-box input {
    min-width: auto;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .overview-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>