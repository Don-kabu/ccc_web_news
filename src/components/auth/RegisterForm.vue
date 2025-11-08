<template>
  <div class="register-container">
    <!-- Étape 1: Vérification email avec OTP -->
    <EmailVerification
      v-if="currentStep === 1"
      @verification-success="handleEmailVerified"
      @back="handleBackToLogin"
      :verification-type="'university-creation'"
      class="email-verification-step"
    />

    <!-- Étape 2: Formulaire complet après vérification email -->
    <div v-else-if="currentStep === 2" class="register-form-container">
      <div class="form-header">
        <h2>Créer votre institution universitaire</h2>
        <p>Complétez les informations pour finaliser la création de votre compte et de votre institution</p>
        <div class="verified-email-badge">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
          </svg>
          Email vérifié : {{ verifiedEmail }}
        </div>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <!-- Section Informations de l'institution -->
        <fieldset class="form-section">
          <legend>Informations de l'institution</legend>
          
          <div class="form-group">
            <label for="university_name" class="form-label">Nom de l'institution *</label>
            <input
              id="university_name"
              v-model="registerForm.university_name"
              type="text"
              placeholder="Université de Kinshasa"
              class="form-input"
              :class="{ 'error': validationErrors.university_name }"
              required
            />
            <div v-if="validationErrors.university_name" class="field-error">
              {{ validationErrors.university_name }}
            </div>
          </div>

          <div class="form-group">
            <label for="university_type" class="form-label">Type d'institution *</label>
            <select
              id="university_type"
              v-model="registerForm.university_type"
              class="form-input"
              :class="{ 'error': validationErrors.university_type }"
              required
            >
              <option value="">Sélectionner le type</option>
              <option value="PUBLIC">Université publique</option>
              <option value="PRIVATE">Université privée</option>
              <option value="INSTITUTE">Institut supérieur</option>
              <option value="COLLEGE">École supérieure</option>
            </select>
            <div v-if="validationErrors.university_type" class="field-error">
              {{ validationErrors.university_type }}
            </div>
          </div>

          <div class="form-group">
            <label for="university_city" class="form-label">Ville *</label>
            <input
              id="university_city"
              v-model="registerForm.university_city"
              type="text"
              placeholder="Kinshasa"
              class="form-input"
              :class="{ 'error': validationErrors.university_city }"
              required
            />
            <div v-if="validationErrors.university_city" class="field-error">
              {{ validationErrors.university_city }}
            </div>
          </div>

          <div class="form-group">
            <label for="university_country" class="form-label">Pays *</label>
            <input
              id="university_country"
              v-model="registerForm.university_country"
              type="text"
              placeholder="République Démocratique du Congo"
              class="form-input"
              :class="{ 'error': validationErrors.university_country }"
              required
            />
            <div v-if="validationErrors.university_country" class="field-error">
              {{ validationErrors.university_country }}
            </div>
          </div>

          <div class="form-group">
            <label for="university_website" class="form-label">Site web de l'institution</label>
            <input
              id="university_website"
              v-model="registerForm.university_website"
              type="url"
              placeholder="https://www.universite-kinshasa.cd"
              class="form-input"
              :class="{ 'error': validationErrors.university_website }"
            />
            <div v-if="validationErrors.university_website" class="field-error">
              {{ validationErrors.university_website }}
            </div>
          </div>

          <div class="form-group">
            <label for="university_description" class="form-label">Description de l'institution</label>
            <textarea
              id="university_description"
              v-model="registerForm.university_description"
              placeholder="Brève description de votre institution..."
              class="form-textarea"
              :class="{ 'error': validationErrors.university_description }"
              rows="3"
            ></textarea>
            <div v-if="validationErrors.university_description" class="field-error">
              {{ validationErrors.university_description }}
            </div>
          </div>
        </fieldset>

        <!-- Section Informations de l'administrateur -->
        <fieldset class="form-section">
          <legend>Compte administrateur</legend>
          
          <div class="form-row">
            <div class="form-group">
              <label for="admin_first_name" class="form-label">Prénom de l'administrateur *</label>
              <input
                id="admin_first_name"
                v-model="registerForm.admin_first_name"
                type="text"
                placeholder="Jean"
                class="form-input"
                :class="{ 'error': validationErrors.admin_first_name }"
                required
              />
              <div v-if="validationErrors.admin_first_name" class="field-error">
                {{ validationErrors.admin_first_name }}
              </div>
            </div>

            <div class="form-group">
              <label for="admin_last_name" class="form-label">Nom de famille *</label>
              <input
                id="admin_last_name"
                v-model="registerForm.admin_last_name"
                type="text"
                placeholder="Kabila"
                class="form-input"
                :class="{ 'error': validationErrors.admin_last_name }"
                required
              />
              <div v-if="validationErrors.admin_last_name" class="field-error">
                {{ validationErrors.admin_last_name }}
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="admin_email" class="form-label">Email (déjà vérifié)</label>
            <input
              id="admin_email"
              :value="verifiedEmail"
              type="email"
              class="form-input verified-field"
              readonly
              disabled
            />
            <small class="help-text">Cet email a été vérifié lors de l'étape précédente</small>
          </div>

          <div class="form-group">
            <label for="admin_password" class="form-label">Mot de passe *</label>
            <PasswordValidator
              ref="passwordValidationRef"
              v-model="registerForm.admin_password"
              :userData="userDataForPasswordValidation"
              :inputId="'admin_password'"
              :placeholder="'Créez un mot de passe sécurisé'"
              :showStrengthIndicator="true"
              :showValidationCriteria="true"
              :validateOnType="true"
              @validation-change="handlePasswordValidationChange"
            />
          </div>

          <div class="form-group">
            <label for="admin_phone" class="form-label">Numéro de téléphone *</label>
            <input
              id="admin_phone"
              v-model="registerForm.admin_phone"
              type="tel"
              placeholder="+243892649177"
              class="form-input"
              :class="{ 'error': validationErrors.admin_phone }"
              required
            />
            <div v-if="validationErrors.admin_phone" class="field-error">
              {{ validationErrors.admin_phone }}
            </div>
          </div>
        </fieldset>

        <!-- Message d'erreur global -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- Actions du formulaire -->
        <div class="form-actions">
          <button
            type="button"
            @click="goBackToEmailVerification"
            class="secondary-button"
          >
            ← Modifier l'email
          </button>
          
          <button
            type="submit"
            class="primary-button"
            :disabled="isLoading || !isPasswordValid"
          >
            <span v-if="!isLoading">Créer l'institution</span>
            <div v-else class="loading-spinner">
              <svg class="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
                <path d="M4 12A8 8 0 0 1 12 4" stroke="currentColor" stroke-width="4"/>
              </svg>
              <span>Création...</span>
            </div>
          </button>
        </div>
      </form>
    </div>

    <!-- Étape 3: Succès -->
    <div v-else-if="currentStep === 3" class="success-container">
      <div class="success-content">
        <div class="success-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <h2>Institution créée avec succès !</h2>
        <p>Votre institution <strong>{{ createdInstitution?.name }}</strong> a été créée et votre compte administrateur est activé.</p>
        <div class="success-details">
          <div class="detail-item">
            <strong>Institution :</strong> {{ createdInstitution?.name }}
          </div>
          <div class="detail-item">
            <strong>Administrateur :</strong> {{ createdAdmin?.first_name }} {{ createdAdmin?.last_name }}
          </div>
          <div class="detail-item">
            <strong>Email :</strong> {{ createdAdmin?.email }}
          </div>
        </div>
        <button 
          @click="proceedToLogin"
          class="primary-button"
        >
          Accéder à votre institution
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import EmailVerification from '../common/EmailVerification.vue'
import PasswordValidator from '../common/PasswordValidator.vue'
import { authService } from '@/services/auth.service.js'

