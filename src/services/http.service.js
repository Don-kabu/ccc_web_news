import { API_CONFIG, getAuthHeaders, buildApiUrl, createApiResponse, API_RESPONSE_TYPES, HTTP_STATUS } from './api.config.js'
import { validateApiRequest, validateApiResponse } from './api-schema-validator.js'

// Classe pour gérer les erreurs API
class ApiError extends Error {
  constructor(message, status, response = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.response = response
  }
}

// Service HTTP de base avec intercepteurs
class HttpService {
  constructor() {
    this.defaultOptions = {
      headers: API_CONFIG.headers,
      timeout: API_CONFIG.timeout
    }
    // Stocker la dernière requête pour pouvoir la relancer
    this.lastRequestInfo = null
  }

  // Intercepteur pour les requêtes
  async interceptRequest(url, options = {}) {
    // Ajouter le token d'authentification
    const headers = {
      ...this.defaultOptions.headers,
      ...getAuthHeaders(),
      ...options.headers
    }

    // Stocker les informations de la requête pour pouvoir la relancer si nécessaire
    this.lastRequestInfo = {
      url,
      method: options.method || 'GET',
      body: options.body || null,
      originalHeaders: options.headers || {}
    }

    // Log des requêtes en mode développement
    if (import.meta.env.DEV) {
      const token = localStorage.getItem('ccc_access_token')
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`, {
        headers,
        body: options.body,
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'Aucun token'
      })
    }

    return {
      ...this.defaultOptions,
      ...options,
      headers
    }
  }

  // Intercepteur pour les réponses
  async interceptResponse(response, originalUrl) {
    // Log des réponses en mode développement
    if (import.meta.env.DEV) {
      console.log(`📡 API Response: ${response.status} ${originalUrl}`, response)
    }

    // Gestion des erreurs HTTP
    if (!response.ok) {
      let errorData = null
      
      try {
        errorData = await response.json()
      } catch (e) {
        errorData = { message: response.statusText }
      }

      // Gestion spécifique des erreurs d'authentification
      if (response.status === HTTP_STATUS.UNAUTHORIZED) {
        // Tenter de renouveler le token automatiquement
        const refreshResult = await this.tryTokenRefresh()
        
        if (refreshResult.success) {
          // Token renouvelé avec succès, relancer la requête originale
          console.log('✅ Token renouvelé automatiquement, relance de la requête')
          const retryResponse = await this.retryOriginalRequest(response, originalUrl)
          
          // Retourner directement la réponse relancée (déjà interceptée)
          return retryResponse
        } else {
          // Impossible de renouveler le token, déclencher la déconnexion
          this.handleUnauthorized()
          throw new ApiError('Session expirée', HTTP_STATUS.UNAUTHORIZED, errorData)
        }
      }

      if (response.status === HTTP_STATUS.FORBIDDEN) {
        throw new ApiError('Accès refusé', HTTP_STATUS.FORBIDDEN, errorData)
      }

      if (response.status === HTTP_STATUS.NOT_FOUND) {
        throw new ApiError('Ressource non trouvée', HTTP_STATUS.NOT_FOUND, errorData)
      }

      if (response.status === HTTP_STATUS.CONFLICT) {
        throw new ApiError('Conflit de ressource', HTTP_STATUS.CONFLICT, errorData)
      }

      if (response.status === HTTP_STATUS.VALIDATION_ERROR) {
        throw new ApiError('Erreur de validation', HTTP_STATUS.VALIDATION_ERROR, errorData)
      }

      throw new ApiError(
        errorData.message || `Erreur HTTP ${response.status}`,
        response.status,
        errorData
      )
    }

    return response
  }

  // Tentative de renouvellement automatique du token
  async tryTokenRefresh() {
    try {
      const refreshToken = localStorage.getItem('ccc_refresh_token')
      
      if (!refreshToken) {
        console.log('❌ Aucun refresh token disponible')
        return { success: false, reason: 'no_refresh_token' }
      }
      
      console.log('🔄 Tentative de renouvellement automatique du token...')
      
      // Import dynamique pour éviter la dépendance circulaire
      const { authService } = await import('./auth.service.js')
      
      const tokenData = await authService.refreshToken()
      
      if (tokenData && tokenData.access_token) {
        console.log('✅ Token renouvelé automatiquement')
        return { success: true, tokenData }
      }
      
      return { success: false, reason: 'refresh_failed' }
    } catch (error) {
      console.error('❌ Échec du renouvellement automatique:', error)
      return { success: false, reason: 'refresh_error', error }
    }
  }

  // Relancer la requête originale avec le nouveau token
  async retryOriginalRequest(originalResponse, originalUrl) {
    try {
      if (!this.lastRequestInfo) {
        throw new Error('Informations de requête non disponibles pour la relance')
      }
      
      // Recréer la requête avec les nouveaux headers (incluant le token renouvelé)
      const newOptions = await this.interceptRequest(this.lastRequestInfo.url, {
        method: this.lastRequestInfo.method,
        body: this.lastRequestInfo.body,
        headers: this.lastRequestInfo.originalHeaders
      })
      
      console.log(`🔄 Relance de la requête: ${this.lastRequestInfo.method} ${this.lastRequestInfo.url}`)
      
      const retryResponse = await fetch(this.lastRequestInfo.url, newOptions)
      return await this.interceptResponse(retryResponse, this.lastRequestInfo.url)
    } catch (error) {
      console.error('❌ Échec de la relance de la requête:', error)
      throw error
    }
  }

  // Gestion de la déconnexion automatique
  handleUnauthorized() {
    // Nettoyer la session locale
    localStorage.removeItem('ccc_access_token')
    localStorage.removeItem('ccc_refresh_token')
    localStorage.removeItem('ccc_currentUser')
    
    // Émettre un événement pour déclencher la déconnexion automatique
    window.dispatchEvent(new CustomEvent('auth:session-expired', { 
      detail: { 
        reason: 'token_expired',
        message: 'Session expirée, redirection vers la page de connexion...'
      }
    }))
    
    // Redirection automatique vers l'authentification
    setTimeout(() => {
      // Forcer le rechargement de la page pour revenir à l'état de connexion
      window.location.reload()
    }, 1500) // Délai de 1.5s pour laisser time à l'utilisateur de voir le message
  }

  // Méthode GET
  async get(endpoint, params = {}) {
    const url = new URL(buildApiUrl(endpoint))
    
    // Ajouter les paramètres de requête
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        url.searchParams.append(key, params[key])
      }
    })

    const options = await this.interceptRequest(url.toString(), {
      method: 'GET'
    })

    try {
      const response = await fetch(url.toString(), options)
      const interceptedResponse = await this.interceptResponse(response, endpoint)
      return await interceptedResponse.json()
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(`Erreur réseau: ${error.message}`, 0, null)
    }
  }

  // Méthode POST
  async post(endpoint, data = null, contentType = 'application/json') {
    // Validation avant envoi (en mode développement)
    if (import.meta.env.DEV && data && contentType === 'application/json') {
      try {
        validateApiRequest(endpoint, 'POST', data)
      } catch (validationError) {
        console.warn('⚠️ Validation échouée, requête envoyée quand même:', validationError.message)
      }
    }

    let body = null
    let headers = {}

    if (data) {
      if (contentType === 'application/json') {
        body = JSON.stringify(data)
        headers['Content-Type'] = 'application/json'
      } else if (data instanceof FormData) {
        body = data
        // Ne pas définir Content-Type pour FormData (géré automatiquement)
      } else {
        body = data
        headers['Content-Type'] = contentType
      }
    }

    const options = await this.interceptRequest(buildApiUrl(endpoint), {
      method: 'POST',
      body,
      headers
    })

    try {
      const response = await fetch(buildApiUrl(endpoint), options)
      const interceptedResponse = await this.interceptResponse(response, endpoint)
      const jsonResponse = await interceptedResponse.json()
      
      // Validation de la réponse (en mode développement)
      if (import.meta.env.DEV) {
        try {
          validateApiResponse(endpoint, jsonResponse)
        } catch (validationError) {
          console.warn('⚠️ Réponse non conforme au schéma:', validationError.message)
        }
      }
      
      return jsonResponse
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(`Erreur réseau: ${error.message}`, 0, null)
    }
  }

  // Méthode PUT
  async put(endpoint, data = null) {
    const options = await this.interceptRequest(buildApiUrl(endpoint), {
      method: 'PUT',
      body: data ? JSON.stringify(data) : null
    })

    try {
      const response = await fetch(buildApiUrl(endpoint), options)
      const interceptedResponse = await this.interceptResponse(response, endpoint)
      return await interceptedResponse.json()
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(`Erreur réseau: ${error.message}`, 0, null)
    }
  }

  // Méthode PATCH
  async patch(endpoint, data = null) {
    const options = await this.interceptRequest(buildApiUrl(endpoint), {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : null
    })

    try {
      const response = await fetch(buildApiUrl(endpoint), options)
      const interceptedResponse = await this.interceptResponse(response, endpoint)
      return await interceptedResponse.json()
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(`Erreur réseau: ${error.message}`, 0, null)
    }
  }

  // Méthode DELETE
  async delete(endpoint) {
    const options = await this.interceptRequest(buildApiUrl(endpoint), {
      method: 'DELETE'
    })

    try {
      const response = await fetch(buildApiUrl(endpoint), options)
      await this.interceptResponse(response, endpoint)
      
      // Retourner true pour les suppressions réussies sans contenu
      if (response.status === HTTP_STATUS.NO_CONTENT) {
        return createApiResponse(API_RESPONSE_TYPES.SUCCESS, true, 'Suppression réussie')
      }
      
      return await response.json()
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(`Erreur réseau: ${error.message}`, 0, null)
    }
  }

  // Upload de fichiers avec progression
  async uploadFile(endpoint, file, onProgress = null) {
    const formData = new FormData()
    formData.append('file', file)

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      // Gestion de la progression
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100)
            onProgress(progress)
          }
        })
      }

      // Gestion de la réponse
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            resolve(response)
          } catch (e) {
            resolve({ status: API_RESPONSE_TYPES.SUCCESS, data: xhr.responseText })
          }
        } else {
          reject(new ApiError(`Upload failed: ${xhr.statusText}`, xhr.status))
        }
      })

      // Gestion des erreurs
      xhr.addEventListener('error', () => {
        reject(new ApiError('Upload error', 0))
      })

      // Configuration et envoi
      xhr.open('POST', buildApiUrl(endpoint))
      
      // Ajouter les headers d'authentification
      const authHeaders = getAuthHeaders()
      Object.keys(authHeaders).forEach(key => {
        if (key !== 'Content-Type') { // Ne pas définir Content-Type pour FormData
          xhr.setRequestHeader(key, authHeaders[key])
        }
      })

      xhr.send(formData)
    })
  }
}

// Instance singleton du service HTTP
export const httpService = new HttpService()
export { ApiError }