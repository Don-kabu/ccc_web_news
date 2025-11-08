<template>
  <div class="sse-test-component">
    <div class="test-header">
      <h2>🧪 Test Connexion SSE avec Headers</h2>
      <p>Test des connexions Server-Sent Events avec token en header</p>
    </div>

    <div class="test-controls">
      <button @click="testSSEHeaders" :disabled="testing" class="test-btn">
        {{ testing ? '🔄 Test en cours...' : '🚀 Tester SSE Headers' }}
      </button>
      
      <button @click="testSSEParam" :disabled="testing" class="test-btn secondary">
        {{ testing ? '🔄 Test en cours...' : '📡 Tester SSE Paramètres' }}
      </button>
      
      <button @click="clearLogs" class="test-btn danger">
        🗑️ Effacer logs
      </button>
    </div>

    <div class="test-status">
      <div class="status-item">
        <strong>Token disponible:</strong> 
        <span :class="hasToken ? 'success' : 'error'">{{ hasToken ? '✅ Oui' : '❌ Non' }}</span>
      </div>
      <div class="status-item">
        <strong>Méthode testée:</strong> {{ currentMethod }}
      </div>
      <div class="status-item">
        <strong>Status:</strong> 
        <span :class="statusClass">{{ status }}</span>
      </div>
    </div>

    <div class="test-logs">
      <h3>📋 Logs de connexion</h3>
      <div class="logs-container">
        <div 
          v-for="(log, index) in logs" 
          :key="index" 
          :class="['log-entry', log.type]"
        >
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const testing = ref(false)
const logs = ref([])
const currentMethod = ref('Aucune')
const status = ref('En attente')
const hasToken = ref(false)

const statusClass = computed(() => {
  switch(status.value) {
    case 'Connecté': return 'success'
    case 'Erreur': return 'error'
    case 'En attente': return 'pending'
    default: return 'info'
  }
})

onMounted(() => {
  hasToken.value = !!localStorage.getItem('ccc_access_token')
})

const addLog = (message, type = 'info') => {
  logs.value.push({
    time: new Date().toLocaleTimeString(),
    message,
    type
  })
  console.log(`[SSE Test] ${message}`)
}

const clearLogs = () => {
  logs.value = []
}

// Test SSE avec headers (fetch + ReadableStream)
const testSSEHeaders = async () => {
  testing.value = true
  currentMethod.value = 'Fetch + Headers'
  status.value = 'Test en cours'
  addLog('🚀 Début test SSE avec headers')

  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://univers-news-ccc-kabu.onrender.com/api/v1'
    const token = localStorage.getItem('ccc_access_token')
    
    if (!token) {
      throw new Error('Pas de token disponible')
    }

    addLog('🔗 URL: ' + baseUrl + '/notifications/stream/')
    addLog('🔑 Token: ' + token.substring(0, 20) + '...')

    const response = await fetch(`${baseUrl}/notifications/stream/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache'
      }
    })

    addLog(`📡 Response status: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    if (!response.body) {
      throw new Error('ReadableStream non supporté par le navigateur')
    }

    status.value = 'Connecté'
    addLog('✅ Connexion SSE établie avec headers', 'success')

    // Lire le stream pendant 10 secondes pour test
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    const timeout = setTimeout(() => {
      addLog('⏰ Timeout test atteint (10s)', 'info')
      reader.cancel()
      status.value = 'Test terminé'
      testing.value = false
    }, 10000)

    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          addLog('🔚 Stream fermé par le serveur')
          break
        }

        buffer += decoder.decode(value, { stream: true })
        addLog(`📨 Données reçues: ${buffer.length} caractères`, 'success')
        
        // Traiter les événements complets
        let eventEnd = buffer.indexOf('\n\n')
        while (eventEnd !== -1) {
          const event = buffer.substring(0, eventEnd)
          buffer = buffer.substring(eventEnd + 2)
          
          if (event.trim()) {
            addLog(`📋 Événement SSE: ${event}`, 'success')
          }
          
          eventEnd = buffer.indexOf('\n\n')
        }
      }
    } catch (streamError) {
      addLog(`❌ Erreur lecture stream: ${streamError.message}`, 'error')
    } finally {
      clearTimeout(timeout)
    }

  } catch (error) {
    status.value = 'Erreur'
    addLog(`❌ Erreur: ${error.message}`, 'error')
  } finally {
    testing.value = false
  }
}

