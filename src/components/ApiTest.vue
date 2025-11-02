// Créer un petit composant de test pour vérifier l'API
<template>
  <div class="api-test" style="padding: 20px; background: #f0f0f0; margin: 20px; border-radius: 8px;">
    <h3>🧪 Test API Connection</h3>
    
    <div style="margin: 10px 0;">
      <button @click="testApiConnection" :disabled="isLoading" class="test-button">
        {{ isLoading ? 'Test en cours...' : 'Tester la connexion API' }}
      </button>
    </div>
    
    <div v-if="testResult" style="margin: 10px 0;">
      <div :class="['test-result', testResult.success ? 'success' : 'error']">
        <strong>{{ testResult.success ? '✅ Succès' : '❌ Erreur' }}:</strong>
        {{ testResult.message }}
      </div>
      
      <div v-if="testResult.details" style="margin-top: 10px;">
        <details>
          <summary>Détails de la réponse</summary>
          <pre style="background: #fff; padding: 10px; border-radius: 4px; overflow: auto;">{{ JSON.stringify(testResult.details, null, 2) }}</pre>
        </details>
      </div>
    </div>
    
    <div style="margin: 20px 0;">
      <h4>Endpoints disponibles :</h4>
      <ul style="list-style: none; padding: 0;">
        <li v-for="endpoint in endpoints" :key="endpoint.name" style="margin: 5px 0;">
          <span :class="['endpoint-status', endpoint.tested ? (endpoint.working ? 'working' : 'failed') : 'untested']">
            {{ endpoint.tested ? (endpoint.working ? '✅' : '❌') : '⏳' }}
          </span>
          <strong>{{ endpoint.name }}</strong>: {{ endpoint.url }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { apiServiceManager } from '@/services'

const isLoading = ref(false)
const testResult = ref(null)

const endpoints = ref([
  { name: 'Health Check', url: '/health', tested: false, working: false },
  { name: 'Auth Login', url: '/auth/login', tested: false, working: false },
  { name: 'Universities', url: '/universities', tested: false, working: false },
  { name: 'News', url: '/news', tested: false, working: false }
])

const testApiConnection = async () => {
  isLoading.value = true
  testResult.value = null
  
  try {
    // Tester la santé de l'API
    const healthStatus = await apiServiceManager.checkApiHealth()
    
    if (healthStatus) {
      testResult.value = {
        success: true,
        message: 'API disponible et opérationnelle',
        details: {
          baseUrl: 'http://127.0.0.1:8000/api',
          timestamp: new Date().toISOString(),
          status: 'OK'
        }
      }
      
      // Marquer le health check comme réussi
      const healthEndpoint = endpoints.value.find(e => e.name === 'Health Check')
      if (healthEndpoint) {
        healthEndpoint.tested = true
        healthEndpoint.working = true
      }
    } else {
      throw new Error('Health check failed')
    }
  } catch (error) {
    console.error('Test API failed:', error)
    
    testResult.value = {
      success: false,
      message: `Impossible de se connecter à l'API: ${error.message}`,
      details: {
        error: error.message,
        baseUrl: 'http://127.0.0.1:8000/api',
        timestamp: new Date().toISOString(),
        suggestions: [
          'Vérifiez que le serveur API est démarré',
          'Vérifiez l\'URL de l\'API dans la configuration',
          'Vérifiez les paramètres CORS du serveur',
          'Ouvrez http://127.0.0.1:8000/api/docs/ dans votre navigateur'
        ]
      }
    }
    
    // Marquer tous les endpoints comme échoués
    endpoints.value.forEach(endpoint => {
      endpoint.tested = true
      endpoint.working = false
    })
  } finally {
    isLoading.value = false
  }
}

// Test automatique au montage
import { onMounted } from 'vue'
onMounted(() => {
  // Tester automatiquement après 1 seconde
  setTimeout(testApiConnection, 1000)
})
</script>

<style scoped>
.test-button {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.test-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.test-result {
  padding: 10px;
  border-radius: 5px;
  font-size: 14px;
}

.test-result.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.test-result.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.endpoint-status {
  display: inline-block;
  width: 20px;
  text-align: center;
}

.endpoint-status.working {
  color: #28a745;
}

.endpoint-status.failed {
  color: #dc3545;
}

.endpoint-status.untested {
  color: #6c757d;
}
</style>