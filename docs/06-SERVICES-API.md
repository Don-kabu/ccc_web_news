# 🌐 Services API - Couche de Communication

## 🎯 Vue d'ensemble

Les services API constituent la **couche de communication** entre votre application Vue.js et le backend. Ils gèrent tous les appels HTTP, l'authentification, et la gestion d'erreurs.

## 📁 Structure des services

```
src/services/
├── index.js              # 🚪 Point d'entrée principal
├── api.config.js         # ⚙️ Configuration et endpoints
├── http.service.js       # 🌐 Service HTTP de base
├── auth.service.js       # 🔐 Authentification
├── news.service.js       # 📰 Gestion des actualités
├── user.service.js       # 👤 Gestion des utilisateurs
├── university.service.js # 🏫 Gestion des universités
└── moderation.service.js # 🛡️ Système de modération
```

## ⚙️ api.config.js - Configuration Centrale

### 🎯 Rôle principal

Centralise **toutes les URLs** et la **configuration** de l'API.

### 🔧 Configuration de base

```javascript
// URL de base de votre API
export const API_CONFIG = {
  baseUrl: 'http://127.0.0.1:8000/api',  // ← Votre serveur backend
  timeout: 30000,                         // 30 secondes max par requête
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}
```

### 📡 Tous les endpoints

```javascript
export const API_ENDPOINTS = {
  // 🔐 Authentification
  AUTH: {
    LOGIN: '/auth/login',                    // POST - Connexion
    REGISTER: '/auth/register',              // POST - Inscription
    LOGOUT: '/auth/logout',                  // POST - Déconnexion
    REFRESH: '/auth/refresh',                // POST - Rafraîchir token
    ME: '/auth/me',                         // GET - Infos utilisateur
    FORGOT_PASSWORD: '/auth/forgot-password', // POST - Mot de passe oublié
    RESET_PASSWORD: '/auth/reset-password',   // POST - Réinitialiser
    CHANGE_PASSWORD: '/auth/change-password', // POST - Changer mot de passe
  },
  
  // 📰 Actualités
  NEWS: {
    LIST: '/news',                          // GET - Liste des actualités
    CREATE: '/news',                        // POST - Créer une actualité
    GET_BY_ID: '/news/:id',                // GET - Une actualité par ID
    UPDATE: '/news/:id',                    // PUT - Modifier
    DELETE: '/news/:id',                    // DELETE - Supprimer
    PUBLISH: '/news/:id/publish',           // PATCH - Publier
    UNPUBLISH: '/news/:id/unpublish',       // PATCH - Dépublier
    FEATURED: '/news/featured',             // GET - Actualités en vedette
    RECENT: '/news/recent',                 // GET - Actualités récentes
    CATEGORIES: '/news/categories',         // GET - Catégories
    STATS: '/news/stats',                   // GET - Statistiques
  },
  
  // 👤 Utilisateurs
  USERS: {
    LIST: '/users',                         // GET - Liste des utilisateurs
    CREATE: '/users',                       // POST - Créer utilisateur
    GET_BY_ID: '/users/:id',               // GET - Un utilisateur par ID
    UPDATE: '/users/:id',                   // PUT - Modifier
    DELETE: '/users/:id',                   // DELETE - Supprimer
    PROFILE: '/users/profile',              // GET - Mon profil
    UPDATE_PROFILE: '/users/profile',       // PUT - Modifier mon profil
  },
  
  // 🏫 Universités
  UNIVERSITIES: {
    LIST: '/universities',                  // GET - Liste des universités
    CREATE: '/universities',               // POST - Créer université
    GET_BY_ID: '/universities/:id',        // GET - Une université par ID
    UPDATE: '/universities/:id',           // PUT - Modifier
    DELETE: '/universities/:id',           // DELETE - Supprimer
  }
}
```

### 🔑 Gestion des tokens

