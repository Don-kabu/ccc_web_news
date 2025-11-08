<template>
  <form @submit.prevent="handleSubmit" class="join-university-form">
    <h2 class="form-title">
      <template v-if="currentStep === 'email'">Rejoindre une université</template>
      <template v-else-if="currentStep === 'university'">Sélectionner l'université</template>
      <template v-else-if="currentStep === 'form'">Informations personnelles</template>
    </h2>

    <!-- Étape 1: Vérification Email -->
    <div v-if="currentStep === 'email'" class="email-step">
      <p class="step-description">
        Entrez votre adresse email pour commencer le processus d'inscription à une université.
      </p>
      <EmailVerification 
        @email-verified="onEmailVerified"
        @error="onVerificationError"
        :error-message="errorMessage"
      />
    </div>

    <!-- Étape 2: Sélection de l'université -->
    <div v-if="currentStep === 'university'" class="university-step">
      <div class="step-header">
        <p class="step-description">
          Sélectionnez l'université que vous souhaitez rejoindre.
        </p>
        <div class="verified-email-badge">
          <span class="badge">✓ Email vérifié</span>
          <span class="email">{{ verifiedEmail }}</span>
        </div>
      </div>

      <!-- Liste des universités -->
      <div class="universities-list">
        <div 
          v-for="university in universities" 
          :key="university.id"
          class="university-card"
          :class="{ 'selected': selectedUniversity?.id === university.id }"
          @click="selectUniversity(university)"
        >
          <div class="university-info">
            <h3 class="university-name">{{ university.name }}</h3>
            <p class="university-details">
              <span class="type">{{ university.type }}</span> • 
              <span class="location">{{ university.city }}, {{ university.country }}</span>
            </p>
            <p v-if="university.description" class="university-description">
              {{ university.description }}
            </p>
            <div v-if="university.website" class="university-website">
              <a :href="university.website" target="_blank" class="website-link">
                🌐 Site web
              </a>
            </div>
          </div>
          <div class="selection-indicator">
            <div v-if="selectedUniversity?.id === university.id" class="selected-icon">✓</div>
          </div>
        </div>
      </div>

      <!-- Message si aucune université -->
      <div v-if="universities.length === 0" class="no-universities">
        <p>Aucune université disponible pour le moment.</p>
        <p>Contactez l'administrateur pour plus d'informations.</p>
      </div>

      <!-- Boutons de navigation -->
      <div class="button-group">
        <button 
          type="button" 
          @click="goBackToEmail"
          class="btn btn-secondary"
        >
          ← Retour
        </button>
        <button 
          type="button"
          @click="proceedToForm"
          :disabled="!selectedUniversity"
          class="btn btn-primary"
        >
          Continuer →
        </button>
      </div>
    </div>

    <!-- Étape 3: Formulaire d'inscription -->
    <div v-if="currentStep === 'form'" class="form-step">
      <div class="step-header">
        <div class="selected-university-info">
          <h3>{{ selectedUniversity?.name }}</h3>
          <p>{{ selectedUniversity?.city }}, {{ selectedUniversity?.country }}</p>
        </div>
        <div class="verified-email-badge">
          <span class="badge">✓ Email vérifié</span>
          <span class="email">{{ verifiedEmail }}</span>
        </div>
      </div>

      <!-- Informations personnelles -->
      <div class="form-section">
        <h3 class="section-title">Vos informations personnelles</h3>
        
        <!-- Email (lecture seule, déjà vérifié) -->
        <div class="input-group">
          <label for="user_email" class="input-label">Adresse email *</label>
          <input 
            id="user_email"
            :value="verifiedEmail"
            type="email" 
            readonly
            class="input-field input-readonly"
          />
          <small class="field-help">Cet email a été vérifié</small>
        </div>

        <!-- Prénom -->
        <div class="input-group">
          <label for="first_name" class="input-label">Prénom *</label>
          <input 
            id="first_name"
            v-model="formData.first_name" 
            type="text" 
            required 
            class="input-field"
            :class="{ 'input-error': validationErrors.first_name }"
            placeholder="Votre prénom"
          />
          <div v-if="validationErrors.first_name" class="error-text">
            {{ validationErrors.first_name }}
          </div>
        </div>

        <!-- Nom -->
        <div class="input-group">
          <label for="last_name" class="input-label">Nom *</label>
          <input 
            id="last_name"
            v-model="formData.last_name" 
            type="text" 
            required 
            class="input-field"
            :class="{ 'input-error': validationErrors.last_name }"
            placeholder="Votre nom de famille"
          />
          <div v-if="validationErrors.last_name" class="error-text">
            {{ validationErrors.last_name }}
          </div>
        </div>

        <!-- Nom d'utilisateur -->
        <div class="input-group">
          <label for="username" class="input-label">Nom d'utilisateur *</label>
          <input 
            id="username"
            v-model="formData.username" 
            type="text" 
            required 
            class="input-field"
            :class="{ 'input-error': validationErrors.username }"
            placeholder="Choisissez un nom d'utilisateur unique"
            @blur="checkUsernameAvailability"
          />
          <div v-if="usernameCheck.checking" class="field-status checking">
            Vérification de la disponibilité...
          </div>
          <div v-if="usernameCheck.available === false" class="field-status error">
            Ce nom d'utilisateur n'est pas disponible
          </div>
          <div v-if="usernameCheck.available === true" class="field-status success">
            Nom d'utilisateur disponible
          </div>
          <div v-if="validationErrors.username" class="error-text">
            {{ validationErrors.username }}
          </div>
        </div>

        <!-- Téléphone -->
        <div class="input-group">
          <label for="phone" class="input-label">Téléphone</label>
          <input 
            id="phone"
            v-model="formData.phone" 
            type="tel" 
            class="input-field"
            :class="{ 'input-error': validationErrors.phone }"
            placeholder="Ex: +33612345678"
          />
          <div v-if="validationErrors.phone" class="error-text">
            {{ validationErrors.phone }}
          </div>
          <small class="field-help">Format international recommandé</small>
        </div>

        <!-- Statut dans l'université -->
        <div class="input-group">
          <label for="user_role" class="input-label">Vous êtes *</label>
          <select 
            id="user_role"
            v-model="formData.user_role" 
            required 
            class="input-field"
            :class="{ 'input-error': validationErrors.user_role }"
          >
            <option value="STUDENT">Sélectionnez votre statut</option>
            <option value="STUDENT">Étudiant</option>
            <option value="STUDENT">Enseignant</option>
            <option value="STUDENT">Personnel administratif</option>
            <option value="STUDENT">Chercheur</option>
            <option value="STUDENT">Invité</option>
          </select>
          <div v-if="validationErrors.user_role" class="error-text">
            {{ validationErrors.user_role }}
          </div>
        </div>

        <!-- Numéro étudiant (si étudiant) -->
        <div v-if="formData.user_role === 'student'" class="input-group">
          <label for="student_id" class="input-label">Numéro étudiant</label>
          <input 
            id="student_id"
            v-model="formData.student_id" 
            type="text" 
            class="input-field"
            :class="{ 'input-error': validationErrors.student_id }"
            placeholder="Votre numéro étudiant (si disponible)"
          />
          <div v-if="validationErrors.student_id" class="error-text">
            {{ validationErrors.student_id }}
          </div>
        </div>

        <!-- Département/Faculté -->
        <div class="input-group">
          <label for="department" class="input-label">Département/Faculté</label>
          <input 
            id="department"
            v-model="formData.department" 
            type="text" 
            class="input-field"
            :class="{ 'input-error': validationErrors.department }"
            placeholder="Ex: Informatique, Médecine, Sciences..."
          />
          <div v-if="validationErrors.department" class="error-text">
            {{ validationErrors.department }}
          </div>
        </div>

        <!-- Mot de passe avec validation -->
        <div class="input-group">
          <label for="password" class="input-label">Mot de passe *</label>
          <PasswordValidator 
            v-model="formData.password"
            :show-strength="true"
            :required="true"
            :user-attributes="{
              username: formData.username,
              email: verifiedEmail,
              first_name: formData.first_name,
              last_name: formData.last_name
            }"
            @validation-change="onPasswordValidation"
          />
        </div>

        <!-- Confirmation mot de passe -->
        <div class="input-group">
          <label for="password_confirmation" class="input-label">Confirmer le mot de passe *</label>
          <input 
            id="password_confirmation"
            v-model="formData.password_confirmation" 
            type="password" 
            required 
            class="input-field"
            :class="{ 'input-error': validationErrors.password_confirmation || passwordMismatch }"
            placeholder="Confirmez votre mot de passe"
          />
          <div v-if="validationErrors.password_confirmation" class="error-text">
            {{ validationErrors.password_confirmation }}
          </div>
          <div v-if="passwordMismatch" class="error-text">
            Les mots de passe ne correspondent pas
          </div>
        </div>
      </div>

      <!-- Erreur générale -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- Boutons d'action -->
      <div class="button-group">
        <button 
          type="button" 
          @click="goBackToUniversitySelection"
          class="btn btn-secondary"
        >
          ← Retour
        </button>
        <button 
          type="submit" 
          :disabled="isLoading || !isFormValid"
          class="btn btn-primary"
        >
          <span v-if="isLoading">Inscription en cours...</span>
          <span v-else">🎓 Rejoindre l'université</span>
        </button>
      </div>
    </div>

    <!-- Étape 4: Succès -->
    <div v-if="currentStep === 'success'" class="success-step">
      <div class="success-message">
        <div class="success-icon">✓</div>
        <h3>Inscription réussie !</h3>
        <p>Votre demande d'inscription à <strong>{{ selectedUniversity?.name }}</strong> a été envoyée avec succès.</p>
        <p><strong>{{ formData.first_name }} {{ formData.last_name }}</strong> ({{ formData.user_role }})</p>
        <p class="redirect-info">
          Votre compte sera activé après validation par l'administrateur de l'université.
        </p>
        <p class="redirect-info">Redirection automatique vers la page de connexion dans 3 secondes...</p>
        <button 
          type="button" 
          @click="() => window.location.href = '/login'"
          class="btn btn-primary"
        >
          Se connecter maintenant
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import EmailVerification from '../common/EmailVerification.vue'
import PasswordValidator from '../common/PasswordValidator.vue'
import { authService } from '../../services/auth.service'
import { universityService } from '../../services/university.service'

