<template>
  <nav class="main-navigation" :class="{ 'dark': isDark }">
    <div class="nav-brand">
      <router-link to="/" class="brand-link">
        <h1>CCC Web News</h1>
      </router-link>
    </div>

    <ul class="nav-links">
      <!-- Liens publics -->
      <li>
        <router-link to="/" class="nav-link">Accueil</router-link>
      </li>

      <!-- Section Actualités - visible selon permissions -->
      <PermissionGuard :permissions="['view_news']">
        <li>
          <router-link to="/news" class="nav-link">Actualités</router-link>
        </li>
      </PermissionGuard>

      <!-- Section Universités - visible selon permissions -->
      <PermissionGuard :permissions="['view_universities']">
        <li>
          <router-link to="/universities" class="nav-link">Universités</router-link>
        </li>
      </PermissionGuard>

      <!-- Navigation Administrative - seulement pour les rôles élevés -->
      <PermissionGuard :roles="['super_admin', 'university_admin', 'moderator']">
        <li class="nav-dropdown">
          <span class="nav-link dropdown-toggle">Administration</span>
          <ul class="dropdown-menu">
            <!-- Gestion des actualités -->
            <PermissionGuard :permissions="['create_news', 'edit_news']">
              <li>
                <router-link to="/admin/news" class="dropdown-link">
                  Gérer les actualités
                </router-link>
              </li>
            </PermissionGuard>

            <!-- Gestion des utilisateurs - super admin uniquement -->
            <PermissionGuard :roles="['super_admin']">
              <li>
                <router-link to="/admin/users" class="dropdown-link">
                  Gérer les utilisateurs
                </router-link>
              </li>
            </PermissionGuard>

            <!-- Gestion des universités -->
            <PermissionGuard :permissions="['edit_university']">
              <li>
                <router-link to="/admin/universities" class="dropdown-link">
                  Gérer les universités
                </router-link>
              </li>
            </PermissionGuard>

            <!-- Modération des commentaires -->
            <PermissionGuard :permissions="['moderate_comments']">
              <li>
                <router-link to="/admin/comments" class="dropdown-link">
                  Modérer les commentaires
                </router-link>
              </li>
            </PermissionGuard>

            <!-- Statistiques - selon les permissions -->
            <PermissionGuard :permissions="['view_statistics']">
              <li>
                <router-link to="/admin/statistics" class="dropdown-link">
                  Statistiques
                </router-link>
              </li>
            </PermissionGuard>
          </ul>
        </li>
      </PermissionGuard>

      <!-- Bouton de basculement de thème -->
      <li class="theme-toggle-item">
        <ThemeToggle />
      </li>

      <!-- Section Profil utilisateur -->
      <PermissionGuard :requireAuth="true">
        <li class="nav-dropdown user-menu">
          <span class="nav-link dropdown-toggle">
            <i class="icon-user"></i>
            {{ currentUser?.full_name || 'Mon compte' }}
          </span>
          <ul class="dropdown-menu">
            <li>
              <router-link to="/profile" class="dropdown-link">
                Mon profil
              </router-link>
            </li>
            
            <!-- Paramètres selon les permissions -->
            <PermissionGuard :permissions="['edit_profile']">
              <li>
                <router-link to="/profile/settings" class="dropdown-link">
                  Paramètres
                </router-link>
              </li>
            </PermissionGuard>

            <li class="dropdown-divider"></li>
            <li>
              <button @click="handleLogout" class="dropdown-link logout-btn">
                Déconnexion
              </button>
            </li>
          </ul>
        </li>
      </PermissionGuard>

      <!-- Liens d'authentification pour utilisateurs non connectés -->
      <PermissionGuard :requireAuth="false">
        <li>
          <router-link to="/login" class="nav-link btn-login">
            Connexion
          </router-link>
        </li>
        <li>
          <router-link to="/register" class="nav-link btn-register">
            Inscription
          </router-link>
        </li>
      </PermissionGuard>
    </ul>

    <!-- Menu mobile toggle -->
    <button 
      class="mobile-menu-toggle"
      @click="toggleMobileMenu"
      aria-label="Ouvrir le menu mobile"
    >
      <span class="hamburger"></span>
    </button>
  </nav>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import PermissionGuard from '@/components/common/PermissionGuard.vue'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import { authService } from '@/services/auth.service.js'
