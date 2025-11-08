// Composable pour la gestion des permissions et rôles
import { computed } from 'vue'

export const ROLES = {
  STUDENT: 'STUDENT',
  PUBLIANT: 'PUBLIANT', 
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN'
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

// Définition des permissions par rôle (rôles en majuscules comme l'API)
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
  // Helper to resolve refs / computed / plain objects
  const resolveUser = () => {
    try {
      if (!currentUser) return null
      // computed() returns an object with .value, a ref also has .value
      if (typeof currentUser === 'function') return currentUser()
      if (typeof currentUser === 'object' && 'value' in currentUser) return currentUser.value
      return currentUser
    } catch (e) {
      return null
    }
  }

  const userRole = computed(() => {
    const user = resolveUser()
    if (!user || !user.role) return ROLES.STUDENT

    // Normaliser le rôle de l'API (gérer les majuscules/minuscules)
    const apiRole = (typeof user.role === 'string') ? user.role.toUpperCase() : String(user.role).toUpperCase()

    // Debug pour voir le rôle exact (utile en dev)
    if (import.meta.env.DEV) {
      console.log('🔍 Debug rôle utilisateur:', {
        original: user.role,
        normalized: apiRole,
        exists: !!ROLE_PERMISSIONS[apiRole],
        availableRoles: Object.keys(ROLE_PERMISSIONS)
      })
    }

    // Vérifier si le rôle existe, sinon retourner STUDENT par défaut
    return ROLE_PERMISSIONS[apiRole] ? apiRole : ROLES.STUDENT
  })
  
  const userPermissions = computed(() => {
    const permissions = ROLE_PERMISSIONS[userRole.value] || []
    console.log('🔑 Permissions utilisateur:', {
      role: userRole.value,
      permissions: permissions
    })
    return permissions
  })
  
  const hasPermission = computed(() => (permission) => {
    return userPermissions.value.includes(permission)
  })
  
  const hasAnyPermission = computed(() => (permissions) => {
    return permissions.some(permission => userPermissions.value.includes(permission))
  })
  
  const hasAllPermissions = computed(() => (permissions) => {
    return permissions.every(permission => userPermissions.value.includes(permission))
  })
  
  const canCreateNews = computed(() => userPermissions.value.includes(PERMISSIONS.CREATE_NEWS))
  const canModerateNews = computed(() => userPermissions.value.includes(PERMISSIONS.MODERATE_NEWS))
  const canManageUsers = computed(() => userPermissions.value.includes(PERMISSIONS.MANAGE_USERS))
  const canValidateNews = computed(() => userPermissions.value.includes(PERMISSIONS.VALIDATE_NEWS))
  
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