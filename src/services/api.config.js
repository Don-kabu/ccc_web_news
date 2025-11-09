// Configuration de base de l'API
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://univers-news-ccc-kabu.onrender.com/api/v1',
  timeout: 30000, // 30 secondes
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}

// Types de réponse API standardisés
export const API_RESPONSE_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  VALIDATION_ERROR: 'validation_error',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not_found',
  CONFLICT: 'conflict',
  SERVER_ERROR: 'server_error'
}

// Codes de statut HTTP
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  INTERNAL_SERVER_ERROR: 500
}

// Configuration des endpoints API
export const API_ENDPOINTS = {
  // Authentification
  AUTH: {
    LOGIN: '/auth/login/',
    REGISTER: '/auth/register/user/',
    REGISTER_UNIVERSITY: '/auth/register/university/', 
    JOIN_UNIVERSITY: '/auth/register/user/',
    SEND_OTP: '/auth/send-otp/',
    VERIFY_OTP: '/auth/verify-otp/',
    REFRESH_TOKEN: '/auth/refresh/',
    LOGOUT: '/auth/logout/',
    FORGOT_PASSWORD: '/auth/forgot-password/',
    RESET_PASSWORD: '/auth/reset-password/'
  },

  // Utilisateurs
  USERS: {
    BASE: '/users/',
    PROFILE: '/users/profile/',
    UPDATE_PROFILE: '/users/profile/',
    CHANGE_PASSWORD: '/users/password/',
    STATISTICS: '/users/stats/'
  },

  // Universités
  UNIVERSITIES: {
    BASE: '/universities/',
    BY_ID: (id) => `/universities/${id}/`,
    STATISTICS: (id) => `/universities/${id}/stats/`
  },

  // Actualités
  NEWS: {
    BASE: '/news/',
    BY_ID: (id) => `/news/${id}/`,
    CREATE: '/news/',
    UPDATE: (id) => `/news/${id}/`,
    DELETE: (id) => `/news/${id}/`,
    STATUS: (id) => `/news/${id}/status/`,
    VIEW: (id) => `/news/${id}/view/`
  },

  // Notifications
  NOTIFICATIONS: {
    BASE: '/notifications/',
    BY_ID: (id) => `/notifications/${id}/`,
    MARK_READ: '/notifications/mark_as_read/',
    MARK_ALL_READ: '/notifications/mark_all_as_read/',
    STATISTICS: '/notifications/stats/'
  },

  // Analytics
  ANALYTICS: {
    NEWS: '/analytics/news/'
  }
}

// Headers par défaut avec token d'authentification
export const getAuthHeaders = () => {
  const token = localStorage.getItem('ccc_access_token')
  
  // Debug en mode développement
  if (import.meta.env.DEV) {
    console.log('🔑 getAuthHeaders() called:', {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'Aucun token',
      fullTokenLength: token ? token.length : 0
    })
  }
  
  const headers = {
    ...API_CONFIG.headers,
    ...(token && { Authorization: `Bearer ${token}` })
  }
  
  if (import.meta.env.DEV && token) {
    console.log('🔑 Authorization header créé:', headers.Authorization ? headers.Authorization.substring(0, 20) + '...' : 'Aucun header')
  }
  
  return headers
}

// Construction d'URL complète
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.baseUrl}${endpoint}`
}

// Validation des réponses API
export const isValidApiResponse = (response) => {
  return response && 
         typeof response === 'object' && 
         'status' in response && 
         'data' in response
}

// Format de réponse API standardisé
export const createApiResponse = (status, data = null, message = '', errors = null) => {
  return {
    status,
    data,
    message,
    errors,
    timestamp: new Date().toISOString()
  }
}