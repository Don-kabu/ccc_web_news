import { httpService } from './http.service.js'
import { API_ENDPOINTS, createApiResponse, API_RESPONSE_TYPES, HTTP_STATUS } from './api.config.js'

// Service d'authentification
class AuthService {
  constructor() {
    this.currentUser = null
    this.isAuthenticated = false
    this.loadUserFromStorage()
  }

  // Charger l'utilisateur depuis le localStorage au démarrage
  loadUserFromStorage() {
    try {
      const userData = localStorage.getItem('ccc_currentUser')
      const token = localStorage.getItem('ccc_access_token')
      
      if (userData && token) {
        this.currentUser = JSON.parse(userData)
        this.isAuthenticated = true
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error)
      this.logout()
    }
  }

  // Sauvegarder l'utilisateur dans le localStorage
  saveUserToStorage(user, tokens) {
    try {
      localStorage.setItem('ccc_currentUser', JSON.stringify(user))
      localStorage.setItem('ccc_access_token', tokens.access_token)
      
      if (tokens.refresh_token) {
        localStorage.setItem('ccc_refresh_token', tokens.refresh_token)
      }
      
      this.currentUser = user
      this.isAuthenticated = true
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'utilisateur:', error)
      throw new Error('Impossible de sauvegarder la session')
    }
  }

  // Connexion
  async login(credentials) {
    try {
      const response = await httpService.post(API_ENDPOINTS.AUTH.LOGIN, {
        email: credentials.email,
        password: credentials.password
      })

      if (response.status === API_RESPONSE_TYPES.SUCCESS) {
        this.saveUserToStorage(response.data.user, response.data.tokens)
        
        // Émettre un événement de connexion réussie
        window.dispatchEvent(new CustomEvent('auth:login', { 
          detail: { user: response.data.user }
        }))

        return createApiResponse(API_RESPONSE_TYPES.SUCCESS, response.data, 'Connexion réussie')
      }

      return response
    } catch (error) {
      console.error('Erreur de connexion:', error)
      throw error
    }
  }

  // Inscription
  async register(userData) {
    try {
      const response = await httpService.post(API_ENDPOINTS.AUTH.REGISTER, userData)

      if (response.status === API_RESPONSE_TYPES.SUCCESS) {
        // Connexion automatique après inscription
        if (response.data.tokens) {
          this.saveUserToStorage(response.data.user, response.data.tokens)
          
          // Émettre un événement d'inscription réussie
          window.dispatchEvent(new CustomEvent('auth:register', { 
            detail: { user: response.data.user }
          }))
        }

        return createApiResponse(API_RESPONSE_TYPES.SUCCESS, response.data, 'Inscription réussie')
      }

      return response
    } catch (error) {
      console.error('Erreur d\'inscription:', error)
      throw error
    }
  }

  // Déconnexion
  async logout() {
    try {
      // Tenter de notifier le serveur de la déconnexion
      if (this.isAuthenticated) {
        try {
          await httpService.post(API_ENDPOINTS.AUTH.LOGOUT)
        } catch (error) {
          console.warn('Erreur lors de la déconnexion côté serveur:', error)
        }
      }
    } finally {
      // Nettoyer la session locale dans tous les cas
      this.clearSession()
    }
  }

  // Nettoyer la session locale
  clearSession() {
    localStorage.removeItem('ccc_currentUser')
    localStorage.removeItem('ccc_access_token')
    localStorage.removeItem('ccc_refresh_token')
    
    this.currentUser = null
    this.isAuthenticated = false

    // Émettre un événement de déconnexion
    window.dispatchEvent(new CustomEvent('auth:logout', { 
      detail: { reason: 'manual' }
    }))
  }

  // Rafraîchir le token d'accès
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('ccc_refresh_token')
      
      if (!refreshToken) {
        throw new Error('Aucun token de rafraîchissement disponible')
      }

      const response = await httpService.post(API_ENDPOINTS.AUTH.REFRESH, {
        refresh_token: refreshToken
      })

      if (response.status === API_RESPONSE_TYPES.SUCCESS) {
        // Mettre à jour les tokens
        localStorage.setItem('ccc_access_token', response.data.access_token)
        
        if (response.data.refresh_token) {
          localStorage.setItem('ccc_refresh_token', response.data.refresh_token)
        }

        return response.data
      }

      throw new Error('Impossible de rafraîchir le token')
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error)
      this.clearSession()
      throw error
    }
  }

  // Vérifier si l'utilisateur est connecté
  async checkAuthStatus() {
    try {
      if (!this.isAuthenticated) {
        return false
      }

      const response = await httpService.get(API_ENDPOINTS.AUTH.ME)
      
      if (response.status === API_RESPONSE_TYPES.SUCCESS) {
        // Mettre à jour les informations utilisateur
        this.currentUser = response.data
        localStorage.setItem('ccc_currentUser', JSON.stringify(response.data))
        return true
      }

      return false
    } catch (error) {
      console.error('Erreur lors de la vérification du statut d\'authentification:', error)
      
      // Si l'erreur est liée à l'authentification, tenter un rafraîchissement
      if (error.status === HTTP_STATUS.UNAUTHORIZED) {
        try {
          await this.refreshToken()
          return await this.checkAuthStatus() // Récursion une seule fois
        } catch (refreshError) {
          this.clearSession()
          return false
        }
      }
      
      return false
    }
  }

  // Demander une réinitialisation de mot de passe
  async requestPasswordReset(email) {
    try {
      const response = await httpService.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email
      })

      return response
    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation:', error)
      throw error
    }
  }

  // Réinitialiser le mot de passe
  async resetPassword(token, newPassword) {
    try {
      const response = await httpService.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        password: newPassword
      })

      return response
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error)
      throw error
    }
  }

  // Changer le mot de passe
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await httpService.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        current_password: currentPassword,
        new_password: newPassword
      })

      return response
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error)
      throw error
    }
  }

  // Vérifier l'email
  async verifyEmail(token) {
    try {
      const response = await httpService.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
        token
      })

      if (response.status === API_RESPONSE_TYPES.SUCCESS && this.currentUser) {
        // Mettre à jour le statut de vérification
        this.currentUser.email_verified = true
        localStorage.setItem('ccc_currentUser', JSON.stringify(this.currentUser))
      }

      return response
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'email:', error)
      throw error
    }
  }

  // Renvoyer l'email de vérification
  async resendVerificationEmail() {
    try {
      const response = await httpService.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION)
      return response
    } catch (error) {
      console.error('Erreur lors du renvoi de l\'email de vérification:', error)
      throw error
    }
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser() {
    return this.currentUser
  }

  // Vérifier si l'utilisateur a un rôle spécifique
  hasRole(role) {
    return this.currentUser?.role === role
  }

  // Vérifier si l'utilisateur a l'une des permissions spécifiées
  hasPermission(permission) {
    if (!this.currentUser) return false
    
    // Les admins ont toutes les permissions
    if (this.currentUser.role === 'ADMIN') return true
    
    // Vérifier les permissions spécifiques selon le rôle
    const rolePermissions = {
      MODERATOR: ['read', 'create', 'edit', 'moderate', 'validate'],
      PUBLIANT: ['read', 'create', 'edit'],
      STUDENT: ['read']
    }
    
    return rolePermissions[this.currentUser.role]?.includes(permission) || false
  }

  // Obtenir le token d'accès
  getAccessToken() {
    return localStorage.getItem('ccc_access_token')
  }

  // Vérifier si l'utilisateur est connecté
  isLoggedIn() {
    return this.isAuthenticated && this.currentUser !== null
  }
}

// Instance singleton du service d'authentification
export const authService = new AuthService()

// Écouter les événements de déconnexion automatique
window.addEventListener('auth:logout', (event) => {
  if (event.detail.reason === 'token_expired') {
    console.log('Session expirée, déconnexion automatique')
    // Afficher une notification à l'utilisateur si nécessaire
  }
})