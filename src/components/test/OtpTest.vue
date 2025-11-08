<template>
  <div class="otp-test-container">
    <h1>Test du service OTP</h1>
    
    <!-- Formulaire de test -->
    <div class="test-form">
      <div class="form-group">
        <label for="testEmail">Email de test :</label>
        <input 
          id="testEmail"
          v-model="testEmail" 
          type="email" 
          placeholder="Entrez un email pour le test"
          class="test-input"
        >
      </div>

      <div class="button-group">
        <button 
          @click="testSendOtp" 
          :disabled="sending || !testEmail"
          class="test-button primary"
        >
          {{ sending ? 'Envoi...' : 'Envoyer OTP' }}
        </button>
        
        <button 
          @click="generateTestCode" 
          class="test-button secondary"
        >
          Générer code test
        </button>
      </div>

      <!-- Saisie du code OTP -->
      <div v-if="otpSent" class="otp-section">
        <div class="form-group">
          <label for="otpCode">Code OTP reçu :</label>
          <input 
            id="otpCode"
            v-model="otpCode" 
            type="text" 
            placeholder="Entrez le code à 6 chiffres"
            maxlength="6"
            class="test-input"
          >
        </div>

        <button 
          @click="testVerifyOtp" 
          :disabled="verifying || !otpCode"
          class="test-button primary"
        >
          {{ verifying ? 'Vérification...' : 'Vérifier OTP' }}
        </button>
      </div>
    </div>

    <!-- Affichage des résultats -->
    <div class="results-section">
      <h2>Résultats des tests :</h2>
      
      <!-- Données envoyées -->
      <div v-if="lastSentData" class="result-card">
        <h3>📤 Dernières données envoyées :</h3>
        <pre>{{ JSON.stringify(lastSentData, null, 2) }}</pre>
      </div>

      <!-- Code généré côté frontend -->
      <div v-if="generatedCode" class="result-card">
        <h3>🔢 Code OTP généré côté frontend :</h3>
        <div class="code-display">{{ generatedCode }}</div>
      </div>

      <!-- Messages de résultat -->
      <div v-if="resultMessage" class="result-card">
        <h3 :class="resultType === 'success' ? 'text-success' : 'text-error'">
          {{ resultType === 'success' ? '✅' : '❌' }} Résultat :
        </h3>
        <p>{{ resultMessage }}</p>
      </div>

      <!-- Informations de débogage -->
      <div v-if="debugInfo" class="result-card">
        <h3>🐛 Informations de débogage :</h3>
        <pre>{{ JSON.stringify(debugInfo, null, 2) }}</pre>
      </div>
    </div>

    <!-- Format attendu -->
    <div class="info-section">
      <h2>Processus de vérification :</h2>
      <div class="format-card">
        <h3>� Workflow OTP (Frontend uniquement) :</h3>
        <ol class="process-list">
          <li>📧 <strong>Frontend génère</strong> un code OTP à 6 chiffres</li>
          <li>📤 <strong>Frontend envoie</strong> au backend : <code>{"email": "...", "otp_code": "..."}</code></li>
          <li>📨 <strong>Backend envoie l'email</strong> avec le code fourni par le frontend</li>
          <li>👤 <strong>Utilisateur saisit</strong> le code reçu par email</li>
          <li>✅ <strong>Frontend vérifie localement</strong> si le code correspond</li>
          <li>🚪 <strong>Si correct :</strong> Passage au formulaire principal</li>
          <li>❌ <strong>Si incorrect :</strong> Reste sur la page de vérification</li>
        </ol>
        <p class="format-note">
          ✅ <strong>Pas d'appel backend</strong> pour la vérification<br>
          ✅ <strong>Vérification entièrement côté frontend</strong><br>
          ✅ <strong>Contrôle total</strong> du flux utilisateur<br>
          ✅ <strong>Sécurité maintenue</strong> via génération frontend + envoi email
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { otpService } from '@/services/otp.service.js'

