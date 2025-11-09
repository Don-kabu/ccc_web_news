<template>
  <form @submit.prevent="handleSubmit" class="join-university-form" :class="{ 'dark': isDark }">
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

  </form>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import EmailVerification from '../common/EmailVerification.vue'
import PasswordValidator from '../common/PasswordValidator.vue'
import { authService } from '../../services/auth.service'
import { universityService } from '../../services/university.service'
import { useTheme } from '@/composables/useTheme.js'

export default {
  name: 'JoinUniversityForm',
  emits: ['success', 'cancel'],
  components: {
    EmailVerification,
    PasswordValidator
  },
  setup(props, { emit }) {
    // Composables
    const { isDark } = useTheme()
    
    const currentStep = ref('email') // 'email' | 'university' | 'form'
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
    
    const handleCancel = () => {
      console.log('📤 Annulation du processus de rejoindre université')
      emit('cancel')
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
        
        const response = await authService.joinUniversity(joinData)
        
        // Si l'inscription réussit, émettre l'événement de succès
        if (response.status === 'success') {
          const userData = response.data.user || response.data
          console.log('✅ Inscription université réussie, émission événement succès:', userData)
          
          // Émettre l'événement de succès avec les données utilisateur
          emit('success', userData)
        } else {
          throw new Error(response.message || 'Erreur lors de l\'inscription')
        }
        
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
        } else if (error.status === 409) {
          // Gestion spécifique de l'erreur 409 (conflit)
          // Le message de l'erreur 409 est déjà extrait dans le service auth
          errorMessage.value = error.message || 'Un conflit est survenu lors de l\'inscription'
        } else {
          errorMessage.value = error.message || 'Erreur lors de l\'inscription à l\'université'
        }
      } finally {
        isLoading.value = false
      }
    }
    
    return {
      isDark,
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
      handleCancel,
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
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  /* Variables CSS pour le mode clair */
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --background-primary: #ffffff;
  --background-secondary: #f9fafb;
  --background-tertiary: #f8fafc;
  --border-color: #e5e7eb;
  --border-light: #d1d5db;
  --border-focus: #3b82f6;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  /* Couleurs spécifiques */
  --success-bg: #f0fdf4;
  --success-border: #bbf7d0;
  --success-text: #065f46;
  --success-badge-bg: #10b981;
  --error-bg: #fef2f2;
  --error-border: #fecaca;
  --error-text: #dc2626;
  --input-bg: #ffffff;
  --input-border: #d1d5db;
  --input-focus-border: #3b82f6;
  --input-focus-shadow: rgba(59, 130, 246, 0.1);
  --input-readonly-bg: #f9fafb;
  --input-readonly-text: #6b7280;
  --section-bg: #f8fafc;
  --section-border: #e2e8f0;
  --card-bg: #ffffff;
  --card-border: #e5e7eb;
  --card-hover-border: #3b82f6;
  --card-hover-shadow: rgba(59, 130, 246, 0.1);
  --card-selected-bg: #f0fdf4;
  --card-selected-border: #10b981;
  --no-data-bg: #f9fafb;
  --no-data-border: #d1d5db;
  --btn-primary-bg: #3b82f6;
  --btn-primary-hover: #2563eb;
  --btn-secondary-bg: #6b7280;
  --btn-secondary-hover: #4b5563;
  
  background: var(--background-primary);
}

