import { API_ENDPOINTS, buildApiUrl } from './api.config.js'

// Service dédié aux opérations sur les tokens pour éviter les dépendances circulaires
class TokenService {
  // Renouveler le token d'accès
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('ccc_refresh_token')
      
      if (!refreshToken) {
        console.log('❌ Aucun refresh token disponible')
        return null
      }
      
      console.log('🔄 Renouvellement du token...')
      
      const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.REFRESH_TOKEN), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          refresh_token: refreshToken
        })
      })
      
      if (!response.ok) {
        console.error('❌ Échec du renouvellement du token:', response.status)
        return null
      }
      
      const data = await response.json()
      
      if (data.access_token) {
        // Sauvegarder les nouveaux tokens
        localStorage.setItem('ccc_access_token', data.access_token)
        
        if (data.refresh_token) {
          localStorage.setItem('ccc_refresh_token', data.refresh_token)
        }
        
        console.log('✅ Token renouvelé avec succès')
        return data
      }
      
      return null
    } catch (error) {
      console.error('❌ Erreur lors du renouvellement du token:', error)
      return null
    }
  }
}

export const tokenService = new TokenService()