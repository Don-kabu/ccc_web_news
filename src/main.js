import { createApp } from 'vue'
import App from './App.vue'
import './components/styles.css'
import './styles/responsive.css'
import './assets/css/themes.css'
import './assets/css/app-theme.css'
import './assets/css/moderation-theme.css'

// Importer les outils de debug notifications en mode dev
if (import.meta.env.DEV) {
  import('./utils/notification-debug.js').catch(error => {
    console.warn('⚠️ Impossible de charger les outils de debug notifications:', error)
  })
}

createApp(App).mount('#app')