.join-university-form.dark {
  /* Variables CSS pour le mode sombre */
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #64748b;
  --background-primary: #0f172a;
  --background-secondary: #1e293b;
  --background-tertiary: #1e293b;
  --border-color: #334155;
  --border-light: #475569;
  --border-focus: #3b82f6;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
  
  /* Couleurs spécifiques pour le mode sombre */
  --success-bg: rgba(16, 185, 129, 0.1);
  --success-border: rgba(16, 185, 129, 0.3);
  --success-text: #4ade80;
  --success-badge-bg: #22c55e;
  --error-bg: rgba(239, 68, 68, 0.1);
  --error-border: rgba(239, 68, 68, 0.3);
  --error-text: #f87171;
  --input-bg: #1e293b;
  --input-border: #475569;
  --input-focus-border: #3b82f6;
  --input-focus-shadow: rgba(59, 130, 246, 0.2);
  --input-readonly-bg: #334155;
  --input-readonly-text: #94a3b8;
  --section-bg: #1e293b;
  --section-border: #334155;
  --card-bg: #1e293b;
  --card-border: #334155;
  --card-hover-border: #3b82f6;
  --card-hover-shadow: rgba(59, 130, 246, 0.2);
  --card-selected-bg: rgba(16, 185, 129, 0.1);
  --card-selected-border: #22c55e;
  --no-data-bg: #1e293b;
  --no-data-border: #475569;
  --btn-primary-bg: #3b82f6;
  --btn-primary-hover: #2563eb;
  --btn-secondary-bg: #64748b;
  --btn-secondary-hover: #475569;
}