```javascript
// Ajouter automatiquement le token d'authentification
export const getAuthHeaders = () => {
  const token = localStorage.getItem('ccc_access_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Construire une URL complète
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.baseUrl}${endpoint}`
}
```

## 🌐 http.service.js - Service HTTP de Base

### 🎯 Rôle principal

Service **fondamental** qui gère toutes les requêtes HTTP avec gestion d'erreurs automatique.

### 🔧 Fonctionnalités principales

```javascript
class HttpService {
  // GET - Récupérer des données
  async get(endpoint, params = {}) {
    const url = new URL(buildApiUrl(endpoint))
    
    // Ajouter les paramètres de requête (?search=test&page=1)
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        url.searchParams.append(key, params[key])
      }
    })
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { ...API_CONFIG.headers, ...getAuthHeaders() }
    })
    
    return this.handleResponse(response)
  }
  
  // POST - Envoyer des données
  async post(endpoint, data = null) {
    const response = await fetch(buildApiUrl(endpoint), {
      method: 'POST',
      headers: { ...API_CONFIG.headers, ...getAuthHeaders() },
      body: data ? JSON.stringify(data) : null
    })
    
    return this.handleResponse(response)
  }
  
  // Gestion automatique des erreurs
  async handleResponse(response) {
    if (!response.ok) {
      // 401 = Token expiré → Déconnexion automatique
      if (response.status === 401) {
        this.handleUnauthorized()
        throw new Error('Session expirée')
      }
      
      // 403 = Pas les permissions
      if (response.status === 403) {
        throw new Error('Accès refusé')
      }
      
      // Autres erreurs
      const errorData = await response.json()
      throw new Error(errorData.message || `Erreur HTTP ${response.status}`)
    }
    
    return await response.json()
  }
  
  // Déconnexion automatique
  handleUnauthorized() {
    localStorage.removeItem('ccc_access_token')
    localStorage.removeItem('ccc_currentUser')
    
    // Émettre un événement pour App.vue
    window.dispatchEvent(new CustomEvent('auth:logout', { 
      detail: { reason: 'token_expired' }
    }))
  }
}

// Instance unique réutilisable
export const httpService = new HttpService()
```

## 🔐 auth.service.js - Authentification

### 🎯 Rôle principal

Gère tout ce qui concerne l'**authentification** : connexion, inscription, tokens, etc.

### 🔧 Méthodes principales

```javascript
class AuthService {
  // Connexion
  async login(credentials) {
    try {
      const response = await httpService.post('/auth/login', {
        email: credentials.email,
        password: credentials.password
      })
      
      if (response.status === 'success') {
        // Sauvegarder les données utilisateur et tokens
        this.saveUserToStorage(response.data.user, response.data.tokens)
        
        // Émettre un événement de connexion réussie
        window.dispatchEvent(new CustomEvent('auth:login', { 
          detail: { user: response.data.user }
        }))
        
        return response
      }
    } catch (error) {
      console.error('Erreur de connexion:', error)
      throw error
    }
  }
  
  // Inscription
  async register(userData) {
    try {
      const response = await httpService.post('/auth/register', userData)
      
      if (response.status === 'success') {
        // Auto-connexion après inscription
        if (response.data.tokens) {
          this.saveUserToStorage(response.data.user, response.data.tokens)
        }
        
        return response
      }
    } catch (error) {
      console.error('Erreur d\'inscription:', error)
      throw error
    }
  }
  
  // Déconnexion
  async logout() {
    try {
      // Notifier le serveur
      await httpService.post('/auth/logout')
    } finally {
      // Nettoyer localement dans tous les cas
      this.clearSession()
    }
  }
  
