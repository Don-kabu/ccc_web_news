<template>
  <div class="otp-container">
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

    // Sauvegarder dans localStorage
    const users = JSON.parse(localStorage.getItem('ccc_users') || '[]')
    users.push(verifiedUser)
    localStorage.setItem('ccc_users', JSON.stringify(users))

    const universities = JSON.parse(localStorage.getItem('universities') || '[]')
    universities.push(props.userData.university)
    localStorage.setItem('universities', JSON.stringify(universities))

    // Afficher l'animation de succès
    showSuccessAnimation.value = true

    // Attendre un peu puis émettre le succès
    setTimeout(() => {
      emit('verification-success')
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
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  position: relative;
}

.otp-header {
  text-align: center;
  margin-bottom: 2rem;
}

.success-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
}

.otp-header h2 {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.otp-header p {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.6;
}

.otp-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
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
  transition: all 0.2s ease;
}

.otp-digit:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  transform: scale(1.05);
}

.otp-digit:not(:placeholder-shown) {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

.verify-button {
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
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
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.verify-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}

.verify-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.otp-footer {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.otp-footer p {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.resend-button {
  background: none;
  border: none;
  color: #6366f1;
  cursor: pointer;
  font-weight: 600;
  text-decoration: underline;
  font-size: inherit;
  transition: color 0.2s ease;
}

.resend-button:hover:not(:disabled) {
  color: #4f46e5;
}

.resend-button:disabled {
  color: var(--text-muted);
  cursor: not-allowed;
  text-decoration: none;
}

.back-button {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.875rem;
  transition: color 0.2s ease;
  padding: 0.5rem;
}

.back-button:hover {
  color: var(--text-primary);
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

/* Animation de succès */
.success-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.success-animation {
  text-align: center;
  animation: fadeInUp 0.6s ease-out;
}

.checkmark {
  width: 100px;
  height: 100px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  animation: bounce 0.6s ease-out 0.3s both;
}

.success-animation h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.success-animation p {
  color: var(--text-secondary);
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
}
</style>