.form-title {
  text-align: center;
  color: var(--text-primary);
  margin-bottom: 2rem;
  font-size: 1.5rem;
  font-weight: 600;
  transition: color 0.3s ease;
  animation: slideInDown 0.5s ease;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-description {
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
  transition: color 0.3s ease;
  animation: fadeIn 0.6s ease 0.2s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.email-step,
.university-step,
.form-step {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: slideInUp 0.5s ease;
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

.step-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.verified-email-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--success-bg);
  border: 1px solid var(--success-border);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  margin-top: 1rem;
  transition: all 0.3s ease;
  animation: bounceIn 0.6s ease;
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.verified-email-badge .badge {
  background: var(--success-badge-bg);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.verified-email-badge .email {
  color: var(--success-text);
  font-weight: 500;
  transition: color 0.3s ease;
}

/* Universités */
.universities-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  animation: staggerIn 0.6s ease;
}

@keyframes staggerIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.university-card {
  border: 2px solid var(--card-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: var(--card-bg);
  position: relative;
  overflow: hidden;
}

.university-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(59, 130, 246, 0.05);
  transition: left 0.3s ease;
}

.university-card:hover::before {
  left: 100%;
}

.university-card:hover {
  border-color: var(--card-hover-border);
  box-shadow: 0 2px 8px var(--card-hover-shadow);
  transform: translateY(-2px);
}

.university-card.selected {
  border-color: var(--card-selected-border);
  background: var(--card-selected-bg);
  animation: cardSelect 0.3s ease;
}

@keyframes cardSelect {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

.university-info {
  flex: 1;
}

.university-name {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
  font-size: 1.2rem;
  font-weight: 600;
  transition: color 0.3s ease;
}

.university-details {
  margin: 0 0 0.75rem 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.university-description {
  margin: 0 0 0.75rem 0;
  color: var(--text-secondary);
  line-height: 1.5;
  transition: color 0.3s ease;
}

.website-link {
  color: var(--border-focus);
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  padding: 0.25rem;
  border-radius: var(--radius-sm);
}

.website-link:hover {
  text-decoration: underline;
  background: var(--background-secondary);
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
  background: var(--success-badge-bg);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  animation: checkmarkPop 0.3s ease;
}

@keyframes checkmarkPop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.no-universities {
  text-align: center;
  color: var(--text-secondary);
  padding: 2rem;
  background: var(--no-data-bg);
  border-radius: var(--radius-md);
  border: 1px dashed var(--no-data-border);
  transition: all 0.3s ease;
  animation: fadeIn 0.5s ease;
}

.selected-university-info h3 {
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
  font-size: 1.3rem;
  transition: color 0.3s ease;
}

.selected-university-info p {
  margin: 0;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

/* Sections de formulaire */
.form-section {
  background: var(--section-bg);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--section-border);
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  animation: slideInUp 0.4s ease;
}

.form-section:hover {
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.section-title {
  margin: 0 0 1.5rem 0;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 2px solid var(--border-focus);
  padding-bottom: 0.5rem;
  transition: color 0.3s ease;
  position: relative;
}

.section-title::before {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--success-badge-bg);
  transition: width 0.3s ease;
}

.form-section:hover .section-title::before {
  width: 100%;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  animation: inputFadeIn 0.3s ease;
}

@keyframes inputFadeIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.input-label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.input-field {
  padding: 0.75rem;
  border: 1px solid var(--input-border);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  background: var(--input-bg);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.input-field:focus {
  outline: none;
  border-color: var(--input-focus-border);
  box-shadow: 0 0 0 3px var(--input-focus-shadow);
  transform: translateY(-1px);
}

.input-field:hover {
  border-color: var(--text-muted);
}

select.input-field {
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

.input-readonly {
  background: var(--input-readonly-bg);
  color: var(--input-readonly-text);
  cursor: not-allowed;
  border-style: dashed;
}

.input-error {
  border-color: var(--error-text);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.error-text {
  color: var(--error-text);
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  animation: slideInDown 0.2s ease;
}

.error-text::before {
  content: '⚠';
  font-size: 0.9rem;
}

.field-help {
  color: var(--text-muted);
  font-size: 0.8rem;
  margin-top: 0.25rem;
  transition: color 0.3s ease;
}

.field-status {
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  animation: statusFadeIn 0.3s ease;
}

@keyframes statusFadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.field-status.checking {
  color: var(--border-focus);
}

.field-status.checking::before {
  content: '⏳';
}

.field-status.success {
  color: var(--success-badge-bg);
}

.field-status.success::before {
  content: '✅';
}

.field-status.error {
  color: var(--error-text);
}

.field-status.error::before {
  content: '❌';
}

.error-message {
  padding: 0.75rem;
  background: var(--error-bg);
  border: 1px solid var(--error-border);
  border-radius: var(--radius-sm);
  color: var(--error-text);
  font-size: 0.875rem;
  text-align: center;
  white-space: pre-line;
  animation: slideInDown 0.3s ease;
  position: relative;
}

.error-message::before {
  content: '⚠';
  margin-right: 0.5rem;
  font-size: 1rem;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: center;
  animation: slideInUp 0.4s ease 0.2s both;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  transition: left 0.3s ease;
}

.btn:hover:not(:disabled)::before {
  left: 100%;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-primary {
  background: var(--btn-primary-bg);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--btn-primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background: var(--btn-secondary-bg);
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: var(--btn-secondary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Responsive Design */
@media (max-width: 768px) {
  .join-university-form {
    padding: 1.5rem;
  }
  
  .university-card {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }
  
  .selection-indicator {
    align-self: flex-end;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .btn {
    min-width: auto;
  }
  
  .form-section {
    padding: 1rem;
  }
  
  .input-group {
    margin-bottom: 0.75rem;
  }
}

@media (max-width: 480px) {
  .join-university-form {
    padding: 1rem;
  }
  
  .form-title {
    font-size: 1.25rem;
  }
  
  .university-card {
    padding: 0.75rem;
  }
  
  .university-name {
    font-size: 1.1rem;
  }
  
  .input-field {
    padding: 0.625rem;
    font-size: 0.9rem;
  }
  
  .btn {
    padding: 0.625rem 1.25rem;
    font-size: 0.9rem;
  }
  
  .verified-email-badge {
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }
}

/* Amélioration de l'accessibilité */
@media (prefers-reduced-motion: reduce) {
  .join-university-form *,
  .join-university-form *::before,
  .join-university-form *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus visible pour l'accessibilité */
.university-card:focus-visible,
.input-field:focus-visible,
.btn:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

/* Animation de progression */
.join-university-form::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: var(--progress-width, 33%);
  height: 3px;
  background: var(--success-badge-bg);
  transition: width 0.5s ease;
  border-radius: 0 0 var(--radius-sm) var(--radius-sm);
}

.join-university-form:has([data-step="university"])::before {
  --progress-width: 66%;
}

.join-university-form:has([data-step="form"])::before {
  --progress-width: 100%;
}
</style>