<template>
  <form @submit.prevent="handleLogin" class="auth-form login-form">
    <!-- Email -->
    <div class="form-group">
      <label for="email" class="form-label">Email</label>
      <div class="input-wrapper">
        <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2"/>
          <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2"/>
        </svg>
        <input
          id="email"
          v-model="loginForm.email"
          type="email"
          placeholder="votre.email@universite.edu"
          class="form-input"
          required
        />
      </div>
    </div>

    <!-- Mot de passe -->
    <div class="form-group">
      <label for="password" class="form-label">Mot de passe</label>
      <div class="input-wrapper">
        <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
          <circle cx="12" cy="16" r="1" fill="currentColor"/>
          <path d="M7 11V7A5 5 0 0 1 17 7V11" stroke="currentColor" stroke-width="2"/>
        </svg>
        <input
          id="password"
          v-model="loginForm.password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="••••••••"
          class="form-input"
          required
        />
        <button
          type="button"
          @click="togglePasswordVisibility"
          class="password-toggle"
        >
          <svg v-if="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C7 20 2.73 16.39 1 12A18.45 18.45 0 0 1 5.06 5.06L17.94 17.94Z" stroke="currentColor" stroke-width="2"/>
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4C17 4 21.27 7.61 23 12A18.5 18.5 0 0 1 19.42 16.42" stroke="currentColor" stroke-width="2"/>
            <path d="M1 1L23 23" stroke="currentColor" stroke-width="2"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Se souvenir de moi -->
    <div class="form-group">
      <div class="checkbox-wrapper">
        <input
          id="remember"
          v-model="loginForm.rememberMe"
          type="checkbox"
          class="checkbox"
        />
        <label for="remember" class="checkbox-label">
          Se souvenir de moi
        </label>
      </div>
    </div>

    <!-- Message d'erreur -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <!-- Bouton de connexion -->
    <button
      type="submit"
      class="auth-button"
      :disabled="isLoading"
    >
      <span v-if="!isLoading">Se connecter</span>
      <div v-else class="loading-spinner">
        <svg class="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
          <path d="M4 12A8 8 0 0 1 12 4" stroke="currentColor" stroke-width="4"/>
        </svg>
        <span>Connexion...</span>
      </div>
    </button>

    <!-- Lien vers inscription -->
    <div class="form-footer">
      <p>
        Pas encore d'institution ? 
        <button type="button" @click="$emit('switch-to-register')" class="link-button">
          Créer une nouvelle institution
        </button>
      </p>
      <p>
        Ou
        <button type="button" @click="showJoinUniversityForm = true" class="link-button">
          Rejoindre une institution existante
        </button>
      </p>
    </div>

    <!-- Composant pour rejoindre une université existante -->
    <JoinUniversityForm 
      v-if="showJoinUniversityForm"
      @success="handleJoinUniversitySuccess"
      @cancel="closeJoinUniversityForm"
    />
  </form>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { authService } from '@/services/auth.service.js'
import JoinUniversityForm from './JoinUniversityForm.vue'

// Émissions
const emit = defineEmits(['login-success', 'switch-to-register'])

// État réactif
const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const showJoinUniversityForm = ref(false)

// Méthodes
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    // Utiliser le service d'authentification
    const response = await authService.login({
      email: loginForm.email,
      password: loginForm.password
    })

    if (response.status === 'success') {
      // Si "Se souvenir de moi" est coché
      if (loginForm.rememberMe) {
        localStorage.setItem('remembered_user', JSON.stringify(response.data.user))
      }

      emit('login-success', response.data.user)
    } else {
      throw new Error(response.message || 'Erreur de connexion')
    }
  } catch (error) {
    console.error('Erreur de connexion:', error)
    errorMessage.value = error.message || 'Email ou mot de passe incorrect'
  } finally {
    isLoading.value = false
  }
}

const closeJoinUniversityForm = () => {
  showJoinUniversityForm.value = false
}

const handleJoinUniversitySuccess = (userData) => {
  console.log('✅ Rejoindre université réussie:', userData)
  emit('login-success', userData)
  showJoinUniversityForm.value = false
}

// Vérifier s'il y a un utilisateur mémorisé
const checkRememberedUser = () => {
  const rememberedUser = localStorage.getItem('remembered_user')
  if (rememberedUser) {
    try {
      const user = JSON.parse(rememberedUser)
      loginForm.email = user.email
      loginForm.rememberMe = true
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur mémorisé:', error)
    }
  }
}

// Initialisation
onMounted(() => {
  checkRememberedUser()
})
</script>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: var(--text-muted);
  z-index: 1;
}

