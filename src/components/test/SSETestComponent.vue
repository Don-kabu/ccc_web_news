<template>
  <div class="sse-test-component" :class="{ 'dark': isDark }">
    <div class="test-header">
      <h2>🧪 Test Connexion SSE avec Headers</h2>
      <p>Test des connexions Server-Sent Events avec token en header</p>
    </div>

    <div class="test-controls">
      <button @click="testSSEHeaders" :disabled="testing" class="test-btn">
        {{ testing ? '🔄 Test en cours...' : '🚀 Tester SSE Headers' }}
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
import { useTheme } from '@/composables/useTheme.js'
import { buildApiUrl, API_ENDPOINTS } from '@/services/api.config.js'

// Composable pour le thème
const { isDark } = useTheme()

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

// Test SSE avec headers uniquement (plus de test avec paramètres)
const testSSEHeaders = async () => {
  testing.value = true
  currentMethod.value = 'Fetch + Headers'
  status.value = 'Test en cours'
  addLog('🚀 Début test SSE avec headers (méthode recommandée)')

  try {
    const sseUrl = buildApiUrl(API_ENDPOINTS.NOTIFICATIONS.STREAM)
    const token = localStorage.getItem('ccc_access_token')
    
    if (!token) {
      throw new Error('Pas de token disponible')
    }

    addLog('🔗 URL: ' + sseUrl)
    addLog('🔑 Token: ' + token.substring(0, 20) + '...')
    addLog('📡 Utilisation des headers Authorization au lieu des paramètres URL')

    const response = await fetch(sseUrl, {
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


</script>

<style scoped>
.sse-test-component {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  
  /* Variables CSS pour le mode clair */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-console: #1f2937;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --text-console: #d1d5db;
  --text-console-time: #9ca3af;
  --border-primary: #e5e7eb;
  --shadow-primary: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-secondary: 0 8px 25px rgba(0, 0, 0, 0.15);
  
  /* Couleurs des boutons */
  --btn-primary-bg: #3b82f6;
  --btn-primary-hover: #2563eb;
  --btn-secondary-bg: #6b7280;
  --btn-secondary-hover: #4b5563;
  --btn-danger-bg: #ef4444;
  --btn-danger-hover: #dc2626;
  --btn-disabled-opacity: 0.6;
  
  /* Couleurs d'état */
  --color-success: #059669;
  --color-error: #dc2626;
  --color-pending: #f59e0b;
  --color-info: #3b82f6;
  --color-log-success: #34d399;
  --color-log-error: #f87171;
  --color-log-info: #60a5fa;
  
  background: var(--bg-primary);
  box-shadow: var(--shadow-primary);
}

.sse-test-component.dark {
  /* Variables CSS pour le mode sombre */
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-console: #0a0f1a;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --text-console: #e2e8f0;
  --text-console-time: #94a3b8;
  --border-primary: #334155;
  --shadow-primary: 0 4px 6px rgba(0, 0, 0, 0.3);
  --shadow-secondary: 0 8px 25px rgba(0, 0, 0, 0.4);
  
  /* Couleurs des boutons pour le mode sombre */
  --btn-primary-bg: #3b82f6;
  --btn-primary-hover: #2563eb;
  --btn-secondary-bg: #64748b;
  --btn-secondary-hover: #475569;
  --btn-danger-bg: #ef4444;
  --btn-danger-hover: #dc2626;
  --btn-disabled-opacity: 0.5;
  
  /* Couleurs d'état pour le mode sombre */
  --color-success: #22c55e;
  --color-error: #f87171;
  --color-pending: #fbbf24;
  --color-info: #60a5fa;
  --color-log-success: #4ade80;
  --color-log-error: #fb7185;
  --color-log-info: #7dd3fc;
}

.test-header {
  text-align: center;
  margin-bottom: 2rem;
  animation: fadeInDown 0.6s ease;
}

.test-header h2 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  transition: color 0.3s ease;
}

.test-header p {
  color: var(--text-secondary);
  margin: 0;
  font-size: 1rem;
  transition: color 0.3s ease;
}

.test-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.test-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  font-size: 0.875rem;
  position: relative;
  overflow: hidden;
}

.test-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  transition: left 0.3s ease;
}

.test-btn:hover:not(:disabled)::before {
  left: 100%;
}

.test-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-secondary);
}

.test-btn:active {
  transform: translateY(0);
}

.test-btn:disabled {
  opacity: var(--btn-disabled-opacity);
  cursor: not-allowed;
  transform: none;
}

.test-btn {
  background: var(--btn-primary-bg);
}

.test-btn:hover:not(:disabled) {
  background: var(--btn-primary-hover);
}

.test-btn.secondary {
  background: var(--btn-secondary-bg);
}

