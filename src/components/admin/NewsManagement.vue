<template>
  <div class="news-management-page">
    <!-- En-tête de la page -->
    <div class="page-header">
      <h1 class="page-title">Gestion des Actualités</h1>
      
      <!-- Bouton de création - seulement si permissions de création -->
      <PermissionGuard :permissions="['create_news']">
        <button 
          @click="openCreateModal"
          class="btn btn-primary"
        >
          <i class="icon-plus"></i>
          Nouvelle actualité
        </button>
      </PermissionGuard>
    </div>

    <!-- Statistiques - seulement pour certains rôles -->
    <PermissionGuard :permissions="['view_statistics']">
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Total des articles</h3>
            <p class="stat-number">{{ statistics.totalArticles }}</p>
          </div>
          <div class="stat-card">
            <h3>Articles publiés</h3>
            <p class="stat-number">{{ statistics.publishedArticles }}</p>
          </div>
          <div class="stat-card">
            <h3>Brouillons</h3>
            <p class="stat-number">{{ statistics.draftArticles }}</p>
          </div>
          <div class="stat-card">
            <h3>En attente</h3>
            <p class="stat-number">{{ statistics.pendingArticles }}</p>
          </div>
        </div>
      </div>
    </PermissionGuard>

    <!-- Filtres et recherche -->
    <div class="filters-section">
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher des actualités..."
          class="search-input"
        >
      </div>

      <!-- Filtres avancés pour les modérateurs et administrateurs -->
      <PermissionGuard :roles="['super_admin', 'university_admin', 'moderator']">
        <div class="filters">
          <select v-model="statusFilter" class="filter-select">
            <option value="">Tous les statuts</option>
            <option value="draft">Brouillons</option>
            <option value="pending">En attente</option>
            <option value="published">Publiés</option>
            <option value="rejected">Rejetés</option>
          </select>

          <select v-model="authorFilter" class="filter-select">
            <option value="">Tous les auteurs</option>
            <option v-for="author in authors" :key="author.id" :value="author.id">
              {{ author.full_name }}
            </option>
          </select>
        </div>
      </PermissionGuard>
    </div>

    <!-- Liste des actualités -->
    <div class="news-list">
      <div 
        v-for="article in filteredArticles" 
        :key="article.id"
        class="news-card"
      >
        <div class="news-header">
          <h3 class="news-title">{{ article.title }}</h3>
          <span :class="['status-badge', `status-${article.status}`]">
            {{ getStatusLabel(article.status) }}
          </span>
        </div>

        <p class="news-excerpt">{{ article.excerpt }}</p>
        
        <div class="news-meta">
          <span class="author">Par {{ article.author?.full_name }}</span>
          <span class="date">{{ formatDate(article.created_at) }}</span>
          
          <!-- Informations universitaires selon permissions -->
          <PermissionGuard :permissions="['view_universities']">
            <span class="university">{{ article.university?.name }}</span>
          </PermissionGuard>
        </div>

        <div class="news-actions">
          <!-- Action Voir - disponible pour tous avec view_news -->
          <PermissionGuard :permissions="['view_news']">
            <button 
              @click="viewArticle(article)"
              class="btn btn-sm btn-outline"
            >
              Voir
            </button>
          </PermissionGuard>

          <!-- Action Éditer - selon permissions ou propriété -->
          <PermissionGuard 
            :permissions="['edit_news']"
            :checkOwnership="true"
            :resourceUserId="article.author?.id"
            fallbackMessage=""
          >
            <button 
              @click="editArticle(article)"
              class="btn btn-sm btn-secondary"
            >
              Éditer
            </button>
          </PermissionGuard>

          <!-- Actions de modération - seulement modérateurs et plus -->
          <PermissionGuard :roles="['super_admin', 'university_admin', 'moderator']">
            <div class="moderation-actions">
              <button 
                v-if="article.status === 'pending'"
                @click="approveArticle(article)"
                class="btn btn-sm btn-success"
              >
                Approuver
              </button>
              
              <button 
                v-if="article.status === 'pending'"
                @click="rejectArticle(article)"
                class="btn btn-sm btn-danger"
              >
                Rejeter
              </button>

              <button 
                v-if="article.status === 'published'"
                @click="unpublishArticle(article)"
                class="btn btn-sm btn-warning"
              >
                Dépublier
              </button>
            </div>
          </PermissionGuard>

          <!-- Suppression - super admin seulement -->
          <PermissionGuard :roles="['super_admin']">
            <button 
              @click="deleteArticle(article)"
              class="btn btn-sm btn-danger"
            >
              Supprimer
            </button>
          </PermissionGuard>
        </div>
      </div>
    </div>

    <!-- Message si aucune actualité -->
    <PermissionGuard :permissions="['view_news']" fallbackMessage="">
      <div v-if="filteredArticles.length === 0" class="empty-state">
        <p>Aucune actualité trouvée.</p>
        
        <!-- Suggestion de création pour ceux qui peuvent créer -->
        <PermissionGuard :permissions="['create_news']">
          <button 
            @click="openCreateModal"
            class="btn btn-primary"
          >
            Créer la première actualité
          </button>
        </PermissionGuard>
      </div>
    </PermissionGuard>

    <!-- Message d'accès refusé si pas de permissions -->
    <PermissionGuard 
      :permissions="['view_news']" 
      fallbackMessage="Vous n'avez pas les permissions nécessaires pour voir les actualités."
    >
      <template #fallback>
        <div class="access-denied">
          <h2>Accès refusé</h2>
          <p>Vous n'avez pas les permissions nécessaires pour accéder à cette section.</p>
          <router-link to="/" class="btn btn-primary">
            Retour à l'accueil
          </router-link>
        </div>
      </template>
    </PermissionGuard>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import PermissionGuard from '@/components/common/PermissionGuard.vue'