  // Vérifier si l'utilisateur est connecté
  async checkAuthStatus() {
    try {
      if (!this.isAuthenticated) return false
      
      const response = await httpService.get('/auth/me')
      
      if (response.status === 'success') {
        // Mettre à jour les infos utilisateur
        this.currentUser = response.data
        localStorage.setItem('ccc_currentUser', JSON.stringify(response.data))
        return true
      }
      
      return false
    } catch (error) {
      // Si erreur d'auth, essayer de rafraîchir le token
      if (error.status === 401) {
        try {
          await this.refreshToken()
          return await this.checkAuthStatus() // Récursion une fois
        } catch (refreshError) {
          this.clearSession()
          return false
        }
      }
      
      return false
    }
  }
  
  // Rafraîchir le token automatiquement
  async refreshToken() {
    const refreshToken = localStorage.getItem('ccc_refresh_token')
    
    if (!refreshToken) {
      throw new Error('Aucun token de rafraîchissement')
    }
    
    const response = await httpService.post('/auth/refresh', {
      refresh_token: refreshToken
    })
    
    if (response.status === 'success') {
      // Mettre à jour les tokens
      localStorage.setItem('ccc_access_token', response.data.access_token)
      
      if (response.data.refresh_token) {
        localStorage.setItem('ccc_refresh_token', response.data.refresh_token)
      }
      
      return response.data
    }
    
    throw new Error('Impossible de rafraîchir le token')
  }
  
  // Obtenir l'utilisateur actuel
  getCurrentUser() {
    return this.currentUser
  }
  
  // Vérifier si connecté
  isLoggedIn() {
    return this.isAuthenticated && this.currentUser !== null
  }
}

// Instance unique
export const authService = new AuthService()
```

## 📰 news.service.js - Gestion des Actualités

### 🎯 Rôle principal

Toutes les opérations liées aux **actualités** : création, modification, suppression, etc.

### 🔧 Méthodes principales

```javascript
class NewsService {
  // Récupérer les actualités avec filtres
  async getNews(params = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status = null,        // 'pending', 'approved', 'rejected'
        category = null,      // 'académique', 'événement', etc.
        search = null,        // Recherche textuelle
        university_id = null, // Filtrer par université
        sort_by = 'created_at',
        sort_order = 'desc'
      } = params
      
      const queryParams = { page, limit, sort_by, sort_order }
      
      // Ajouter les filtres optionnels
      if (status) queryParams.status = status
      if (category) queryParams.category = category
      if (search) queryParams.search = search
      if (university_id) queryParams.university_id = university_id
      
      const response = await httpService.get('/news', queryParams)
      return response
    } catch (error) {
      console.error('Erreur chargement actualités:', error)
      throw error
    }
  }
  
  // Créer une nouvelle actualité
  async createNews(newsData) {
    try {
      const response = await httpService.post('/news', {
        title: newsData.title,
        content: newsData.content,
        excerpt: newsData.excerpt,
        category: newsData.category,
        tags: newsData.tags || [],
        featured: newsData.featured || false,
        image_url: newsData.image_url || null
      })
      
      if (response.status === 'success') {
        // Invalider le cache
        this.invalidateListCache()
        
        // Émettre un événement
        window.dispatchEvent(new CustomEvent('news:created', {
          detail: { news: response.data }
        }))
      }
      
      return response
    } catch (error) {
      console.error('Erreur création actualité:', error)
      throw error
    }
  }
  
  // Actualités en vedette
  async getFeaturedNews(limit = 5) {
    try {
      const response = await httpService.get('/news/featured', { limit })
      return response
    } catch (error) {
      console.error('Erreur actualités vedette:', error)
      throw error
    }
  }
  
  // Upload d'image
  async uploadNewsImage(file, onProgress = null) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      // Upload avec progression (si supporté)
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
        
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText))
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`))
          }
        })
        
        xhr.open('POST', buildApiUrl('/media/upload'))
        
        // Ajouter le token d'auth
        const authHeaders = getAuthHeaders()
        Object.keys(authHeaders).forEach(key => {
          xhr.setRequestHeader(key, authHeaders[key])
        })
        
        xhr.send(formData)
      })
    } catch (error) {
      console.error('Erreur upload image:', error)
      throw error
    }
  }
}

export const newsService = new NewsService()
```

