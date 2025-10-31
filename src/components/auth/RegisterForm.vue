<template>
  <div>
    <!-- Formulaire d'inscription -->
    <div v-if="!showOtpPage">
      <form @submit.prevent="handleRegister" class="auth-form register-form">
        <!-- Section: Informations personnelles -->
        <div class="form-section">
          <h3 class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
            </svg>
            Informations personnelles
          </h3>
          
          <!-- Ligne 1: Prénom et Nom -->
          <div class="form-row">
            <div class="form-group">
              <label for="first_name" class="form-label">Prénom *</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                </svg>
                <input
                  id="first_name"
                  v-model="registerForm.first_name"
                  type="text"
                  placeholder="Votre prénom"
                  class="form-input"
                  required
                />
              </div>
            </div>
            
            <div class="form-group">
              <label for="last_name" class="form-label">Nom *</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                </svg>
                <input
                  id="last_name"
                  v-model="registerForm.last_name"
                  type="text"
                  placeholder="Votre nom"
                  class="form-input"
                  required
                />
              </div>
            </div>
          </div>

          <!-- Ligne 2: Username et Email -->
          <div class="form-row">
            <div class="form-group">
              <label for="username" class="form-label">Nom d'utilisateur *</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="2"/>
                </svg>
                <input
                  id="username"
                  v-model="registerForm.username"
                  type="text"
                  placeholder="admin_universite"
                  class="form-input"
                  required
                />
              </div>
            </div>
            
            <div class="form-group">
              <label for="register-email" class="form-label">Email *</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2"/>
                </svg>
                <input
                  id="register-email"
                  v-model="registerForm.email"
                  type="email"
                  placeholder="admin@nouvelleuni.edu"
                  class="form-input"
                  required
                />
              </div>
            </div>
          </div>

          <!-- Mots de passe -->
          <div class="form-row">
            <div class="form-group">
              <label for="register-password" class="form-label">Mot de passe *</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="16" r="1" fill="currentColor"/>
                  <path d="M7 11V7A5 5 0 0 1 17 7V11" stroke="currentColor" stroke-width="2"/>
                </svg>
                <input
                  id="register-password"
                  v-model="registerForm.password"
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
            
            <div class="form-group">
              <label for="password_confirm" class="form-label">Confirmer *</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="16" r="1" fill="currentColor"/>
                  <path d="M7 11V7A5 5 0 0 1 17 7V11" stroke="currentColor" stroke-width="2"/>
                </svg>
                <input
                  id="password_confirm"
                  v-model="registerForm.password_confirm"
                  :type="showPasswordConfirm ? 'text' : 'password'"
                  placeholder="••••••••"
                  class="form-input"
                  :class="{ 'error': registerForm.password_confirm && !isPasswordMatch }"
                  required
                />
                <button
                  type="button"
                  @click="togglePasswordConfirmVisibility"
                  class="password-toggle"
                >
                  <svg v-if="showPasswordConfirm" width="20" height="20" viewBox="0 0 24 24" fill="none">
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
              <div v-if="registerForm.password_confirm && !isPasswordMatch" class="error-message">
                Les mots de passe ne correspondent pas
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Informations de l'université -->
        <div class="form-section">
          <h3 class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              <path d="M3 17L12 22L21 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              <path d="M3 12L12 17L21 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            </svg>
            Nouvelle université
          </h3>
          
          <div class="form-group">
            <label for="university_name" class="form-label">Nom de l'université *</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                <path d="M3 17L12 22L21 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                <path d="M3 12L12 17L21 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              </svg>
              <input
                id="university_name"
                v-model="registerForm.university_name"
                type="text"
                placeholder="Université de Kinshasa"
                class="form-input"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="university_city" class="form-label">Ville</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.03 7.03 1 12 1S21 5.03 21 10Z" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                </svg>
                <input
                  id="university_city"
                  v-model="registerForm.university_city"
                  type="text"
                  placeholder="Kinshasa"
                  class="form-input"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label for="university_country" class="form-label">Pays</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                </svg>
                <select
                  id="university_country"
                  v-model="registerForm.university_country"
                  class="form-input"
                  style="padding-left: 3rem;"
                >
                  <option value="République Démocratique du Congo">République Démocratique du Congo</option>
                  <option value="Rwanda">Rwanda</option>
                  <option value="Burundi">Burundi</option>
                  <option value="Congo-Brazzaville">Congo-Brazzaville</option>
                  <option value="Cameroun">Cameroun</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Structure académique -->
        <div class="form-section">
          <h3 class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7" stroke="currentColor" stroke-width="2"/>
              <path d="M21 7L12 12L3 7L12 2L21 7Z" stroke="currentColor" stroke-width="2"/>
            </svg>
            Structure académique
          </h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="faculty_name" class="form-label">Faculté *</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7" stroke="currentColor" stroke-width="2"/>
                  <path d="M21 7L12 12L3 7L12 2L21 7Z" stroke="currentColor" stroke-width="2"/>
                </svg>
                <input
                  id="faculty_name"
                  v-model="registerForm.faculty_name"
                  type="text"
                  placeholder="Faculté des Sciences"
                  class="form-input"
                  required
                />
              </div>
            </div>
            
            <div class="form-group">
              <label for="department_name" class="form-label">Département *</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7" stroke="currentColor" stroke-width="2"/>
                  <path d="M21 7L12 12L3 7L12 2L21 7Z" stroke="currentColor" stroke-width="2"/>
                </svg>
                <input
                  id="department_name"
                  v-model="registerForm.department_name"
                  type="text"
                  placeholder="Informatique"
                  class="form-input"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Conditions d'utilisation -->
        <div class="form-group">
          <div class="checkbox-wrapper">
            <input
              id="terms"
              v-model="registerForm.terms_accepted"
              type="checkbox"
              class="checkbox"
              required
            />
            <label for="terms" class="checkbox-label">
              J'accepte les <a href="#" class="link">conditions d'utilisation</a> et je confirme que je suis autorisé(e) à créer cette institution universitaire
            </label>
          </div>
        </div>

        <!-- Message d'erreur -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- Bouton d'inscription -->
        <button
          type="submit"
          class="auth-button"
          :disabled="isLoading || !isFormValid"
        >
          <span v-if="!isLoading">Créer l'Institution</span>
          <div v-else class="loading-spinner">
            <svg class="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
              <path d="M4 12A8 8 0 0 1 12 4" stroke="currentColor" stroke-width="4"/>
            </svg>
            <span>Création en cours...</span>
          </div>
        </button>
      </form>
    </div>

    <!-- Page de confirmation OTP -->
    <OtpVerification 
      v-if="showOtpPage"
      :email="registerForm.email"
      :user-data="pendingUserData"
      @verification-success="handleOtpSuccess"
      @back-to-register="showOtpPage = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import OtpVerification from './OtpVerification.vue'

