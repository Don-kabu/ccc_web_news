<template>
  <div class="frontend-otp-demo">
    <div class="demo-container">
      <h1>Démonstration OTP Frontend</h1>
      
      <!-- Étape 1: Email -->
      <div v-if="currentStep === 'email'" class="step-container">
        <div class="step-header">
          <h2>📧 Étape 1 : Saisie de l'email</h2>
          <p>Entrez votre adresse email pour recevoir un code de vérification</p>
        </div>
        
        <div class="form-group">
          <input 
            v-model="email" 
            type="email" 
            placeholder="votre.email@exemple.com"
            class="email-input"
            @keyup.enter="sendOtpCode"
          >
        </div>
        
        <button 
          @click="sendOtpCode" 
          :disabled="!email || sending"
          class="action-button primary"
        >
          {{ sending ? '⏳ Envoi...' : '📤 Envoyer le code OTP' }}
        </button>
      </div>

      <!-- Étape 2: Vérification OTP -->
      <div v-if="currentStep === 'otp'" class="step-container">
        <div class="step-header">
          <h2>🔐 Étape 2 : Vérification du code</h2>
          <p>Code envoyé à <strong>{{ email }}</strong></p>
          <div class="debug-info">
            <small>🐛 Debug: Code généré = <code>{{ generatedCode }}</code></small>
          </div>
        </div>

        <!-- Saisie OTP -->
        <div class="otp-inputs">
          <input
            v-for="(digit, index) in otpDigits"
            :key="index"
            v-model="otpDigits[index]"
            type="text"
            maxlength="1"
            class="otp-digit"
            @input="handleOtpInput(index, $event)"
            @keydown="handleKeyDown(index, $event)"
            :ref="el => otpInputs[index] = el"
          >
        </div>

        <!-- Informations de validation -->
        <div class="validation-info">
          <p v-if="attempts > 0" class="attempts-warning">
            ⚠️ Tentatives : {{ attempts }}/3
          </p>
          <p v-if="errorMessage" class="error-message">
            ❌ {{ errorMessage }}
          </p>
        </div>

        <!-- Actions -->
        <div class="button-group">
          <button @click="goBackToEmail" class="action-button secondary">
            ← Retour
          </button>
          <button 
            @click="verifyCode" 
            :disabled="otpCode.length !== 6 || verifying"
            class="action-button primary"
          >
            {{ verifying ? '⏳ Vérification...' : '✅ Vérifier' }}
          </button>
        </div>
      </div>

      <!-- Étape 3: Formulaire principal -->
      <div v-if="currentStep === 'form'" class="step-container success">
        <div class="step-header">
          <h2>🎉 Étape 3 : Email vérifié !</h2>
          <p>Vous pouvez maintenant compléter votre inscription</p>
        </div>

        <div class="verified-email">
          <span class="verified-badge">✅ Email vérifié</span>
          <span class="email-display">{{ email }}</span>
        </div>

        <!-- Simulation du formulaire principal -->
        <div class="main-form">
          <h3>Formulaire d'inscription</h3>
          <div class="form-group">
            <label>Nom complet</label>
            <input type="text" placeholder="Votre nom complet" class="form-input">
          </div>
          <div class="form-group">
            <label>Nom d'utilisateur</label>
            <input type="text" placeholder="Votre nom d'utilisateur" class="form-input">
          </div>
          <div class="form-group">
            <label>Mot de passe</label>
            <input type="password" placeholder="Votre mot de passe" class="form-input">
          </div>
          
          <button class="action-button success">
            🚀 Finaliser l'inscription
          </button>
        </div>

        <button @click="resetDemo" class="action-button secondary">
          🔄 Recommencer la démonstration
        </button>
      </div>

      <!-- Log des actions -->
      <div v-if="actionLog.length > 0" class="log-section">
        <h3>📋 Journal des actions :</h3>
        <div class="log-entries">
          <div 
            v-for="(log, index) in actionLog" 
            :key="index"
            class="log-entry"
            :class="log.type"
          >
            <span class="log-time">{{ formatTime(log.timestamp) }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { otpService } from '@/services/otp.service.js'

export default {
  name: 'FrontendOtpDemo',
  setup() {
    // État de la démonstration
    const currentStep = ref('email') // 'email' | 'otp' | 'form'
    const email = ref('demo@exemple.com')
    const otpDigits = ref(['', '', '', '', '', ''])
    const otpInputs = ref([])
    const sending = ref(false)
    const verifying = ref(false)
    const generatedCode = ref('')
    const attempts = ref(0)
    const errorMessage = ref('')
    const actionLog = ref([])

    // Code OTP calculé
    const otpCode = computed(() => otpDigits.value.join(''))

    // Ajouter une entrée au log
    const addToLog = (message, type = 'info') => {
      actionLog.value.push({
        timestamp: Date.now(),
        message,
        type
      })
    }

    // Étape 1: Envoyer le code OTP
    const sendOtpCode = async () => {
      if (!email.value) return

      sending.value = true
      errorMessage.value = ''

      try {
        addToLog(`📧 Envoi du code OTP à ${email.value}`, 'info')
        
        // Utiliser le service OTP
        const result = await otpService.sendOtp(email.value)
        
        // Récupérer le code généré pour la démonstration
        const storedOtp = otpService.sentOtps.get(email.value.toLowerCase())
        if (storedOtp) {
          generatedCode.value = storedOtp.otp_code
          addToLog(`🔢 Code généré côté frontend: ${generatedCode.value}`, 'success')
          addToLog(`📤 Données envoyées au backend: {"email": "${email.value}", "otp_code": "${generatedCode.value}"}`, 'info')
          addToLog(`📨 Email envoyé avec le code ${generatedCode.value}`, 'success')
        }

        currentStep.value = 'otp'
        
        // Focus sur le premier champ OTP
        setTimeout(() => {
          if (otpInputs.value[0]) {
            otpInputs.value[0].focus()
          }
        }, 100)

      } catch (error) {
        errorMessage.value = error.message
        addToLog(`❌ Erreur lors de l'envoi: ${error.message}`, 'error')
      } finally {
        sending.value = false
      }
    }

    // Gérer la saisie des chiffres OTP
    const handleOtpInput = (index, event) => {
      const value = event.target.value.replace(/\D/g, '')
      otpDigits.value[index] = value

      if (value && index < 5) {
        otpInputs.value[index + 1]?.focus()
      }

      // Vérification automatique si tous les chiffres sont saisis
      if (otpCode.value.length === 6) {
        setTimeout(verifyCode, 100)
      }
    }

    // Gérer les touches spéciales
    const handleKeyDown = (index, event) => {
      if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
        otpInputs.value[index - 1]?.focus()
      }
    }

    // Étape 2: Vérifier le code (côté frontend uniquement)
    const verifyCode = async () => {
      if (otpCode.value.length !== 6) return

      verifying.value = true
      errorMessage.value = ''
      
      addToLog(`🔐 Vérification du code saisi: ${otpCode.value}`, 'info')
      addToLog(`🧠 Vérification côté frontend uniquement (pas d'appel backend)`, 'info')

      try {
        // Utiliser le service OTP pour vérification frontend
        const result = await otpService.verifyOtp(email.value, otpCode.value)
        
        if (result.status === 'success') {
          addToLog(`✅ Code correct ! Passage au formulaire principal`, 'success')
          currentStep.value = 'form'
          attempts.value = 0
        }

      } catch (error) {
        attempts.value++
        errorMessage.value = error.message
        addToLog(`❌ Code incorrect (tentative ${attempts.value}/3): ${error.message}`, 'error')
        
        // Effacer les champs OTP
        otpDigits.value = ['', '', '', '', '', '']
        
        // Focus sur le premier champ
        setTimeout(() => {
          if (otpInputs.value[0]) {
            otpInputs.value[0].focus()
          }
        }, 100)
      } finally {
        verifying.value = false
      }
    }

    // Retour à l'étape email
    const goBackToEmail = () => {
      currentStep.value = 'email'
      otpDigits.value = ['', '', '', '', '', '']
      errorMessage.value = ''
      attempts.value = 0
      addToLog(`← Retour à la saisie d'email`, 'info')
    }

    // Réinitialiser la démonstration
    const resetDemo = () => {
      currentStep.value = 'email'
      email.value = 'demo@exemple.com'
      otpDigits.value = ['', '', '', '', '', '']
      generatedCode.value = ''
      errorMessage.value = ''
      attempts.value = 0
      actionLog.value = []
      addToLog(`🔄 Démonstration réinitialisée`, 'info')
    }

    // Formatter l'heure pour les logs
    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }

    // Initialisation
    addToLog(`🚀 Démonstration OTP Frontend démarrée`, 'info')

    return {
      currentStep,
      email,
      otpDigits,
      otpInputs,
      sending,
      verifying,
      generatedCode,
      attempts,
      errorMessage,
      actionLog,
      otpCode,
      sendOtpCode,
      handleOtpInput,
      handleKeyDown,
      verifyCode,
      goBackToEmail,
      resetDemo,
      formatTime
    }
  }
}
</script>