// Props et émissions
const emit = defineEmits(['registration-success', 'switch-to-login'])

// État réactif
const currentStep = ref(1)
const verifiedEmail = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const validationErrors = ref({})
const passwordValidationRef = ref(null)
const passwordValidationResult = ref({ isValid: false, errors: [], strength: 0 })

// Données de succès
const createdInstitution = ref(null)
const createdAdmin = ref(null)

// Formulaire principal
const registerForm = reactive({
  // Données université
  university_name: '',
  university_type: '',
  university_city: '',
  university_country: '',
  university_website: '',
  university_description: '',
  
  // Données administrateur  
  admin_first_name: '',
  admin_last_name: '',
  admin_email: '', // sera rempli automatiquement avec verifiedEmail
  admin_password: '',
  admin_phone: ''
})

// Computed
const isPasswordValid = computed(() => passwordValidationResult.value.isValid)

const userDataForPasswordValidation = computed(() => ({
  first_name: registerForm.admin_first_name,
  last_name: registerForm.admin_last_name,
  email: verifiedEmail.value
}))

// Watchers
watch(verifiedEmail, (newEmail) => {
  registerForm.admin_email = newEmail
})

// Méthodes
const handlePasswordValidationChange = (validation) => {
  passwordValidationResult.value = validation
  // Supprimer les erreurs de mot de passe des erreurs de validation générales
  if (validation.isValid) {
    delete validationErrors.value.admin_password
  }
}