import { usePermissions } from '@/services/permission.service.js'

export default {
  name: 'NewsManagement',
  components: {
    PermissionGuard
  },
  setup() {
    // État réactif
    const articles = ref([])
    const authors = ref([])
    const searchQuery = ref('')
    const statusFilter = ref('')
    const authorFilter = ref('')
    const loading = ref(false)

    // Composable des permissions
    const { hasPermission, hasRole, getCurrentUser } = usePermissions()

    // Statistiques (mock data)
    const statistics = ref({
      totalArticles: 0,
      publishedArticles: 0,
      draftArticles: 0,
      pendingArticles: 0
    })

    // Articles filtrés selon la recherche et les filtres
    const filteredArticles = computed(() => {
      let filtered = [...articles.value]

      // Filtrage par recherche
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(article => 
          article.title.toLowerCase().includes(query) ||
          article.excerpt.toLowerCase().includes(query) ||
          article.author?.full_name.toLowerCase().includes(query)
        )
      }

      // Filtrage par statut
      if (statusFilter.value) {
        filtered = filtered.filter(article => article.status === statusFilter.value)
      }

      // Filtrage par auteur
      if (authorFilter.value) {
        filtered = filtered.filter(article => article.author?.id === authorFilter.value)
      }

      return filtered
    })

    // Charger les données
    const loadData = async () => {
      loading.value = true
      try {
        // Simulation d'un appel API
        // Dans la vraie implementation, vous utiliseriez un service d'actualités
        articles.value = [
          {
            id: 1,
            title: "Nouvelle formation en Intelligence Artificielle",
            excerpt: "L'université lance un nouveau programme de master en IA...",
            status: "published",
            author: { id: 1, full_name: "Dr. Jean Dupont" },
            university: { id: 1, name: "Université de Paris" },
            created_at: new Date('2024-01-15')
          },
          {
            id: 2,
            title: "Conférence internationale sur le développement durable",
            excerpt: "Un événement majeur réunit chercheurs et étudiants...",
            status: "pending",
            author: { id: 2, full_name: "Prof. Marie Martin" },
            university: { id: 2, name: "Université de Lyon" },
            created_at: new Date('2024-01-10')
          },
          {
            id: 3,
            title: "Résultats de recherche en biotechnologie",
            excerpt: "Des avancées significatives dans le domaine...",
            status: "draft",
            author: { id: 3, full_name: "Dr. Pierre Durand" },
            university: { id: 1, name: "Université de Paris" },
            created_at: new Date('2024-01-05')
          }
        ]

        // Charger la liste des auteurs pour les filtres
        authors.value = [
          { id: 1, full_name: "Dr. Jean Dupont" },
          { id: 2, full_name: "Prof. Marie Martin" },
          { id: 3, full_name: "Dr. Pierre Durand" }
        ]

        // Calculer les statistiques
        updateStatistics()
        
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      } finally {
        loading.value = false
      }
    }

    // Mettre à jour les statistiques
    const updateStatistics = () => {
      statistics.value = {
        totalArticles: articles.value.length,
        publishedArticles: articles.value.filter(a => a.status === 'published').length,
        draftArticles: articles.value.filter(a => a.status === 'draft').length,
        pendingArticles: articles.value.filter(a => a.status === 'pending').length
      }
    }

    // Actions sur les articles
    const viewArticle = (article) => {
      console.log('Voir article:', article)
      // Navigation vers la vue détaillée
    }

    const editArticle = (article) => {
      console.log('Éditer article:', article)
      // Navigation vers le formulaire d'édition
    }

    const openCreateModal = () => {
      console.log('Ouvrir modal de création')
      // Ouvrir modal ou navigation vers création
    }

    // Actions de modération
    const approveArticle = async (article) => {
      try {
        // API call to approve
        article.status = 'published'
        updateStatistics()
      } catch (error) {
        console.error('Erreur lors de l\'approbation:', error)
      }
    }

    const rejectArticle = async (article) => {
      try {
        // API call to reject
        article.status = 'rejected'
        updateStatistics()
      } catch (error) {
        console.error('Erreur lors du rejet:', error)
      }
    }

    const unpublishArticle = async (article) => {
      try {
        // API call to unpublish
        article.status = 'draft'
        updateStatistics()
      } catch (error) {
        console.error('Erreur lors de la dépublication:', error)
      }
    }

    const deleteArticle = async (article) => {
      if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
        try {
          // API call to delete
          const index = articles.value.findIndex(a => a.id === article.id)
          if (index > -1) {
            articles.value.splice(index, 1)
            updateStatistics()
          }
        } catch (error) {
          console.error('Erreur lors de la suppression:', error)
        }
      }
    }

    // Utilitaires
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
      loadData()
    })

    return {
      // État
      articles,
      authors,
      searchQuery,
      statusFilter,
      authorFilter,
      loading,
      statistics,
      filteredArticles,

      // Actions
      viewArticle,
      editArticle,
      openCreateModal,
      approveArticle,
      rejectArticle,
      unpublishArticle,
      deleteArticle,

      // Utilitaires
      getStatusLabel,
      formatDate,

      // Permissions
      hasPermission,
      hasRole,
      getCurrentUser
    }
  }
}
</script>

