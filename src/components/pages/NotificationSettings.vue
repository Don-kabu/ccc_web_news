<template>
  <div class="notifications-settings">
    <div class="settings-header">
      <h2>Paramètres de Notifications</h2>
      <p>Gérez la fréquence de vos notifications d'actualités</p>
    </div>

    <div class="notification-options">
      <!-- Fréquence des notifications -->
      <div class="setting-group">
        <h3>Fréquence des notifications</h3>
        <div class="radio-group">
          <label class="radio-option">
            <input 
              type="radio" 
              name="frequency" 
              value="immediate" 
              v-model="settings.frequency"
              @change="saveSettings"
            />
            <span class="radio-label">
              <strong>À chaque nouvelle information</strong>
              <small>Notification immédiate pour chaque actualité publiée</small>
            </span>
          </label>
          
          <label class="radio-option">
            <input 
              type="radio" 
              name="frequency" 
              value="daily" 
              v-model="settings.frequency"
              @change="saveSettings"
            />
            <span class="radio-label">
              <strong>Une fois par jour (digest)</strong>
              <small>Résumé quotidien des actualités de la journée</small>
            </span>
          </label>
          
          <label class="radio-option">
            <input 
              type="radio" 
              name="frequency" 
              value="weekly" 
              v-model="settings.frequency"
              @change="saveSettings"
            />
            <span class="radio-label">
              <strong>Une fois par semaine (digest)</strong>
              <small>Résumé hebdomadaire, sauf pour les actualités urgentes</small>
            </span>
          </label>
        </div>
      </div>

      <!-- Types d'actualités -->
      <div class="setting-group">
        <h3>Types d'actualités à recevoir</h3>
        <div class="checkbox-group">
          <label class="checkbox-option">
            <input 
              type="checkbox" 
              v-model="settings.importance.urgente"
              @change="saveSettings"
            />
            <span class="checkbox-label urgente">
              <span class="importance-badge urgente">🔴 Urgente</span>
              <small>Informations critiques nécessitant une action immédiate</small>
            </span>
          </label>
          
          <label class="checkbox-option">
            <input 
              type="checkbox" 
              v-model="settings.importance.importante"
              @change="saveSettings"
            />
            <span class="checkbox-label importante">
              <span class="importance-badge importante">🟠 Importante</span>
              <small>Informations prioritaires à connaître</small>
            </span>
          </label>
          
          <label class="checkbox-option">
            <input 
              type="checkbox" 
              v-model="settings.importance.moyenne"
              @change="saveSettings"
            />
            <span class="checkbox-label moyenne">
              <span class="importance-badge moyenne">🟡 Moyenne</span>
              <small>Informations notables mais non critiques</small>
            </span>
          </label>
          
          <label class="checkbox-option">
            <input 
              type="checkbox" 
              v-model="settings.importance.faible"
              @change="saveSettings"
            />
            <span class="checkbox-label faible">
              <span class="importance-badge faible">🟢 Faible</span>
              <small>Informations générales</small>
            </span>
          </label>
        </div>
      </div>

      <!-- Canaux de notification -->
      <div class="setting-group">
        <h3>Canaux de notification</h3>
        <div class="checkbox-group">
          <label class="checkbox-option">
            <input 
              type="checkbox" 
              v-model="settings.channels.web"
              @change="saveSettings"
            />
            <span class="checkbox-label">
              <strong>Notifications Web</strong>
              <small>Notifications dans le navigateur</small>
            </span>
          </label>
          
          <label class="checkbox-option">
            <input 
              type="checkbox" 
              v-model="settings.channels.email"
              @change="saveSettings"
            />
            <span class="checkbox-label">
              <strong>Notifications Email</strong>
              <small>Emails à {{ currentUser.email }}</small>
            </span>
          </label>
          
          <label class="checkbox-option">
            <input 
              type="checkbox" 
              v-model="settings.channels.mobile"
              @change="saveSettings"
              disabled
            />
            <span class="checkbox-label">
              <strong>Notifications Mobile</strong>
              <small>Push notifications sur l'application mobile (bientôt disponible)</small>
            </span>
          </label>
        </div>
      </div>

      <!-- Horaires préférés -->
      <div class="setting-group" v-if="settings.frequency !== 'immediate'">
        <h3>Horaires préférés pour les digest</h3>
        <div class="time-settings">
          <div v-if="settings.frequency === 'daily'" class="time-input-group">
            <label>Heure d'envoi quotidien :</label>
            <input 
              type="time" 
              v-model="settings.dailyTime"
              @change="saveSettings"
              class="time-input"
            />
          </div>
          
          <div v-if="settings.frequency === 'weekly'" class="time-input-group">
            <label>Jour et heure d'envoi hebdomadaire :</label>
            <div class="weekly-settings">
              <select v-model="settings.weeklyDay" @change="saveSettings" class="day-select">
                <option value="1">Lundi</option>
                <option value="2">Mardi</option>
                <option value="3">Mercredi</option>
                <option value="4">Jeudi</option>
                <option value="5">Vendredi</option>
                <option value="6">Samedi</option>
                <option value="0">Dimanche</option>
              </select>
              <input 
                type="time" 
                v-model="settings.weeklyTime"
                @change="saveSettings"
                class="time-input"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Zone de test -->
      <div class="setting-group">
        <h3>Test des notifications</h3>
        <div class="test-section">
          <button @click="sendTestNotification" class="test-button" :disabled="testLoading">
            <svg v-if="!testLoading" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" stroke-width="2"/>
              <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" stroke-width="2"/>
            </svg>
            <div v-else class="loading-spinner">
              <svg class="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
                <path d="M4 12A8 8 0 0 1 12 4" stroke="currentColor" stroke-width="4"/>
              </svg>
            </div>
            {{ testLoading ? 'Envoi...' : 'Envoyer une notification test' }}
          </button>
          <small>Ceci enverra une notification test selon vos paramètres actuels</small>
        </div>
      </div>
    </div>

    <div class="settings-footer">
      <div class="save-status" :class="{ visible: showSaveStatus }">
        ✓ Paramètres sauvegardés automatiquement
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'

