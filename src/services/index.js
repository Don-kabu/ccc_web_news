// services/index.js - Point d'entrée centralisé pour tous les services API

// Importer tous les services
export { httpService } from './http.service.js'
export { authService } from './auth.service.js'
export { newsService } from './news.service.js'
export { userService } from './user.service.js'
export { universityService } from './university.service.js'
export { moderationService } from './moderation.service.js'
export { passwordValidator } from './password-validator.service.js'
import { API_CONFIG, API_RESPONSE_TYPES } from './api.config.js'
import { authService } from './auth.service.js'
import { httpService } from './http.service.js'
import { newsService } from './news.service.js'
import { userService } from './user.service.js'
import { universityService } from './university.service.js'
import { moderationService } from './moderation.service.js'
import { passwordValidator } from './password-validator.service.js'


// Importer la configuration API
export {
  API_CONFIG,
  API_ENDPOINTS,
  HTTP_STATUS,
  API_RESPONSE_TYPES,
  createApiResponse,
  getAuthHeaders,
  buildApiUrl
} from './api.config.js'

// Importer les utilitaires
export { ApiError } from './http.service.js'

// Instance de service centralisée pour l'accès global
class ApiServiceManager {
  constructor() {
    this.isInitialized = false
    this.environment = 'development'
  }

  // Initialiser les services avec la configuration
  initialize(config = {}) {
    try {
      // Mettre à jour la configuration si fournie
      if (config.baseUrl) {
        API_CONFIG.baseUrl = config.baseUrl
      }
      
      if (config.timeout) {
        API_CONFIG.timeout = config.timeout
      }

      if (config.environment) {
        this.environment = config.environment
      }

      // Configurer les événements globaux d'authentification
      this.setupGlobalEventListeners()

      this.isInitialized = true
      
      console.log('✅ Services API initialisés avec succès', {
        environment: this.environment,
        baseUrl: API_CONFIG.baseUrl
      })

      return true
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des services API:', error)
      return false
    }
  }

  // Configurer les écouteurs d'événements globaux
  setupGlobalEventListeners() {
    // Gestion de la déconnexion automatique
    window.addEventListener('auth:logout', (event) => {
      if (event.detail.reason === 'token_expired') {
        this.handleTokenExpired()
      }
    })

    // Gestion des erreurs réseau
    window.addEventListener('online', () => {
      console.log('🌐 Connexion rétablie')
      this.handleConnectionRestored()
    })

    window.addEventListener('offline', () => {
      console.log('📵 Connexion perdue')
      this.handleConnectionLost()
    })
  }

  // Gérer l'expiration du token
  handleTokenExpired() {
    // Nettoyer tous les caches
    this.clearAllCaches()
    
    // Rediriger vers la page de connexion ou afficher une modal
    if (window.location.pathname !== '/login') {
      // Sauvegarder la page actuelle pour la redirection après connexion
      localStorage.setItem('ccc_redirect_after_login', window.location.pathname)
    }
  }

  // Gérer la perte de connexion
  handleConnectionLost() {
    // Activer le mode hors ligne si disponible
    window.dispatchEvent(new CustomEvent('app:offline_mode', {
      detail: { enabled: true }
    }))
  }

  // Gérer le rétablissement de la connexion
  handleConnectionRestored() {
    // Désactiver le mode hors ligne
    window.dispatchEvent(new CustomEvent('app:offline_mode', {
      detail: { enabled: false }
    }))

    // Synchroniser les données en attente
    this.syncPendingData()
  }

