<template>
  <div class="password-validator">
    <!-- Champ de saisie du mot de passe -->
    <div class="password-input-wrapper">
      <input
        :id="inputId"
        :type="showPassword ? 'text' : 'password'"
        :value="password"
        @input="handlePasswordInput"
        :placeholder="placeholder"
        :class="['password-input', { 'error': hasErrors }]"
        autocomplete="new-password"
      />
      <button
        type="button"
        @click="togglePasswordVisibility"
        class="password-toggle-btn"
        :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
      >
        <svg v-if="showPassword" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
          <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
        </svg>
        <svg v-else width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"/>
          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
        </svg>
      </button>
    </div>

    <!-- Barre de force du mot de passe -->
    <div v-if="showStrengthIndicator && password" class="password-strength-container">
      <div class="password-strength-bar">
        <div 
          class="password-strength-fill"
          :style="{ 
            width: validation.strength + '%',
            backgroundColor: strengthLevel.color
          }"
        ></div>
      </div>
      <span class="password-strength-label" :style="{ color: strengthLevel.color }">
        {{ strengthLevel.label }} ({{ validation.strength }}/100)
      </span>
    </div>

    <!-- Liste des critères de validation -->
    <div v-if="showValidationCriteria && password" class="password-criteria">
      <h4 class="criteria-title">Critères de sécurité :</h4>
      <ul class="criteria-list">
        <li 
          v-for="(criterion, key) in criteriaDisplay" 
          :key="key"
          :class="['criterion-item', { 'valid': validation.checks[key], 'invalid': !validation.checks[key] }]"
        >
          <span class="criterion-icon">
            {{ validation.checks[key] ? '✓' : '✗' }}
          </span>
          <span class="criterion-text">{{ criterion }}</span>
        </li>
      </ul>
    </div>

    <!-- Messages d'erreur de validation -->
    <div v-if="validationErrors.length > 0" class="validation-errors">
      <div 
        v-for="error in validationErrors" 
        :key="error"
        class="validation-error-item"
      >
        <span class="error-icon">⚠</span>
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { passwordValidator } from '../../services/password-validator.service.js'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  userData: {
    type: Object,
    default: () => ({})
  },
  placeholder: {
    type: String,
    default: 'Entrez votre mot de passe'
  },
  inputId: {
    type: String,
    default: 'password'
  },
  showStrengthIndicator: {
    type: Boolean,
    default: true
  },
  showValidationCriteria: {
    type: Boolean,
    default: true
  },
  validateOnType: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'validation-change'])

// État local
const password = ref(props.modelValue)
const showPassword = ref(false)
const validationErrors = ref([])

// Validation en temps réel
const validation = computed(() => {
  if (!password.value) {
    return { checks: {}, strength: 0, isValid: false }
  }
  return passwordValidator.validateRealTime(password.value, props.userData)
})

// Niveau de force
const strengthLevel = computed(() => {
  return passwordValidator.getPasswordStrengthLevel(validation.value.strength)
})

// Affichage des critères
const criteriaDisplay = computed(() => ({
  minLength: 'Au moins 8 caractères',
  hasUppercase: 'Une lettre majuscule',
  hasLowercase: 'Une lettre minuscule', 
  hasNumbers: 'Un chiffre',
  notNumericOnly: 'Pas uniquement des chiffres',
  notCommon: 'Pas un mot de passe courant',
  notSimilarToUser: 'Différent de vos informations personnelles'
}))

// Erreurs calculées
const hasErrors = computed(() => {
  return validationErrors.value.length > 0 || !validation.value.isValid
})

// Gestion de la saisie
const handlePasswordInput = (event) => {
  password.value = event.target.value
  emit('update:modelValue', password.value)
  
  if (props.validateOnType) {
    validatePassword()
  }
}

// Validation complète
const validatePassword = async () => {
  await nextTick()
  
  const result = passwordValidator.validate(password.value, props.userData)
  validationErrors.value = result.errors
  
  emit('validation-change', {
    isValid: result.isValid,
    errors: result.errors,
    strength: validation.value.strength,
    checks: validation.value.checks
  })
}

// Toggle visibilité
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// Watch des changements
watch(() => props.modelValue, (newValue) => {
  password.value = newValue
  if (props.validateOnType) {
    validatePassword()
  }
})

watch(() => props.userData, () => {
  if (password.value && props.validateOnType) {
    validatePassword()
  }
}, { deep: true })

// Méthodes exposées
defineExpose({
  validate: validatePassword,
  isValid: computed(() => validation.value.isValid && validationErrors.value.length === 0),
  errors: computed(() => validationErrors.value),
  strength: computed(() => validation.value.strength)
})
</script>

<style scoped>
.password-validator {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input {
  width: 100%;
  padding: 1rem 3rem 1rem 1rem;
  border: 2px solid var(--border-color, #e2e8f0);
  border-radius: 0.75rem;
  font-size: 1rem;
  background: var(--background-secondary, #f8fafc);
  color: var(--text-primary, #1a202c);
  transition: all 0.2s ease;
}

.password-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.password-input.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.password-toggle-btn {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: var(--text-muted, #64748b);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: color 0.2s ease;
}

.password-toggle-btn:hover {
  color: var(--text-primary, #1a202c);
}

.password-strength-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.password-strength-bar {
  flex: 1;
  height: 0.25rem;
  background: var(--background-tertiary, #e2e8f0);
  border-radius: 0.125rem;
  overflow: hidden;
}

.password-strength-fill {
  height: 100%;
  border-radius: 0.125rem;
  transition: all 0.3s ease;
}

.password-strength-label {
  font-size: 0.875rem;
  font-weight: 600;
  min-width: max-content;
}

.password-criteria {
  background: var(--background-secondary, #f8fafc);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 0.5rem;
  padding: 1rem;
}

.criteria-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary, #1a202c);
  margin: 0 0 0.5rem 0;
}

.criteria-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.375rem;
}

.criterion-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.criterion-item.valid {
  color: #22c55e;
}

.criterion-item.invalid {
  color: #64748b;
}

.criterion-icon {
  font-weight: bold;
  font-size: 0.75rem;
  width: 1rem;
  text-align: center;
}

.validation-errors {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.validation-error-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ef4444;
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 0.375rem;
}

.error-icon {
  font-size: 0.75rem;
  font-weight: bold;
}

@media (max-width: 768px) {
  .password-strength-container {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .password-strength-label {
    text-align: center;
  }
  
  .criteria-list {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 769px) {
  .criteria-list {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>