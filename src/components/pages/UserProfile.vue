<template>
  <div class="user-profile">
    <div class="profile-container">
      <!-- En-tête du profil -->
      <div class="profile-header">
        <div class="profile-avatar">
          <div class="avatar-circle">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
        </div>
        <div class="profile-info">
          <h1>{{ currentUser.firstName }} {{ currentUser.lastName }}</h1>
          <p class="profile-email">{{ currentUser.email }}</p>
          <div class="profile-role" :style="{ color: getRoleColor(currentUser.role) }">
            {{ getRoleLabel(currentUser.role) }}
          </div>
        </div>
        <div class="profile-actions">
          <button 
            v-if="!isEditing" 
            @click="startEditing" 
            class="primary-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/>
              <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/>
            </svg>
            Modifier le profil
          </button>
          <div v-else class="edit-actions">
            <button @click="saveProfile" class="primary-button" :disabled="isSaving">
              <svg v-if="isSaving" width="20" height="20" viewBox="0 0 24 24" fill="none" class="animate-spin">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
                <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"/>
              </svg>
              <span v-else>Sauvegarder</span>
            </button>
            <button @click="cancelEditing" class="secondary-button">Annuler</button>
          </div>
        </div>
      </div>

      <!-- Informations du profil -->
      <div class="profile-content">
        <div class="profile-section">
          <h2>Informations personnelles</h2>
          
          <div v-if="!isEditing" class="profile-fields">
            <div class="field-group">
              <label class="field-label">Prénom</label>
              <p class="field-value">{{ currentUser.firstName }}</p>
            </div>
            
            <div class="field-group">
              <label class="field-label">Nom</label>
              <p class="field-value">{{ currentUser.lastName }}</p>
            </div>
            
            <div class="field-group">
              <label class="field-label">Email</label>
              <p class="field-value">{{ currentUser.email }}</p>
            </div>
            
            <div class="field-group">
              <label class="field-label">Téléphone</label>
              <p class="field-value">{{ currentUser.phone || 'Non renseigné' }}</p>
            </div>
          </div>

          <!-- Formulaire d'édition -->
          <form v-else @submit.prevent="saveProfile" class="edit-form">
            <div class="form-row">
              <div class="form-group">
                <label for="firstName" class="form-label">Prénom *</label>
                <input
                  id="firstName"
                  v-model="editForm.firstName"
                  type="text"
                  class="form-input"
                  required
                >
              </div>
              
              <div class="form-group">
                <label for="lastName" class="form-label">Nom *</label>
                <input
                  id="lastName"
                  v-model="editForm.lastName"
                  type="text"
                  class="form-input"
                  required
                >
              </div>
            </div>

            <div class="form-group">
              <label for="email" class="form-label">Email *</label>
              <input
                id="email"
                v-model="editForm.email"
                type="email"
                class="form-input"
                required
              >
            </div>

            <div class="form-group">
              <label for="phone" class="form-label">Téléphone</label>
              <input
                id="phone"
                v-model="editForm.phone"
                type="tel"
                class="form-input"
                placeholder="Ex: +33 6 12 34 56 78"
              >
            </div>
          </form>
        </div>

        <!-- Section université -->
        <div class="profile-section">
          <h2>Institution</h2>
          <div class="university-info">
            <div class="university-card">
              <div class="university-header">
                <h3>{{ currentUser.university?.name || 'Institution non définie' }}</h3>
                <span class="university-badge">{{ currentUser.university?.type || 'Type non défini' }}</span>
              </div>
              <div class="university-details">
                <p><strong>Ville :</strong> {{ currentUser.university?.city || 'Non renseignée' }}</p>
                <p><strong>Pays :</strong> {{ currentUser.university?.country || 'Non renseigné' }}</p>
                <p><strong>Site web :</strong> 
                  <a 
                    v-if="currentUser.university?.website" 
                    :href="currentUser.university.website" 
                    target="_blank" 
                    class="university-link"
                  >
                    {{ currentUser.university.website }}
                  </a>
                  <span v-else>Non renseigné</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Section sécurité -->
        <div class="profile-section">
          <h2>Sécurité</h2>
          <div class="security-section">
            <div class="security-item">
              <div class="security-info">
                <h3>Mot de passe</h3>
                <p>Dernière modification : {{ formatDate(currentUser.lastPasswordChange) }}</p>
              </div>
              <button @click="showPasswordModal = true" class="secondary-button">
                Changer le mot de passe
              </button>
            </div>
            
            <div class="security-item">
              <div class="security-info">
                <h3>Dernière connexion</h3>
                <p>{{ formatDate(currentUser.last_login) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Section statistiques -->
        <div class="profile-section">
          <h2>Statistiques</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>Articles publiés</h3>
                <p class="stat-number">{{ userStats.articlesPublished }}</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2"/>
                  <path d="M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8 .896 0 1.756.156 2.56.428" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>Articles modérés</h3>
                <p class="stat-number">{{ userStats.articlesModerated }}</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>Membre depuis</h3>
                <p class="stat-number">{{ getMembershipDuration() }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de changement de mot de passe -->
    <div v-if="showPasswordModal" class="modal-overlay" @click="closePasswordModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Changer le mot de passe</h3>
          <button @click="closePasswordModal" class="close-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="changePassword" class="password-form">
          <div class="form-group">
            <label for="currentPassword" class="form-label">Mot de passe actuel *</label>
            <input
              id="currentPassword"
              v-model="passwordForm.currentPassword"
              type="password"
              class="form-input"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="newPassword" class="form-label">Nouveau mot de passe *</label>
            <input
              id="newPassword"
              v-model="passwordForm.newPassword"
              type="password"
              class="form-input"
              required
              minlength="6"
            >
          </div>
          
          <div class="form-group">
            <label for="confirmPassword" class="form-label">Confirmer le nouveau mot de passe *</label>
            <input
              id="confirmPassword"
              v-model="passwordForm.confirmPassword"
              type="password"
              class="form-input"
              required
            >
          </div>

          <div v-if="passwordError" class="error-message">
            {{ passwordError }}
          </div>

          <div class="modal-actions">
            <button type="submit" class="primary-button" :disabled="isChangingPassword">
              <span v-if="isChangingPassword">Modification...</span>
              <span v-else>Changer le mot de passe</span>
            </button>
            <button type="button" @click="closePasswordModal" class="secondary-button">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { usePermissions } from '../../composables/usePermissions.js'

const props = defineProps({
  currentUser: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['user-updated'])

// État du composant
const isEditing = ref(false)
const isSaving = ref(false)
const showPasswordModal = ref(false)
const isChangingPassword = ref(false)
const passwordError = ref('')

// Système de permissions
const { getRoleLabel, getRoleColor } = usePermissions()

// Formulaire d'édition
const editForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: ''
})

// Formulaire de mot de passe
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Statistiques utilisateur
const userStats = ref({
  articlesPublished: 0,
  articlesModerated: 0
})

// Commencer l'édition
const startEditing = () => {
  editForm.firstName = props.currentUser.firstName || ''
  editForm.lastName = props.currentUser.lastName || ''
  editForm.email = props.currentUser.email || ''
  editForm.phone = props.currentUser.phone || ''
  isEditing.value = true
}

// Annuler l'édition
const cancelEditing = () => {
  isEditing.value = false
  // Réinitialiser le formulaire
  Object.keys(editForm).forEach(key => {
    editForm[key] = ''
  })
}

// Sauvegarder le profil
const saveProfile = async () => {
  isSaving.value = true
  
  try {
    // Simulation d'une sauvegarde
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mettre à jour l'utilisateur
    const updatedUser = {
      ...props.currentUser,
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      email: editForm.email,
      phone: editForm.phone,
      lastModified: new Date().toISOString()
    }
    
    // Sauvegarder dans localStorage
    updateUserInStorage(updatedUser)
    
    // Émettre l'événement de mise à jour
    emit('user-updated', updatedUser)
    
    isEditing.value = false
    
    // Notification de succès
    showNotification('Profil mis à jour avec succès !', 'success')
    
  } catch (error) {
    showNotification('Erreur lors de la sauvegarde du profil', 'error')
  } finally {
    isSaving.value = false
  }
}

// Mettre à jour l'utilisateur dans le localStorage
const updateUserInStorage = (updatedUser) => {
  // Mettre à jour dans ccc_users
  const users = JSON.parse(localStorage.getItem('ccc_users') || '[]')
  const userIndex = users.findIndex(u => u.id === updatedUser.id)
  
  if (userIndex !== -1) {
    users[userIndex] = updatedUser
    localStorage.setItem('ccc_users', JSON.stringify(users))
  }
  
  // Mettre à jour currentUser
  localStorage.setItem('currentUser', JSON.stringify(updatedUser))
}

// Fermer le modal de mot de passe
const closePasswordModal = () => {
  showPasswordModal.value = false
  passwordError.value = ''
  Object.keys(passwordForm).forEach(key => {
    passwordForm[key] = ''
  })
}

// Changer le mot de passe
const changePassword = async () => {
  passwordError.value = ''
  
  // Validations
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordError.value = 'Les mots de passe ne correspondent pas'
    return
  }
  
  if (passwordForm.newPassword.length < 6) {
    passwordError.value = 'Le mot de passe doit contenir au moins 6 caractères'
    return
  }
  
  if (passwordForm.currentPassword !== props.currentUser.password) {
    passwordError.value = 'Mot de passe actuel incorrect'
    return
  }
  
  isChangingPassword.value = true
  
  try {
    // Simulation du changement
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mettre à jour le mot de passe
    const updatedUser = {
      ...props.currentUser,
      password: passwordForm.newPassword,
      lastPasswordChange: new Date().toISOString()
    }
    
    updateUserInStorage(updatedUser)
    emit('user-updated', updatedUser)
    
    closePasswordModal()
    showNotification('Mot de passe modifié avec succès !', 'success')
    
  } catch (error) {
    passwordError.value = 'Erreur lors du changement de mot de passe'
  } finally {
    isChangingPassword.value = false
  }
}

// Formatage des dates
const formatDate = (dateString) => {
  if (!dateString) return 'Non disponible'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Calculer la durée d'adhésion
const getMembershipDuration = () => {
  if (!props.currentUser.createdAt) return 'Non disponible'
  
  const createdDate = new Date(props.currentUser.createdAt)
  const now = new Date()
  const diffTime = Math.abs(now - createdDate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 30) return `${diffDays} jours`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} mois`
  return `${Math.floor(diffDays / 365)} ans`
}

// Charger les statistiques utilisateur
const loadUserStats = () => {
  const news = JSON.parse(localStorage.getItem('ccc_news') || '[]')
  
  userStats.value.articlesPublished = news.filter(
    article => article.author_id === props.currentUser.id
  ).length
  
  userStats.value.articlesModerated = news.filter(
    article => article.moderator_id === props.currentUser.id
  ).length
}

// Notification simple
const showNotification = (message, type) => {
  // Simple alert pour l'instant - pourrait être amélioré avec un système de toast
  alert(message)
}

// Initialisation
onMounted(() => {
  loadUserStats()
})
</script>

<style scoped>
.user-profile {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-container {
  background: var(--background-secondary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

/* En-tête du profil */
.profile-header {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.profile-avatar {
  flex-shrink: 0;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.profile-info {
  flex: 1;
}

.profile-info h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.profile-email {
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.profile-role {
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-md);
  backdrop-filter: blur(10px);
}

.profile-actions {
  flex-shrink: 0;
}

.edit-actions {
  display: flex;
  gap: 0.75rem;
}

/* Contenu du profil */
.profile-content {
  padding: 2rem;
}

.profile-section {
  margin-bottom: 2.5rem;
}

.profile-section:last-child {
  margin-bottom: 0;
}

.profile-section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--border-light);
}

/* Champs du profil */
.profile-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.field-value {
  font-size: 1rem;
  color: var(--text-primary);
  font-weight: 500;
}

/* Formulaire d'édition */
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.form-input {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Section université */
.university-card {
  background: var(--background-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.university-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.university-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.university-badge {
  background: var(--primary-light);
  color: var(--primary-color);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
}

.university-details p {
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.university-link {
  color: var(--primary-color);
  text-decoration: none;
}

.university-link:hover {
  text-decoration: underline;
}

/* Section sécurité */
.security-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.security-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: var(--background-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.security-info h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.security-info p {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* Statistiques */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: var(--background-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: var(--primary-light);
  color: var(--primary-color);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-content {
  background: var(--background-secondary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-button {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-md);
  transition: background-color 0.2s ease;
}

.close-button:hover {
  background: var(--background-primary);
}

.password-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.error-message {
  color: var(--error-color);
  font-size: 0.875rem;
  padding: 0.75rem;
  background: rgba(245, 101, 101, 0.1);
  border: 1px solid rgba(245, 101, 101, 0.2);
  border-radius: var(--radius-md);
}

/* Boutons */
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

.primary-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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
}

.secondary-button:hover {
  background: var(--background-primary);
  border-color: var(--primary-color);
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .user-profile {
    padding: 1rem;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .security-item {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>