<template>
  <div class="otp-test-container" :class="{ 'dark': isDark }">
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
import { useTheme } from '@/composables/useTheme.js'

export default {
  name: 'OtpTest',
  setup() {
    // Composable pour le thème
    const { isDark } = useTheme()
    
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
      generateTestCode,
      isDark
    }
  }
}
</script>

<style scoped>
.otp-test-container {
  max-width: 64rem;
  margin: 0 auto;
  padding: 1.5rem;
  transition: all 0.3s ease;
  
  /* Variables CSS pour le mode clair */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  --bg-code: #f3f4f6;
  --bg-info: #dbeafe;
  --text-primary: #1f2937;
  --text-secondary: #4b5563;
  --text-muted: #6b7280;
  --text-success: #16a34a;
  --text-error: #dc2626;
  --text-info: #1d4ed8;
  --border-primary: #e5e7eb;
  --border-secondary: #d1d5db;
  --border-info: #93c5fd;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  
  /* Couleurs des boutons */
  --btn-primary-bg: #2563eb;
  --btn-primary-hover: #1d4ed8;
  --btn-secondary-bg: #4b5563;
  --btn-secondary-hover: #374151;
  --btn-disabled-opacity: 0.5;
  
  /* Focus ring */
  --focus-ring: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.otp-test-container.dark {
  /* Variables CSS pour le mode sombre */
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --bg-code: #475569;
  --bg-info: #1e3a8a;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --text-success: #22c55e;
  --text-error: #f87171;
  --text-info: #60a5fa;
  --border-primary: #334155;
  --border-secondary: #475569;
  --border-info: #3b82f6;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2);
  
  /* Couleurs des boutons pour le mode sombre */
  --btn-primary-bg: #3b82f6;
  --btn-primary-hover: #2563eb;
  --btn-secondary-bg: #6b7280;
  --btn-secondary-hover: #4b5563;
  --btn-disabled-opacity: 0.4;
  
  /* Focus ring pour le mode sombre */
  --focus-ring: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  transition: color 0.3s ease;
}

h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  transition: color 0.3s ease;
}

h3 {
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.test-form {
  background: var(--bg-primary);
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-primary);
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.test-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-secondary);
  border-radius: 0.375rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.test-input:focus {
  outline: none;
  border-color: var(--btn-primary-bg);
  box-shadow: var(--focus-ring);
}

.test-input::placeholder {
  color: var(--text-muted);
}

.button-group {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.test-button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
}

.test-button:disabled {
  opacity: var(--btn-disabled-opacity);
  cursor: not-allowed;
}

.test-button.primary {
  background: var(--btn-primary-bg);
}

.test-button.primary:hover:not(:disabled) {
  background: var(--btn-primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.test-button.secondary {
  background: var(--btn-secondary-bg);
}

.test-button.secondary:hover:not(:disabled) {
  background: var(--btn-secondary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.otp-section {
  padding-top: 1rem;
  border-top: 1px solid var(--border-primary);
}

.results-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.result-card {
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border-primary);
  transition: all 0.3s ease;
}

.code-display {
  font-size: 1.5rem;
  font-family: 'Courier New', monospace;
  font-weight: 700;
  color: var(--text-info);
  background: var(--bg-primary);
  padding: 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid var(--border-primary);
  text-align: center;
  transition: all 0.3s ease;
}

.text-success {
  color: var(--text-success);
}

.text-error {
  color: var(--text-error);
}

pre {
  background: var(--bg-code);
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  overflow-x: auto;
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  transition: all 0.3s ease;
}

.info-section {
  margin-top: 2rem;
}

.format-card {
  background: var(--bg-info);
  border: 1px solid var(--border-info);
  padding: 1rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.format-note {
  font-size: 0.875rem;
  color: var(--text-info);
  margin-top: 0.5rem;
  line-height: 1.6;
  transition: color 0.3s ease;
}

.process-list {
  text-align: left;
  margin: 1rem 0;
  padding-left: 1.5rem;
  color: var(--text-secondary);
}

.process-list li {
  margin-bottom: 0.5rem;
  line-height: 1.6;
  transition: color 0.3s ease;
}

.process-list code {
  background: var(--bg-code);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  color: var(--text-primary);
  transition: all 0.3s ease;
}

/* Animations et effets */
.test-button:active {
  transform: scale(0.98);
}

.result-card {
  animation: slideInUp 0.3s ease;
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

.code-display {
  animation: codeGlow 2s ease-in-out infinite alternate;
}

@keyframes codeGlow {
  from {
    box-shadow: 0 0 5px rgba(37, 99, 235, 0.3);
  }
  to {
    box-shadow: 0 0 20px rgba(37, 99, 235, 0.6);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .otp-test-container {
    padding: 1rem;
  }
  
  h1 {
    font-size: 1.5rem;
  }
  
  h2 {
    font-size: 1.25rem;
  }
  
  .test-form {
    padding: 1rem;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .test-button {
    width: 100%;
  }
  
  .code-display {
    font-size: 1.25rem;
    padding: 0.5rem;
  }
}

@media (max-width: 480px) {
  .otp-test-container {
    padding: 0.75rem;
  }
  
  h1 {
    font-size: 1.375rem;
    margin-bottom: 1rem;
  }
  
  .test-form {
    padding: 0.75rem;
  }
  
  .result-card {
    padding: 0.75rem;
  }
  
  pre {
    font-size: 0.75rem;
    padding: 0.5rem;
  }
  
  .process-list {
    padding-left: 1rem;
  }
}

/* Amélioration de l'accessibilité */
@media (prefers-reduced-motion: reduce) {
  .otp-test-container *,
  .otp-test-container *::before,
  .otp-test-container *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus visible pour l'accessibilité */
.test-input:focus-visible,
.test-button:focus-visible {
  outline: 2px solid var(--btn-primary-bg);
  outline-offset: 2px;
}

/* États hover améliorés pour les cards */
.result-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.format-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* Scrollbar personnalisée pour pre */
pre::-webkit-scrollbar {
  height: 6px;
}

pre::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: 3px;
}

pre::-webkit-scrollbar-thumb {
  background: var(--border-secondary);
  border-radius: 3px;
}

pre::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
</style>