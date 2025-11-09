<template>
  <div class="otp-container" :class="{ 'dark': isDark }">
    <div class="otp-header">
      <div class="success-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4814 2.02168 11.3363C2.16356 9.19128 2.99721 7.14741 4.39828 5.5028C5.79935 3.85819 7.69279 2.70119 9.79619 2.20411C11.8996 1.70703 14.1003 1.89617 16.07 2.74C16.47 2.88 16.76 3.21 16.76 3.61" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h2>Vérification par email</h2>
      <p>
        Nous avons envoyé un code de vérification à<br>
        <strong>{{ email }}</strong>
      </p>
    </div>

    <form @submit.prevent="handleVerifyOtp" class="otp-form">
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
            @input="handleOtpInput(index, $event)"
            @keydown="handleKeyDown(index, $event)"
            @paste="handlePaste($event)"
          />
        </div>
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </div>

      <div class="otp-actions">
        <button
          type="submit"
          class="verify-button"
          :disabled="isLoading || !isOtpComplete"
        >
          <span v-if="!isLoading">Vérifier</span>
          <div v-else class="loading-spinner">
            <svg class="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
              <path d="M4 12A8 8 0 0 1 12 4" stroke="currentColor" stroke-width="4"/>
            </svg>
            <span>Vérification...</span>
          </div>
        </button>
      </div>

      <div class="otp-footer">
        <p>
          Vous n'avez pas reçu le code ?
          <button 
            type="button" 
            @click="handleResendOtp" 
            class="resend-button"
            :disabled="canResend === false"
          >
            {{ canResend ? 'Renvoyer le code' : `Renvoyer dans ${countdown}s` }}
          </button>
        </p>
        <button type="button" @click="$emit('back-to-register')" class="back-button">
          ← Retour à l'inscription
        </button>
      </div>
    </form>

    <!-- Animation de succès -->
    <div v-if="showSuccessAnimation" class="success-overlay">
      <div class="success-animation">
        <div class="checkmark">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
            <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4814 2.02168 11.3363C2.16356 9.19128 2.99721 7.14741 4.39828 5.5028C5.79935 3.85819 7.69279 2.70119 9.79619 2.20411C11.8996 1.70703 14.1003 1.89617 16.07 2.74C16.47 2.88 16.76 3.21 16.76 3.61" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3>Compte vérifié avec succès !</h3>
        <p>Redirection en cours...</p>
        <button
          type="submit"
          class="verify-button"
          :disabled="isLoading || !isOtpComplete"
        >
          <span>se connecter</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useTheme } from '@/composables/useTheme.js'

// Composables
const { isDark } = useTheme()

const props = defineProps({
  email: {
    type: String,
    required: true
  },
  userData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['verification-success', 'back-to-register'])

// État réactif
const otpDigits = reactive(['', '', '', '', '', ''])
const otpInputs = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const showSuccessAnimation = ref(false)
const countdown = ref(60)
const canResend = ref(false)
let countdownInterval = null

// Computed
const isOtpComplete = computed(() => {
  return otpDigits.every(digit => digit !== '')
})

const otpCode = computed(() => {
  return otpDigits.join('')
})

// Méthodes
const handleOtpInput = (index, event) => {
  const value = event.target.value
  
  // Ne garder que les chiffres
  if (!/^\d*$/.test(value)) {
    otpDigits[index] = ''
    return
  }

  otpDigits[index] = value

  // Passer automatiquement au champ suivant
  if (value && index < 5) {
    const nextInput = otpInputs.value[index + 1]
    if (nextInput) {
      nextInput.focus()
    }
  }
}

const handleKeyDown = (index, event) => {
  // Retour arrière : passer au champ précédent
  if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
    const prevInput = otpInputs.value[index - 1]
    if (prevInput) {
      prevInput.focus()
    }
  }
  
  // Flèches gauche/droite pour naviguer
  if (event.key === 'ArrowLeft' && index > 0) {
    otpInputs.value[index - 1].focus()
  }
  if (event.key === 'ArrowRight' && index < 5) {
    otpInputs.value[index + 1].focus()
  }
}

const handlePaste = (event) => {
  event.preventDefault()
  const pastedData = event.clipboardData.getData('text/plain')
  const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('')
  
  digits.forEach((digit, index) => {
    if (index < 6) {
      otpDigits[index] = digit
    }
  })

  // Focus sur le dernier champ rempli ou le suivant
  const lastFilledIndex = Math.min(digits.length - 1, 5)
  if (otpInputs.value[lastFilledIndex]) {
    otpInputs.value[lastFilledIndex].focus()
  }
}