// Test SSE avec paramètres (EventSource classique)
const testSSEParam = async () => {
  testing.value = true
  currentMethod.value = 'EventSource + Paramètres'
  status.value = 'Test en cours'
  addLog('🚀 Début test SSE avec paramètres')

  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://univers-news-ccc-kabu.onrender.com/api/v1'
    const token = localStorage.getItem('ccc_access_token')
    
    if (!token) {
      throw new Error('Pas de token disponible')
    }

    const sseUrl = `${baseUrl}/notifications/stream/?token=${encodeURIComponent(token)}`
    addLog('🔗 URL: ' + sseUrl.replace(token, token.substring(0, 10) + '...'))

    const eventSource = new EventSource(sseUrl)

    const timeout = setTimeout(() => {
      addLog('⏰ Timeout test atteint (10s)', 'info')
      eventSource.close()
      status.value = 'Test terminé'
      testing.value = false
    }, 10000)

    eventSource.onopen = () => {
      status.value = 'Connecté'
      addLog('✅ Connexion EventSource établie', 'success')
    }

    eventSource.onmessage = (event) => {
      addLog(`📨 Message reçu: ${event.data}`, 'success')
    }

    eventSource.onerror = (error) => {
      status.value = 'Erreur'
      addLog('❌ Erreur EventSource', 'error')
      clearTimeout(timeout)
      eventSource.close()
      testing.value = false
    }

  } catch (error) {
    status.value = 'Erreur'
    addLog(`❌ Erreur: ${error.message}`, 'error')
    testing.value = false
  }
}
</script>

<style scoped>
.sse-test-component {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.test-header {
  text-align: center;
  margin-bottom: 2rem;
}

.test-header h2 {
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.test-header p {
  color: #6b7280;
  margin: 0;
}

.test-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.test-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: #3b82f6;
  color: white;
}

.test-btn:hover:not(:disabled) {
  background: #2563eb;
}

.test-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.test-btn.secondary {
  background: #6b7280;
}

.test-btn.secondary:hover:not(:disabled) {
  background: #4b5563;
}

.test-btn.danger {
  background: #ef4444;
}

.test-btn.danger:hover:not(:disabled) {
  background: #dc2626;
}

.test-status {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.status-item {
  margin-bottom: 0.5rem;
}

.status-item:last-child {
  margin-bottom: 0;
}

.success {
  color: #059669;
  font-weight: 500;
}

.error {
  color: #dc2626;
  font-weight: 500;
}

.pending {
  color: #f59e0b;
  font-weight: 500;
}

.info {
  color: #3b82f6;
  font-weight: 500;
}

.test-logs h3 {
  color: #1f2937;
  margin-bottom: 1rem;
}

.logs-container {
  background: #1f2937;
  border-radius: 8px;
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.875rem;
}

.log-entry {
  display: flex;
  margin-bottom: 0.25rem;
  color: #d1d5db;
}

.log-entry:last-child {
  margin-bottom: 0;
}

.log-time {
  color: #9ca3af;
  margin-right: 0.75rem;
  min-width: 80px;
}

.log-entry.success .log-message {
  color: #34d399;
}

.log-entry.error .log-message {
  color: #f87171;
}

.log-entry.info .log-message {
  color: #60a5fa;
}

@media (max-width: 640px) {
  .sse-test-component {
    margin: 1rem;
    padding: 1rem;
  }

  .test-controls {
    flex-direction: column;
    align-items: center;
  }

  .test-btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>