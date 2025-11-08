<template>
  <div class="email-verification-container">
    <!-- Étape 1: Saisie de l'email -->
    <div v-if="!otpSent && !isVerified" class="email-input-step">
      <div class="step-header">
        <div class="step-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2"/>
            <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <h3>Vérification de votre email</h3>
        <p>{{ verificationMessage }}</p>
      </div>

      <div class="email-form">
        <div class="form-group">
          <label for="email-verification" class="form-label">Adresse email *</label>
          <div class="input-wrapper">
            <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2"/>
              <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2"/>
            </svg>
            <input
              id="email-verification"
              v-model="email"
              type="email"
              :placeholder="emailPlaceholder"
              class="form-input"
              :class="{ 'error': emailError }"
              :disabled="isSending"
              @keyup.enter="sendOtpCode"
              @blur="validateEmail"
              required
            />
          </div>
          <div v-if="emailError" class="field-error">
            {{ emailError }}
          </div>
        </div>

        <div class="form-actions">
          <button
            type="button"
            @click="sendOtpCode"
            :disabled="!isValidEmail || isSending"
            class="primary-button"
          >
            <span v-if="isSending" class="button-spinner"></span>
            {{ isSending ? 'Envoi en cours...' : 'Envoyer le code de vérification' }}
          </button>
        </div>

        <div v-if="sendError" class="error-message">
          {{ sendError }}
        </div>
      </div>
    </div>

    <!-- Étape 2: Vérification du code OTP -->
    <div v-if="otpSent && !isVerified" class="otp-verification-step">
      <div class="step-header">
        <div class="step-icon success">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4814 2.02168 11.3363C2.16356 9.19128 2.99721 7.14741 4.39828 5.5028C5.79935 3.85819 7.69279 2.70119 9.79619 2.20411C11.8996 1.70703 14.1003 1.89617 16.07 2.74C16.47 2.88 16.76 3.21 16.76 3.61" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3>Code envoyé !</h3>
        <p>
          Nous avons envoyé un code de vérification à<br>
          <strong>{{ email }}</strong>
        </p>
        <div v-if="remainingTime > 0" class="countdown">
          Code valide pendant encore : <strong>{{ formatTime(remainingTime) }}</strong>
        </div>
      </div>

      <div class="otp-form">
        <div class="otp-input-section">
          <label class="otp-label">Entrez le code de vérification</label>
          <div class="otp-inputs">
            <input
              v-for="(digit, index) in otpDigits"
              :key="index"
              :ref="el => otpInputs[index] = el"
              v-model="otpDigits[index]"
              type="text"
              maxlength="1"
              class="otp-digit"
              :class="{ 'error': otpError }"
              :disabled="isVerifying"
              @input="handleOtpInput(index, $event)"
              @keydown="handleKeyDown(index, $event)"
              @paste="handlePaste($event)"
            />
          </div>
          <div v-if="otpError" class="field-error">
            {{ otpError }}
          </div>
        </div>

        <div class="form-actions">
          <button
            type="button"
            @click="verifyOtpCode"
            :disabled="otpCode.length !== 6 || isVerifying"
            class="primary-button"
          >
            <span v-if="isVerifying" class="button-spinner"></span>
            {{ isVerifying ? 'Vérification...' : 'Vérifier le code' }}
          </button>

          <button
            type="button"
            @click="goBackToEmail"
            class="secondary-button"
            :disabled="isVerifying"
          >
            Modifier l'email
          </button>
        </div>

        <div class="resend-section">
          <button
            v-if="remainingTime <= 0"
            type="button"
            @click="sendOtpCode"
            class="link-button"
            :disabled="isSending"
          >
            {{ isSending ? 'Renvoi...' : 'Renvoyer le code' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Étape 3: Email vérifié -->
    <div v-if="isVerified" class="verification-success">
      <div class="step-header">
        <div class="step-icon verified">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4814 2.02168 11.3363C2.16356 9.19128 2.99721 7.14741 4.39828 5.5028C5.79935 3.85819 7.69279 2.70119 9.79619 2.20411C11.8996 1.70703 14.1003 1.89617 16.07 2.74C16.47 2.88 16.76 3.21 16.76 3.61" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3>Email vérifié !</h3>
        <p>
          <strong>{{ email }}</strong> a été vérifié avec succès.<br>
          Vous pouvez maintenant continuer votre inscription.
        </p>
      </div>

      <div class="form-actions">
        <button
          type="button"
          @click="$emit('email-verified', email)"
          class="primary-button"
        >
          Continuer l'inscription
        </button>
        <button
          type="button"
          @click="changeEmail"
          class="link-button"
        >
          Utiliser un autre email
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { otpService } from '../../services/otp.service.js'

// Props
const props = defineProps({
  verificationType: {
    type: String,
    default: 'registration'
  },
  emailPlaceholder: {
    type: String,
    default: 'votre.email@example.com'
  },
  verificationMessage: {
    type: String,
    default: 'Pour commencer votre inscription, nous devons vérifier votre adresse email.'
  }
})

// Emits
const emit = defineEmits(['email-verified'])

// État réactif
const email = ref('')
const otpDigits = ref(['', '', '', '', '', ''])
const otpInputs = ref([])
const otpSent = ref(false)
const isVerified = ref(false)
const isSending = ref(false)
const isVerifying = ref(false)
const emailError = ref('')
const otpError = ref('')
const sendError = ref('')
const remainingTime = ref(0)
const countdownInterval = ref(null)

// Computed
const isValidEmail = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.value.trim())
})