export default {
  name: 'OtpTest',
  setup() {
    // État réactif
    const testEmail = ref('andremukenga9@gmail.com')
    const otpCode = ref('')
    const sending = ref(false)
    const verifying = ref(false)
    const otpSent = ref(false)
    const generatedCode = ref('')
    const lastSentData = ref(null)
    const resultMessage = ref('')
    const resultType = ref('')
    const debugInfo = ref(null)

    // Test d'envoi d'OTP
    const testSendOtp = async () => {
      if (!testEmail.value) {
        resultMessage.value = 'Veuillez entrer un email'
        resultType.value = 'error'
        return
      }

      sending.value = true
      resultMessage.value = ''
      debugInfo.value = null

      try {
        console.log('🧪 Test envoi OTP pour:', testEmail.value)
        
        const result = await otpService.sendOtp(testEmail.value)
        
        // Récupérer le code généré pour affichage (en mode debug)
        const storedOtp = otpService.sentOtps.get(testEmail.value.toLowerCase())
        if (storedOtp) {
          generatedCode.value = storedOtp.otp_code
        }

        // Afficher les données qui ont été envoyées
        lastSentData.value = {
          email: testEmail.value.toLowerCase(),
          otp_code: generatedCode.value
        }

        otpSent.value = true
        resultMessage.value = 'OTP envoyé avec succès ! Code généré côté frontend.'
        resultType.value = 'success'

        debugInfo.value = {
          service_result: result,
          generated_code: generatedCode.value,
          sent_data_format: lastSentData.value
        }

      } catch (error) {
        resultMessage.value = `Erreur lors de l'envoi : ${error.message}`
        resultType.value = 'error'
        
        debugInfo.value = {
          error: error.message,
          error_details: error
        }
      } finally {
        sending.value = false
      }
    }

    // Test de vérification d'OTP
    const testVerifyOtp = async () => {
      if (!otpCode.value) {
        resultMessage.value = 'Veuillez entrer le code OTP'
        resultType.value = 'error'
        return
      }

      verifying.value = true
      resultMessage.value = ''

      try {
        console.log('🧪 Test vérification OTP:', {
          email: testEmail.value,
          code: otpCode.value
        })

        const result = await otpService.verifyOtp(testEmail.value, otpCode.value)
        
        resultMessage.value = 'OTP vérifié avec succès !'
        resultType.value = 'success'

        debugInfo.value = {
          verification_result: result,
          verified_email: testEmail.value,
          entered_code: otpCode.value,
          expected_code: generatedCode.value
        }

      } catch (error) {
        resultMessage.value = `Erreur lors de la vérification : ${error.message}`
        resultType.value = 'error'
        
        debugInfo.value = {
          error: error.message,
          entered_code: otpCode.value,
          expected_code: generatedCode.value
        }
      } finally {
        verifying.value = false
      }
    }

    // Générer un code de test
    const generateTestCode = () => {
      const code = otpService.generateOtpCode()
      generatedCode.value = code
      otpCode.value = code
      
      resultMessage.value = `Code de test généré : ${code}`
      resultType.value = 'success'
    }

    return {
      testEmail,
      otpCode,
      sending,
      verifying,
      otpSent,
      generatedCode,
      lastSentData,
      resultMessage,
      resultType,
      debugInfo,
      testSendOtp,
      testVerifyOtp,
      generateTestCode
    }
  }
}
</script>

<style scoped>
.otp-test-container {
  @apply max-w-4xl mx-auto p-6;
}

h1 {
  @apply text-3xl font-bold text-gray-800 mb-6;
}

h2 {
  @apply text-2xl font-semibold text-gray-700 mb-4;
}

h3 {
  @apply text-lg font-medium text-gray-600 mb-2;
}

.test-form {
  @apply bg-white p-6 rounded-lg shadow border mb-6;
}

.form-group {
  @apply mb-4;
}

.form-group label {
  @apply block text-sm font-medium text-gray-700 mb-2;
}

.test-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.button-group {
  @apply flex gap-3 mb-4;
}

.test-button {
  @apply px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.test-button.primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.test-button.secondary {
  @apply bg-gray-600 text-white hover:bg-gray-700;
}

.otp-section {
  @apply pt-4 border-t border-gray-200;
}

.results-section {
  @apply space-y-4;
}

.result-card {
  @apply bg-gray-50 p-4 rounded-lg border;
}

.code-display {
  @apply text-2xl font-mono font-bold text-blue-600 bg-white p-3 rounded border text-center;
}

.text-success {
  @apply text-green-600;
}

.text-error {
  @apply text-red-600;
}

pre {
  @apply bg-gray-100 p-3 rounded text-sm overflow-x-auto;
}

.info-section {
  @apply mt-8;
}

.format-card {
  @apply bg-blue-50 border border-blue-200 p-4 rounded-lg;
}

.format-note {
  @apply text-sm text-blue-700 mt-2 leading-relaxed;
}

.process-list {
  text-align: left;
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.process-list li {
  margin-bottom: 0.5rem;
  line-height: 1.6;
  color: #374151;
}

.process-list code {
  background-color: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}
</style>