export default {
  name: 'JoinUniversityForm',
  components: {
    EmailVerification,
    PasswordValidator
  },
  setup() {
    const currentStep = ref('email') // 'email' | 'university' | 'form' | 'success'
    const isLoading = ref(false)
    const errorMessage = ref('')
    const verifiedEmail = ref('')
    const selectedUniversity = ref(null)
    const universities = ref([])
    
    const formData = reactive({
      // Données personnelles
      first_name: '',
      last_name: '',
      username: '',
      phone: '',
      user_role: '',
      student_id: '',
      department: '',
      password: '',
      password_confirmation: ''
    })
    
    const validationErrors = ref({})
    const passwordValidation = ref({ isValid: false })
    
    // Vérification du nom d'utilisateur
    const usernameCheck = ref({
      checking: false,
      available: null
    })
    
    // Computed properties
    const passwordMismatch = computed(() => {
      return formData.password && formData.password_confirmation && 
             formData.password !== formData.password_confirmation
    })
    
    const isFormValid = computed(() => {
      return formData.first_name && 
             formData.last_name &&
             formData.username &&
             formData.user_role &&
             formData.password && 
             formData.password_confirmation &&
             passwordValidation.value.isValid &&
             !passwordMismatch.value &&
             usernameCheck.value.available !== false &&
             verifiedEmail.value &&
             selectedUniversity.value
    })
    
    // Méthodes de navigation
    const onEmailVerified = (email) => {
      verifiedEmail.value = email
      currentStep.value = 'university'
      errorMessage.value = ''
      loadUniversities()
    }
    
    const onVerificationError = (error) => {
      errorMessage.value = error
    }
    
    const goBackToEmail = () => {
      currentStep.value = 'email'
      errorMessage.value = ''
      selectedUniversity.value = null
    }
    
    const goBackToUniversitySelection = () => {
      currentStep.value = 'university'
      errorMessage.value = ''
    }
    
    const selectUniversity = (university) => {
      selectedUniversity.value = university
    }
    
    const proceedToForm = () => {
      if (selectedUniversity.value) {
        currentStep.value = 'form'
      }
    }
    
    // Charger les universités disponibles
    const loadUniversities = async () => {
      try {
        console.log('🔄 Chargement des universités depuis l\'API...')
        
        const response = await universityService.getUniversities()
        
        console.log('📡 Réponse API universités:', response)
        
        if (response && (response.success === true || response.status === 'success')) {
          // Essayer différentes structures de réponse possibles
          let universitiesList = []
          
          if (response.data) {
            if (Array.isArray(response.data)) {
              universitiesList = response.data
            } else if (response.data.universities && Array.isArray(response.data.universities)) {
              universitiesList = response.data.universities
            } else if (response.data.results && Array.isArray(response.data.results)) {
              universitiesList = response.data.results
            } else {
              console.warn('⚠️ Structure de données inattendue dans response.data:', response.data)
            }
          } else if (Array.isArray(response)) {
            universitiesList = response
          }
          
          console.log('🏫 Universités récupérées depuis l\'API:', {
            count: universitiesList.length,
            universities: universitiesList.slice(0, 3) // Afficher seulement les 3 premières pour debug
          })
          
          universities.value = universitiesList
          
          if (universitiesList.length === 0) {
            console.warn('⚠️ Aucune université trouvée dans la réponse API')
            errorMessage.value = 'Aucune institution disponible pour le moment'
          } else {
            errorMessage.value = '' // Effacer les erreurs précédentes
          }
        } else {
          console.warn('⚠️ Réponse API non valide:', response)
          throw new Error('Réponse API invalide')
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement des universités:', error)
        
        // Afficher l'erreur à l'utilisateur
        if (error.message && error.message.includes('API')) {
          errorMessage.value = 'Impossible de se connecter à l\'API pour récupérer les universités'
        } else if (error.status === 401) {
          errorMessage.value = 'Session expirée. Veuillez vous reconnecter.'
        } else if (error.status === 500) {
          errorMessage.value = 'Erreur serveur. Veuillez réessayer plus tard.'
        } else {
          errorMessage.value = 'Impossible de charger la liste des universités. Vérifiez votre connexion.'
        }
        
        // Liste vide en cas d'erreur
        universities.value = []
      }
    }
    
    // Vérification du nom d'utilisateur
    const checkUsernameAvailability = async () => {
      if (!formData.username.trim() || formData.username.length < 3) {
        usernameCheck.value.available = null
        return
      }

      usernameCheck.value.checking = true
      usernameCheck.value.available = null

      try {
        // Simuler vérification API - remplacer par vraie API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock logic - remplacer par vraie vérification
        const unavailableUsernames = ['admin', 'test', 'user', 'root', 'administrator']
        const isAvailable = !unavailableUsernames.includes(formData.username.toLowerCase())
        
        usernameCheck.value.available = isAvailable
      } catch (error) {
        console.error('Erreur lors de la vérification du nom d\'utilisateur:', error)
        usernameCheck.value.available = null
      } finally {
        usernameCheck.value.checking = false
      }
    }
    
    // Validation du mot de passe
    const onPasswordValidation = (validation) => {
      passwordValidation.value = validation
    }
    
    // Soumission du formulaire
    const handleSubmit = async () => {
      if (!isFormValid.value) return
      
      isLoading.value = true
      errorMessage.value = ''
      
      try {
        // Préparer les données d'inscription
        const joinData = {
          university_id: selectedUniversity.value.id,
          email: verifiedEmail.value,
          first_name: formData.first_name,
          last_name: formData.last_name,
        //   username: formData.username,     //comming soon
          phone: formData.phone,
          role: formData.user_role,
        //   student_id: formData.student_id,
        //   department: formData.department,
          password: formData.password
        }

        console.log('📝 Données d\'inscription université:', joinData)
        
        await authService.joinUniversity(joinData)
        currentStep.value = 'success'
        
        // Redirection automatique après 5 secondes
        setTimeout(() => {
          window.location.href = '/login'
        }, 5000)
        
      } catch (error) {
        console.error('Erreur lors de l\'inscription:', error)
        
        // Gestion des erreurs de validation côté serveur
        if (error.status === 400 && error.response?.data?.errors) {
          const errors = error.response.data.errors
          validationErrors.value = errors
          
          // Construire un message d'erreur générale
          const errorMessages = []
          Object.keys(errors).forEach(field => {
            if (Array.isArray(errors[field])) {
              errorMessages.push(`${field}: ${errors[field].join(', ')}`)
            } else {
              errorMessages.push(`${field}: ${errors[field]}`)
            }
          })
          errorMessage.value = errorMessages.join('\n')
        } else {
          errorMessage.value = error.message || 'Erreur lors de l\'inscription à l\'université'
        }
      } finally {
        isLoading.value = false
      }
    }
    
    return {
      currentStep,
      isLoading,
      errorMessage,
      verifiedEmail,
      selectedUniversity,
      universities,
      formData,
      validationErrors,
      passwordValidation,
      usernameCheck,
      passwordMismatch,
      isFormValid,
      onEmailVerified,
      onVerificationError,
      goBackToEmail,
      goBackToUniversitySelection,
      selectUniversity,
      proceedToForm,
      checkUsernameAvailability,
      onPasswordValidation,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.join-university-form {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-title {
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.step-description {
  text-align: center;
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.email-step,
.university-step,
.form-step {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.step-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.verified-email-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  margin-top: 1rem;
}

.verified-email-badge .badge {
  background: #10b981;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.verified-email-badge .email {
  color: #065f46;
  font-weight: 500;
}

/* Universités */
.universities-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.university-card {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.university-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.university-card.selected {
  border-color: #10b981;
  background-color: #f0fdf4;
}

.university-info {
  flex: 1;
}

.university-name {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1.2rem;
  font-weight: 600;
}

.university-details {
  margin: 0 0 0.75rem 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.university-description {
  margin: 0 0 0.75rem 0;
  color: #4b5563;
  line-height: 1.5;
}

.website-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.9rem;
}

.website-link:hover {
  text-decoration: underline;
}

.selection-indicator {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.selected-icon {
  width: 2rem;
  height: 2rem;
  background: #10b981;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.no-universities {
  text-align: center;
  color: #6b7280;
  padding: 2rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #d1d5db;
}

.selected-university-info h3 {
  margin: 0 0 0.25rem 0;
  color: #1f2937;
  font-size: 1.3rem;
}

.selected-university-info p {
  margin: 0;
  color: #6b7280;
}

/* Sections de formulaire */
.form-section {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 1rem;
}

.section-title {
  margin: 0 0 1.5rem 0;
  color: #2d3748;
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 2px solid #3b82f6;
  padding-bottom: 0.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.input-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.input-field {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

select.input-field {
  cursor: pointer;
}

.input-readonly {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.input-error {
  border-color: #ef4444;
}

.error-text {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.field-help {
  color: #6b7280;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.field-status {
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.field-status.checking {
  color: #3b82f6;
}

.field-status.success {
  color: #10b981;
}

.field-status.error {
  color: #ef4444;
}

.error-message {
  padding: 0.75rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 0.875rem;
  text-align: center;
  white-space: pre-line;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;
  text-align: center;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #4b5563;
}

/* Page de succès */
.success-step {
  text-align: center;
  padding: 2rem 1rem;
}

.success-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.success-icon {
  width: 60px;
  height: 60px;
  background-color: #10b981;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
}

.success-message h3 {
  color: #10b981;
  margin: 0;
  font-size: 1.25rem;
}

.success-message p {
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.redirect-info {
  color: #8b5cf6 !important;
  font-style: italic;
  font-size: 0.875rem;
  margin-top: 1rem !important;
}

/* Responsive */
@media (max-width: 768px) {
  .join-university-form {
    padding: 1.5rem;
  }
  
  .university-card {
    padding: 1rem;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .btn {
    min-width: auto;
  }
}
</style>