const props = defineProps({
  currentUser: {
    type: Object,
    required: true
  }
})

// État réactif
const settings = reactive({
  frequency: 'daily', // 'immediate', 'daily', 'weekly'
  importance: {
    urgente: true,
    importante: true,
    moyenne: true,
    faible: false
  },
  channels: {
    web: true,
    email: false,
    mobile: false
  },
  dailyTime: '09:00',
  weeklyDay: '1', // Lundi
  weeklyTime: '09:00'
})

const testLoading = ref(false)
const showSaveStatus = ref(false)

// Charger les paramètres au montage
onMounted(() => {
  loadSettings()
})

const loadSettings = () => {
  const savedSettings = localStorage.getItem(`notification_settings_${props.currentUser.id}`)
  if (savedSettings) {
    Object.assign(settings, JSON.parse(savedSettings))
  }
}

const saveSettings = () => {
  localStorage.setItem(`notification_settings_${props.currentUser.id}`, JSON.stringify(settings))
  
  // Afficher le statut de sauvegarde
  showSaveStatus.value = true
  setTimeout(() => {
    showSaveStatus.value = false
  }, 2000)
}

const sendTestNotification = async () => {
  testLoading.value = true
  
  try {
    // Simulation d'envoi de notification
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Notification web si activée
    if (settings.channels.web && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('CCC Web News - Test', {
          body: 'Ceci est une notification test selon vos paramètres.',
          icon: '/favicon.ico'
        })
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          new Notification('CCC Web News - Test', {
            body: 'Ceci est une notification test selon vos paramètres.',
            icon: '/favicon.ico'
          })
        }
      }
    }
    
    // Simulation notification email
    if (settings.channels.email) {
      console.log(`Email de test envoyé à ${props.currentUser.email}`)
    }
    
    alert('Notification test envoyée avec succès !')
    
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification test:', error)
    alert('Erreur lors de l\'envoi de la notification test')
  } finally {
    testLoading.value = false
  }
}
</script>

<style scoped>
.notifications-settings {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.settings-header {
  text-align: center;
  margin-bottom: 3rem;
}

.settings-header h2 {
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
}

.settings-header p {
  color: #6b7280;
  margin: 0;
  font-size: 1.1rem;
}

.notification-options {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.setting-group {
  background: #f9fafb;
  border-radius: 12px;
  padding: 2rem;
  border: 2px solid #e5e7eb;
}

.setting-group h3 {
  color: #374151;
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.radio-group,
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.radio-option,
.checkbox-option {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s ease;
}

.radio-option:hover,
.checkbox-option:hover {
  border-color: #6366f1;
  background: #f8faff;
}

.radio-option input[type="radio"]:checked + .radio-label,
.checkbox-option input[type="checkbox"]:checked + .checkbox-label {
  color: #1f2937;
}

.radio-option input[type="radio"]:checked,
.checkbox-option input[type="checkbox"]:checked {
  accent-color: #6366f1;
}

.radio-label,
.checkbox-label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.radio-label strong,
.checkbox-label strong {
  color: #1f2937;
  font-weight: 600;
}

.radio-label small,
.checkbox-label small {
  color: #6b7280;
  font-size: 0.875rem;
}

.importance-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.importance-badge.urgente {
  background: #fef2f2;
  color: #dc2626;
}

.importance-badge.importante {
  background: #fef3c7;
  color: #d97706;
}

.importance-badge.moyenne {
  background: #dbeafe;
  color: #2563eb;
}

.importance-badge.faible {
  background: #f0fdf4;
  color: #16a34a;
}

.time-settings {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
}

.time-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.time-input-group label {
  color: #374151;
  font-weight: 600;
}

.time-input,
.day-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.time-input:focus,
.day-select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.weekly-settings {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.day-select {
  flex: 1;
}

.test-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  text-align: center;
}

.test-button {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 0.5rem;
}

.test-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
}

.test-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.test-section small {
  color: #6b7280;
  display: block;
}

.settings-footer {
  text-align: center;
  margin-top: 2rem;
}

.save-status {
  color: #16a34a;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.save-status.visible {
  opacity: 1;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@media (max-width: 768px) {
  .notifications-settings {
    padding: 1rem;
    margin: 1rem;
  }
  
  .weekly-settings {
    flex-direction: column;
    align-items: stretch;
  }
  
  .radio-option,
  .checkbox-option {
    padding: 0.75rem;
  }
}
</style>