const otpCode = computed(() => {
  return otpDigits.value.join('')
})

// Méthodes
const validateEmail = () => {
  emailError.value = ''
  
  if (!email.value.trim()) {
    emailError.value = 'L\'adresse email est requise'
    return false
  }
  
  if (!isValidEmail.value) {
    emailError.value = 'Veuillez entrer une adresse email valide'
    return false
  }
  
  return true
}

const sendOtpCode = async () => {
  if (!validateEmail()) return
  
  isSending.value = true
  sendError.value = ''
  
  try {
    const response = await otpService.sendOtp(email.value)
    
    if (response.status === 'success') {
      otpSent.value = true
      startCountdown(300) // 5 minutes
      clearOtpInputs()
      
      // Focus sur le premier champ OTP
      setTimeout(() => {
        if (otpInputs.value[0]) {
          otpInputs.value[0].focus()
        }
      }, 100)
    }
  } catch (error) {
    sendError.value = error.message || 'Erreur lors de l\'envoi du code'
  } finally {
    isSending.value = false
  }
}

const verifyOtpCode = async () => {
  if (otpCode.value.length !== 6) return
  
  isVerifying.value = true
  otpError.value = ''
  
  try {
    const response = await otpService.verifyOtp(email.value, otpCode.value)
    
    if (response.status === 'success') {
      isVerified.value = true
      stopCountdown()
      emit('email-verified', email.value)
    }
  } catch (error) {
    otpError.value = error.message || 'Code de vérification incorrect'
    clearOtpInputs()
  } finally {
    isVerifying.value = false
  }
}

const handleOtpInput = (index, event) => {
  const value = event.target.value.replace(/\D/g, '')
  otpDigits.value[index] = value
  
  if (value && index < 5) {
    // Passer au champ suivant
    otpInputs.value[index + 1]?.focus()
  }
  
  // Vérifier automatiquement si tous les chiffres sont saisis
  if (otpCode.value.length === 6) {
    verifyOtpCode()
  }
}

const handleKeyDown = (index, event) => {
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    // Revenir au champ précédent
    otpInputs.value[index - 1]?.focus()
  }
}

const handlePaste = (event) => {
  event.preventDefault()
  const paste = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
  
  for (let i = 0; i < 6; i++) {
    otpDigits.value[i] = paste[i] || ''
  }
  
  if (paste.length === 6) {
    verifyOtpCode()
  }
}

