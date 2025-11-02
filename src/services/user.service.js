import { httpService } from './http.service.js'
import { API_ENDPOINTS, createApiResponse, API_RESPONSE_TYPES } from './api.config.js'

// Service de gestion des utilisateurs
class UserService {
  constructor() {
    this.cache = new Map()
    this.cacheTimeout = 10 * 60 * 1000 // 10 minutes
  }

  // Obtenir la liste des utilisateurs avec filtres et pagination
  async getUsers(params = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        role = null,
        university_id = null,
        search = null,
        status = null,
        sort_by = 'created_at',
        sort_order = 'desc'
      } = params

      const queryParams = {
        page,
        limit,
        sort_by,
        sort_order
      }

      // Ajouter les filtres optionnels
      if (role) queryParams.role = role
      if (university_id) queryParams.university_id = university_id
      if (search) queryParams.search = search
      if (status) queryParams.status = status

      const response = await httpService.get(API_ENDPOINTS.USERS.LIST, queryParams)
      return response
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
      throw error
    }
  }

  // Obtenir un utilisateur par son ID
  async getUserById(id) {
    try {
      // Vérifier le cache
      const cacheKey = `user_${id}`
      const cached = this.cache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }

      const response = await httpService.get(API_ENDPOINTS.USERS.GET_BY_ID.replace(':id', id))
      
      // Mettre en cache
      this.cache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      })

      return response
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error)
      throw error
    }
  }

  // Créer un nouvel utilisateur (admin seulement)
  async createUser(userData) {
    try {
      const response = await httpService.post(API_ENDPOINTS.USERS.CREATE, {
        email: userData.email,
        firstname: userData.firstname,
        lastname: userData.lastname,
        role: userData.role,
        university_id: userData.university_id,
        password: userData.password
      })

      if (response.status === API_RESPONSE_TYPES.SUCCESS) {
        // Invalider le cache des listes
        this.invalidateListCache()
        
        // Émettre un événement pour notifier la création
        window.dispatchEvent(new CustomEvent('user:created', {
          detail: { user: response.data }
        }))
      }

      return response
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error)
      throw error
    }
  }

  // Mettre à jour un utilisateur
  async updateUser(id, updates) {
    try {
      const response = await httpService.put(
        API_ENDPOINTS.USERS.UPDATE.replace(':id', id),
        updates
      )

      if (response.status === API_RESPONSE_TYPES.SUCCESS) {
        // Invalider le cache
        this.cache.delete(`user_${id}`)
        this.invalidateListCache()
        
        // Émettre un événement pour notifier la mise à jour
        window.dispatchEvent(new CustomEvent('user:updated', {
          detail: { user: response.data }
        }))
      }

      return response
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error)
      throw error
    }
  }

  // Supprimer un utilisateur
  async deleteUser(id) {
    try {
      const response = await httpService.delete(
        API_ENDPOINTS.USERS.DELETE.replace(':id', id)
      )

      if (response.status === API_RESPONSE_TYPES.SUCCESS) {
        // Invalider le cache
        this.cache.delete(`user_${id}`)
        this.invalidateListCache()
        
        // Émettre un événement pour notifier la suppression
        window.dispatchEvent(new CustomEvent('user:deleted', {
          detail: { userId: id }
        }))
      }

      return response
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error)
      throw error
    }
  }

  // Activer/désactiver un utilisateur
  async toggleUserStatus(id, active = true) {
    try {
      const endpoint = active 
        ? API_ENDPOINTS.USERS.ACTIVATE.replace(':id', id)
        : API_ENDPOINTS.USERS.DEACTIVATE.replace(':id', id)

      const response = await httpService.patch(endpoint)

      if (response.status === API_RESPONSE_TYPES.SUCCESS) {
        // Invalider le cache
        this.cache.delete(`user_${id}`)
        this.invalidateListCache()
        
        // Émettre un événement pour notifier le changement de statut
        window.dispatchEvent(new CustomEvent('user:status_changed', {
          detail: { userId: id, active }
        }))
      }

      return response
    } catch (error) {
      console.error('Erreur lors du changement de statut de l\'utilisateur:', error)
      throw error
    }
  }

  // Changer le rôle d'un utilisateur
  async changeUserRole(id, newRole) {
    try {
      const response = await httpService.patch(
        API_ENDPOINTS.USERS.CHANGE_ROLE.replace(':id', id),
        { role: newRole }
      )

      if (response.status === API_RESPONSE_TYPES.SUCCESS) {
        // Invalider le cache
        this.cache.delete(`user_${id}`)
        this.invalidateListCache()
        
        // Émettre un événement pour notifier le changement de rôle
        window.dispatchEvent(new CustomEvent('user:role_changed', {
          detail: { userId: id, newRole }
        }))
      }

      return response
    } catch (error) {
      console.error('Erreur lors du changement de rôle de l\'utilisateur:', error)
      throw error
    }
  }

  // Obtenir le profil de l'utilisateur connecté
  async getCurrentUserProfile() {
    try {
      const response = await httpService.get(API_ENDPOINTS.USERS.PROFILE)
      return response
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
      throw error
    }
  }

  // Mettre à jour le profil de l'utilisateur connecté
  async updateProfile(profileData) {
    try {
      const response = await httpService.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, {
        firstname: profileData.firstname,
        lastname: profileData.lastname,
        bio: profileData.bio,
        phone: profileData.phone,
        avatar_url: profileData.avatar_url
      })

      if (response.status === API_RESPONSE_TYPES.SUCCESS) {
        // Émettre un événement pour notifier la mise à jour du profil
        window.dispatchEvent(new CustomEvent('user:profile_updated', {
          detail: { profile: response.data }
        }))
      }

      return response
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error)
      throw error
    }
  }

  // Upload d'avatar
  async uploadAvatar(file, onProgress = null) {
    try {
      const response = await httpService.uploadFile(
        API_ENDPOINTS.MEDIA.UPLOAD_AVATAR,
        file,
        onProgress
      )

      if (response.status === API_RESPONSE_TYPES.SUCCESS) {
        // Émettre un événement pour notifier l'upload d'avatar
        window.dispatchEvent(new CustomEvent('user:avatar_uploaded', {
          detail: { avatarUrl: response.data.url }
        }))
      }

      return response
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'avatar:', error)
      throw error
    }
  }

  // Obtenir les utilisateurs par université
  async getUsersByUniversity(universityId, params = {}) {
    try {
      const queryParams = {
        university_id: universityId,
        ...params
      }

      const response = await httpService.get(API_ENDPOINTS.USERS.BY_UNIVERSITY, queryParams)
      return response
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs par université:', error)
      throw error
    }
  }

  // Obtenir les utilisateurs par rôle
  async getUsersByRole(role, params = {}) {
    try {
      const queryParams = {
        role,
        ...params
      }

      const response = await httpService.get(API_ENDPOINTS.USERS.BY_ROLE, queryParams)
      return response
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs par rôle:', error)
      throw error
    }
  }

  // Rechercher des utilisateurs
  async searchUsers(query, filters = {}) {
    try {
      const params = {
        search: query,
        ...filters
      }

      const response = await httpService.get(API_ENDPOINTS.USERS.SEARCH, params)
      return response
    } catch (error) {
      console.error('Erreur lors de la recherche d\'utilisateurs:', error)
      throw error
    }
  }

  // Obtenir les statistiques des utilisateurs
  async getUserStats(params = {}) {
    try {
      const response = await httpService.get(API_ENDPOINTS.USERS.STATS, params)
      return response
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques utilisateurs:', error)
      throw error
    }
  }

  // Obtenir l'historique d'activité d'un utilisateur
  async getUserActivity(id, params = {}) {
    try {
      const response = await httpService.get(
        API_ENDPOINTS.USERS.ACTIVITY.replace(':id', id),
        params
      )
      return response
    } catch (error) {
      console.error('Erreur lors du chargement de l\'activité utilisateur:', error)
      throw error
    }
  }

  // Réinitialiser le mot de passe d'un utilisateur (admin)
  async resetUserPassword(id) {
    try {
      const response = await httpService.post(
        API_ENDPOINTS.USERS.RESET_PASSWORD.replace(':id', id)
      )

      if (response.status === API_RESPONSE_TYPES.SUCCESS) {
        // Émettre un événement pour notifier la réinitialisation
        window.dispatchEvent(new CustomEvent('user:password_reset', {
          detail: { userId: id }
        }))
      }

      return response
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error)
      throw error
    }
  }

  // Envoyer une invitation par email
  async sendInvitation(email, role, universityId) {
    try {
      const response = await httpService.post(API_ENDPOINTS.USERS.INVITE, {
        email,
        role,
        university_id: universityId
      })

      if (response.status === API_RESPONSE_TYPES.SUCCESS) {
        // Émettre un événement pour notifier l'invitation
        window.dispatchEvent(new CustomEvent('user:invited', {
          detail: { email, role, universityId }
        }))
      }

      return response
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'invitation:', error)
      throw error
    }
  }

  // Invalider le cache des listes
  invalidateListCache() {
    for (const key of this.cache.keys()) {
      if (key.startsWith('users_list_')) {
        this.cache.delete(key)
      }
    }
  }

  // Nettoyer le cache expiré
  cleanExpiredCache() {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key)
      }
    }
  }

  // Vider tout le cache
  clearCache() {
    this.cache.clear()
  }
}

// Instance singleton du service utilisateurs
export const userService = new UserService()

// Nettoyer le cache périodiquement
setInterval(() => {
  userService.cleanExpiredCache()
}, 60000) // Chaque minute