<style scoped>
.news-management-page {
  @apply max-w-7xl mx-auto p-6;
}

.page-header {
  @apply flex justify-between items-center mb-8;
}

.page-title {
  @apply text-3xl font-bold text-gray-800;
}

/* Statistiques */
.stats-section {
  @apply mb-8;
}

.stats-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6;
}

.stat-card {
  @apply bg-white p-6 rounded-lg shadow border;
}

.stat-card h3 {
  @apply text-sm font-medium text-gray-600 mb-2;
}

.stat-number {
  @apply text-3xl font-bold text-blue-600;
}

/* Filtres */
.filters-section {
  @apply mb-6 space-y-4;
}

.search-bar {
  @apply w-full;
}

.search-input {
  @apply w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.filters {
  @apply flex flex-wrap gap-4;
}

.filter-select {
  @apply px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500;
}

/* Liste des actualités */
.news-list {
  @apply space-y-6;
}

.news-card {
  @apply bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow;
}

.news-header {
  @apply flex justify-between items-start mb-3;
}

.news-title {
  @apply text-xl font-semibold text-gray-800 flex-1 mr-4;
}

.status-badge {
  @apply px-3 py-1 text-xs font-medium rounded-full;
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

.status-rejected {
  @apply bg-red-100 text-red-800;
}

.news-excerpt {
  @apply text-gray-600 mb-4 line-clamp-2;
}

.news-meta {
  @apply flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4;
}

.news-actions {
  @apply flex flex-wrap gap-2;
}

.moderation-actions {
  @apply flex gap-2;
}

/* Boutons */
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

.btn-warning {
  @apply bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500;
}

.btn-danger {
  @apply bg-red-600 text-white hover:bg-red-700 focus:ring-red-500;
}

/* États vides et erreurs */
.empty-state {
  @apply text-center py-12;
}

.empty-state p {
  @apply text-gray-600 mb-4;
}

.access-denied {
  @apply text-center py-12;
}

.access-denied h2 {
  @apply text-2xl font-bold text-gray-800 mb-4;
}

.access-denied p {
  @apply text-gray-600 mb-6;
}

/* Icônes */
.icon-plus::before {
  content: '+';
  margin-right: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    @apply flex-col items-start space-y-4;
  }
  
  .stats-grid {
    @apply grid-cols-2;
  }
  
  .news-actions {
    @apply flex-col items-start;
  }
}
</style>