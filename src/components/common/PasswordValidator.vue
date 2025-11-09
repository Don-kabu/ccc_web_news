<template>
  <div class="password-validator" :class="{ 'dark': isDark }">
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
import { useTheme } from '../../composables/useTheme.js'

// Composable pour le thème
const { isDark } = useTheme()

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
  
  /* Variables CSS pour le mode clair */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #e2e8f0;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --border-primary: #e2e8f0;
  --border-secondary: #cbd5e1;
  --shadow-light: rgba(15, 23, 42, 0.08);
  --shadow-medium: rgba(15, 23, 42, 0.15);
  
  /* Couleurs des états */
  --success-color: #22c55e;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --error-bg: rgba(239, 68, 68, 0.05);
  --error-border: rgba(239, 68, 68, 0.2);
  --focus-ring: rgba(99, 102, 241, 0.1);
  --focus-border: #6366f1;
  
  /* Couleurs de force du mot de passe */
  --strength-weak: #ef4444;
  --strength-fair: #f59e0b;
  --strength-good: #3b82f6;
  --strength-strong: #22c55e;
}

.password-validator.dark {
  /* Variables CSS pour le mode sombre */
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --border-primary: #334155;
  --border-secondary: #475569;
  --shadow-light: rgba(0, 0, 0, 0.3);
  --shadow-medium: rgba(0, 0, 0, 0.5);
  
  /* Couleurs des états pour le mode sombre */
  --success-color: #16a34a;
  --warning-color: #d97706;
  --error-color: #dc2626;
  --error-bg: rgba(220, 38, 38, 0.1);
  --error-border: rgba(220, 38, 38, 0.3);
  --focus-ring: rgba(99, 102, 241, 0.2);
  --focus-border: #6366f1;
  
  /* Couleurs de force du mot de passe pour le mode sombre */
  --strength-weak: #f87171;
  --strength-fair: #fbbf24;
  --strength-good: #60a5fa;
  --strength-strong: #4ade80;
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input {
  width: 100%;
  padding: 1rem 3rem 1rem 1rem;
  border: 2px solid var(--border-primary);
  border-radius: 0.75rem;
  font-size: 1rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.password-input:focus {
  outline: none;
  border-color: var(--focus-border);
  box-shadow: 0 0 0 3px var(--focus-ring);
}

.password-input::placeholder {
  color: var(--text-muted);
}

.password-input.error {
  border-color: var(--error-color);
  box-shadow: 0 0 0 3px var(--error-bg);
}

.password-toggle-btn {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.3s ease;
}

.password-toggle-btn:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.password-toggle-btn:focus {
  outline: 2px solid var(--focus-border);
  outline-offset: 2px;
}

.password-strength-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.password-strength-bar {
  flex: 1;
  height: 0.25rem;
  background: var(--bg-tertiary);
  border-radius: 0.125rem;
  overflow: hidden;
  transition: background 0.3s ease;
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
  transition: color 0.3s ease;
}

.password-criteria {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  padding: 1rem;
  transition: all 0.3s ease;
}

.criteria-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  transition: color 0.3s ease;
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
  transition: color 0.3s ease;
}

.criterion-item.valid {
  color: var(--success-color);
}

.criterion-item.invalid {
  color: var(--text-secondary);
}

.criterion-icon {
  font-weight: bold;
  font-size: 0.75rem;
  width: 1rem;
  text-align: center;
  transition: color 0.3s ease;
}

.criterion-text {
  transition: color 0.3s ease;
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
  color: var(--error-color);
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
  background: var(--error-bg);
  border: 1px solid var(--error-border);
  border-radius: 0.375rem;
  transition: all 0.3s ease;
}

.error-icon {
  font-size: 0.75rem;
  font-weight: bold;
}

/* Animation pour les critères qui changent d'état */
.criterion-item {
  animation: criterionChange 0.3s ease;
}

@keyframes criterionChange {
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

/* Animation pour la barre de force */
.password-strength-fill {
  animation: strengthGrow 0.5s ease;
}

@keyframes strengthGrow {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

/* Animation pour les erreurs */
.validation-error-item {
  animation: errorSlideIn 0.3s ease;
}

@keyframes errorSlideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
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
  
  .password-input {
    padding: 0.875rem 2.5rem 0.875rem 0.875rem;
    font-size: 0.9rem;
  }
  
  .password-toggle-btn {
    right: 0.75rem;
  }
}

@media (min-width: 769px) {
  .criteria-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Amélioration de l'accessibilité */
@media (prefers-reduced-motion: reduce) {
  .password-validator * {
    animation: none !important;
    transition: none !important;
  }
}

/* Focus visible pour l'accessibilité */
.password-input:focus-visible,
.password-toggle-btn:focus-visible {
  outline: 2px solid var(--focus-border);
  outline-offset: 2px;
}
</style>