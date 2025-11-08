<template>
  <nav class="main-navigation">
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

export default {
  name: 'Navigation',
  components: {
    PermissionGuard,
    ThemeToggle
  },
  setup() {
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
      handleLogout
    }
  }
}
</script>

<style scoped>
.main-navigation {
  @apply bg-white shadow-lg border-b border-gray-200;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand .brand-link {
  @apply text-blue-600 hover:text-blue-800 transition-colors;
  text-decoration: none;
}

.nav-brand h1 {
  @apply text-xl font-bold;
  margin: 0;
}

.nav-links {
  @apply flex space-x-6 items-center;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  @apply text-gray-700 hover:text-blue-600 transition-colors;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
}

.nav-link:hover {
  @apply bg-gray-50;
}

.btn-login {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.btn-register {
  @apply bg-green-600 text-white hover:bg-green-700;
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
}

.dropdown-menu {
  @apply bg-white border border-gray-200 rounded-lg shadow-lg;
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 200px;
  list-style: none;
  margin: 0;
  padding: 0.5rem 0;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s ease;
}

.nav-dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-link {
  @apply text-gray-700 hover:text-blue-600 hover:bg-gray-50;
  display: block;
  padding: 0.5rem 1rem;
  text-decoration: none;
  transition: colors 0.2s ease;
}

.logout-btn {
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: inherit;
}

.dropdown-divider {
  @apply border-t border-gray-200;
  margin: 0.5rem 0;
}

/* User menu styles */
.user-menu .dropdown-toggle {
  @apply bg-gray-100 rounded-full px-3 py-2;
}

.icon-user::before {
  content: '👤';
  margin-right: 0.5rem;
}

/* Mobile menu toggle */
.mobile-menu-toggle {
  @apply lg:hidden;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.hamburger {
  @apply block w-6 h-0.5 bg-gray-700;
  position: relative;
}

.hamburger::before,
.hamburger::after {
  @apply absolute w-full h-0.5 bg-gray-700;
  content: '';
  transition: all 0.3s ease;
}

.hamburger::before {
  top: -6px;
}

.hamburger::after {
  bottom: -6px;
}

/* Mobile styles */
@media (max-width: 1023px) {
  .nav-links {
    @apply hidden;
  }
  
  /* Mobile menu implementation would go here */
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .main-navigation {
    padding: 1rem;
  }
  
  .nav-brand h1 {
    @apply text-lg;
  }
}
</style>