.test-btn.secondary:hover:not(:disabled) {
  background: var(--btn-secondary-hover);
}

.test-btn.danger {
  background: var(--btn-danger-bg);
}

.test-btn.danger:hover:not(:disabled) {
  background: var(--btn-danger-hover);
}

.test-status {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border: 1px solid var(--border-primary);
  transition: all 0.3s ease;
  animation: slideInUp 0.5s ease;
}

.test-status:hover {
  box-shadow: var(--shadow-primary);
  transform: translateY(-2px);
}

.status-item {
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
}

.status-item:last-child {
  margin-bottom: 0;
}

.status-item strong {
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.success {
  color: var(--color-success);
  font-weight: 600;
}

.error {
  color: var(--color-error);
  font-weight: 600;
}

.pending {
  color: var(--color-pending);
  font-weight: 600;
}

.info {
  color: var(--color-info);
  font-weight: 600;
}

.test-logs h3 {
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  transition: color 0.3s ease;
}

.logs-container {
  background: var(--bg-console);
  border-radius: 8px;
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 0.875rem;
  border: 1px solid var(--border-primary);
  position: relative;
  transition: all 0.3s ease;
}

.logs-container::before {
  content: '●●●';
  position: absolute;
  top: 0.5rem;
  right: 1rem;
  color: var(--text-muted);
  font-size: 0.75rem;
  opacity: 0.6;
}

.logs-container::-webkit-scrollbar {
  width: 8px;
}

.logs-container::-webkit-scrollbar-track {
  background: transparent;
}

.logs-container::-webkit-scrollbar-thumb {
  background: var(--text-muted);
  border-radius: 4px;
  opacity: 0.5;
}

.logs-container::-webkit-scrollbar-thumb:hover {
  opacity: 0.8;
}

.log-entry {
  display: flex;
  margin-bottom: 0.25rem;
  color: var(--text-console);
  line-height: 1.4;
  animation: logFadeIn 0.3s ease;
}

.log-entry:last-child {
  margin-bottom: 0;
}

.log-time {
  color: var(--text-console-time);
  margin-right: 0.75rem;
  min-width: 80px;
  font-size: 0.8rem;
  opacity: 0.8;
}

.log-message {
  flex: 1;
  word-wrap: break-word;
}

.log-entry.success .log-message {
  color: var(--color-log-success);
}

.log-entry.error .log-message {
  color: var(--color-log-error);
}

.log-entry.info .log-message {
  color: var(--color-log-info);
}

/* Animations */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

@keyframes logFadeIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Pulse animation pour les boutons en cours de test */
.test-btn:disabled {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .sse-test-component {
    margin: 1rem;
    padding: 1.5rem;
  }

  .test-controls {
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .test-btn {
    width: 100%;
    max-width: 280px;
  }

  .status-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .logs-container {
    font-size: 0.8rem;
    max-height: 300px;
  }
  
  .log-time {
    min-width: 70px;
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .sse-test-component {
    padding: 1rem;
  }
  
  .test-header h2 {
    font-size: 1.25rem;
  }
  
  .test-btn {
    padding: 0.625rem 1.25rem;
    font-size: 0.8rem;
  }
  
  .logs-container {
    padding: 0.75rem;
    font-size: 0.75rem;
  }
}

/* Amélioration de l'accessibilité */
@media (prefers-reduced-motion: reduce) {
  .sse-test-component *,
  .sse-test-component *::before,
  .sse-test-component *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus visible pour l'accessibilité */
.test-btn:focus-visible {
  outline: 2px solid var(--color-info);
  outline-offset: 2px;
}

/* États spéciaux pour les logs */
.log-entry.success {
  background: rgba(34, 197, 94, 0.1);
  margin: 0.125rem 0;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border-left: 3px solid var(--color-log-success);
}

.log-entry.error {
  background: rgba(239, 68, 68, 0.1);
  margin: 0.125rem 0;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border-left: 3px solid var(--color-log-error);
}

.log-entry.info {
  background: rgba(59, 130, 246, 0.1);
  margin: 0.125rem 0;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border-left: 3px solid var(--color-log-info);
}

/* Effet de typing pour les logs */
.log-entry:last-child .log-message::after {
  content: '|';
  animation: blink 1s infinite;
  color: var(--color-info);
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

/* Indicateur de connexion active */
.status-item .success::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  background: var(--color-success);
  border-radius: 50%;
  margin-right: 0.5rem;
  animation: pulse 2s infinite;
}

.status-item .error::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  background: var(--color-error);
  border-radius: 50%;
  margin-right: 0.5rem;
}

.status-item .pending::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  background: var(--color-pending);
  border-radius: 50%;
  margin-right: 0.5rem;
  animation: pulse 1s infinite;
}
</style>