import { useTheme } from '@/composables/useTheme.js'

export default {
  name: 'Navigation',
  components: {
    PermissionGuard,
    ThemeToggle
  },
  setup() {
    // Composable pour le thème
    const { isDark } = useTheme()
    
    const isMobileMenuOpen = ref(false)
    const currentUser = ref(null)

    // Charger les informations de l'utilisateur connecté
    onMounted(() => {
      currentUser.value = authService.getCurrentUser()
      
      // Écouter les changements d'authentification
      authService.addEventListener('userLoggedIn', (user) => {
        currentUser.value = user
      })
      
      authService.addEventListener('userLoggedOut', () => {
        currentUser.value = null
      })
    })

    // Basculer le menu mobile
    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value
    }

    // Gérer la déconnexion
    const handleLogout = async () => {
      try {
        await authService.logout()
        // Redirection vers la page d'accueil après déconnexion
        window.location.href = '/'
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error)
      }
    }

    return {
      isMobileMenuOpen,
      currentUser,
      toggleMobileMenu,
      handleLogout,
      isDark
    }
  }
}
</script>

<style scoped>
.main-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;
  
  /* Variables CSS pour le mode clair */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  --bg-hover: #f8fafc;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --border-primary: #e2e8f0;
  --border-secondary: #cbd5e1;
  --shadow-primary: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-secondary: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  
  /* Couleurs d'accent */
  --brand-color: #2563eb;
  --brand-hover-color: #1d4ed8;
  --success-color: #16a34a;
  --success-hover-color: #15803d;
  --danger-color: #dc2626;
  --danger-hover-color: #b91c1c;
  
  /* États des dropdowns */
  --dropdown-bg: #ffffff;
  --dropdown-border: #e5e7eb;
  --dropdown-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  
  background: var(--bg-primary);
  box-shadow: var(--shadow-primary);
  border-bottom: 1px solid var(--border-primary);
}

.main-navigation.dark {
  /* Variables CSS pour le mode sombre */
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --bg-hover: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --border-primary: #334155;
  --border-secondary: #475569;
  --shadow-primary: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
  --shadow-secondary: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2);
  
  /* Couleurs d'accent pour le mode sombre */
  --brand-color: #3b82f6;
  --brand-hover-color: #2563eb;
  --success-color: #22c55e;
  --success-hover-color: #16a34a;
  --danger-color: #ef4444;
  --danger-hover-color: #dc2626;
  
  /* États des dropdowns pour le mode sombre */
  --dropdown-bg: #1e293b;
  --dropdown-border: #334155;
  --dropdown-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
}

.nav-brand .brand-link {
  color: var(--brand-color);
  text-decoration: none;
  transition: color 0.3s ease;
}

.nav-brand .brand-link:hover {
  color: var(--brand-hover-color);
}

.nav-brand h1 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  transition: color 0.3s ease;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: var(--brand-color);
  background: var(--bg-hover);
}

.nav-link.router-link-active {
  color: var(--brand-color);
  background: var(--bg-secondary);
  font-weight: 600;
}

.btn-login {
  background: var(--brand-color);
  color: white;
  border-radius: 0.375rem;
}

.btn-login:hover {
  background: var(--brand-hover-color);
  color: white;
}

.btn-register {
  background: var(--success-color);
  color: white;
  border-radius: 0.375rem;
}

.btn-register:hover {
  background: var(--success-hover-color);
  color: white;
}

/* Styles pour le bouton de thème */
.theme-toggle-item {
  display: flex;
  align-items: center;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}

/* Dropdown styles */
.nav-dropdown {
  position: relative;
}

.dropdown-toggle {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: all 0.3s ease;
}

.dropdown-toggle:hover {
  color: var(--brand-color);
  background: var(--bg-hover);
}

.dropdown-menu {
  background: var(--dropdown-bg);
  border: 1px solid var(--dropdown-border);
  border-radius: 0.5rem;
  box-shadow: var(--dropdown-shadow);
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 200px;
  list-style: none;
  margin: 0.5rem 0 0 0;
  padding: 0.5rem 0;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 1000;
}

