<template>
  <div class="news-page">
    <div class="page-header">
      <h1>Actualités</h1>
      <button 
        v-if="hasPermission(PERMISSIONS.CREATE_NEWS)" 
        @click="$emit('tab-change', 'publier')" 
        class="primary"
      >
        Nouvelle actualité
      </button>
    </div>

    <div class="organization-tabs">
      <button
        v-for="tab in organizationTabs"
        :key="tab.key"
        @click="activeOrgTab = tab.key"
        :class="['org-tab', { active: activeOrgTab === tab.key }]"
      >
        <span>{{ tab.label }}</span>
        <span class="count">{{ getTabCount(tab.key) }}</span>
      </button>
    </div>

        <!-- Filtres -->
    <div class="filters">
      <input v-model="searchQuery" @input="handleSearch" placeholder="Rechercher..." class="search" />
      <select v-model="selectedCategory" @change="handleFilter">
        <option value="">Tous les niveaux</option>
        <option value="faible">🟢 Faible</option>
        <option value="moyenne">🟡 Moyenne</option>
        <option value="importante">🟠 Importante</option>
        <option value="urgente">🔴 Urgente</option>
      </select>
      <select v-model="sortBy" @change="handleSort">
        <option value="date-desc">Plus récent</option>
        <option value="date-asc">Plus ancien</option>
        <option value="importance">Par importance</option>
        <option value="title">Titre A–Z</option>
      </select>
    </div>

    <div v-if="loading" class="loading">Chargement...</div>

    <div v-else>
      <div v-if="filteredArticles.length === 0" class="empty">
        <h3>{{ getEmptyStateTitle() }}</h3>
        <p>{{ getEmptyStateMessage() }}</p>
        <button 
          v-if="hasPermission(PERMISSIONS.CREATE_NEWS)"
          @click="$emit('tab-change','publier')" 
          class="primary"
        >
          Publier
        </button>
      </div>

      <div v-else class="articles-grid">
        <article v-for="article in paginatedArticles" :key="article.id" class="article-card">
          <div class="meta">
            <span class="org-badge">{{ getOrgLabel(article.organization_level) }}</span>
            <span class="cat-badge" :class="getCategoryClass(article.category)">{{ getCategoryLabel(article.category) }}</span>
            <span v-if="article.status === 'pending'" class="status-badge pending">En attente</span>
            <span v-else-if="article.status === 'approved'" class="status-badge approved">Publié</span>
            <span v-else-if="article.status === 'rejected'" class="status-badge rejected">Rejeté</span>
            <time>{{ formatDate(article.created_at) }}</time>
          </div>

          <h2 class="title">{{ article.title || 'Sans titre' }}</h2>
          <p class="excerpt">{{ (article.content || '').substring(0,200) }}...</p>

          <!-- Pièces jointes -->
          <div v-if="article.attachments?.length" class="attachments-preview">
            <div class="attachments-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21.44 11.05L12.25 20.24C11.1242 21.3658 9.59722 21.9983 8.005 21.9983C6.41278 21.9983 4.88583 21.3658 3.76 20.24C2.63417 19.1142 2.00166 17.5872 2.00166 15.995C2.00166 14.4028 2.63417 12.8758 3.76 11.75L12.95 2.56C13.7006 1.80944 14.7186 1.38755 15.78 1.38755C16.8414 1.38755 17.8594 1.80944 18.61 2.56C19.3606 3.31056 19.7825 4.32856 19.7825 5.39C19.7825 6.45144 19.3606 7.46944 18.61 8.22L9.41 17.41C9.03494 17.7851 8.52556 17.9963 7.995 17.9963C7.46444 17.9963 6.95506 17.7851 6.58 17.41C6.20494 17.0349 5.99369 16.5256 5.99369 15.995C5.99369 15.4644 6.20494 14.9551 6.58 14.58L15.07 6.1" stroke="currentColor" stroke-width="2" fill="none"/>
              </svg>
              {{ article.attachments.length }} pièce{{ article.attachments.length > 1 ? 's' : '' }} jointe{{ article.attachments.length > 1 ? 's' : '' }}
            </div>
            <div class="attachment-thumbnails">
              <div 
                v-for="(attachment, index) in article.attachments.slice(0, 3)" 
                :key="index"
                class="attachment-thumb"
                :title="attachment.name"
              >
                <!-- Image thumbnail -->
                <img 
                  v-if="attachment.type?.startsWith('image/') && attachment.preview" 
                  :src="attachment.preview" 
                  :alt="attachment.name || 'Image'"
                  class="thumb-image"
                />
                <!-- Video icon -->
                <div v-else-if="attachment.type?.startsWith('video/')" class="thumb-icon video">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>
                  </svg>
                </div>
                <!-- Audio icon -->
                <div v-else-if="attachment.type?.startsWith('audio/')" class="thumb-icon audio">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18V5L21 3V20" stroke="currentColor" stroke-width="2"/>
                    <circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="2"/>
                    <circle cx="18" cy="20" r="3" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <!-- Document icon -->
                <div v-else class="thumb-icon doc">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
              </div>
              <div v-if="article.attachments.length > 3" class="more-attachments">
                +{{ article.attachments.length - 3 }}
              </div>
            </div>
          </div>

          <div class="footer">
            <div class="tags" v-if="article.tags?.length">
              <span v-for="t in article.tags.slice(0,3)" :key="t" class="tag">#{{ t }}</span>
            </div>
            <button class="read" @click="openArticle(article)">Lire</button>
          </div>
        </article>
      </div>

      <div v-if="totalPages > 1" class="pagination">
        <button @click="changePage(currentPage-1)" :disabled="currentPage===1">Précédent</button>
        <span class="page">{{ currentPage }} / {{ totalPages }}</span>
        <button @click="changePage(currentPage+1)" :disabled="currentPage===totalPages">Suivant</button>
      </div>
    </div>

    <!-- Modal de lecture d'article -->
    <div v-if="selectedArticle" class="article-modal-overlay" @click="closeArticle">
      <div class="article-modal" @click.stop>
        <div class="article-modal-header">
          <h1 class="article-title">{{ selectedArticle.title || 'Article sans titre' }}</h1>
          <button @click="closeArticle" class="close-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div class="article-modal-meta">
          <div class="meta-info">
            <span class="org-badge">{{ getOrgLabel(selectedArticle.organization_level) }}</span>
            <span class="cat-badge" :class="getCategoryClass(selectedArticle.category)">
              {{ getCategoryLabel(selectedArticle.category) }}
            </span>
            <span v-if="selectedArticle.status === 'pending'" class="status-badge pending">En attente</span>
            <span v-else-if="selectedArticle.status === 'approved'" class="status-badge approved">Publié</span>
            <span v-else-if="selectedArticle.status === 'rejected'" class="status-badge rejected">Rejeté</span>
          </div>
          <div class="meta-details">
            <time>{{ formatDate(selectedArticle.created_at) }}</time>
            <span v-if="selectedArticle.author" class="author">
              Par {{ selectedArticle.author.first_name }} {{ selectedArticle.author.last_name }}
            </span>
          </div>
        </div>

        <div class="article-modal-content">
          <!-- Résumé si disponible -->
          <div v-if="selectedArticle.excerpt" class="article-excerpt">
            <h3>Résumé</h3>
            <p>{{ selectedArticle.excerpt }}</p>
          </div>

          <!-- Contenu principal -->
          <div class="article-content">
            <div v-if="selectedArticle.content" v-html="formatContent(selectedArticle.content)"></div>
            <div v-else class="no-content">
              <p>Aucun contenu disponible pour cet article.</p>
            </div>
          </div>

          <!-- Pièces jointes -->
          <div v-if="selectedArticle.attachments?.length" class="article-attachments">
            <h3>Pièces jointes</h3>
            <div class="attachments-list">
              <div 
                v-for="(attachment, index) in selectedArticle.attachments" 
                :key="index"
                class="attachment-item"
                @click="downloadAttachment(attachment)"
              >
                <div class="attachment-icon">
                  <!-- Image preview -->
                  <img 
                    v-if="attachment.type?.startsWith('image/') && attachment.preview" 
                    :src="attachment.preview" 
                    :alt="attachment.name || 'Image'"
                    class="attachment-preview"
                  />
                  <!-- Video icon -->
                  <div v-else-if="attachment.type?.startsWith('video/')" class="file-icon video">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>
                    </svg>
                  </div>
                  <!-- Audio icon -->
                  <div v-else-if="attachment.type?.startsWith('audio/')" class="file-icon audio">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18V5L21 3V20" stroke="currentColor" stroke-width="2"/>
                      <circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="2"/>
                      <circle cx="18" cy="20" r="3" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </div>
                  <!-- Document icon -->
                  <div v-else class="file-icon doc">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
                      <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </div>
                </div>
                <div class="attachment-info">
                  <div class="attachment-name">{{ attachment.name || 'Fichier sans nom' }}</div>
                  <div class="attachment-meta">
                    <span class="attachment-size">{{ formatFileSize(attachment.size) }}</span>
                    <span class="attachment-type">{{ getFileTypeName(attachment.type) }}</span>
                  </div>
                </div>
                <div class="attachment-action">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div v-if="selectedArticle.tags?.length" class="article-tags">
            <h3>Tags</h3>
            <div class="tags-list">
              <span v-for="tag in selectedArticle.tags" :key="tag" class="article-tag">
                #{{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { newsService } from '@/services/news.service.js'