## 🎣 Utilisation dans les composants

### 📝 Exemple dans PublishPage.vue

```javascript
<script setup>
import { ref, reactive } from 'vue'
import { newsService } from '@/services'

// État du formulaire
const article = reactive({
  title: '',
  content: '',
  category: '',
  featured: false
})

const isLoading = ref(false)
const error = ref(null)

// Publier l'article
const publishArticle = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    const response = await newsService.createNews(article)
    
    if (response.status === 'success') {
      alert('Article publié avec succès !')
      // Réinitialiser le formulaire
      Object.assign(article, {
        title: '',
        content: '',
        category: '',
        featured: false
      })
    }
  } catch (err) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}
</script>
```

### 🏠 Exemple dans HomePage.vue

```javascript
<script setup>
import { ref, onMounted } from 'vue'
import { newsService } from '@/services'

const featuredNews = ref([])
const recentNews = ref([])
const isLoading = ref(true)

// Charger les données au montage
onMounted(async () => {
  try {
    // Charger en parallèle
    const [featured, recent] = await Promise.all([
      newsService.getFeaturedNews(5),
      newsService.getNews({ limit: 10, status: 'approved' })
    ])
    
    featuredNews.value = featured.data
    recentNews.value = recent.data.articles
  } catch (error) {
    console.error('Erreur chargement accueil:', error)
  } finally {
    isLoading.value = false
  }
})
</script>
```

## 🔧 Fonctionnalités avancées

### 💾 Cache intelligent

```javascript
class NewsService {
  constructor() {
    this.cache = new Map()
    this.cacheTimeout = 5 * 60 * 1000 // 5 minutes
  }
  
  async getNewsById(id) {
    // Vérifier le cache
    const cacheKey = `news_${id}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }
    
    // Sinon, appeler l'API
    const response = await httpService.get(`/news/${id}`)
    
    // Mettre en cache
    this.cache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    })
    
    return response
  }
}
```

### 🔄 Retry automatique

```javascript
const executeWithRetry = async (apiCall, maxRetries = 3) => {
  let lastError = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall()
    } catch (error) {
      lastError = error
      
      if (attempt < maxRetries) {
        // Attendre avant de réessayer (1s, 2s, 3s)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
  }
  
  throw lastError
}
```

## 🐛 Debugging des APIs

### 🔍 Vérifier les appels

```javascript
// Dans http.service.js - Mode développement
if (import.meta.env.DEV) {
  console.log(`🌐 API Request: ${method} ${url}`, {
    headers,
    body: options.body
  })
}

// Après la réponse
if (import.meta.env.DEV) {
  console.log(`📡 API Response: ${response.status} ${url}`, response)
}
```

### 🧪 Tester les endpoints

```javascript
// Dans la console du navigateur
const { newsService } = window.__CCC_API_SERVICES__

// Tester une requête
await newsService.getNews({ limit: 5 })

// Tester avec des filtres
await newsService.getNews({ 
  category: 'académique', 
  search: 'test' 
})
```

## ⚠️ Points d'attention

### ❌ Erreurs communes

1. **URL incorrecte** : Vérifier `API_CONFIG.baseUrl`
2. **Token manquant** : Vérifier l'authentification
3. **CORS** : Configurer le backend pour accepter votre domaine
4. **Format de données** : Respecter les types attendus par l'API

### ✅ Bonnes pratiques

1. **Toujours encapsuler** les appels API dans try/catch
2. **Gérer les états de chargement** pour l'UX
3. **Implémenter le cache** pour les données statiques
4. **Retry automatique** pour les erreurs réseau
5. **Validation côté client** avant envoi

---

> 💡 **Debug tip** : Utilisez l'onglet Network des DevTools pour voir tous les appels API et leurs réponses en temps réel.