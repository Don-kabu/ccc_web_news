import { httpService } from './http.service.js'
import { API_ENDPOINTS, createApiResponse, API_RESPONSE_TYPES, HTTP_STATUS } from './api.config.js'
// export { authService }

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
        const user = JSON.parse(userData)
        
        // S'assurer que l'utilisateur a une université définie
        const userWithUniversity = this.ensureUserHasUniversity(user)
        
        if (import.meta.env.DEV) {
          console.log('📥 Chargement utilisateur depuis localStorage:', {
            role: userWithUniversity.role,
            university: userWithUniversity.university,
            university_id: userWithUniversity.university_id,
            userData: userWithUniversity
          })
        }
        
        this.currentUser = userWithUniversity
        this.isAuthenticated = true
        
        // Sauvegarder si modifié
        if (JSON.stringify(user) !== JSON.stringify(userWithUniversity)) {
          localStorage.setItem('ccc_currentUser', JSON.stringify(userWithUniversity))
          console.log('✅ Utilisateur mis à jour avec université par défaut')
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error)
      this.currentUser = null
      this.isAuthenticated = false
    }
  }

  // S'assurer que l'utilisateur a une université définie
  ensureUserHasUniversity(user) {
    if (!user) return user
    
    // Si l'utilisateur n'a pas d'université définie, en ajouter une par défaut
    if (!user.university_id && !user.university?.id) {
      console.log('⚠️ Utilisateur sans université, ajout d\'une université par défaut')
      
      const defaultUniversity = {
        id: 'univ_ccc_default',
        name: 'CCC Web News University'
      }
      
      return {
        ...user,
        university_id: defaultUniversity.id,
        university: defaultUniversity
      }
    }
    
    // Si l'utilisateur a un university_id mais pas d'objet university
    if (user.university_id && (!user.university || !user.university.name)) {
      return {
        ...user,
        university: {
          id: user.university_id,
          name: user.university?.name || 'CCC Web News University'
        }
      }
    }
    
    return user
  }

  // Sauvegarder l'utilisateur dans le localStorage
  saveUserToStorage(user, tokens) {
    try {
      if (import.meta.env.DEV) {
        console.log('💾 Sauvegarde utilisateur:', {
          role: user.role,
          userData: user
        })
      }
      
      // Enrichir les informations utilisateur avec les permissions
      const userInfo = {
        ...user,
        role: user.role || 'user',
        permissions: user.permissions || []
      }
      
      localStorage.setItem('ccc_currentUser', JSON.stringify(userInfo))
      localStorage.setItem('ccc_access_token', tokens.access_token)
      
      if (tokens.refresh_token) {
        localStorage.setItem('ccc_refresh_token', tokens.refresh_token)
      }
      
      this.currentUser = userInfo
      this.isAuthenticated = true
      
      // Ajouter l'utilisateur à la liste d'administration
      this.addToUsersList(userInfo)
      
      // Initialiser les permissions
      this.initializePermissions(userInfo)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'utilisateur:', error)
      throw new Error('Impossible de sauvegarder la session')
    }
  }

  // Ajouter l'utilisateur à la liste d'administration
  addToUsersList(user) {
    try {
      const existingUsers = JSON.parse(localStorage.getItem('ccc_users') || '[]')
      
      // Vérifier si l'utilisateur existe déjà
      const existingUserIndex = existingUsers.findIndex(u => u.email === user.email || u.id === user.id)
      
      // Formater l'utilisateur pour l'administration
      const formattedUser = {
        id: user.id || Date.now(),
        first_name: user.first_name || user.firstname || 'Utilisateur',
        last_name: user.last_name || user.lastname || '',
        email: user.email || '',
        role: user.role || 'STUDENT',
        faculty: user.faculty || null,
        university: user.university || { name: 'CCC University' },
        created_at: user.created_at || new Date().toISOString(),
        last_login: new Date().toISOString()
      }
      
      if (existingUserIndex !== -1) {
        // Mettre à jour l'utilisateur existant
        existingUsers[existingUserIndex] = { ...existingUsers[existingUserIndex], ...formattedUser }
      } else {
        // Ajouter le nouvel utilisateur
        existingUsers.push(formattedUser)
      }
      
      // Sauvegarder la liste mise à jour
      localStorage.setItem('ccc_users', JSON.stringify(existingUsers))
      
      console.log('👤 Utilisateur ajouté/mis à jour dans la liste d\'administration')
    } catch (error) {
      console.error('Erreur lors de l\'ajout à la liste des utilisateurs:', error)
    }
  }

  // Initialiser les permissions utilisateur
  async initializePermissions(user) {
    try {
      const { permissionService } = await import('./permission.service.js')
      permissionService.setUser(user)
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des permissions:', error)
    }
  }

  // Connexion
  async login(credentials) {
    try {
      const response = await httpService.post(API_ENDPOINTS.AUTH.LOGIN, {
        email: credentials.email,
        password: credentials.password
      })
      // Supporter plusieurs formes de réponse API (success boolean ou status string)
      const isSuccess = response && (response.success === true || response.status === API_RESPONSE_TYPES.SUCCESS)

      if (isSuccess) {
        // L'API retourne les données dans response.data ou directement
        const payload = response.data || response
        const userData = payload.user || payload

        // Debug pour voir les données exactes de l'utilisateur (dev uniquement)
        if (import.meta.env.DEV) {
          console.log('🔍 Debug connexion - données utilisateur:', {
            role: userData.role,
            roleType: typeof userData.role,
            userData: userData
          })
        }

        // Gérer différentes clés possibles pour le token
        const access = (payload.access_token || payload.token || payload.auth_token)
        const refresh = (payload.refresh_token || payload.refresh)

        const tokens = {
          access_token: access,
          refresh_token: refresh
        }

        if (tokens.access_token) {
          this.saveUserToStorage(userData, tokens)
        }

        // Émettre un événement de connexion réussie
        window.dispatchEvent(new CustomEvent('auth:login', { 
          detail: { user: userData }
        }))

        return createApiResponse(API_RESPONSE_TYPES.SUCCESS, payload, 'Connexion réussie')
      }

      // Erreur d'authentification
      throw new Error(response.error?.message || 'Identifiants incorrects')
    } catch (error) {
      console.error('Erreur de connexion:', error)
      throw error
    }
  }



  
  // Inscription d'université spécialisée
  async registerUniversity(universityData) {
    try {
      const response = await httpService.post(API_ENDPOINTS.AUTH.REGISTER_UNIVERSITY, universityData)
      const isSuccess = response && (response.success === true || response.status === API_RESPONSE_TYPES.SUCCESS)

      if (isSuccess) {
        const payload = response.data || response

        // Connexion automatique après inscription si des tokens sont fournis
        const access = (payload.access_token || payload.token || payload.auth_token)
        const refresh = (payload.refresh_token || payload.refresh)

        const tokens = {
          access_token: access,
          refresh_token: refresh
        }

        if (tokens.access_token) {
          this.saveUserToStorage(payload.user || payload, tokens)

          // Émettre un événement d'inscription d'université réussie
          window.dispatchEvent(new CustomEvent('auth:register', { 
            detail: { user: payload.user || payload, university: payload.university }
          }))
        }

        return createApiResponse(API_RESPONSE_TYPES.SUCCESS, payload, 'Université créée avec succès')
      }

      // Erreur d'inscription
      const errorInfo = response.error || response
      throw new Error(errorInfo.message || 'Erreur lors de la création de l\'université')
    } catch (error) {
      console.error('Erreur de création d\'université:', error)
      
      // Si c'est une erreur HTTP avec des détails de validation, on préserve la structure
      if (error.status && (error.status === 400 || error.status === 422)) {
        // Préserver l'erreur pour que RegisterForm puisse traiter les validationErrors
        throw error
      }
      
      throw error
    }
  }

  // Inscription
  async register(userData) {
    try {
      // Utiliser l'endpoint d'inscription d'université car c'est celui qui existe dans l'API
      const response = await httpService.post(API_ENDPOINTS.AUTH.REGISTER_UNIVERSITY, userData)
      const isSuccess = response && (response.success === true || response.status === API_RESPONSE_TYPES.SUCCESS)

      if (isSuccess) {
        const payload = response.data || response

        // Connexion automatique après inscription si des tokens sont fournis
        const access = (payload.access_token || payload.token || payload.auth_token)
        const refresh = (payload.refresh_token || payload.refresh)

        const tokens = {
          access_token: access,
          refresh_token: refresh
        }

        if (tokens.access_token) {
          this.saveUserToStorage(payload.user || payload, tokens)

          // Émettre un événement d'inscription réussie
          window.dispatchEvent(new CustomEvent('auth:register', { 
            detail: { user: payload.user || payload }
          }))
        }

        return createApiResponse(API_RESPONSE_TYPES.SUCCESS, payload, 'Inscription réussie')
      }

      // Erreur d'inscription
      const errorInfo = response.error || response
      throw new Error(errorInfo.message || 'Erreur lors de l\'inscription')
    } catch (error) {
      console.error('Erreur d\'inscription:', error)
      
      // Si c'est une erreur HTTP avec des détails de validation, on préserve la structure
      if (error.status && (error.status === 400 || error.status === 422)) {
        // Préserver l'erreur pour que LoginForm puisse traiter les validationErrors
        throw error
      }
      
      throw error
    }
  }








  async registerUser(userData) {
    try {
      // Utiliser l'endpoint d'inscription d'université car c'est celui qui existe dans l'API
      const response = await httpService.post(API_ENDPOINTS.AUTH.REGISTER, userData)
      const isSuccess = response && (response.success === true || response.status === API_RESPONSE_TYPES.SUCCESS)

      if (isSuccess) {
        const payload = response.data || response

        // Connexion automatique après inscription si des tokens sont fournis
        const access = (payload.access_token || payload.token || payload.auth_token)
        const refresh = (payload.refresh_token || payload.refresh)

        const tokens = {
          access_token: access,
          refresh_token: refresh
        }

        if (tokens.access_token) {
          this.saveUserToStorage(payload.user || payload, tokens)

          // Émettre un événement d'inscription réussie
          window.dispatchEvent(new CustomEvent('auth:register', { 
            detail: { user: payload.user || payload }
          }))
        }

        return createApiResponse(API_RESPONSE_TYPES.SUCCESS, payload, 'Inscription réussie')
      }


      

      // Erreur d'inscription
      throw new Error(response.error?.message || 'Erreur lors de l\'inscription')
    } catch (error) {
      console.error('Erreur d\'inscription:', error)
      throw error
    }
  }

  // Déconnexion
  async logout() {
    try {
      await httpService.post('/accounts/logout/')
      this.clearSession()
      this.emitEvent('userLoggedOut')
      return { success: true }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      this.clearSession()
      return { success: false, error: 'Erreur de déconnexion' }
    }
  }

  // Nettoyer la session locale
  clearSession() {
    localStorage.removeItem('ccc_currentUser')
    localStorage.removeItem('ccc_access_token')
    localStorage.removeItem('ccc_refresh_token')
    
    this.currentUser = null
    this.isAuthenticated = false

    // Nettoyer les permissions de manière synchrone
    this.clearPermissionsSync()

    // Émettre un événement de déconnexion
    this.emitEvent('userLoggedOut')
  }

  // Nettoyer les permissions lors de la déconnexion (version asynchrone)
  async clearPermissions() {
    try {
      const { clearUserPermissions } = await import('@/services/permission.service.js')
      clearUserPermissions()
    } catch (error) {
      console.error('Erreur lors du nettoyage des permissions:', error)
    }
  }

  // Version synchrone pour clearSession
  clearPermissionsSync() {
    // Supprimer les permissions du localStorage de manière synchrone
    localStorage.removeItem('user_permissions')
    localStorage.removeItem('user_roles')
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

      if (response.success) {
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

      // Utiliser l'endpoint du profil utilisateur pour vérifier l'authentification
      const response = await httpService.get(API_ENDPOINTS.USERS.PROFILE)
      
      if (response.success) {
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

  // Rejoindre une université existante
  async joinUniversity(joinData) {
    try {
      console.log('🎓 Inscription à l\'université:', joinData.university_id)
      
      const response = await httpService.post(API_ENDPOINTS.AUTH.JOIN_UNIVERSITY, joinData)
      const isSuccess = response && (response.success === true || response.status === API_RESPONSE_TYPES.SUCCESS)

      if (isSuccess) {
        const payload = response.data || response
        console.log('✅ Inscription à l\'université réussie')

        // Connexion automatique après inscription si des tokens sont fournis
        const access = (payload.access_token || payload.token || payload.auth_token)
        const refresh = (payload.refresh_token || payload.refresh)

        const tokens = {
          access_token: access,
          refresh_token: refresh
        }

        if (tokens.access_token) {
          this.saveUserToStorage(payload.user || payload, tokens)

          // Émettre un événement d'inscription réussie
          window.dispatchEvent(new CustomEvent('auth:join-university', { 
            detail: { 
              user: payload.user || payload,
              university_id: joinData.university_id 
            }
          }))
        }

        return createApiResponse(API_RESPONSE_TYPES.SUCCESS, payload, 'Inscription à l\'université réussie')
      }

      // Erreur d'inscription
      const errorInfo = response.error || response
      throw new Error(errorInfo.message || 'Erreur lors de l\'inscription à l\'université')
    } catch (error) {
      console.error('Erreur d\'inscription à l\'université:', error)
      
      // Si c'est une erreur HTTP avec des détails de validation, on préserve la structure
      if (error.status && (error.status === 400 || error.status === 409 || error.status === 422)) {
        // Préserver l'erreur pour que JoinUniversityForm puisse traiter les validationErrors
        throw error
      }
      
      throw error
    }
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