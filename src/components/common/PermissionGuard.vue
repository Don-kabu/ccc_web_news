<template>
  <!-- Affichage conditionnel selon les permissions -->
  <div v-if="shouldShow" class="permission-wrapper">
    <slot></slot>
  </div>
  
  <!-- Message alternatif si pas de permission -->
  <div v-else-if="showFallback" class="permission-fallback">
    <slot name="fallback">
      <div class="no-permission-message">
        <div class="no-permission-icon">🔒</div>
        <p>{{ fallbackMessage }}</p>
      </div>
    </slot>
  </div>
</template>

<script>
import { computed } from 'vue'
import { usePermissions } from '../../services/permission.service'

export default {
  name: 'PermissionGuard',
  props: {
    // Permission(s) requise(s)
    permission: {
      type: [String, Array],
      default: null
    },
    
    // Rôle(s) requis
    role: {
      type: [String, Array],
      default: null
    },
    
    // Logique pour les permissions multiples
    requireAll: {
      type: Boolean,
      default: false // Par défaut: au moins une permission suffit
    },
    
    // Afficher un message de fallback si pas de permission
    showFallback: {
      type: Boolean,
      default: false
    },
    
    // Message personnalisé si pas de permission
    fallbackMessage: {
      type: String,
      default: 'Vous n\'avez pas les permissions nécessaires pour voir ce contenu.'
    },
    
    // Inverser la logique (afficher si PAS de permission)
    invert: {
      type: Boolean,
      default: false
    },
    
    // Exiger l'authentification
    requireAuth: {
      type: Boolean,
      default: false
    }
  },
  
  setup(props) {
    const { 
      hasPermission, 
      hasAnyPermission, 
      hasAllPermissions, 
      hasRole, 
      hasAnyRole,
      isAuthenticated 
    } = usePermissions()
    
    const shouldShow = computed(() => {
      // Vérifier l'authentification si requise
      if (props.requireAuth && !isAuthenticated.value) {
        return props.invert ? true : false
      }
      
      let hasRequiredPermission = true
      let hasRequiredRole = true
      
      // Vérifier les permissions
      if (props.permission) {
        if (Array.isArray(props.permission)) {
          hasRequiredPermission = props.requireAll 
            ? hasAllPermissions(props.permission)
            : hasAnyPermission(props.permission)
        } else {
          hasRequiredPermission = hasPermission(props.permission)
        }
      }
      
      // Vérifier les rôles
      if (props.role) {
        if (Array.isArray(props.role)) {
          hasRequiredRole = hasAnyRole(props.role)
        } else {
          hasRequiredRole = hasRole(props.role)
        }
      }
      
      const result = hasRequiredPermission && hasRequiredRole
      
      // Inverser si demandé
      return props.invert ? !result : result
    })
    
    return {
      shouldShow
    }
  }
}
</script>

<style scoped>
.permission-wrapper {
  /* Le wrapper n'ajoute pas de style par défaut */
}

.permission-fallback {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin: 1rem 0;
}

.no-permission-message {
  text-align: center;
  color: #6b7280;
}

.no-permission-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.no-permission-message p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}
</style>