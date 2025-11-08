<template>
  <div class="user-dashboard">
    <!-- En-tête avec informations utilisateur -->
    <div class="dashboard-header">
      <div class="user-info">
        <div class="avatar">
          <img 
            v-if="currentUser?.avatar" 
            :src="currentUser.avatar" 
            :alt="currentUser.full_name"
            class="avatar-image"
          >
          <div v-else class="avatar-placeholder">
            {{ getInitials(currentUser?.full_name) }}
          </div>
        </div>
        <div class="user-details">
          <h1 class="welcome-message">
            Bienvenue, {{ currentUser?.full_name || 'Utilisateur' }}
          </h1>
          <p class="user-role">
            {{ getRoleLabel(currentUser?.role) }}
            <PermissionGuard :permissions="['view_universities']">
              • {{ currentUser?.university?.name }}
            </PermissionGuard>
          </p>
        </div>
      </div>

      <!-- Actions rapides selon les permissions -->
      <div class="quick-actions">
        <PermissionGuard :permissions="['create_news']">
          <button @click="createNews" class="btn btn-primary">
            <i class="icon-plus"></i>
            Nouvelle actualité
          </button>
        </PermissionGuard>
        
        <PermissionGuard :roles="['super_admin', 'university_admin']">
          <button @click="manageUsers" class="btn btn-secondary">
            <i class="icon-users"></i>
            Gérer utilisateurs
          </button>
        </PermissionGuard>
      </div>
    </div>

    <!-- Statistiques personnelles -->
    <div class="stats-section">
      <h2 class="section-title">Vos statistiques</h2>
      <div class="stats-grid">
        <!-- Statistiques pour les créateurs de contenu -->
        <PermissionGuard :permissions="['create_news', 'edit_news']">
          <div class="stat-card">
            <div class="stat-icon articles-icon">📰</div>
            <div class="stat-content">
              <h3>Articles créés</h3>
              <p class="stat-number">{{ userStats.articlesCreated }}</p>
              <p class="stat-change positive">+{{ userStats.articlesThisMonth }} ce mois</p>
            </div>
          </div>
        </PermissionGuard>

        <!-- Statistiques de modération -->
        <PermissionGuard :roles="['moderator', 'university_admin', 'super_admin']">
          <div class="stat-card">
            <div class="stat-icon moderation-icon">⚖️</div>
            <div class="stat-content">
              <h3>Articles modérés</h3>
              <p class="stat-number">{{ userStats.articlesModerated }}</p>
              <p class="stat-change">{{ userStats.pendingModeration }} en attente</p>
            </div>
          </div>
        </PermissionGuard>

        <!-- Statistiques d'engagement -->
        <PermissionGuard :permissions="['view_statistics']">
          <div class="stat-card">
            <div class="stat-icon engagement-icon">👥</div>
            <div class="stat-content">
              <h3>Engagement</h3>
              <p class="stat-number">{{ userStats.totalViews }}</p>
              <p class="stat-change">vues sur vos contenus</p>
            </div>
          </div>
        </PermissionGuard>

        <!-- Statistiques universitaires pour les admins -->
        <PermissionGuard :roles="['university_admin', 'super_admin']">
          <div class="stat-card">
            <div class="stat-icon university-icon">🎓</div>
            <div class="stat-content">
              <h3>Étudiants actifs</h3>
              <p class="stat-number">{{ userStats.activeStudents }}</p>
              <p class="stat-change positive">+{{ userStats.newStudents }} nouveaux</p>
            </div>
          </div>
        </PermissionGuard>
      </div>
    </div>

    <!-- Sections du dashboard selon les rôles -->
    <div class="dashboard-content">
      <!-- Section Mes actualités -->
      <PermissionGuard :permissions="['create_news', 'edit_news']">
        <div class="section">
          <div class="section-header">
            <h2 class="section-title">Mes actualités</h2>
            <router-link to="/my-news" class="link-view-all">
              Voir tout
            </router-link>
          </div>
          
          <div class="content-grid">
            <div 
              v-for="article in myRecentArticles" 
              :key="article.id"
              class="content-card"
            >
              <div class="card-header">
                <h3 class="card-title">{{ article.title }}</h3>
                <span :class="['status-badge', `status-${article.status}`]">
                  {{ getStatusLabel(article.status) }}
                </span>
              </div>
              <p class="card-excerpt">{{ article.excerpt }}</p>
              <div class="card-actions">
                <button @click="editArticle(article)" class="btn btn-sm btn-outline">
                  Éditer
                </button>
                <button @click="viewStats(article)" class="btn btn-sm btn-secondary">
                  Statistiques
                </button>
              </div>
            </div>
          </div>
        </div>
      </PermissionGuard>

      <!-- Section Modération (pour modérateurs et plus) -->
      <PermissionGuard :roles="['moderator', 'university_admin', 'super_admin']">
        <div class="section">
          <div class="section-header">
            <h2 class="section-title">
              Articles à modérer
              <span v-if="pendingArticles.length > 0" class="notification-badge">
                {{ pendingArticles.length }}
              </span>
            </h2>
            <router-link to="/admin/moderation" class="link-view-all">
              Voir tout
            </router-link>
          </div>

          <div class="content-grid">
            <div 
              v-for="article in pendingArticles.slice(0, 3)" 
              :key="article.id"
              class="content-card moderation-card"
            >
              <div class="card-header">
                <h3 class="card-title">{{ article.title }}</h3>
                <span class="author-info">par {{ article.author.full_name }}</span>
              </div>
              <p class="card-excerpt">{{ article.excerpt }}</p>
              <div class="card-actions">
                <button @click="approveArticle(article)" class="btn btn-sm btn-success">
                  Approuver
                </button>
                <button @click="rejectArticle(article)" class="btn btn-sm btn-danger">
                  Rejeter
                </button>
                <button @click="reviewArticle(article)" class="btn btn-sm btn-outline">
                  Examiner
                </button>
              </div>
            </div>
          </div>
        </div>
      </PermissionGuard>

      <!-- Section Gestion université (pour admins universitaires) -->
      <PermissionGuard :roles="['university_admin', 'super_admin']">
        <div class="section">
          <div class="section-header">
            <h2 class="section-title">Gestion université</h2>
          </div>
          
          <div class="university-management">
            <div class="management-grid">
              <div class="management-card">
                <h3>Utilisateurs</h3>
                <p>{{ universityStats.totalUsers }} utilisateurs actifs</p>
                <router-link to="/admin/users" class="btn btn-primary">
                  Gérer
                </router-link>
              </div>
              
              <PermissionGuard :permissions="['edit_university']">
                <div class="management-card">
                  <h3>Paramètres</h3>
                  <p>Configuration de l'université</p>
                  <router-link to="/admin/university-settings" class="btn btn-primary">
                    Configurer
                  </router-link>
                </div>
              </PermissionGuard>

              <PermissionGuard :permissions="['view_statistics']">
                <div class="management-card">
                  <h3>Rapports</h3>
                  <p>Analyses et statistiques détaillées</p>
                  <router-link to="/admin/reports" class="btn btn-primary">
                    Voir rapports
                  </router-link>
                </div>
              </PermissionGuard>
            </div>
          </div>
        </div>
      </PermissionGuard>

      <!-- Section Super Admin uniquement -->
      <PermissionGuard :roles="['super_admin']">
        <div class="section admin-only">
          <div class="section-header">
            <h2 class="section-title">Administration système</h2>
          </div>
          
          <div class="admin-tools">
            <div class="tool-grid">
              <router-link to="/admin/system" class="tool-card">
                <div class="tool-icon">⚙️</div>
                <h3>Système</h3>
                <p>Configuration globale</p>
              </router-link>

              <router-link to="/admin/universities" class="tool-card">
                <div class="tool-icon">🏛️</div>
                <h3>Universités</h3>
                <p>Gérer toutes les universités</p>
              </router-link>

              <router-link to="/admin/global-stats" class="tool-card">
                <div class="tool-icon">📊</div>
                <h3>Statistiques globales</h3>
                <p>Vue d'ensemble complète</p>
              </router-link>

              <router-link to="/admin/logs" class="tool-card">
                <div class="tool-icon">📋</div>
                <h3>Logs système</h3>
                <p>Surveillance et debugging</p>
              </router-link>
            </div>
          </div>
        </div>
      </PermissionGuard>

      <!-- Section pour tous les utilisateurs connectés -->
      <PermissionGuard :requireAuth="true">
        <div class="section">
          <div class="section-header">
            <h2 class="section-title">Actualités récentes</h2>
          </div>
          
          <div class="recent-news">
            <div 
              v-for="article in recentNews" 
              :key="article.id"
              class="news-item"
            >
              <div class="news-content">
                <h3 class="news-title">{{ article.title }}</h3>
                <p class="news-meta">
                  Par {{ article.author.full_name }} • 
                  {{ formatDate(article.created_at) }}
                </p>
              </div>
              <router-link 
                :to="`/news/${article.id}`" 
                class="btn btn-outline"
              >
                Lire
              </router-link>
            </div>
          </div>
        </div>
      </PermissionGuard>
    </div>

    <!-- Message pour utilisateurs sans permissions spécifiques -->
    <PermissionGuard 
      :roles="['guest', 'user']" 
      :permissions="[]"
      fallbackMessage=""
    >
      <div class="limited-access-notice">
        <h3>Fonctionnalités limitées</h3>
        <p>
          Votre compte a un accès limité. 
          Contactez votre administrateur pour obtenir plus de permissions.
        </p>
      </div>
    </PermissionGuard>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import PermissionGuard from '@/components/common/PermissionGuard.vue'
