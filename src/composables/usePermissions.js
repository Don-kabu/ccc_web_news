// Composable pour la gestion des permissions et rôles
import { computed } from 'vue'

export const ROLES = {
  STUDENT: 'student',
  PUBLIANT: 'publiant', 
  MODERATOR: 'moderator',
  ADMIN: 'admin'
}

export const PERMISSIONS = {
  // Lecture
  READ_NEWS: 'read_news',
  
  // Publication
  CREATE_NEWS: 'create_news',
  EDIT_OWN_NEWS: 'edit_own_news',
  
  // Modération
  MODERATE_NEWS: 'moderate_news',
  VALIDATE_NEWS: 'validate_news',
  COMMENT_VALIDATION: 'comment_validation',
  
  // Administration
  MANAGE_USERS: 'manage_users',
  MANAGE_ROLES: 'manage_roles',
  CONTROL_PUBLICATION: 'control_publication',
  
  // Paramètres
  MANAGE_NOTIFICATIONS: 'manage_notifications'
}

// Définition des permissions par rôle
const ROLE_PERMISSIONS = {
  [ROLES.STUDENT]: [
    PERMISSIONS.READ_NEWS,
    PERMISSIONS.MANAGE_NOTIFICATIONS
  ],
  
  [ROLES.PUBLIANT]: [
    PERMISSIONS.READ_NEWS,
    PERMISSIONS.CREATE_NEWS,
    PERMISSIONS.EDIT_OWN_NEWS,
    PERMISSIONS.MANAGE_NOTIFICATIONS
  ],
  
  [ROLES.MODERATOR]: [
    PERMISSIONS.READ_NEWS,
    PERMISSIONS.MODERATE_NEWS,
    PERMISSIONS.VALIDATE_NEWS,
    PERMISSIONS.COMMENT_VALIDATION,
    PERMISSIONS.MANAGE_NOTIFICATIONS
  ],
  
  [ROLES.ADMIN]: [
    PERMISSIONS.READ_NEWS,
    PERMISSIONS.CREATE_NEWS,
    PERMISSIONS.EDIT_OWN_NEWS,
    PERMISSIONS.MODERATE_NEWS,
    PERMISSIONS.VALIDATE_NEWS,
    PERMISSIONS.COMMENT_VALIDATION,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.CONTROL_PUBLICATION,
    PERMISSIONS.MANAGE_NOTIFICATIONS
  ]
}

export function usePermissions(currentUser) {
  const userRole = computed(() => currentUser?.role || ROLES.STUDENT)
  
  const userPermissions = computed(() => {
    return ROLE_PERMISSIONS[userRole.value] || []
  })
  
  const hasPermission = (permission) => {
    return userPermissions.value.includes(permission)
  }
  
  const hasAnyPermission = (permissions) => {
    return permissions.some(permission => hasPermission(permission))
  }
  
  const hasAllPermissions = (permissions) => {
    return permissions.every(permission => hasPermission(permission))
  }
  
  const canCreateNews = computed(() => hasPermission(PERMISSIONS.CREATE_NEWS))
  const canModerateNews = computed(() => hasPermission(PERMISSIONS.MODERATE_NEWS))
  const canManageUsers = computed(() => hasPermission(PERMISSIONS.MANAGE_USERS))
  const canValidateNews = computed(() => hasPermission(PERMISSIONS.VALIDATE_NEWS))
  
  const getRoleLabel = (role) => {
    switch(role) {
      case ROLES.ADMIN: return 'Administrateur'
      case ROLES.MODERATOR: return 'Modérateur'
      case ROLES.PUBLIANT: return 'Publiant'
      case ROLES.STUDENT: return 'Étudiant'
      default: return 'Utilisateur'
    }
  }
  
  const getRoleColor = (role) => {
    switch(role) {
      case ROLES.ADMIN: return '#dc2626'
      case ROLES.MODERATOR: return '#ea580c'
      case ROLES.PUBLIANT: return '#16a34a'
      case ROLES.STUDENT: return '#2563eb'
      default: return '#6b7280'
    }
  }
  
  return {
    userRole,
    userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canCreateNews,
    canModerateNews,
    canManageUsers,
    canValidateNews,
    getRoleLabel,
    getRoleColor
  }
}