const handleVerifyOtp = async () => {
  if (!isOtpComplete.value) {
    errorMessage.value = 'Veuillez entrer le code complet'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Vérifier le code OTP
    const expectedOtp = props.userData.user.otp_code
    
    if (otpCode.value !== expectedOtp) {
      throw new Error('Code de vérification incorrect')
    }

    // Marquer l'utilisateur comme vérifié
    const verifiedUser = {
      ...props.userData.user,
      is_verified: true,
      otp_code: null
    }

    // Mettre à jour les données temporaires
    const verifiedData = {
      user: verifiedUser,
      university: props.userData.university
    }

    // Afficher l'animation de succès
    showSuccessAnimation.value = true

    // Attendre un peu puis émettre le succès avec les données vérifiées
    setTimeout(() => {
      emit('verification-success', verifiedData)
    }, 2000)

  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

const handleResendOtp = async () => {
  if (!canResend.value) return

  try {
    // Simuler le renvoi d'OTP
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Générer un nouveau code
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString()
    props.userData.user.otp_code = newOtp
    
    console.log(`Nouveau OTP envoyé à ${props.email}: ${newOtp}`)
    
    // Réinitialiser le countdown
    countdown.value = 60
    canResend.value = false
    startCountdown()
    
    // Effacer les champs OTP
    otpDigits.forEach((_, index) => {
      otpDigits[index] = ''
    })
    
    // Focus sur le premier champ
    if (otpInputs.value[0]) {
      otpInputs.value[0].focus()
    }

  } catch (error) {
    errorMessage.value = 'Erreur lors du renvoi du code'
  }
}

const startCountdown = () => {
  countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      canResend.value = true
      clearInterval(countdownInterval)
    }
  }, 1000)
}