.form-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-size: 1rem;
  background: var(--background-secondary);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-input::placeholder {
  color: var(--text-muted);
}

.password-toggle {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: var(--radius-sm);
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: var(--text-primary);
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.checkbox {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: #6366f1;
}

.checkbox-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
}

.auth-button {
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 3.5rem;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.auth-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}

.auth-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.form-footer {
  text-align: center;
  margin-top: 1rem;
}

.form-footer p {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.link-button {
  background: none;
  border: none;
  color: #6366f1;
  cursor: pointer;
  font-weight: 600;
  text-decoration: underline;
  font-size: inherit;
  transition: color 0.2s ease;
}

.link-button:hover {
  color: #4f46e5;
}

/* Modal styles */
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
  padding: 1rem;
}

.modal-content {
  background: var(--background-secondary);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
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
  font-weight: 700;
  color: var(--text-primary);
}

.close-button {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.close-button:hover {
  background: var(--background-primary);
  color: var(--text-primary);
}

.join-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.primary-button, .secondary-button {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
}

.primary-button {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.primary-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.secondary-button {
  background: var(--background-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.secondary-button:hover {
  background: var(--border-light);
}

.debug-info {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.debug-info small {
  color: #3b82f6;
  font-weight: 500;
}

.no-universities-message {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.no-universities-message small {
  color: #ef4444;
}

@media (max-width: 768px) {
  .login-container {
    padding: 1rem;
  }
  
  .login-form {
    padding: 2rem 1.5rem;
    max-width: 100%;
    margin: 1rem auto;
  }
  
  .form-header h1 {
    font-size: 1.5rem;
  }
  
  .form-header p {
    font-size: 0.9rem;
  }
  
  .university-selector {
    gap: 0.75rem;
  }
  
  .university-card {
    padding: 1rem;
    min-height: auto;
  }
  
  .university-card h3 {
    font-size: 1rem;
  }
  
  .form-group label {
    font-size: 0.875rem;
  }
  
  .form-group input {
    padding: 0.75rem;
    font-size: 1rem;
  }
  
  .form-actions {
    gap: 0.75rem;
  }
  
  .modal-content {
    margin: 1rem;
    max-width: calc(100vw - 2rem);
    padding: 1.5rem;
  }
  
  .modal-actions {
    flex-direction: column;
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 0.5rem;
  }
  
  .login-form {
    padding: 1.5rem 1rem;
    margin: 0.5rem auto;
    border-radius: 12px;
  }
  
  .form-header h1 {
    font-size: 1.25rem;
  }
  
  .form-header p {
    font-size: 0.85rem;
  }
  
  .university-selector {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .university-card {
    padding: 0.75rem;
  }
  
  .university-card h3 {
    font-size: 0.9rem;
  }
  
  .university-card p {
    font-size: 0.8rem;
  }
  
  .form-group input {
    padding: 0.6rem;
    font-size: 0.9rem;
  }
  
  .form-actions button {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
  }
  
  .modal-content {
    margin: 0.5rem;
    max-width: calc(100vw - 1rem);
    padding: 1rem;
  }
  
  .modal-header h3 {
    font-size: 1.1rem;
  }
}

@media (max-width: 360px) {
  .login-form {
    padding: 1rem 0.75rem;
    margin: 0.25rem auto;
  }
  
  .form-header h1 {
    font-size: 1.1rem;
  }
  
  .form-header p {
    font-size: 0.8rem;
  }
  
  .university-card {
    padding: 0.5rem;
  }
  
  .university-card h3 {
    font-size: 0.85rem;
  }
  
  .university-card p {
    font-size: 0.75rem;
  }
  
  .form-group input {
    padding: 0.5rem;
    font-size: 0.85rem;
  }
  
  .form-actions button {
    padding: 0.6rem 1.25rem;
    font-size: 0.85rem;
  }
  
  .modal-content {
    margin: 0.25rem;
    max-width: calc(100vw - 0.5rem);
    padding: 0.75rem;
  }
}

/* Landscape orientation optimizations */
@media (max-height: 500px) and (orientation: landscape) {
  .login-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
  
  .login-form {
    max-height: 90vh;
    overflow-y: auto;
    margin: 0;
  }
  
  .university-selector {
    max-height: 200px;
    overflow-y: auto;
  }
}

@media (max-width: 640px) {
  .modal-content {
    margin: 1rem;
    max-width: none;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}

/* Styles pour les erreurs de validation */
.form-input.error {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}

.field-error {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  padding-left: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.field-error::before {
  content: "⚠";
  font-size: 0.875rem;
}
</style>