<style scoped>
.frontend-otp-demo {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.demo-container {
  max-width: 600px;
  width: 100%;
}

.demo-container h1 {
  text-align: center;
  color: white;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.step-container {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  margin-bottom: 2rem;
}

.step-container.success {
  border-left: 5px solid #10b981;
}

.step-header h2 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1.5rem;
}

.step-header p {
  margin: 0 0 1rem 0;
  color: #6b7280;
}

.debug-info {
  background: #f3f4f6;
  padding: 0.5rem;
  border-radius: 6px;
  margin-top: 0.5rem;
}

.debug-info code {
  background: #e5e7eb;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
  font-weight: bold;
  color: #dc2626;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.email-input,
.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.email-input:focus,
.form-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.otp-inputs {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin: 2rem 0;
}

.otp-digit {
  width: 3rem;
  height: 3rem;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
}

.otp-digit:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.validation-info {
  text-align: center;
  margin: 1rem 0;
}

.attempts-warning {
  color: #f59e0b;
  margin: 0;
}

.error-message {
  color: #ef4444;
  margin: 0.5rem 0 0 0;
}

.verified-email {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.verified-badge {
  background: #10b981;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.email-display {
  font-weight: 500;
  color: #065f46;
}

.main-form {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.main-form h3 {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
}

.button-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.action-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 140px;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-button.primary {
  background: #3b82f6;
  color: white;
}

.action-button.primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.action-button.secondary {
  background: #6b7280;
  color: white;
}

.action-button.secondary:hover:not(:disabled) {
  background: #4b5563;
}

.action-button.success {
  background: #10b981;
  color: white;
}

.action-button.success:hover {
  background: #059669;
  transform: translateY(-1px);
}

.log-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.log-section h3 {
  margin: 0 0 1rem 0;
  color: #1f2937;
}

.log-entries {
  max-height: 200px;
  overflow-y: auto;
}

.log-entry {
  display: flex;
  gap: 1rem;
  padding: 0.5rem;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.log-entry.info {
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
}

.log-entry.success {
  background: #f0fdf4;
  border-left: 3px solid #10b981;
}

.log-entry.error {
  background: #fef2f2;
  border-left: 3px solid #ef4444;
}

.log-time {
  color: #6b7280;
  font-family: monospace;
  min-width: 70px;
}

.log-message {
  flex: 1;
  color: #374151;
}

/* Responsive */
@media (max-width: 768px) {
  .frontend-otp-demo {
    padding: 1rem;
  }
  
  .step-container {
    padding: 1.5rem;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .action-button {
    min-width: auto;
  }
}
</style>