const emit = defineEmits(['register-success', 'switch-to-login'])

// État réactif
const registerForm = reactive({
  first_name: '',
  last_name: '',
  username: '',
  email: '',
  password: '',
  password_confirm: '',
  university_name: '',
  university_city: '',
  university_country: 'République Démocratique du Congo',
  faculty_name: '',
  department_name: '',
  terms_accepted: false
})

const showPassword = ref(false)
const showPasswordConfirm = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const showOtpPage = ref(false)
const pendingUserData = ref(null)

// Computed
const isPasswordMatch = computed(() => {
  return registerForm.password === registerForm.password_confirm
})

const isFormValid = computed(() => {
  return registerForm.first_name &&
         registerForm.last_name &&
         registerForm.username &&
         registerForm.email &&
         registerForm.password &&
         registerForm.password_confirm &&
         isPasswordMatch.value &&
         registerForm.university_name &&
         registerForm.faculty_name &&
         registerForm.department_name &&
         registerForm.terms_accepted
})

// Méthodes
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const togglePasswordConfirmVisibility = () => {
  showPasswordConfirm.value = !showPasswordConfirm.value
}

const handleRegister = async () => {
  if (!isFormValid.value) {
    errorMessage.value = 'Veuillez remplir tous les champs obligatoires'
    return
  }

  if (!isPasswordMatch.value) {
    errorMessage.value = 'Les mots de passe ne correspondent pas'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Créer l'université
    const university = {
      id: Date.now(),
      name: registerForm.university_name,
      city: registerForm.university_city,
      country: registerForm.university_country,
      faculties: [
        {
          id: Date.now() + 1,
          name: registerForm.faculty_name,
          departments: [
            {
              id: Date.now() + 2,
              name: registerForm.department_name
            }
          ]
        }
      ],
      created_at: new Date().toISOString()
    }

    // Créer l'utilisateur
    const user = {
      id: Date.now(),
      first_name: registerForm.first_name,
      last_name: registerForm.last_name,
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password,
      role: 'ADMIN', // Le créateur d'institution devient automatiquement administrateur
      university_id: university.id,
      university: university,
      faculty: registerForm.faculty_name,
      department: registerForm.department_name,
      is_verified: false,
      otp_code: Math.floor(100000 + Math.random() * 900000).toString(),
      created_at: new Date().toISOString(),
      last_login: null
    }

    // Sauvegarder temporairement les données
    pendingUserData.value = { user, university }

    // Simuler l'envoi d'OTP par email
    console.log(`OTP envoyé à ${user.email}: ${user.otp_code}`)

    // Afficher la page de vérification OTP
    showOtpPage.value = true

  } catch (error) {
    errorMessage.value = 'Erreur lors de la création de l\'institution. Veuillez réessayer.'
    console.error('Erreur d\'inscription:', error)
  } finally {
    isLoading.value = false
  }
}

const handleOtpSuccess = () => {
  emit('register-success', pendingUserData.value)
  showOtpPage.value = false
}
</script>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  background: rgba(255, 255, 255, 0.7);
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid rgba(99, 102, 241, 0.2);
}

.section-title svg {
  color: #6366f1;
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
  border-radius: var(--radius-md);
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

.form-input.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
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
  align-items: flex-start;
  gap: 0.75rem;
}

.checkbox {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: #6366f1;
  margin-top: 0.125rem;
}

.checkbox-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
}

.link {
  color: #6366f1;
  text-decoration: underline;
  font-weight: 600;
}

.link:hover {
  color: #4f46e5;
}

.auth-button {
  width: 100%;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 4rem;
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
}

.auth-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
}

.auth-button:disabled {
  opacity: 0.6;
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
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-section {
    padding: 1rem;
  }
}
</style>