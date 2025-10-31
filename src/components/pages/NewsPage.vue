<template>
  <div class="news-page">
    <div class="page-header">
      <h1>Actualités</h1>
      <button @click="$emit('tab-change', 'publier')" class="primary">Nouvelle actualité</button>
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
        <button @click="$emit('tab-change','publier')" class="primary">Publier</button>
      </div>

      <div v-else class="articles-grid">
        <article v-for="article in paginatedArticles" :key="article.id" class="article-card">
          <div class="meta">
            <span class="org-badge">{{ getOrgLabel(article.organization_level) }}</span>
            <span class="cat-badge" :class="getCategoryClass(article.category)">{{ getCategoryLabel(article.category) }}</span>
            <time>{{ formatDate(article.created_at) }}</time>
          </div>

          <h2 class="title">{{ article.title }}</h2>
          <p class="excerpt">{{ article.content.substring(0,200) }}...</p>

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
                  v-if="attachment.type.startsWith('image/') && attachment.preview" 
                  :src="attachment.preview" 
                  :alt="attachment.name"
                  class="thumb-image"
                />
                <!-- Video icon -->
                <div v-else-if="attachment.type.startsWith('video/')" class="thumb-icon video">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>
                  </svg>
                </div>
                <!-- Audio icon -->
                <div v-else-if="attachment.type.startsWith('audio/')" class="thumb-icon audio">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({ currentUser: { type: Object, required: true } })
const emit = defineEmits(['tab-change'])

const organizationTabs = [
  { key: 'university', label: 'Université' },
  { key: 'faculty', label: 'Faculté' },
  { key: 'department', label: 'Département' },
  { key: 'auditoire', label: 'Auditoire' }
]

const activeOrgTab = ref('university')
const news = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedCategory = ref('')
const sortBy = ref('date-desc')
const currentPage = ref(1)
const articlesPerPage = 8

onMounted(() => {
  loadNews()
  window.addEventListener('news-published', loadNews)
})

const loadNews = () => {
  const saved = JSON.parse(localStorage.getItem('ccc_news') || '[]')
  // Filtrer seulement les articles approuvés
  news.value = saved
    .filter(article => article.status === 'approved')
    .map(a => ({ organization_level: a.organization_level || 'university', ...a }))
  loading.value = false
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
const openArticle = (a) => { console.log('open', a) }

const formatDate = (dateStr) => {
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
</style>