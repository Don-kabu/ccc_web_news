import { API_CONFIG, getAuthHeaders, buildApiUrl, createApiResponse, API_RESPONSE_TYPES, HTTP_STATUS } from './api.config.js'

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
  }

  // Intercepteur pour les requêtes
  async interceptRequest(url, options = {}) {
    // Ajouter le token d'authentification
    const headers = {
      ...this.defaultOptions.headers,
      ...getAuthHeaders(),
      ...options.headers
    }

    // Log des requêtes en mode développement
    if (import.meta.env.DEV) {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`, {
        headers,
        body: options.body
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
        this.handleUnauthorized()
        throw new ApiError('Session expirée', HTTP_STATUS.UNAUTHORIZED, errorData)
      }

      if (response.status === HTTP_STATUS.FORBIDDEN) {
        throw new ApiError('Accès refusé', HTTP_STATUS.FORBIDDEN, errorData)
      }

      if (response.status === HTTP_STATUS.NOT_FOUND) {
        throw new ApiError('Ressource non trouvée', HTTP_STATUS.NOT_FOUND, errorData)
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

  // Gestion de la déconnexion automatique
  handleUnauthorized() {
    localStorage.removeItem('ccc_access_token')
    localStorage.removeItem('ccc_refresh_token')
    localStorage.removeItem('ccc_currentUser')
    
    // Émettre un événement pour déclencher la déconnexion
    window.dispatchEvent(new CustomEvent('auth:logout', { 
      detail: { reason: 'token_expired' }
    }))
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
      return await interceptedResponse.json()
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