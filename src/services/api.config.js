// Configuration de base de l'API
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
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
  VALIDATION_ERROR: 422,
  INTERNAL_SERVER_ERROR: 500
}

// Configuration des endpoints API
export const API_ENDPOINTS = {
  // Authentification
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_OTP: '/auth/verify-otp',
    REFRESH_TOKEN: '/auth/refresh',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },

  // Utilisateurs
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    LIST: '/users',
    BY_ID: (id) => `/users/${id}`,
    UPDATE_ROLE: (id) => `/users/${id}/role`,
    DEACTIVATE: (id) => `/users/${id}/deactivate`,
    ACTIVATE: (id) => `/users/${id}/activate`,
    STATISTICS: '/users/statistics'
  },

  // Universités
  UNIVERSITIES: {
    BASE: '/universities',
    BY_ID: (id) => `/universities/${id}`,
    FACULTIES: (id) => `/universities/${id}/faculties`,
    DEPARTMENTS: (universityId, facultyId) => `/universities/${universityId}/faculties/${facultyId}/departments`,
    STATISTICS: (id) => `/universities/${id}/statistics`
  },

  // Actualités
  NEWS: {
    BASE: '/news',
    BY_ID: (id) => `/news/${id}`,
    CREATE: '/news',
    UPDATE: (id) => `/news/${id}`,
    DELETE: (id) => `/news/${id}`,
    PUBLISH: (id) => `/news/${id}/publish`,
    MODERATE: (id) => `/news/${id}/moderate`,
    VALIDATE: (id) => `/news/${id}/validate`,
    REJECT: (id) => `/news/${id}/reject`,
    LIKE: (id) => `/news/${id}/like`,
    UNLIKE: (id) => `/news/${id}/unlike`,
    VIEW: (id) => `/news/${id}/view`,
    COMMENTS: (id) => `/news/${id}/comments`,
    ATTACHMENTS: (id) => `/news/${id}/attachments`,
    STATISTICS: '/news/statistics',
    SEARCH: '/news/search',
    BY_AUTHOR: (authorId) => `/news/author/${authorId}`,
    BY_CATEGORY: (category) => `/news/category/${category}`,
    BY_STATUS: (status) => `/news/status/${status}`,
    PENDING: '/news/pending',
    APPROVED: '/news/approved',
    REJECTED: '/news/rejected'
  },

  // Modération
  MODERATION: {
    BASE: '/moderation',
    PENDING: '/moderation/pending',
    ASSIGN: (newsId, moderatorId) => `/moderation/${newsId}/assign/${moderatorId}`,
    APPROVE: (newsId) => `/moderation/${newsId}/approve`,
    REJECT: (newsId) => `/moderation/${newsId}/reject`,
    COMMENT: (newsId) => `/moderation/${newsId}/comment`,
    HISTORY: (newsId) => `/moderation/${newsId}/history`,
    STATISTICS: '/moderation/statistics'
  },

  // Notifications
  NOTIFICATIONS: {
    BASE: '/notifications',
    BY_ID: (id) => `/notifications/${id}`,
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE: (id) => `/notifications/${id}`,
    SETTINGS: '/notifications/settings',
    UPDATE_SETTINGS: '/notifications/settings',
    UNREAD_COUNT: '/notifications/unread-count',
    SEND: '/notifications/send',
    BROADCAST: '/notifications/broadcast'
  },

  // Fichiers/Médias
  MEDIA: {
    UPLOAD: '/media/upload',
    DELETE: (id) => `/media/${id}`,
    BY_ID: (id) => `/media/${id}`,
    LIST: '/media',
    RESIZE: (id) => `/media/${id}/resize`,
    OPTIMIZE: (id) => `/media/${id}/optimize`
  },

  // Statistiques
  STATISTICS: {
    DASHBOARD: '/statistics/dashboard',
    NEWS: '/statistics/news',
    USERS: '/statistics/users',
    UNIVERSITIES: '/statistics/universities',
    ENGAGEMENT: '/statistics/engagement',
    EXPORT: '/statistics/export'
  },

  // Configuration système
  SYSTEM: {
    HEALTH: '/system/health',
    VERSION: '/system/version',
    CONFIG: '/system/config',
    LOGS: '/system/logs'
  }
}

// Headers par défaut avec token d'authentification
export const getAuthHeaders = () => {
  const token = localStorage.getItem('ccc_access_token')
  return {
    ...API_CONFIG.headers,
    ...(token && { Authorization: `Bearer ${token}` })
  }
}

// Construction d'URL complète
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.baseURL}${endpoint}`
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