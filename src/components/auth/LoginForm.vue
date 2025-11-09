<template>
  <form @submit.prevent="handleLogin" class="auth-form login-form" :class="{ 'dark': isDark }">
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
        <button type="button" @click="$emit('switch-to-register')" class="link-button">
          Rejoindre une institution existante
        </button>
      </p>
    </div>
  </form>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { authService } from '@/services/auth.service.js'
import { useTheme } from '@/composables/useTheme.js'

// Composables
const { isDark } = useTheme()

// Émissions
const emit = defineEmits(['login-success', 'switch-to-register', 'join-university-success'])

// État réactif
const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

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
  transition: all 0.3s ease;
  
  /* Variables CSS pour le mode clair */
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --background-primary: #ffffff;
  --background-secondary: #f9fafb;
  --background-tertiary: #f3f4f6;
  --border-color: #e5e7eb;
  --border-light: #f3f4f6;
  --border-focus: #6366f1;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  
  /* Couleurs spécifiques */
  --input-bg: #ffffff;
  --input-border: #d1d5db;
  --input-focus-border: #6366f1;
  --input-focus-shadow: rgba(99, 102, 241, 0.1);
  --button-primary-bg: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  --button-primary-shadow: rgba(99, 102, 241, 0.3);
  --button-primary-hover-shadow: rgba(99, 102, 241, 0.4);
  --error-bg: rgba(239, 68, 68, 0.1);
  --error-border: rgba(239, 68, 68, 0.2);
  --error-text: #ef4444;
  --success-bg: rgba(34, 197, 94, 0.1);
  --success-border: rgba(34, 197, 94, 0.2);
  --success-text: #22c55e;
  --link-color: #6366f1;
  --link-hover-color: #4f46e5;
}

.auth-form.dark {
  /* Variables CSS pour le mode sombre */
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #64748b;
  --background-primary: #0f172a;
  --background-secondary: #1e293b;
  --background-tertiary: #334155;
  --border-color: #334155;
  --border-light: #475569;
  --border-focus: #6366f1;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.6);
  
  /* Couleurs spécifiques pour le mode sombre */
  --input-bg: #1e293b;
  --input-border: #475569;
  --input-focus-border: #6366f1;
  --input-focus-shadow: rgba(99, 102, 241, 0.2);
  --button-primary-bg: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  --button-primary-shadow: rgba(99, 102, 241, 0.4);
  --button-primary-hover-shadow: rgba(99, 102, 241, 0.5);
  --error-bg: rgba(239, 68, 68, 0.15);
  --error-border: rgba(239, 68, 68, 0.3);
  --error-text: #f87171;
  --success-bg: rgba(34, 197, 94, 0.15);
  --success-border: rgba(34, 197, 94, 0.3);
  --success-text: #4ade80;
  --link-color: #818cf8;
  --link-hover-color: #6366f1;
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
  transition: color 0.3s ease;
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
  transition: color 0.3s ease;
}

.form-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid var(--input-border);
  border-radius: var(--radius-lg);
  font-size: 1rem;
  background: var(--input-bg);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--input-focus-border);
  box-shadow: 0 0 0 3px var(--input-focus-shadow);
}

.form-input:focus + .input-icon {
  color: var(--input-focus-border);
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
  transition: all 0.3s ease;
}

.password-toggle:hover {
  color: var(--text-primary);
  background: var(--background-tertiary);
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
  transition: all 0.3s ease;
}

.checkbox-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.checkbox-label:hover {
  color: var(--text-primary);
}

.auth-button {
  width: 100%;
  padding: 1rem 1.5rem;
  background: var(--button-primary-bg);
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
  box-shadow: 0 4px 15px var(--button-primary-shadow);
  position: relative;
  overflow: hidden;
}

.auth-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  transition: left 0.3s ease;
}

.auth-button:hover:not(:disabled)::before {
  left: 100%;
}

.auth-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px var(--button-primary-hover-shadow);
}

.auth-button:active {
  transform: translateY(0);
}

.auth-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
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
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  padding: 1rem;
  background: var(--error-bg);
  color: var(--error-text);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  border: 1px solid var(--error-border);
  animation: slideInDown 0.3s ease;
  position: relative;
}

.error-message::before {
  content: '⚠';
  margin-right: 0.5rem;
  font-size: 1rem;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-footer {
  text-align: center;
  margin-top: 1rem;
}

.form-footer p {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.link-button {
  background: none;
  border: none;
  color: var(--link-color);
  cursor: pointer;
  font-weight: 600;
  text-decoration: underline;
  font-size: inherit;
  transition: all 0.3s ease;
  padding: 0.25rem;
  border-radius: var(--radius-sm);
}

.link-button:hover {
  color: var(--link-hover-color);
  text-decoration: none;
}

/* Styles de modal */
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
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: var(--background-secondary);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
  animation: slideInUp 0.3s ease;
  border: 1px solid var(--border-color);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  transition: color 0.3s ease;
}

.close-button {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
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
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  position: relative;
  overflow: hidden;
}

.primary-button::before, .secondary-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  transition: left 0.3s ease;
}

.primary-button:hover:not(:disabled)::before,
.secondary-button:hover::before {
  left: 100%;
}

.primary-button {
  background: var(--button-primary-bg);
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
  background: var(--background-tertiary);
  border-color: var(--border-light);
}

.debug-info {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: var(--success-bg);
  border-radius: var(--radius-sm);
  border: 1px solid var(--success-border);
  animation: slideInDown 0.3s ease;
}

.debug-info small {
  color: var(--success-text);
  font-weight: 500;
}

.no-universities-message {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: var(--error-bg);
  border-radius: var(--radius-sm);
  border: 1px solid var(--error-border);
  animation: slideInDown 0.3s ease;
}

.no-universities-message small {
  color: var(--error-text);
}

/* Styles pour les erreurs de validation */
.form-input.error {
  border-color: var(--error-text) !important;
  box-shadow: 0 0 0 3px var(--error-border) !important;
}

.field-error {
  color: var(--error-text);
  font-size: 0.75rem;
  margin-top: 0.25rem;
  padding-left: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  animation: slideInDown 0.2s ease;
}

.field-error::before {
  content: "⚠";
  font-size: 0.875rem;
}

/* Responsive Design */
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

/* Optimisations d'orientation paysage */
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

/* Amélioration de l'accessibilité */
@media (prefers-reduced-motion: reduce) {
  .auth-form *,
  .auth-form *::before,
  .auth-form *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus visible pour l'accessibilité */
.form-input:focus-visible,
.checkbox:focus-visible,
.auth-button:focus-visible,
.link-button:focus-visible,
.password-toggle:focus-visible {
  outline: 2px solid var(--input-focus-border);
  outline-offset: 2px;
}

/* États de hover améliorés */
.form-input:hover {
  border-color: var(--text-muted);
}

.checkbox-wrapper:hover .checkbox {
  transform: scale(1.05);
}

/* Animation pour le bouton de connexion */
.auth-button.loading {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
}
</style>