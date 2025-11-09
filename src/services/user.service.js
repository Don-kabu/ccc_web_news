import { httpService } from './http.service.js'
import { API_ENDPOINTS, createApiResponse, API_RESPONSE_TYPES } from './api.config.js'

// Service de gestion des utilisateurs
class UserService {
  constructor() {
    this.cache = new Map()
    this.cacheTimeout = 5 * 60 * 1000 // 5 minutes
  }

  // Récupérer tous les utilisateurs (avec restriction par établissement pour les admins)
  async getUsers(filters = {}) {
    try {
      const cacheKey = this.getCacheKey('users', filters)
      
      // Vérifier le cache
      const cachedData = this.getCachedData(cacheKey)
      if (cachedData) {
        return cachedData
      }

      const queryParams = {
        ...filters
      }

      const response = await httpService.get(API_ENDPOINTS.USERS.BASE, queryParams)

      if (response.success) {
        // Mettre en cache
        this.setCachedData(cacheKey, response)
      }

      return response
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error)
      throw error
    }
  }

  // Récupérer un utilisateur spécifique
  async getUser(id) {
    try {
      const cacheKey = this.getCacheKey('user', { id })
      
      const cachedData = this.getCachedData(cacheKey)
      if (cachedData) {
        return cachedData
      }

      const response = await httpService.get(`${API_ENDPOINTS.USERS.BASE}${id}/`)

      if (response.success) {
        this.setCachedData(cacheKey, response)
      }

      return response
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error)
      throw error
    }
  }

  // Mettre à jour un utilisateur (admin seulement)
  async updateUser(id, userData) {
    try {
      const response = await httpService.put(`${API_ENDPOINTS.USERS.BASE}${id}/`, userData)

      if (response.success) {
        // Invalider le cache
        this.invalidateUserCache(id)
        this.invalidateUsersCache()
      }

      return response
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error)
      throw error
    }
  }

  // Supprimer un utilisateur (admin seulement)
  async deleteUser(id) {
    try {
      const response = await httpService.delete(`${API_ENDPOINTS.USERS.BASE}${id}/`)

      if (response.success) {
        // Invalider le cache
        this.invalidateUserCache(id)
        this.invalidateUsersCache()
      }

      return response
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error)
      throw error
    }
  }

  // Récupérer les utilisateurs de l'université de l'admin connecté
  async getUsersForCurrentAdmin() {
    try {
      // Récupérer l'utilisateur actuel
      const currentUser = JSON.parse(localStorage.getItem('ccc_currentUser') || '{}')
      
      console.log('🔍 Admin courant:', {
        email: currentUser.email,
        role: currentUser.role,
        university_id: currentUser.university_id,
        university_name: currentUser.university?.name,
        currentUserData: currentUser
      })
      
      if (!currentUser || currentUser.role !== 'ADMIN') {
        throw new Error('Accès non autorisé - Admin requis')
      }

      // Essayer d'abord sans filtrage par université pour voir si l'API fonctionne
      console.log('🔄 Tentative de récupération de tous les utilisateurs...')
      
      try {
        const allUsersResponse = await this.getUsers()
        console.log('✅ API Users accessible, réponse:', allUsersResponse)
        
        // Si on a un university_id, filtrer côté client
        if (currentUser.university_id) {
          console.log('🏫 Filtrage côté client par université ID:', currentUser.university_id)
          
          // Gérer différentes structures de réponse
          let usersList = []
          if (Array.isArray(allUsersResponse.data)) {
            usersList = allUsersResponse.data
          } else if (allUsersResponse.data?.results && Array.isArray(allUsersResponse.data.results)) {
            usersList = allUsersResponse.data.results
          } else if (allUsersResponse.data?.users && Array.isArray(allUsersResponse.data.users)) {
            usersList = allUsersResponse.data.users
          }
          
          console.log('� Utilisateurs totaux:', usersList.length)
          
          // Filtrer par université côté client
          const filteredUsers = usersList.filter(user => {
            const userUniversityId = user.university_id || user.university?.id
            const match = userUniversityId === currentUser.university_id
            
            if (import.meta.env.DEV) {
              console.log('👤 User:', user.email, 'University:', userUniversityId, 'Match admin university:', match)
            }
            
            return match
          })
          
          console.log('🎯 Utilisateurs filtrés pour cette université:', filteredUsers.length)
          
          // Retourner la même structure avec les utilisateurs filtrés
          return {
            ...allUsersResponse,
            data: Array.isArray(allUsersResponse.data) 
              ? filteredUsers 
              : { ...allUsersResponse.data, results: filteredUsers }
          }
        } else {
          // Si pas d'université définie, retourner tous les utilisateurs
          console.warn('⚠️ Admin sans université définie, retour de tous les utilisateurs')
          return allUsersResponse
        }
        
      } catch (apiError) {
        console.error('❌ Erreur API lors de la récupération des utilisateurs:', apiError)
        throw apiError
      }

    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs pour l\'admin:', error)
      
      // Fallback : essayer de charger depuis localStorage
      try {
        console.log('🔄 Fallback vers localStorage...')
        const savedUsers = localStorage.getItem('ccc_users')
        if (savedUsers) {
          const allUsers = JSON.parse(savedUsers)
          const currentUser = JSON.parse(localStorage.getItem('ccc_currentUser') || '{}')
          
          let filteredUsers = allUsers
          if (currentUser.university_id) {
            filteredUsers = allUsers.filter(user => 
              (user.university_id || user.university?.id) === currentUser.university_id
            )
          }
          
          console.log('🔄 Fallback localStorage - utilisateurs trouvés:', filteredUsers.length)
          
          return createApiResponse(API_RESPONSE_TYPES.SUCCESS, filteredUsers, 'Données chargées depuis localStorage')
        } else {
          // Créer des données de test si rien n'existe
          console.log('🧪 Création de données de test...')
          const testUsers = this.createTestUsers(currentUser.university_id)
          localStorage.setItem('ccc_users', JSON.stringify(testUsers))
          
          return createApiResponse(API_RESPONSE_TYPES.SUCCESS, testUsers, 'Données de test créées')
        }
      } catch (fallbackError) {
        console.error('Erreur fallback localStorage:', fallbackError)
      }
      
      throw error
    }
  }

  // Créer des utilisateurs de test pour une université
  createTestUsers(universityId = 'univ_test') {
    const testUsers = [
      {
        id: '1',
        email: 'admin.test@ccc.com',
        first_name: 'Admin',
        last_name: 'Test',
        role: 'ADMIN',
        university_id: universityId,
        university: { id: universityId, name: 'CCC Web News University' },
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        email: 'prof.test@ccc.com',
        first_name: 'Professeur',
        last_name: 'Test',
        role: 'PUBLIANT',
        university_id: universityId,
        university: { id: universityId, name: 'CCC Web News University' },
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        email: 'etudiant.test@ccc.com',
        first_name: 'Étudiant',
        last_name: 'Test',
        role: 'STUDENT',
        university_id: universityId,
        university: { id: universityId, name: 'CCC Web News University' },
        is_active: true,
        created_at: new Date().toISOString()
      }
    ]
    
    console.log('🧪 Utilisateurs de test créés:', testUsers.length)
    return testUsers
  }

  // Obtenir le profil utilisateur connecté
  async getProfile() {
    try {
      const response = await httpService.get(API_ENDPOINTS.USERS.PROFILE)
      return response
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
      throw error
    }
  }

  // Mettre à jour le profil utilisateur
  async updateProfile(profileData) {
    try {
      const response = await httpService.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, profileData)
      return response
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error)
      throw error
    }
  }

  // Récupérer les statistiques de l'utilisateur connecté
  async getCurrentUserStatistics() {
    try {
      const cacheKey = this.getCacheKey('current_user_stats', {})
      
      const cachedData = this.getCachedData(cacheKey)
      if (cachedData) {
        return cachedData
      }

      // Récupérer les statistiques via l'endpoint profile avec query param
      const response = await httpService.get(`${API_ENDPOINTS.USERS.PROFILE}stats/`)

      if (response.success) {
        this.setCachedData(cacheKey, response)
      }

      return response
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques utilisateur:', error)
      
      // Fallback : calculer les statistiques côté client
      return await this.calculateUserStatsFromNews()
    }
  }

  // Fallback : calculer les statistiques à partir des actualités locales
  async calculateUserStatsFromNews() {
    try {
      const currentUser = JSON.parse(localStorage.getItem('ccc_currentUser') || '{}')
      
      // Récupérer les actualités depuis l'API ou localStorage
      let newsData = []
      try {
        // Essayer de récupérer depuis l'API (via news service si disponible)
        const newsResponse = await fetch('/api/v1/news/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('ccc_access_token')}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (newsResponse.ok) {
          const data = await newsResponse.json()
          newsData = data.results || data || []
        }
      } catch (apiError) {
        console.log('API non disponible, utilisation localStorage')
        newsData = JSON.parse(localStorage.getItem('ccc_news') || '[]')
      }

      const articlesPublished = newsData.filter(
        article => article.author_id === currentUser.id || article.author?.id === currentUser.id
      ).length

      const articlesModerated = newsData.filter(
        article => article.moderator_id === currentUser.id || article.moderator?.id === currentUser.id
      ).length

      // Calculer le nombre de jours de membre
      const memberSince = currentUser.date_joined || currentUser.created_at || new Date().toISOString()
      const memberDate = new Date(memberSince)
      const today = new Date()
      const membershipDays = Math.floor((today - memberDate) / (1000 * 60 * 60 * 24))

      // Simuler les vues totales basées sur l'activité
      const totalViews = (articlesPublished * 50) + (articlesModerated * 20) + Math.floor(Math.random() * 100)

      return {
        success: true,
        data: {
          articlesPublished: articlesPublished,
          articlesModerated: articlesModerated,
          totalViews: totalViews,
          membershipDays: Math.max(membershipDays, 0) // S'assurer qu'on n'a pas de valeurs négatives
        }
      }
    } catch (error) {
      console.error('Erreur calcul statistiques fallback:', error)
      return {
        success: false,
        data: {
          articlesPublished: 0,
          articlesModerated: 0,
          totalViews: 0,
          membershipDays: 0
        }
      }
    }
  }

  // Changer le mot de passe
  async changePassword(passwordData) {
    try {
      const response = await httpService.put(API_ENDPOINTS.USERS.CHANGE_PASSWORD, passwordData)
      return response
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error)
      throw error
    }
  }

  // Obtenir les statistiques utilisateur
  async getUserStatistics(universityId = null) {
    try {
      const cacheKey = this.getCacheKey('user_stats', { universityId })
      
      const cachedData = this.getCachedData(cacheKey)
      if (cachedData) {
        return cachedData
      }

      const queryParams = universityId ? { university_id: universityId } : {}
      const response = await httpService.get(API_ENDPOINTS.USERS.STATISTICS, queryParams)

      if (response.success) {
        this.setCachedData(cacheKey, response)
      }

      return response
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
      throw error
    }
  }

  // Formater un utilisateur pour l'affichage
  formatUser(user) {
    return {
      id: user.id,
      first_name: user.first_name || user.firstname || '',
      last_name: user.last_name || user.lastname || '',
      email: user.email || '',
      role: user.role || 'STUDENT',
      faculty: user.faculty || null,
      department: user.department || null,
      university: user.university || null,
      university_id: user.university_id || user.university?.id || null,
      created_at: user.created_at || new Date().toISOString(),
      last_login: user.last_login || null,
      is_active: user.is_active !== false,
      profile_image: user.profile_image || null
    }
  }

  // Valider les permissions de modification
  canModifyUser(targetUser, currentUser) {
    // Seuls les admins peuvent modifier
    if (currentUser.role !== 'ADMIN') {
      return false
    }

    // Les admins ne peuvent modifier que les utilisateurs de leur établissement
    if (currentUser.university_id !== targetUser.university_id) {
      console.warn('Tentative de modification d\'utilisateur hors établissement:', {
        admin_university: currentUser.university_id,
        target_university: targetUser.university_id
      })
      return false
    }

    return true
  }

  // Vérifier si l'utilisateur peut supprimer un utilisateur
  canDeleteUser(targetUser, currentUser, allUsers) {
    if (!this.canModifyUser(targetUser, currentUser)) {
      return false
    }

    // Ne pas se supprimer soi-même
    if (currentUser.id === targetUser.id) {
      return false
    }

    // Vérifier qu'il n'y a pas qu'un seul admin dans l'établissement
    const adminsInUniversity = allUsers.filter(user => 
      user.role === 'ADMIN' && 
      user.university_id === currentUser.university_id
    )

    if (targetUser.role === 'ADMIN' && adminsInUniversity.length === 1) {
      console.warn('Tentative de suppression du dernier admin de l\'établissement')
      return false
    }

    return true
  }

  // Invalider le cache d'un utilisateur spécifique
  invalidateUserCache(userId) {
    for (const key of this.cache.keys()) {
      if (key.includes(`"id":"${userId}"`)) {
        this.cache.delete(key)
      }
    }
  }

  // Invalider le cache de la liste des utilisateurs
  invalidateUsersCache() {
    for (const key of this.cache.keys()) {
      if (key.startsWith('users_')) {
        this.cache.delete(key)
      }
    }
  }

  // Cache management
  clearCache() {
    this.cache.clear()
  }

  getCacheKey(method, params = {}) {
    return `${method}_${JSON.stringify(params)}`
  }

  getCachedData(key) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }
    return null
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }
}

export const userService = new UserService()