import { usePermissions } from '@/services/permission.service.js'
import { authService } from '@/services/auth.service.js'
import { newsService } from '@/services/news.service.js'

export default {
  name: 'UserDashboard',
  components: {
    PermissionGuard
  },
  setup() {
    // Permissions
    const { hasPermission, hasRole, getCurrentUser } = usePermissions()
    
    // État réactif
    const currentUser = ref(null)
    const userStats = ref({
      articlesCreated: 0,
      articlesThisMonth: 0,
      articlesModerated: 0,
      pendingModeration: 0,
      totalViews: 0,
      activeStudents: 0,
      newStudents: 0
    })

    const universityStats = ref({
      totalUsers: 0,
      activeNews: 0,
      pendingArticles: 0
    })

    const myRecentArticles = ref([])
    const pendingArticles = ref([])
    const recentNews = ref([])

    // Charger les données utilisateur
    const loadUserData = async () => {
      currentUser.value = authService.getCurrentUser()
      
      if (!currentUser.value) {
        return
      }

      // Charger les statistiques selon les permissions
      if (hasPermission('create_news') || hasPermission('edit_news')) {
        await loadCreatorStats()
      }

      if (hasRole('moderator') || hasRole('university_admin') || hasRole('super_admin')) {
        await loadModerationData()
      }

      if (hasRole('university_admin') || hasRole('super_admin')) {
        await loadUniversityStats()
      }

      // Charger les actualités récentes pour tous
      await loadRecentNews()
    }

    // Charger les stats de créateur
    const loadCreatorStats = async () => {
      // Simulation - remplacer par de vraies API calls
      userStats.value.articlesCreated = 15
      userStats.value.articlesThisMonth = 3
      userStats.value.totalViews = 2450

      myRecentArticles.value = [
        {
          id: 1,
          title: "Guide des nouvelles technologies éducatives",
          excerpt: "Exploration des outils numériques...",
          status: "published",
          views: 324
        },
        {
          id: 2,
          title: "Recherche en intelligence artificielle",
          excerpt: "Avancées récentes dans le machine learning...",
          status: "pending",
          views: 0
        }
      ]
    }

    // Charger les données de modération
    const loadModerationData = async () => {
      userStats.value.articlesModerated = 47
      userStats.value.pendingModeration = 5

      pendingArticles.value = [
        {
          id: 3,
          title: "Nouveaux programmes d'échange international",
          excerpt: "L'université développe des partenariats...",
          author: { full_name: "Dr. Sophie Laurent" }
        },
        {
          id: 4,
          title: "Innovation en biotechnologie",
          excerpt: "Découvertes révolutionnaires en laboratoire...",
          author: { full_name: "Prof. Michel Rousseau" }
        }
      ]
    }

    // Charger les stats universitaires
    const loadUniversityStats = async () => {
      universityStats.value = {
        totalUsers: 1245,
        activeNews: 23,
        pendingArticles: 5
      }
      userStats.value.activeStudents = 3420
      userStats.value.newStudents = 127
    }

    // Charger les actualités récentes
    const loadRecentNews = async () => {
      try {
        console.log('🔄 Chargement des actualités récentes depuis l\'API...')
        
        const response = await newsService.getRecentNews(5)
        
        console.log('📡 Réponse API actualités récentes:', response)
        
        if (response && (response.success === true || response.status === 'success')) {
          // Gestion de différents formats de réponse
          let newsList = []
          
          if (response.data) {
            if (Array.isArray(response.data)) {
              newsList = response.data
            } else if (response.data.results && Array.isArray(response.data.results)) {
              newsList = response.data.results
            } else if (response.data.news && Array.isArray(response.data.news)) {
              newsList = response.data.news
            } else {
              console.warn('⚠️ Structure de données inattendue dans response.data:', response.data)
            }
          } else if (Array.isArray(response)) {
            newsList = response
          }
          
          console.log('📰 Actualités récentes récupérées:', {
            count: newsList.length,
            articles: newsList.slice(0, 2) // Afficher seulement les 2 premières pour debug
          })
          
          recentNews.value = newsList
          
          if (newsList.length === 0) {
            console.warn('⚠️ Aucune actualité récente trouvée')
          }
        } else {
          console.warn('⚠️ Réponse API non valide pour les actualités récentes:', response)
          recentNews.value = []
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement des actualités récentes:', error)
        
        // Gestion d'erreurs selon le type
        if (error.status === 401) {
          console.warn('🚨 Session expirée - redirection nécessaire')
        } else if (error.status === 500) {
          console.warn('🚨 Erreur serveur pour les actualités')
        } else {
          console.warn('🚨 Erreur réseau pour les actualités')
        }
        
        // Liste vide en cas d'erreur
        recentNews.value = []
      }
    }

    // Actions
    const createNews = () => {
      console.log('Créer une actualité')
      // Navigation vers création
    }

    const manageUsers = () => {
      console.log('Gérer les utilisateurs')
      // Navigation vers gestion utilisateurs
    }

    const editArticle = (article) => {
      console.log('Éditer article:', article.id)
    }

    const viewStats = (article) => {
      console.log('Voir stats article:', article.id)
    }

    const approveArticle = async (article) => {
      console.log('Approuver article:', article.id)
      // Logic d'approbation
    }

    const rejectArticle = async (article) => {
      console.log('Rejeter article:', article.id)
      // Logic de rejet
    }

    const reviewArticle = (article) => {
      console.log('Examiner article:', article.id)
      // Navigation vers vue détaillée
    }

    // Utilitaires
    const getInitials = (fullName) => {
      if (!fullName) return 'U'
      return fullName
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }

    const getRoleLabel = (role) => {
      const labels = {
        super_admin: 'Super Administrateur',
        university_admin: 'Administrateur Université',
        moderator: 'Modérateur',
        editor: 'Éditeur',
        user: 'Utilisateur',
        guest: 'Invité'
      }
      return labels[role] || 'Utilisateur'
    }

    const getStatusLabel = (status) => {
      const labels = {
        draft: 'Brouillon',
        pending: 'En attente',
        published: 'Publié',
        rejected: 'Rejeté'
      }
      return labels[status] || status
    }

    const formatDate = (date) => {
      return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(new Date(date))
    }

    // Lifecycle
    onMounted(() => {
      loadUserData()
    })

    return {
      currentUser,
      userStats,
      universityStats,
      myRecentArticles,
      pendingArticles,
      recentNews,
      createNews,
      manageUsers,
      editArticle,
      viewStats,
      approveArticle,
      rejectArticle,
      reviewArticle,
      getInitials,
      getRoleLabel,
      getStatusLabel,
      formatDate,
      hasPermission,
      hasRole,
      getCurrentUser
    }
  }
}
</script>

<style scoped>
.user-dashboard {
  @apply max-w-7xl mx-auto p-6;
}

/* Header */
.dashboard-header {
  @apply flex flex-col lg:flex-row lg:justify-between lg:items-start mb-8 space-y-4 lg:space-y-0;
}

.user-info {
  @apply flex items-center space-x-4;
}

.avatar {
  @apply w-16 h-16 rounded-full overflow-hidden;
}

.avatar-image {
  @apply w-full h-full object-cover;
}

.avatar-placeholder {
  @apply w-full h-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold;
}

.welcome-message {
  @apply text-2xl font-bold text-gray-800;
}

.user-role {
  @apply text-gray-600;
}

.quick-actions {
  @apply flex flex-wrap gap-3;
}

/* Sections */
.section {
  @apply mb-10;
}

.section-header {
  @apply flex justify-between items-center mb-6;
}

.section-title {
  @apply text-xl font-semibold text-gray-800 flex items-center gap-2;
}

.notification-badge {
  @apply bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2;
}

.link-view-all {
  @apply text-blue-600 hover:text-blue-800 text-sm;
}

/* Stats */
.stats-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8;
}