const handleEmailVerified = (emailData) => {
  console.log('✅ Email vérifié pour création d\'université:', emailData)
  verifiedEmail.value = emailData.email || emailData
  registerForm.admin_email = verifiedEmail.value
  currentStep.value = 2
}

const handleBackToLogin = () => {
  emit('switch-to-login')
}

const goBackToEmailVerification = () => {
  currentStep.value = 1
  verifiedEmail.value = ''
  registerForm.admin_email = ''
}

const handleRegister = async () => {
  if (!isPasswordValid.value) {
    errorMessage.value = 'Le mot de passe ne respecte pas les critères de sécurité'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  validationErrors.value = {}

  try {
    // Préparer les données au format attendu par le backend
    const registrationData = {
      email: verifiedEmail.value,
      otp_code: "verified", // Indique que l'email a été vérifié
      
      // Données université
      university_name: registerForm.university_name,
      university_type: registerForm.university_type,
      university_city: registerForm.university_city,
      university_country: registerForm.university_country,
      university_website: registerForm.university_website || '',
      university_description: registerForm.university_description || '',
      
      // Données admin
      admin_first_name: registerForm.admin_first_name,
      admin_last_name: registerForm.admin_last_name,
      admin_email: verifiedEmail.value,
      admin_password: registerForm.admin_password,
      admin_phone: registerForm.admin_phone
    }

    console.log('📤 Envoi des données d\'inscription:', {
      ...registrationData,
      admin_password: '[MASQUÉ]'
    })

    // Utiliser le service d'authentification
    const response = await authService.registerUniversity(registrationData)

    if (response.status === 'success') {
      console.log('✅ Université créée avec succès:', response.data)
      
      // Sauvegarder les informations de succès
      createdInstitution.value = response.data.university
      createdAdmin.value = response.data.admin || response.data.user
      
      // Passer à l'étape de succès
      currentStep.value = 3
      
      console.log('🎉 Redirection vers l\'étape de succès')
    } else {
      throw new Error(response.message || 'Erreur lors de la création de l\'université')
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'inscription:', error)
    
    // Gestion détaillée des erreurs
    if (error.response && error.response.error) {
      const apiError = error.response.error
      
      // Erreurs de validation avec détails par champ
      if (apiError.code === 'VALIDATION_ERROR' && apiError.details) {
        validationErrors.value = apiError.details
        errorMessage.value = apiError.message || 'Veuillez corriger les erreurs ci-dessous'
        
        console.log('🔍 Erreurs de validation détaillées:', validationErrors.value)
      } else {
        // Autres erreurs de l'API
        errorMessage.value = apiError.message || 'Erreur lors de la création de l\'université'
      }
    } else if (error.status === 400 || error.status === 422) {
      // Erreurs de validation HTTP directes
      try {
        const errorData = error.response || error
        if (errorData.details || errorData.errors) {
          validationErrors.value = errorData.details || errorData.errors
          errorMessage.value = errorData.message || 'Données invalides'
        } else {
          errorMessage.value = 'Données invalides. Vérifiez vos informations.'
        }
      } catch (parseError) {
        errorMessage.value = 'Erreur de validation'
      }
    } else if (error.status === 409) {
      errorMessage.value = 'Cette université ou cet email existe déjà.'
    } else {
      // Erreur générique
      errorMessage.value = error.message || 'Erreur lors de la création de l\'université'
    }
    
    // Scroller vers le haut pour voir l'erreur
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  } finally {
    isLoading.value = false
  }
}

const proceedToLogin = () => {
  console.log('🎯 Émission de l\'événement registration-success...')
  console.log('📊 Données à envoyer:', {
    user: createdAdmin.value,
    university: createdInstitution.value
  })
  
  // Émettre l'événement de succès avec toutes les données
  emit('registration-success', {
    user: createdAdmin.value,
    university: createdInstitution.value,
    message: 'Institution créée et compte administrateur activé avec succès !'
  })
  
  console.log('✅ Événement registration-success émis')
}
</script>

<style scoped>
.register-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.email-verification-step {
  margin: 0 auto;
}

.register-form-container {
  background: var(--background-secondary);
  border-radius: var(--radius-xl);
  padding: 2rem;
  box-shadow: var(--shadow-lg);
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.form-header p {
  color: var(--text-secondary);
  font-size: 1rem;
  margin-bottom: 1rem;
}

.verified-email-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  border: 2px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  background: var(--background-primary);
}

.form-section legend {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1.125rem;
  padding: 0 1rem;
  background: var(--background-primary);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-size: 1rem;
  background: var(--background-secondary);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-input::placeholder, .form-textarea::placeholder {
  color: var(--text-muted);
}

.verified-field {
  background: rgba(16, 185, 129, 0.1) !important;
  border-color: #10b981 !important;
  color: var(--text-primary) !important;
}

.help-text {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.error-message {
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  border: 1px solid rgba(239, 68, 68, 0.2);
  margin-bottom: 1rem;
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

.form-input.error, .form-textarea.error {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-top: 2rem;
}

.primary-button, .secondary-button {
  padding: 1rem 2rem;
  border-radius: var(--radius-lg);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 3rem;
  border: none;
  font-size: 1rem;
}

.primary-button {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  color: white;
  flex: 1;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.primary-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}

.primary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.secondary-button {
  background: var(--background-primary);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
}

.secondary-button:hover {
  background: var(--border-light);
  border-color: var(--border-hover);
}

.loading-spinner {
  display: inline-flex;
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

/* Page de succès */
.success-container {
  background: var(--background-secondary);
  border-radius: var(--radius-xl);
  padding: 3rem;
  box-shadow: var(--shadow-lg);
  text-align: center;
}

.success-content {
  max-width: 500px;
  margin: 0 auto;
}

.success-icon {
  color: #10b981;
  margin-bottom: 1.5rem;
}

.success-content h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.success-content p {
  color: var(--text-secondary);
  font-size: 1.125rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.success-details {
  background: var(--background-primary);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-light);
  color: var(--text-secondary);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item strong {
  color: var(--text-primary);
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .register-container {
    padding: 1rem;
  }

  .register-form-container {
    padding: 1.5rem;
  }

  .form-header h2 {
    font-size: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .success-container {
    padding: 2rem;
  }

  .success-content h2 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .register-container {
    padding: 0.5rem;
  }

  .register-form-container {
    padding: 1rem;
  }

  .form-section {
    padding: 1rem;
  }

  .form-header h2 {
    font-size: 1.25rem;
  }

  .verified-email-badge {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
  }

  .success-container {
    padding: 1.5rem;
  }
}
</style>