import { usePermissions, PERMISSIONS } from '@/composables/usePermissions.js'

const props = defineProps({ currentUser: { type: Object, required: true } })
const emit = defineEmits(['tab-change'])

// Système de permissions
const { hasPermission } = usePermissions(props.currentUser)

const organizationTabs = [
  { key: 'university', label: 'Université' },
  { key: 'faculty', label: 'Faculté' },
  { key: 'department', label: 'Département' },
  { key: 'auditoire', label: 'Auditoire' }
]

const activeOrgTab = ref('university')
const news = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const selectedCategory = ref('')
const sortBy = ref('date-desc')
const currentPage = ref(1)
const articlesPerPage = 8
const selectedArticle = ref(null)

onMounted(() => {
  loadNews()
  window.addEventListener('news-published', loadNews)
})

const loadNews = async () => {
  try {
    loading.value = true
    error.value = null
    
    console.log('🔄 Chargement des actualités depuis l\'API...')
    
    const response = await newsService.getNews({
      page: 1,
      limit: 100 // Charger plus d'articles pour le filtrage local
    })
    
    console.log('📡 Réponse API news:', response)
    
    if (response.success && response.data) {
      // Gérer différentes structures de réponse
      let articlesList = []
      
      if (Array.isArray(response.data)) {
        articlesList = response.data
      } else if (response.data.results && Array.isArray(response.data.results)) {
        articlesList = response.data.results
      } else if (response.data.news && Array.isArray(response.data.news)) {
        articlesList = response.data.news
      } else {
        console.warn('Structure de réponse API inattendue:', response.data)
        articlesList = []
      }
      
      console.log('📰 Articles bruts depuis API:', articlesList.length, articlesList)
      
      // Filtrage simplifié : disponibilité et université seulement
      const filteredArticles = articlesList.filter(article => {
        // 1. Vérifier la disponibilité de l'article (statut publié)
        const isAvailable = article.status === 'PUBLISHED' || 
                           article.status === 'published' ||
                           article.status === 'APPROVED' ||
                           article.status === 'approved'
        
        // 2. Vérifier l'université (si spécifiée dans l'article et utilisateur)
        const sameUniversity = !article.university_id || 
                              !props.currentUser.university_id || 
                              article.university_id === props.currentUser.university_id
        
        const canView = isAvailable && sameUniversity
        
        console.log('🔍 Filtrage simplifié:', {
          title: article.title,
          status: article.status,
          isAvailable,
          sameUniversity,
          canView,
          articleUniversityId: article.university_id,
          userUniversityId: props.currentUser.university_id
        })
        
        return canView
      })
      
      // Mapper avec la structure attendue pour l'affichage
      news.value = filteredArticles.map(article => ({
        ...article,
        organization_level: article.organization_level 
      }))
      
      console.log('✅ Articles filtrés affichés:', news.value.length, news.value)
      
    } else {
      throw new Error(response.message || 'Erreur lors du chargement des actualités')
    }
  } catch (err) {
    console.error('❌ Erreur lors du chargement des actualités:', err)
    error.value = 'Impossible de se connecter à l\'API pour charger les actualités'
    
    // Fallback vers localStorage
    console.log('🔄 Tentative de fallback vers localStorage...')
    try {
      const saved = JSON.parse(localStorage.getItem('ccc_news') || '[]')
      news.value = saved
        .filter(article => {
          // Même filtrage simplifié pour localStorage
          const isAvailable = article.status === 'PUBLISHED' || article.status === 'published'
          const sameUniversity = !article.university_id || 
                                !props.currentUser.university_id || 
                                article.university_id === props.currentUser.university_id
          return isAvailable && sameUniversity
        })
        .map(a => ({ organization_level: a.organization_level || 'university', ...a }))
      
      console.log('⚠️ Articles chargés depuis localStorage (fallback):', news.value.length)
    } catch (fallbackError) {
      console.error('❌ Erreur fallback localStorage:', fallbackError)
      news.value = []
    }
  } finally {
    loading.value = false
  }
}

