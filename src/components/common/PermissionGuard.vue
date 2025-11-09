<template>
  <!-- Affichage conditionnel selon les permissions -->
  <div v-if="shouldShow" class="permission-wrapper" :class="{ 'dark': isDark }">
    <slot></slot>
  </div>
  
  <!-- Message alternatif si pas de permission -->
  <div v-else-if="showFallback" class="permission-fallback" :class="{ 'dark': isDark }">
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
import { useTheme } from '../../composables/useTheme.js'

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
    
    // Composable pour le thème
    const { isDark } = useTheme()
    
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
      shouldShow,
      isDark
    }
  }
}
</script>

<style scoped>
.permission-wrapper {
  /* Variables CSS pour le mode clair */
  --bg-primary: #ffffff;
  --text-primary: #1e293b;
  
  /* Le wrapper conserve la transparence par défaut */
  display: contents;
}

.permission-wrapper.dark {
  /* Variables CSS pour le mode sombre */
  --bg-primary: #0f172a;
  --text-primary: #f1f5f9;
}

.permission-fallback {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  border-radius: 8px;
  margin: 1rem 0;
  transition: all 0.3s ease;
  
  /* Mode clair */
  background: #f9fafb;
  border: 1px solid #e5e7eb;
}

.permission-fallback.dark {
  /* Mode sombre */
  background: #1e293b;
  border: 1px solid #334155;
}

.no-permission-message {
  text-align: center;
  transition: color 0.3s ease;
  
  /* Mode clair */
  color: #6b7280;
}

.permission-fallback.dark .no-permission-message {
  /* Mode sombre */
  color: #94a3b8;
}

.no-permission-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.permission-fallback.dark .no-permission-icon {
  opacity: 0.8;
}

.no-permission-message p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  transition: color 0.3s ease;
}

/* Animation d'apparition pour le message de fallback */
.permission-fallback {
  animation: fadeInMessage 0.3s ease-in-out;
}

@keyframes fadeInMessage {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive design */
@media (max-width: 640px) {
  .permission-fallback {
    padding: 1.5rem;
    margin: 0.75rem 0;
  }
  
  .no-permission-icon {
    font-size: 1.5rem;
    margin-bottom: 0.375rem;
  }
  
  .no-permission-message p {
    font-size: 0.8rem;
  }
}
</style>