.nav-dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-link {
  color: var(--text-secondary);
  display: block;
  padding: 0.5rem 1rem;
  text-decoration: none;
  transition: all 0.3s ease;
}

.dropdown-link:hover {
  color: var(--brand-color);
  background: var(--bg-hover);
}

.dropdown-link.router-link-active {
  color: var(--brand-color);
  background: var(--bg-secondary);
  font-weight: 600;
}

.logout-btn {
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: inherit;
  color: var(--danger-color);
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(220, 38, 38, 0.1);
  color: var(--danger-hover-color);
}

.dropdown-divider {
  border-top: 1px solid var(--border-primary);
  margin: 0.5rem 0;
}

/* User menu styles */
.user-menu .dropdown-toggle {
  background: var(--bg-secondary);
  border-radius: 9999px;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-primary);
}

.user-menu .dropdown-toggle:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-secondary);
}

.icon-user::before {
  content: '👤';
  margin-right: 0.5rem;
}

/* Mobile menu toggle */
.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.hamburger {
  display: block;
  width: 1.5rem;
  height: 2px;
  background: var(--text-secondary);
  position: relative;
  transition: all 0.3s ease;
}

.hamburger::before,
.hamburger::after {
  position: absolute;
  width: 100%;
  height: 2px;
  background: var(--text-secondary);
  content: '';
  transition: all 0.3s ease;
}

.hamburger::before {
  top: -6px;
}

.hamburger::after {
  bottom: -6px;
}

.mobile-menu-toggle:hover .hamburger,
.mobile-menu-toggle:hover .hamburger::before,
.mobile-menu-toggle:hover .hamburger::after {
  background: var(--text-primary);
}

/* Animation pour le menu mobile ouvert */
.mobile-menu-open .hamburger {
  background: transparent;
}

.mobile-menu-open .hamburger::before {
  transform: rotate(45deg);
  top: 0;
}

.mobile-menu-open .hamburger::after {
  transform: rotate(-45deg);
  bottom: 0;
}

/* Mobile styles */
@media (max-width: 1023px) {
  .mobile-menu-toggle {
    display: block;
  }
  
  .nav-links {
    display: none;
  }
  
  /* Mobile menu implementation would go here */
  .nav-links.mobile-open {
    display: flex;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--bg-primary);
    border-top: 1px solid var(--border-primary);
    flex-direction: column;
    padding: 1rem;
    gap: 0.5rem;
    box-shadow: var(--shadow-secondary);
  }
  
  .nav-dropdown .dropdown-menu {
    position: static;
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    box-shadow: none;
    border: none;
    background: var(--bg-secondary);
    margin: 0.5rem 0;
    padding: 0.5rem;
    border-radius: 0.375rem;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .main-navigation {
    padding: 1rem;
  }
  
  .nav-brand h1 {
    font-size: 1.125rem;
  }
}

@media (max-width: 480px) {
  .main-navigation {
    padding: 0.75rem;
  }
  
  .nav-brand h1 {
    font-size: 1rem;
  }
}

/* Animations pour les transitions */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-menu {
  animation: fadeInDown 0.3s ease;
}

/* Amélioration de l'accessibilité */
@media (prefers-reduced-motion: reduce) {
  .main-navigation *,
  .main-navigation *::before,
  .main-navigation *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus visible pour l'accessibilité */
.nav-link:focus-visible,
.dropdown-toggle:focus-visible,
.dropdown-link:focus-visible,
.logout-btn:focus-visible,
.mobile-menu-toggle:focus-visible {
  outline: 2px solid var(--brand-color);
  outline-offset: 2px;
}

/* États actifs améliorés */
.nav-link:active,
.dropdown-toggle:active {
  transform: translateY(1px);
}

/* Hover effects pour les boutons spéciaux */
.btn-login:active,
.btn-register:active {
  transform: scale(0.98);
}

/* Responsive dropdown positioning */
@media (max-width: 768px) {
  .nav-dropdown .dropdown-menu {
    left: 0;
    right: auto;
    min-width: 250px;
  }
}
</style>