  // Synchroniser les données en attente (pour le mode hors ligne)
  async syncPendingData() {
    try {
      // Récupérer les données en attente depuis le localStorage
      const pendingData = JSON.parse(localStorage.getItem('ccc_pending_sync') || '[]')
      
      if (pendingData.length === 0) return

      console.log(`🔄 Synchronisation de ${pendingData.length} éléments en attente`)

      for (const item of pendingData) {
        try {
          await this.processPendingItem(item)
        } catch (error) {
          console.error('Erreur lors de la synchronisation d\'un élément:', error)
        }
      }

      // Nettoyer les données synchronisées
      localStorage.removeItem('ccc_pending_sync')
      
      // Notifier le succès de la synchronisation
      window.dispatchEvent(new CustomEvent('app:sync_completed'))
      
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error)
    }
  }

  // Traiter un élément en attente
  async processPendingItem(item) {
    const { service, method, args, timestamp } = item

    // Vérifier que l'élément n'est pas trop ancien
    const maxAge = 24 * 60 * 60 * 1000 // 24 heures
    if (Date.now() - timestamp > maxAge) {
      console.warn('Élément trop ancien, ignoré:', item)
      return
    }

    // Exécuter l'action en attente
    switch (service) {
      case 'news':
        await newsService[method](...args)
        break
      case 'user':
        await userService[method](...args)
        break
      case 'university':
        await universityService[method](...args)
        break
      case 'moderation':
        await moderationService[method](...args)
        break
      default:
        console.warn('Service inconnu pour la synchronisation:', service)
    }
  }

  // Ajouter une action à la file d'attente hors ligne
  addToPendingSync(service, method, args) {
    try {
      const pendingData = JSON.parse(localStorage.getItem('ccc_pending_sync') || '[]')
      
      pendingData.push({
        service,
        method,
        args,
        timestamp: Date.now(),
        id: Date.now() + Math.random() // ID unique simple
      })

      localStorage.setItem('ccc_pending_sync', JSON.stringify(pendingData))
    } catch (error) {
      console.error('Erreur lors de l\'ajout à la file d\'attente:', error)
    }
  }

  // Nettoyer tous les caches des services
  clearAllCaches() {
    try {
      newsService.clearCache()
      userService.clearCache()
      universityService.clearCache()
      moderationService.invalidateCache()
      
      console.log('🧹 Tous les caches ont été nettoyés')
    } catch (error) {
      console.error('Erreur lors du nettoyage des caches:', error)
    }
  }

  // Obtenir le statut des services
  getStatus() {
    return {
      initialized: this.isInitialized,
      environment: this.environment,
      baseUrl: API_CONFIG.baseUrl,
      online: navigator.onLine,
      authenticated: authService.isLoggedIn()
    }
  }

  // Vérifier la santé de l'API
  async checkApiHealth() {
    try {
      // Utiliser un endpoint simple qui existe pour vérifier la santé de l'API
      const response = await httpService.get('/universities/', { page: 1, limit: 1 })
      return response.success === true
    } catch (error) {
      console.error('API non disponible:', error)
      return false
    }
  }
}

// Instance singleton du gestionnaire de services
export const apiServiceManager = new ApiServiceManager()

// Auto-initialisation avec les valeurs par défaut
apiServiceManager.initialize()

// Exposer pour le debugging en développement
if (import.meta.env.DEV) {
  window.__CCC_API_SERVICES__ = {
    auth: authService,
    news: newsService,
    user: userService,
    university: universityService,
    moderation: moderationService,
    manager: apiServiceManager
  }
  
  // Fonction de test des headers d'authentification
  window.__CCC_TEST_AUTH__ = async () => {
    try {
      console.log('🧪 Test global des headers d\'authentification...')
      return await universityService.testAuthHeaders()
    } catch (error) {
      console.error('❌ Test global échoué:', error)
      return error
    }
  }

  // Fonction de test pour simuler des erreurs de validation
  window.__CCC_TEST_VALIDATION_ERRORS__ = () => {
    console.log('🧪 Simulation d\'erreurs de validation...')
    
    const mockValidationError = {
      status: 422,
      response: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Données invalides',
          details: {
            email: 'Cette adresse email existe déjà',
            phone: 'Le numéro de téléphone doit commencer par +243',
            password: 'Le mot de passe doit contenir au moins 8 caractères',
            first_name: 'Le prénom est requis',
            university_id: 'Vous devez sélectionner une institution'
          }
        }
      }
    }

    console.log('Exemple d\'erreur de validation:', mockValidationError)
    console.log('Pour tester, ouvrez la modal d\'inscription et essayez avec des données invalides')
    
    return mockValidationError
  }
}