// composables/useApi.js - Composable pour faciliter l'utilisation des services API

import { ref, computed } from 'vue'
import { 
  authService, 
  newsService, 
  userService, 
  universityService, 
  moderationService 
} from '@/services'

export function useApi() {
  const isLoading = ref(false)
  const error = ref(null)
  const data = ref(null)

  // État de l'authentification
  const isAuthenticated = computed(() => authService.isLoggedIn())
  const currentUser = computed(() => authService.getCurrentUser())

  // Fonction générique pour exécuter des appels API
  const execute = async (apiCall, loadingKey = null) => {
    if (loadingKey) {
      if (typeof isLoading.value === 'object') {
        isLoading.value[loadingKey] = true
      } else {
        isLoading.value = true
      }
    } else {
      isLoading.value = true
    }
    
    error.value = null

    try {
      const response = await apiCall()
      
      if (response.status === 'success') {
        data.value = response.data
        return response
      } else {
        throw new Error(response.message || 'Erreur inconnue')
      }
    } catch (err) {
      error.value = err.message || 'Une erreur est survenue'
      console.error('Erreur API:', err)
      throw err
    } finally {
      if (loadingKey) {
        if (typeof isLoading.value === 'object') {
          isLoading.value[loadingKey] = false
        } else {
          isLoading.value = false
        }
      } else {
        isLoading.value = false
      }
    }
  }

  // Méthodes d'authentification
  const login = async (credentials) => {
    return execute(() => authService.login(credentials))
  }

  const register = async (userData) => {
    return execute(() => authService.register(userData))
  }

  const logout = async () => {
    return execute(() => authService.logout())
  }

  const checkAuthStatus = async () => {
    return execute(() => authService.checkAuthStatus())
  }

  // Méthodes pour les actualités
  const getNews = async (params = {}) => {
    return execute(() => newsService.getNews(params))
  }

  const getNewsById = async (id) => {
    return execute(() => newsService.getNewsById(id))
  }

  const createNews = async (newsData) => {
    return execute(() => newsService.createNews(newsData))
  }

  const updateNews = async (id, updates) => {
    return execute(() => newsService.updateNews(id, updates))
  }

  const deleteNews = async (id) => {
    return execute(() => newsService.deleteNews(id))
  }

  const publishNews = async (id) => {
    return execute(() => newsService.publishNews(id))
  }

  const unpublishNews = async (id) => {
    return execute(() => newsService.unpublishNews(id))
  }

  const getFeaturedNews = async (limit = 5) => {
    return execute(() => newsService.getFeaturedNews(limit))
  }

  // Méthodes pour les utilisateurs
  const getUsers = async (params = {}) => {
    return execute(() => userService.getUsers(params))
  }

  const getUserById = async (id) => {
    return execute(() => userService.getUserById(id))
  }

  const createUser = async (userData) => {
    return execute(() => userService.createUser(userData))
  }

  const updateUser = async (id, updates) => {
    return execute(() => userService.updateUser(id, updates))
  }

  const deleteUser = async (id) => {
    return execute(() => userService.deleteUser(id))
  }

  const updateProfile = async (profileData) => {
    return execute(() => userService.updateProfile(profileData))
  }

  const uploadAvatar = async (file, onProgress = null) => {
    return execute(() => userService.uploadAvatar(file, onProgress))
  }

  // Méthodes pour les universités
  const getUniversities = async (params = {}) => {
    return execute(() => universityService.getUniversities(params))
  }

  const getUniversityById = async (id) => {
    return execute(() => universityService.getUniversityById(id))
  }

  const createUniversity = async (universityData) => {
    return execute(() => universityService.createUniversity(universityData))
  }

  const updateUniversity = async (id, updates) => {
    return execute(() => universityService.updateUniversity(id, updates))
  }

  const deleteUniversity = async (id) => {
    return execute(() => universityService.deleteUniversity(id))
  }

  // Méthodes pour la modération
  const getPendingItems = async (params = {}) => {
    return execute(() => moderationService.getPendingItems(params))
  }

  const approveItem = async (itemType, itemId, reason = null) => {
    return execute(() => moderationService.approveItem(itemType, itemId, reason))
  }

  const rejectItem = async (itemType, itemId, reason) => {
    return execute(() => moderationService.rejectItem(itemType, itemId, reason))
  }

  const reportContent = async (contentType, contentId, reason, description = null) => {
    return execute(() => moderationService.reportContent(contentType, contentId, reason, description))
  }

  // Utilitaires pour la gestion d'état multiple
  const createLoadingState = (keys = []) => {
    const loadingState = ref({})
    
    keys.forEach(key => {
      loadingState.value[key] = false
    })
    
    return {
      loading: loadingState,
      setLoading: (key, value) => {
        loadingState.value[key] = value
      },
      isLoading: (key) => loadingState.value[key] || false
    }
  }

  // Gestion des erreurs avec retry
  const executeWithRetry = async (apiCall, maxRetries = 3, delay = 1000) => {
    let lastError = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await execute(apiCall)
      } catch (err) {
        lastError = err
        
        if (attempt < maxRetries) {
          // Attendre avant de réessayer
          await new Promise(resolve => setTimeout(resolve, delay * attempt))
        }
      }
    }
    
    throw lastError
  }

  // Cache local simple pour éviter les requêtes répétées
  const cache = new Map()
  const executeWithCache = async (apiCall, cacheKey, ttl = 5 * 60 * 1000) => {
    const cached = cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      data.value = cached.data
      return { status: 'success', data: cached.data }
    }
    
    const response = await execute(apiCall)
    
    if (response.status === 'success') {
      cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      })
    }
    
    return response
  }

  // Nettoyer le cache
  const clearCache = (pattern = null) => {
    if (pattern) {
      for (const key of cache.keys()) {
        if (key.includes(pattern)) {
          cache.delete(key)
        }
      }
    } else {
      cache.clear()
    }
  }

  return {
    // État
    isLoading,
    error,
    data,
    isAuthenticated,
    currentUser,
    
    // Méthodes génériques
    execute,
    executeWithRetry,
    executeWithCache,
    createLoadingState,
    clearCache,
    
    // Authentification
    login,
    register,
    logout,
    checkAuthStatus,
    
    // Actualités
    getNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews,
    publishNews,
    unpublishNews,
    getFeaturedNews,
    
    // Utilisateurs
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    updateProfile,
    uploadAvatar,
    
    // Universités
    getUniversities,
    getUniversityById,
    createUniversity,
    updateUniversity,
    deleteUniversity,
    
    // Modération
    getPendingItems,
    approveItem,
    rejectItem,
    reportContent
  }
}

// Composable spécialisé pour les actualités
export function useNews() {
  const api = useApi()
  
  const newsCache = ref(new Map())
  const filters = ref({
    status: 'approved',
    category: null,
    university_id: null,
    search: ''
  })
  
  const loadNews = async (params = {}) => {
    const finalParams = { ...filters.value, ...params }
    return api.getNews(finalParams)
  }
  
  const createArticle = async (articleData) => {
    const response = await api.createNews(articleData)
    // Invalider le cache
    newsCache.value.clear()
    return response
  }
  
  return {
    ...api,
    filters,
    loadNews,
    createArticle,
    cache: newsCache
  }
}

// Composable spécialisé pour l'authentification
export function useAuth() {
  const api = useApi()
  
  const loginWithRemember = async (credentials, remember = false) => {
    const response = await api.login(credentials)
    
    if (response.status === 'success' && remember) {
      localStorage.setItem('remembered_user', JSON.stringify(response.data.user))
    }
    
    return response
  }
  
  const logoutAndClear = async () => {
    await api.logout()
    localStorage.removeItem('remembered_user')
    api.clearCache()
  }
  
  return {
    ...api,
    loginWithRemember,
    logoutAndClear
  }
}