const getTabCount = (key) => news.value.filter(a => (a.organization_level || 'university') === key).length

const filteredArticles = computed(() => {
  let items = news.value.slice()

  if (activeOrgTab.value) {
    items = items.filter(a => (a.organization_level || 'university') === activeOrgTab.value)
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    items = items.filter(a => (a.title + ' ' + (a.content || '') + ' ' + (a.author?.first_name || '') + ' ' + (a.author?.last_name || '')).toLowerCase().includes(q))
  }

  if (selectedCategory.value) items = items.filter(a => a.category === selectedCategory.value)

  items.sort((a,b) => {
    if (sortBy.value === 'date-desc') return new Date(b.created_at) - new Date(a.created_at)
    if (sortBy.value === 'date-asc') return new Date(a.created_at) - new Date(b.created_at)
    if (sortBy.value === 'importance') return getCategoryPriority(b.category) - getCategoryPriority(a.category)
    if (sortBy.value === 'title') return (a.title || '').localeCompare(b.title || '')
    return 0
  })

  return items
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredArticles.value.length / articlesPerPage)))
const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * articlesPerPage
  return filteredArticles.value.slice(start, start + articlesPerPage)
})

const handleSearch = () => { currentPage.value = 1 }
const handleFilter = () => { currentPage.value = 1 }
const handleSort = () => { currentPage.value = 1 }
const changePage = (p) => { if (p >=1 && p <= totalPages.value) currentPage.value = p }

