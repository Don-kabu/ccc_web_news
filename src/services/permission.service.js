/**
 * Service de gestion des permissions utilisateur
 * Gère les rôles et permissions pour l'affichage conditionnel des composants
 */

import { ref, computed } from 'vue'

// Types de rôles utilisateur
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  UNIVERSITY_ADMIN: 'university_admin',
  MODERATOR: 'moderator',
  EDITOR: 'editor',
  USER: 'user',
  GUEST: 'guest'
}

// Permissions disponibles
export const PERMISSIONS = {
  // Gestion des universités
  CREATE_UNIVERSITY: 'create_university',
  EDIT_UNIVERSITY: 'edit_university',
  DELETE_UNIVERSITY: 'delete_university',
  VIEW_UNIVERSITY: 'view_university',
  
  // Gestion des utilisateurs
  CREATE_USER: 'create_user',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',
  VIEW_USERS: 'view_users',
  MANAGE_ROLES: 'manage_roles',
  
  // Gestion des actualités
  CREATE_NEWS: 'create_news',
  EDIT_NEWS: 'edit_news',
  DELETE_NEWS: 'delete_news',
  PUBLISH_NEWS: 'publish_news',
  MODERATE_NEWS: 'moderate_news',
  VIEW_NEWS: 'view_news',
  
  // Administration
  ACCESS_ADMIN: 'access_admin',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_SETTINGS: 'manage_settings',
  
  // Notifications
  SEND_NOTIFICATIONS: 'send_notifications',
  MANAGE_NOTIFICATIONS: 'manage_notifications'
}

// Mapping des rôles vers leurs permissions
const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: [
    // Toutes les permissions
    ...Object.values(PERMISSIONS)
  ],
  
  [USER_ROLES.UNIVERSITY_ADMIN]: [
    PERMISSIONS.EDIT_UNIVERSITY,
    PERMISSIONS.VIEW_UNIVERSITY,
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.EDIT_USER,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_NEWS,
    PERMISSIONS.EDIT_NEWS,
    PERMISSIONS.DELETE_NEWS,
    PERMISSIONS.PUBLISH_NEWS,
    PERMISSIONS.VIEW_NEWS,
    PERMISSIONS.ACCESS_ADMIN,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.SEND_NOTIFICATIONS
  ],
  
  [USER_ROLES.MODERATOR]: [
    PERMISSIONS.VIEW_UNIVERSITY,
    PERMISSIONS.EDIT_USER,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_NEWS,
    PERMISSIONS.EDIT_NEWS,
    PERMISSIONS.MODERATE_NEWS,
    PERMISSIONS.VIEW_NEWS,
    PERMISSIONS.ACCESS_ADMIN
  ],
  
  [USER_ROLES.EDITOR]: [
    PERMISSIONS.VIEW_UNIVERSITY,
    PERMISSIONS.CREATE_NEWS,
    PERMISSIONS.EDIT_NEWS,
    PERMISSIONS.VIEW_NEWS
  ],
  
  [USER_ROLES.USER]: [
    PERMISSIONS.VIEW_UNIVERSITY,
    PERMISSIONS.VIEW_NEWS
  ],
  
  [USER_ROLES.GUEST]: [
    PERMISSIONS.VIEW_NEWS
  ]
}

export class PermissionService {
  constructor() {
    this.currentUser = ref(null)
    this.userRole = ref(USER_ROLES.GUEST)
    this.userPermissions = ref([])
  }

  /**
   * Initialise les permissions de l'utilisateur
   * @param {Object} user - Données utilisateur
   */
  setUser(user) {
    this.currentUser.value = user
    this.userRole.value = user?.role || USER_ROLES.GUEST
    this.userPermissions.value = ROLE_PERMISSIONS[this.userRole.value] || []
    
    console.log('🔐 Permissions initialisées:', {
      user: user?.email,
      role: this.userRole.value,
      permissions: this.userPermissions.value.length
    })
  }

  /**
   * Vérifie si l'utilisateur a une permission spécifique
   * @param {string} permission - Permission à vérifier
   * @returns {boolean}
   */
  hasPermission(permission) {
    if (!permission) return true
    return this.userPermissions.value.includes(permission)
  }

  /**
   * Vérifie si l'utilisateur a au moins une des permissions
   * @param {string[]} permissions - Liste des permissions
   * @returns {boolean}
   */
  hasAnyPermission(permissions) {
    if (!permissions || permissions.length === 0) return true
    return permissions.some(permission => this.hasPermission(permission))
  }

  /**
   * Vérifie si l'utilisateur a toutes les permissions
   * @param {string[]} permissions - Liste des permissions
   * @returns {boolean}
   */
  hasAllPermissions(permissions) {
    if (!permissions || permissions.length === 0) return true
    return permissions.every(permission => this.hasPermission(permission))
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   * @param {string} role - Rôle à vérifier
   * @returns {boolean}
   */
  hasRole(role) {
    return this.userRole.value === role
  }

  /**
   * Vérifie si l'utilisateur a au moins un des rôles
   * @param {string[]} roles - Liste des rôles
   * @returns {boolean}
   */
  hasAnyRole(roles) {
    if (!roles || roles.length === 0) return true
    return roles.includes(this.userRole.value)
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   * @returns {boolean}
   */
  isAuthenticated() {
    return this.currentUser.value !== null && this.userRole.value !== USER_ROLES.GUEST
  }

  /**
   * Vérifie si l'utilisateur est un administrateur
   * @returns {boolean}
   */
  isAdmin() {
    return this.hasAnyRole([USER_ROLES.SUPER_ADMIN, USER_ROLES.UNIVERSITY_ADMIN])
  }

  /**
   * Récupère les informations utilisateur
   * @returns {Object}
   */
  getUserInfo() {
    return {
      user: this.currentUser.value,
      role: this.userRole.value,
      permissions: this.userPermissions.value,
      isAuthenticated: this.isAuthenticated(),
      isAdmin: this.isAdmin()
    }
  }

  /**
   * Nettoie les permissions (déconnexion)
   */
  clearPermissions() {
    this.currentUser.value = null
    this.userRole.value = USER_ROLES.GUEST
    this.userPermissions.value = []
    
    console.log('🚪 Permissions nettoyées (déconnexion)')
  }

  /**
   * Computed pour usage dans les composants Vue
   */
  get computed() {
    return {
      currentUser: computed(() => this.currentUser.value),
      userRole: computed(() => this.userRole.value),
      userPermissions: computed(() => this.userPermissions.value),
      isAuthenticated: computed(() => this.isAuthenticated()),
      isAdmin: computed(() => this.isAdmin())
    }
  }
}

// Instance exportée
export const permissionService = new PermissionService()

// Composable pour usage dans les composants Vue
export function usePermissions() {
  return {
    ...permissionService.computed,
    hasPermission: (permission) => permissionService.hasPermission(permission),
    hasAnyPermission: (permissions) => permissionService.hasAnyPermission(permissions),
    hasAllPermissions: (permissions) => permissionService.hasAllPermissions(permissions),
    hasRole: (role) => permissionService.hasRole(role),
    hasAnyRole: (roles) => permissionService.hasAnyRole(roles),
    getUserInfo: () => permissionService.getUserInfo()
  }
}