// Lifecycle
onMounted(() => {
  // Focus sur le premier champ
  if (otpInputs.value[0]) {
    otpInputs.value[0].focus()
  }
  
  // Démarrer le countdown pour le renvoi
  startCountdown()
  
  // Simuler un log pour le développement
  console.log(`Code OTP pour ${props.email}: ${props.userData.user.otp_code}`)
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script>

<style scoped>
.otp-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  backdrop-filter: blur(20px);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  position: relative;
  transition: all 0.3s ease;
  
  /* Variables CSS pour le mode clair */
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --background-primary: rgba(255, 255, 255, 0.95);
  --background-secondary: #f9fafb;
  --background-tertiary: #f3f4f6;
  --border-color: #e5e7eb;
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
  --success-bg: linear-gradient(135deg, #10b981 0%, #059669 100%);
  --success-shadow: rgba(16, 185, 129, 0.3);
  --success-hover-shadow: rgba(16, 185, 129, 0.4);
  --success-light: rgba(16, 185, 129, 0.05);
  --success-border: #10b981;
  --btn-primary-bg: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  --btn-primary-shadow: rgba(99, 102, 241, 0.3);
  --btn-primary-hover-shadow: rgba(99, 102, 241, 0.4);
  --input-focus-shadow: rgba(99, 102, 241, 0.1);
  --error-text: #ef4444;
  --link-color: #6366f1;
  --link-hover-color: #4f46e5;
  --overlay-bg: rgba(255, 255, 255, 0.95);
  
  background: var(--background-primary);
}

.otp-container.dark {
  /* Variables CSS pour le mode sombre */
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #64748b;
  --background-primary: rgba(15, 23, 42, 0.95);
  --background-secondary: #1e293b;
  --background-tertiary: #334155;
  --border-color: #334155;
  --border-focus: #6366f1;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.6);
  
  /* Couleurs spécifiques pour le mode sombre */
  --success-bg: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  --success-shadow: rgba(34, 197, 94, 0.4);
  --success-hover-shadow: rgba(34, 197, 94, 0.5);
  --success-light: rgba(34, 197, 94, 0.1);
  --success-border: #22c55e;
  --btn-primary-bg: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  --btn-primary-shadow: rgba(99, 102, 241, 0.4);
  --btn-primary-hover-shadow: rgba(99, 102, 241, 0.5);
  --input-focus-shadow: rgba(99, 102, 241, 0.2);
  --error-text: #f87171;
  --link-color: #818cf8;
  --link-hover-color: #6366f1;
  --overlay-bg: rgba(15, 23, 42, 0.95);
}

.otp-header {
  text-align: center;
  margin-bottom: 2rem;
  animation: slideInDown 0.6s ease;
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

.success-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: var(--success-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 25px var(--success-shadow);
  animation: bounceIn 0.6s ease;
  position: relative;
  overflow: hidden;
}

.success-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  transition: left 0.3s ease;
}

.success-icon:hover::before {
  left: 100%;
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

.otp-header h2 {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
  transition: color 0.3s ease;
}

.otp-header p {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.6;
  transition: color 0.3s ease;
}

.otp-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
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

.otp-input-section {
  text-align: center;
}

.otp-label {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1rem;
  transition: color 0.3s ease;
}

.otp-inputs {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.otp-digit {
  width: 3.5rem;
  height: 3.5rem;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--background-secondary);
  color: var(--text-primary);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.otp-digit::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(99, 102, 241, 0.1);
  transition: left 0.3s ease;
}

.otp-digit:focus::before {
  left: 100%;
}

.otp-digit:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px var(--input-focus-shadow);
  transform: scale(1.05);
}

.otp-digit:not(:placeholder-shown) {
  border-color: var(--success-border);
  background: var(--success-light);
  animation: digitFill 0.3s ease;
}

@keyframes digitFill {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.otp-digit:hover {
  border-color: var(--text-muted);
  transform: translateY(-2px);
}

.verify-button {
  width: 100%;
  padding: 1rem 1.5rem;
  background: var(--btn-primary-bg);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 3.5rem;
  box-shadow: 0 4px 15px var(--btn-primary-shadow);
  position: relative;
  overflow: hidden;
}

.verify-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  transition: left 0.3s ease;
}

.verify-button:hover:not(:disabled)::before {
  left: 100%;
}

.verify-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px var(--btn-primary-hover-shadow);
}

.verify-button:active {
  transform: translateY(0);
}

.verify-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.otp-footer {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: fadeIn 0.6s ease 0.3s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.otp-footer p {
  color: var(--text-secondary);
  font-size: 0.875rem;
  transition: color 0.3s ease;
}

.resend-button {
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

.resend-button:hover:not(:disabled) {
  color: var(--link-hover-color);
  text-decoration: none;
  background: var(--background-tertiary);
}

.resend-button:disabled {
  color: var(--text-muted);
  cursor: not-allowed;
  text-decoration: none;
  background: none;
}

.back-button {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
}

.back-button:hover {
  color: var(--text-primary);
  background: var(--background-tertiary);
}

.error-message {
  color: var(--error-text);
  font-size: 0.875rem;
  margin-top: 0.5rem;
  animation: shake 0.4s ease;
  padding: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Animation de succès */
.success-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--overlay-bg);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  animation: fadeIn 0.3s ease;
}

.success-animation {
  text-align: center;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.checkmark {
  width: 100px;
  height: 100px;
  margin: 0 auto 1.5rem;
  background: var(--success-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  animation: bounce 0.6s ease-out 0.3s both;
  box-shadow: 0 8px 25px var(--success-shadow);
  position: relative;
  overflow: hidden;
}

.checkmark::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  transition: left 0.3s ease;
}

.checkmark:hover::before {
  left: 100%;
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: scale(1);
  }
  40%, 43% {
    transform: scale(1.1);
  }
  70% {
    transform: scale(1.05);
  }
  90% {
    transform: scale(1.02);
  }
}

.success-animation h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.success-animation p {
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

/* Responsive Design */
@media (max-width: 640px) {
  .otp-container {
    margin: 1rem;
    padding: 1.5rem;
  }
  
  .otp-inputs {
    gap: 0.5rem;
  }
  
  .otp-digit {
    width: 3rem;
    height: 3rem;
    font-size: 1.25rem;
  }
  
  .otp-header h2 {
    font-size: 1.5rem;
  }
  
  .success-icon {
    width: 60px;
    height: 60px;
  }
  
  .checkmark {
    width: 80px;
    height: 80px;
  }
}

@media (max-width: 480px) {
  .otp-container {
    padding: 1rem;
  }
  
  .otp-inputs {
    gap: 0.375rem;
  }
  
  .otp-digit {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.125rem;
  }
  
  .otp-header h2 {
    font-size: 1.25rem;
  }
  
  .otp-header p {
    font-size: 0.875rem;
  }
  
  .verify-button {
    padding: 0.875rem 1.25rem;
    font-size: 1rem;
  }
  
  .success-icon {
    width: 50px;
    height: 50px;
  }
  
  .checkmark {
    width: 70px;
    height: 70px;
  }
  
  .success-animation h3 {
    font-size: 1.25rem;
  }
}

/* Amélioration de l'accessibilité */
@media (prefers-reduced-motion: reduce) {
  .otp-container *,
  .otp-container *::before,
  .otp-container *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus visible pour l'accessibilité */
.otp-digit:focus-visible,
.verify-button:focus-visible,
.resend-button:focus-visible,
.back-button:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

/* Animation pour les champs OTP complets */
.otp-inputs:has(.otp-digit:not(:placeholder-shown):nth-child(6)) {
  animation: allDigitsFilled 0.5s ease;
}

@keyframes allDigitsFilled {
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

/* État de chargement pour le bouton */
.verify-button.loading {
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