const clearOtpInputs = () => {
  otpDigits.value = ['', '', '', '', '', '']
  otpError.value = ''
}

const goBackToEmail = () => {
  otpSent.value = false
  stopCountdown()
  clearOtpInputs()
  sendError.value = ''
}

const changeEmail = () => {
  email.value = ''
  otpSent.value = false
  isVerified.value = false
  stopCountdown()
  clearOtpInputs()
  emailError.value = ''
  sendError.value = ''
}

const startCountdown = (seconds) => {
  remainingTime.value = seconds
  countdownInterval.value = setInterval(() => {
    remainingTime.value--
    if (remainingTime.value <= 0) {
      stopCountdown()
    }
  }, 1000)
}

const stopCountdown = () => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
    countdownInterval.value = null
  }
}

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

// Cleanup
onUnmounted(() => {
  stopCountdown()
})

// Exposer des méthodes pour usage externe
defineExpose({
  changeEmail,
  isEmailVerified: computed(() => isVerified.value),
  verifiedEmail: computed(() => isVerified.value ? email.value : null)
})
</script>

<style scoped>
.email-verification-container {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.step-header {
  text-align: center;
  margin-bottom: 2rem;
}

.step-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--background-secondary, #f8fafc);
  border: 2px solid var(--border-color, #e2e8f0);
  color: var(--text-muted, #64748b);
  margin-bottom: 1rem;
}

.step-icon.success {
  background: rgba(34, 197, 94, 0.1);
  border-color: #22c55e;
  color: #22c55e;
}

.step-icon.verified {
  background: rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
  color: #3b82f6;
}

.step-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary, #1a202c);
  margin: 0 0 0.5rem 0;
}

.step-header p {
  color: var(--text-secondary, #64748b);
  line-height: 1.5;
  margin: 0;
}

.countdown {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--text-muted, #64748b);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 600;
  color: var(--text-primary, #1a202c);
  margin-bottom: 0.5rem;
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
  color: var(--text-muted, #64748b);
  z-index: 1;
}

.form-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid var(--border-color, #e2e8f0);
  border-radius: 0.75rem;
  font-size: 1rem;
  background: var(--background-secondary, #f8fafc);
  color: var(--text-primary, #1a202c);
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

.otp-input-section {
  text-align: center;
  margin-bottom: 2rem;
}

.otp-label {
  display: block;
  font-weight: 600;
  color: var(--text-primary, #1a202c);
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.otp-inputs {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.otp-digit {
  width: 3rem;
  height: 3rem;
  text-align: center;
  border: 2px solid var(--border-color, #e2e8f0);
  border-radius: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  background: var(--background-secondary, #f8fafc);
  color: var(--text-primary, #1a202c);
  transition: all 0.2s ease;
}

.otp-digit:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.otp-digit.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.primary-button {
  width: 100%;
  max-width: 300px;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.primary-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.secondary-button {
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: var(--text-secondary, #64748b);
  border: 2px solid var(--border-color, #e2e8f0);
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.secondary-button:hover:not(:disabled) {
  border-color: var(--text-secondary, #64748b);
  background: var(--background-secondary, #f8fafc);
}

.link-button {
  background: none;
  border: none;
  color: #6366f1;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0.5rem;
  transition: color 0.2s ease;
}

.link-button:hover:not(:disabled) {
  color: #4f46e5;
}

.link-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.field-error {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.field-error::before {
  content: '⚠';
  font-weight: bold;
}

.error-message {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  text-align: center;
  margin-top: 1rem;
}

.resend-section {
  margin-top: 1.5rem;
  text-align: center;
}

@media (max-width: 640px) {
  .otp-inputs {
    gap: 0.5rem;
  }
  
  .otp-digit {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1rem;
  }
  
  .form-actions {
    gap: 0.75rem;
  }
}
</style>