.stat-card {
  @apply bg-white p-6 rounded-lg shadow border flex items-center space-x-4;
}

.stat-icon {
  @apply text-3xl;
}

.stat-content h3 {
  @apply text-sm font-medium text-gray-600;
}

.stat-number {
  @apply text-2xl font-bold text-gray-900;
}

.stat-change {
  @apply text-xs text-gray-500;
}

.stat-change.positive {
  @apply text-green-600;
}

/* Content cards */
.content-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.content-card {
  @apply bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow;
}

.card-header {
  @apply flex justify-between items-start mb-3;
}

.card-title {
  @apply text-lg font-semibold text-gray-800 flex-1 mr-2;
}

.card-excerpt {
  @apply text-gray-600 text-sm mb-4 line-clamp-2;
}

.card-actions {
  @apply flex gap-2 flex-wrap;
}

.status-badge {
  @apply px-2 py-1 text-xs font-medium rounded-full;
}

.status-draft {
  @apply bg-gray-100 text-gray-800;
}

.status-pending {
  @apply bg-yellow-100 text-yellow-800;
}

.status-published {
  @apply bg-green-100 text-green-800;
}

.author-info {
  @apply text-sm text-gray-500;
}

.moderation-card {
  @apply border-l-4 border-yellow-400;
}