const openArticle = (article) => {
  console.log('📖 Ouverture de l\'article:', article.title)
  selectedArticle.value = article
  // Bloquer le scroll du body
  document.body.style.overflow = 'hidden'
}

const closeArticle = () => {
  console.log('❌ Fermeture de l\'article')
  selectedArticle.value = null
  // Restaurer le scroll du body
  document.body.style.overflow = 'auto'
}

const formatContent = (content) => {
  if (!content) return ''
  // Convertir les retours à la ligne en <br>
  return content.replace(/\n/g, '<br>')
}

const downloadAttachment = (attachment) => {
  console.log('📎 Téléchargement de:', attachment.name)
  if (attachment.url) {
    window.open(attachment.url, '_blank')
  } else if (attachment.data) {
    // Si c'est des données en base64
    const link = document.createElement('a')
    link.href = attachment.data
    link.download = attachment.name || 'fichier'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else {
    console.warn('Aucune URL de téléchargement disponible pour:', attachment)
  }
}

const formatFileSize = (bytes) => {
  if (!bytes) return 'Taille inconnue'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB'
  return Math.round(bytes / 1048576) + ' MB'
}

const getFileTypeName = (mimeType) => {
  if (!mimeType) return 'Fichier'
  if (mimeType.startsWith('image/')) return 'Image'
  if (mimeType.startsWith('video/')) return 'Vidéo'
  if (mimeType.startsWith('audio/')) return 'Audio'
  if (mimeType.includes('pdf')) return 'PDF'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'Document'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'Tableur'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'Présentation'
  return 'Fichier'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

const getOrgLabel = (k) => {
  switch(k) {
    case 'faculty': return 'Faculté'
    case 'department': return 'Département'
    case 'auditoire': return 'Auditoire'
    default: return 'Université'
  }
}

const getCategoryLabel = (category) => {
  switch(category) {
    case 'faible': return '🟢 Faible'
    case 'moyenne': return '🟡 Moyenne'
    case 'importante': return '🟠 Importante'
    case 'urgente': return '🔴 Urgente'
    default: return category || 'Non défini'
  }
}

const getCategoryPriority = (category) => {
  switch(category) {
    case 'urgente': return 4
    case 'importante': return 3
    case 'moyenne': return 2
    case 'faible': return 1
    default: return 0
  }
}

const getCategoryClass = (category) => {
  switch(category) {
    case 'urgente': return 'urgente'
    case 'importante': return 'importante'
    case 'moyenne': return 'moyenne'
    case 'faible': return 'faible'
    default: return 'default'
  }
}

const getEmptyStateTitle = () => searchQuery.value ? 'Aucun résultat' : `Aucune actualité pour ${getOrgLabel(activeOrgTab.value)}`
const getEmptyStateMessage = () => searchQuery.value ? 'Essayez un autre mot-clé.' : 'Soyez le premier à publier.'

watch([activeOrgTab, searchQuery, selectedCategory, sortBy], () => { currentPage.value = 1 })
</script>

<style scoped>
.news-page { 
  max-width: 1200px; 
  margin: 0 auto; 
  padding: 1.5rem; 
}

.page-header { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  gap: 1rem; 
  margin-bottom: 1rem; 
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
}

.organization-tabs { 
  display: flex; 
  gap: 0.5rem; 
  margin-bottom: 1rem; 
}

.org-tab { 
  padding: 0.5rem 0.75rem; 
  border-radius: 8px; 
  background: #ffffff; 
  border: 1px solid #e2e8f0; 
  cursor: pointer; 
  display: flex; 
  gap: 0.5rem; 
  align-items: center;
  transition: all 0.2s ease;
}

.org-tab:hover {
  border-color: #6366f1;
}

.org-tab.active { 
  background: linear-gradient(135deg, #6366f1, #8b5cf6); 
  color: white; 
  border-color: transparent;
}

.org-tab .count { 
  background: rgba(0,0,0,0.06); 
  padding: 0.15rem 0.4rem; 
  border-radius: 999px; 
  font-size: 0.85rem;
}

.org-tab.active .count {
  background: rgba(255,255,255,0.2);
}

.filters { 
  display: flex; 
  gap: 0.75rem; 
  align-items: center; 
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.search { 
  padding: 0.5rem 0.75rem; 
  flex: 1; 
  border-radius: 8px; 
  border: 1px solid #e2e8f0;
  min-width: 200px;
}

.filters select {
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
}

.articles-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); 
  gap: 1rem; 
}

.article-card { 
  padding: 1rem; 
  background: #ffffff; 
  border: 1px solid #e2e8f0; 
  border-radius: 10px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.article-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.article-card .meta { 
  display: flex; 
  gap: 0.5rem; 
  align-items: center; 
  font-size: 0.85rem; 
  color: #718096; 
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.org-badge { 
  padding: 0.15rem 0.5rem; 
  border-radius: 999px; 
  background: rgba(99,102,241,0.08); 
  color: #6366f1; 
  font-weight: 600;
  font-size: 0.8rem;
}

.cat-badge { 
  padding: 0.15rem 0.5rem; 
  border-radius: 999px; 
  background: rgba(0,0,0,0.04);
  font-size: 0.8rem;
  font-weight: 600;
}

.cat-badge.faible {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.cat-badge.moyenne {
  background: rgba(234, 179, 8, 0.1);
  color: #ca8a04;
}

.cat-badge.importante {
  background: rgba(249, 115, 22, 0.1);
  color: #ea580c;
}

.cat-badge.urgente {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  animation: pulse-urgent 2s infinite;
}

/* Badges de statut */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-badge.pending {
  background: rgba(234, 179, 8, 0.1);
  color: #ca8a04;
  border: 1px solid rgba(234, 179, 8, 0.2);
}

.status-badge.approved {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.status-badge.rejected {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

@keyframes pulse-urgent {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.title { 
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a202c;
  line-height: 1.4;
}

.excerpt {
  color: #4a5568;
  line-height: 1.5;
  margin-bottom: 0.75rem;
}

.footer { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-top: 0.75rem; 
}

.tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag { 
  background: #f8fafc; 
  padding: 0.15rem 0.4rem; 
  border-radius: 6px; 
  font-size: 0.8rem;
  color: #4a5568;
}

.read {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.read:hover {
  transform: translateY(-1px);
}

.pagination { 
  display: flex; 
  gap: 0.5rem; 
  align-items: center; 
  justify-content: center; 
  margin-top: 1rem; 
}

.pagination button {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination button:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #6366f1;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page {
  font-weight: 600;
  color: #4a5568;
}

.primary { 
  background: linear-gradient(135deg, #6366f1, #8b5cf6); 
  color: white; 
  padding: 0.5rem 0.75rem; 
  border-radius: 8px; 
  border: none; 
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.loading, .empty { 
  text-align: center; 
  padding: 2rem;
  color: #4a5568;
}

.loading {
  font-size: 1.1rem;
}

.empty h3 {
  margin-bottom: 0.5rem;
  color: #1a202c;
}

@media (max-width: 1200px) {
  .articles-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .news-page {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .organization-tabs {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .org-tab {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
  
  .filters {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .search {
    min-width: auto;
    padding: 0.75rem;
    font-size: 1rem;
  }
  
  .filters select {
    padding: 0.75rem;
    font-size: 0.875rem;
  }
  
  .articles-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .article-card {
    padding: 1rem;
  }
  
  .article-card h2 {
    font-size: 1.1rem;
  }
  
  .pagination {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .pagination button {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .news-page {
    padding: 0.75rem;
  }
  
  .page-header h1 {
    font-size: 1.25rem;
  }
  
  .organization-tabs {
    gap: 0.25rem;
  }
  
  .org-tab {
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
    flex: 1;
    text-align: center;
  }
  
  .org-tab .count {
    font-size: 0.7rem;
  }
  
  .filters {
    gap: 0.5rem;
  }
  
  .search {
    padding: 0.6rem;
    font-size: 0.9rem;
  }
  
  .filters select {
    padding: 0.6rem;
    font-size: 0.8rem;
  }
  
  .article-card {
    padding: 0.75rem;
  }
  
  .article-card h2 {
    font-size: 1rem;
    line-height: 1.3;
  }
  
  .article-card p {
    font-size: 0.875rem;
  }
  
  .meta {
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  
  .org-badge, 
  .cat-badge {
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
  }
  
  .author {
    font-size: 0.75rem;
  }
  
  .stats {
    gap: 0.75rem;
  }
  
  .stat-item {
    font-size: 0.7rem;
  }
  
  .pagination {
    justify-content: center;
  }
  
  .pagination button {
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
  }
  
  .attachments-preview {
    padding: 0.5rem;
  }
  
  .attachment-thumb {
    width: 28px;
    height: 28px;
  }
}

@media (max-width: 360px) {
  .news-page {
    padding: 0.5rem;
  }
  
  .page-header h1 {
    font-size: 1.1rem;
  }
  
  .org-tab {
    padding: 0.3rem 0.5rem;
    font-size: 0.7rem;
  }
  
  .org-tab span:first-child {
    display: none;
  }
  
  .search {
    padding: 0.5rem;
    font-size: 0.85rem;
  }
  
  .filters select {
    padding: 0.5rem;
    font-size: 0.75rem;
  }
  
  .article-card {
    padding: 0.5rem;
  }
  
  .article-card h2 {
    font-size: 0.9rem;
  }
  
  .article-card p {
    font-size: 0.8rem;
  }
  
  .pagination button {
    padding: 0.3rem 0.5rem;
    font-size: 0.75rem;
  }
}

/* Landscape orientation optimizations */
@media (max-height: 500px) and (orientation: landscape) {
  .page-header {
    flex-direction: row;
    align-items: center;
    gap: 1rem;
  }
  
  .organization-tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .organization-tabs::-webkit-scrollbar {
    display: none;
  }
  
  .filters {
    flex-direction: row;
    flex-wrap: wrap;
  }
}

/* Styles pour les pièces jointes */
.attachments-preview {
  margin: 0.75rem 0;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.attachments-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: #4b5563;
}

.attachments-header svg {
  color: #6b7280;
}

.attachment-thumbnails {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.attachment-thumb {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
}

.thumb-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumb-icon.video {
  background: #fef3c7;
  color: #f59e0b;
}

.thumb-icon.audio {
  background: #dcfce7;
  color: #16a34a;
}

.thumb-icon.doc {
  background: #dbeafe;
  color: #2563eb;
}

.more-attachments {
  font-size: 0.75rem;
  color: #6b7280;
  background: #e5e7eb;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

/* Modal de lecture d'article */
.article-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.article-modal {
  background: white;
  border-radius: 12px;
  max-width: 4xl;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.article-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 2rem 2rem 0 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.article-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
  margin: 0;
  flex: 1;
}

.close-button {
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.close-button:hover {
  background: #e5e7eb;
  color: #374151;
}

.article-modal-meta {
  padding: 1rem 2rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.meta-info {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.meta-details {
  display: flex;
  gap: 1rem;
  align-items: center;
  color: #6b7280;
  font-size: 0.875rem;
}

.author {
  font-weight: 500;
  color: #4b5563;
}

.article-modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.article-excerpt {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.article-excerpt h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.75rem 0;
}

.article-excerpt p {
  color: #6b7280;
  line-height: 1.6;
  font-style: italic;
  margin: 0;
}

.article-content {
  margin-bottom: 2rem;
}

.article-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
}

.article-content div {
  color: #374151;
  line-height: 1.7;
  font-size: 1rem;
}

.no-content {
  color: #9ca3af;
  font-style: italic;
  text-align: center;
  padding: 2rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #d1d5db;
}

.article-attachments {
  margin-bottom: 2rem;
}

.article-attachments h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.article-attachments h3::before {
  content: '📎';
  font-size: 1rem;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.attachment-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
  transform: translateY(-1px);
}

.attachment-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.attachment-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.file-icon.video {
  background: #fef3c7;
  color: #f59e0b;
}

.file-icon.audio {
  background: #dcfce7;
  color: #16a34a;
}

.file-icon.doc {
  background: #dbeafe;
  color: #2563eb;
}

.attachment-info {
  flex: 1;
}

.attachment-name {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.attachment-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.attachment-action {
  color: #6b7280;
  transition: color 0.2s ease;
}

.attachment-item:hover .attachment-action {
  color: #374151;
}

.article-tags {
  margin-bottom: 2rem;
}

.article-tags h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.article-tags h3::before {
  content: '🏷️';
  font-size: 1rem;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.article-tag {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.article-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.3);
}

/* Responsive pour le modal */
@media (max-width: 768px) {
  .article-modal {
    margin: 0;
    border-radius: 0;
    max-height: 100vh;
    height: 100vh;
  }

  .article-modal-header {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
  }

  .article-title {
    font-size: 1.5rem;
  }

  .article-modal-meta {
    padding: 1rem 1.5rem;
    flex-direction: column;
    align-items: flex-start;
  }

  .article-modal-content {
    padding: 1.5rem;
  }

  .attachment-item {
    padding: 0.75rem;
    gap: 0.75rem;
  }

  .attachment-icon {
    width: 40px;
    height: 40px;
  }

  .attachment-meta {
    flex-direction: column;
    gap: 0.25rem;
  }
}

@media (max-width: 480px) {
  .article-modal-overlay {
    padding: 0;
  }

  .article-modal-header {
    padding: 1rem;
  }

  .article-title {
    font-size: 1.25rem;
  }

  .article-modal-meta {
    padding: 1rem;
  }

  .article-modal-content {
    padding: 1rem;
  }

  .meta-info {
    flex-wrap: wrap;
  }

  .meta-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>