/* Management */
.management-grid {
  @apply grid grid-cols-1 md:grid-cols-3 gap-6;
}

.management-card {
  @apply bg-white p-6 rounded-lg shadow border text-center;
}

.management-card h3 {
  @apply text-lg font-semibold mb-2;
}

.management-card p {
  @apply text-gray-600 mb-4;
}

/* Admin tools */
.tool-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6;
}

.tool-card {
  @apply bg-white p-6 rounded-lg shadow border hover:shadow-lg transition-all text-center no-underline;
}

.tool-icon {
  @apply text-4xl mb-4;
}

.tool-card h3 {
  @apply text-lg font-semibold mb-2 text-gray-800;
}

.tool-card p {
  @apply text-gray-600 text-sm;
}

.admin-only {
  @apply border-2 border-purple-200 rounded-lg p-6 bg-purple-50;
}

/* Recent news */
.recent-news {
  @apply space-y-4;
}

.news-item {
  @apply bg-white p-4 rounded-lg shadow border flex justify-between items-center;
}

.news-content {
  @apply flex-1;
}

.news-title {
  @apply font-semibold text-gray-800 mb-1;
}

.news-meta {
  @apply text-sm text-gray-500;
}

/* Limited access */
.limited-access-notice {
  @apply bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center;
}

.limited-access-notice h3 {
  @apply text-lg font-semibold text-yellow-800 mb-2;
}

.limited-access-notice p {
  @apply text-yellow-700;
}

/* Buttons */
.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2;
}

.btn-sm {
  @apply px-3 py-1 text-sm;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
}

.btn-secondary {
  @apply bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500;
}

.btn-outline {
  @apply border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500;
}

.btn-success {
  @apply bg-green-600 text-white hover:bg-green-700 focus:ring-green-500;
}

.btn-danger {
  @apply bg-red-600 text-white hover:bg-red-700 focus:ring-red-500;
}

/* Icons */
.icon-plus::before {
  content: '+';
  margin-right: 0.5rem;
}

.icon-users::before {
  content: '👥';
  margin-right: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-header {
    @apply space-y-4;
  }
  
  .stats-grid {
    @apply grid-cols-1;
  }
  
  .content-grid {
    @apply grid-cols-1;
  }
  
  .management-grid {
    @apply grid-cols-1;
  }
  
  .tool-grid {
    @apply grid-cols-1;
  }
}
</style>