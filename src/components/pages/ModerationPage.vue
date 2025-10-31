<template>
  <div class="moderation-page">
    <div class="page-header">
      <div class="header-content">
        <h1>Modération</h1>
        <p class="subtitle">Gérez les articles en attente de validation</p>
      </div>
      
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon pending">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="stat-info">
            <h3>{{ pendingNews.length }}</h3>
            <p>En attente</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon approved">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-info">
            <h3>{{ approvedToday }}</h3>
            <p>Approuvés aujourd'hui</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon rejected">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M15 9L9 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M9 9L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="stat-info">
            <h3>{{ rejectedToday }}</h3>
            <p>Rejetés aujourd'hui</p>
          </div>
        </div>
      </div>
    </div>

    <div class="filters">
      <div class="filter-group">
        <label>Filtrer par :</label>
        <select v-model="selectedFilter" class="filter-select">
          <option value="all">Tous les articles</option>
          <option value="pending">En attente</option>
          <option value="approved">Approuvés</option>
          <option value="rejected">Rejetés</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Importance :</label>
        <select v-model="selectedImportance" class="filter-select">
          <option value="">Toutes</option>
          <option value="urgente">Urgente</option>
          <option value="importante">Importante</option>
          <option value="moyenne">Moyenne</option>
          <option value="faible">Faible</option>
        </select>
      </div>
      
      <div class="search-group">
        <div class="search-input">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Rechercher un article..."
          />
        </div>
      </div>
    </div>

    <div class="news-list">
      <div v-if="filteredNews.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
            <path d="M14 2V8H20" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <h3>Aucun article trouvé</h3>
        <p>Aucun article ne correspond aux critères de recherche</p>
      </div>

      <div v-else class="articles-grid">
        <article 
          v-for="article in filteredNews" 
          :key="article.id"
          class="article-card"
          :class="{ 
            'status-pending': article.status === 'pending',
            'status-approved': article.status === 'approved',
            'status-rejected': article.status === 'rejected'
          }"
        >
          <div class="article-header">
            <div class="article-meta">
              <span class="importance-badge" :class="`importance-${article.importance}`">
                {{ article.importance }}
              </span>
              <span class="status-badge" :class="`status-${article.status}`">
                {{ getStatusLabel(article.status) }}
              </span>
            </div>
            
            <div class="article-actions" v-if="article.status === 'pending'">
              <button 
                @click="approveArticle(article)"
                class="action-btn approve"
                title="Approuver"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
              
              <button 
                @click="rejectArticle(article)"
                class="action-btn reject"
                title="Rejeter"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M15 9L9 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M9 9L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="article-content">
            <h3 class="article-title">{{ article.title }}</h3>
            <p class="article-excerpt">{{ truncateText(article.content, 120) }}</p>
            
            <div class="article-attachments" v-if="article.attachments && article.attachments.length > 0">
              <div class="attachment-count">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21.44 11.05L12.25 20.24C11.1242 21.3658 9.59722 21.9983 8.005 21.9983C6.41278 21.9983 4.88583 21.3658 3.76 20.24C2.63417 19.1142 2.00166 17.5872 2.00166 15.995C2.00166 14.4028 2.63417 12.8758 3.76 11.75L12.33 3.18C13.0806 2.42944 14.0999 2.00833 15.16 2.00833C16.2201 2.00833 17.2394 2.42944 17.99 3.18C18.7406 3.93056 19.1617 4.94989 19.1617 6.01C19.1617 7.07011 18.7406 8.08944 17.99 8.84L9.41 17.41C9.03467 17.7853 8.52464 17.9957 7.995 17.9957C7.46536 17.9957 6.95533 17.7853 6.58 17.41C6.20467 17.0347 5.99427 16.5246 5.99427 15.995C5.99427 15.4654 6.20467 14.9553 6.58 14.58L14.5 6.66" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                {{ article.attachments.length }} fichier(s)
              </div>
            </div>
          </div>

          <div class="article-footer">
            <div class="author-info">
              <div class="author-avatar">
                {{ article.author?.first_name?.[0] || 'U' }}{{ article.author?.last_name?.[0] || 'U' }}
              </div>
              <div class="author-details">
                <span class="author-name">{{ article.author?.first_name }} {{ article.author?.last_name }}</span>
                <span class="publish-date">{{ formatDate(article.created_at) }}</span>
              </div>
            </div>
            
            <div class="article-scope">
              <span class="scope-badge">{{ article.scope }}</span>
            </div>
          </div>

          <!-- Zone de commentaire pour le rejet -->
          <div v-if="article.showRejectForm" class="reject-form">
            <textarea 
              v-model="article.rejectReason"
              placeholder="Raison du rejet..."
              class="reject-textarea"
            ></textarea>
            <div class="reject-actions">
              <button @click="confirmReject(article)" class="confirm-reject-btn">
                Confirmer le rejet
              </button>
              <button @click="cancelReject(article)" class="cancel-reject-btn">
                Annuler
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// État réactif
const allNews = ref([])
const selectedFilter = ref('pending')
const selectedImportance = ref('')
const searchQuery = ref('')

// Charger les données
onMounted(() => {
  loadNews()
})

const loadNews = () => {
  // Récupérer les articles depuis localStorage
  const savedNews = localStorage.getItem('ccc_news')
  if (savedNews) {
    allNews.value = JSON.parse(savedNews).map(article => ({
      ...article,
      showRejectForm: false,
      rejectReason: ''
    }))
  }
}

// Articles filtrés
const filteredNews = computed(() => {
  let filtered = allNews.value

  // Filtrer par statut
  if (selectedFilter.value !== 'all') {
    filtered = filtered.filter(article => article.status === selectedFilter.value)
  }

  // Filtrer par importance
  if (selectedImportance.value) {
    filtered = filtered.filter(article => article.importance === selectedImportance.value)
  }

  // Filtrer par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(article => 
      article.title.toLowerCase().includes(query) ||
      article.content.toLowerCase().includes(query) ||
      (article.author?.first_name + ' ' + article.author?.last_name).toLowerCase().includes(query)
    )
  }

  // Trier par date de création (plus récents en premier)
  return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

// Articles en attente
const pendingNews = computed(() => {
  return allNews.value.filter(article => article.status === 'pending')
})

// Statistiques du jour
const approvedToday = computed(() => {
  const today = new Date().toDateString()
  return allNews.value.filter(article => 
    article.status === 'approved' && 
    new Date(article.moderated_at || article.created_at).toDateString() === today
  ).length
})

const rejectedToday = computed(() => {
  const today = new Date().toDateString()
  return allNews.value.filter(article => 
    article.status === 'rejected' && 
    new Date(article.moderated_at || article.created_at).toDateString() === today
  ).length
})

// Actions de modération
const approveArticle = (article) => {
  article.status = 'approved'
  article.moderated_at = new Date().toISOString()
  article.moderator_approval = true
  article.moderator_id = props.currentUser?.id
  article.effective_publication_date = new Date().toISOString()
  
  // Si l'article n'a pas été modifié, copier le contenu original
  if (!article.moderated_title) {
    article.moderated_title = article.original_title || article.title
  }
  if (!article.moderated_content) {
    article.moderated_content = article.original_content || article.content
  }
  
  saveNews()
}

const rejectArticle = (article) => {
  article.showRejectForm = true
}

const confirmReject = (article) => {
  article.status = 'rejected'
  article.moderated_at = new Date().toISOString()
  article.moderator_approval = false
  article.moderator_id = props.currentUser?.id
  article.invalidation_reason = article.rejectReason
  article.moderation_comments = article.rejectReason
  article.showRejectForm = false
  saveNews()
}

const cancelReject = (article) => {
  article.showRejectForm = false
  article.rejectReason = ''
}

const saveNews = () => {
  const newsToSave = allNews.value.map(article => {
    const { showRejectForm, rejectReason, ...cleanArticle } = article
    return cleanArticle
  })
  localStorage.setItem('ccc_news', JSON.stringify(newsToSave))
}

// Utilitaires
const getStatusLabel = (status) => {
  const labels = {
    pending: 'En attente',
    approved: 'Approuvé',
    rejected: 'Rejeté'
  }
  return labels[status] || status
}

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.moderation-page {
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  margin: 0 0 2rem 0;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.pending {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-icon.approved {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-icon.rejected {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.stat-info h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1;
}

.stat-info p {
  color: #6b7280;
  margin: 0.25rem 0 0 0;
  font-weight: 500;
}

.filters {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-size: 0.875rem;
  min-width: 140px;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-group {
  flex: 1;
  max-width: 300px;
}

.search-input {
  position: relative;
}

.search-input svg {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.search-input input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.news-list {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  margin: 0 auto 1.5rem;
  color: #9ca3af;
}

.empty-state h3 {
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #6b7280;
  margin: 0;
}

.articles-grid {
  display: grid;
  gap: 1.5rem;
}

.article-card {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  background: white;
  transition: all 0.3s ease;
}

.article-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.article-card.status-pending {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.02);
}

.article-card.status-approved {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.02);
}

.article-card.status-rejected {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.02);
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.article-meta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.importance-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.importance-urgente {
  background: #fef2f2;
  color: #dc2626;
}

.importance-importante {
  background: #fef3c7;
  color: #d97706;
}

.importance-moyenne {
  background: #dbeafe;
  color: #2563eb;
}

.importance-faible {
  background: #f0fdf4;
  color: #16a34a;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-pending {
  background: #fef3c7;
  color: #d97706;
}

.status-approved {
  background: #f0fdf4;
  color: #16a34a;
}

.status-rejected {
  background: #fef2f2;
  color: #dc2626;
}

.article-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.approve {
  background: #f0fdf4;
  color: #16a34a;
}

.action-btn.approve:hover {
  background: #16a34a;
  color: white;
  transform: scale(1.1);
}

.action-btn.reject {
  background: #fef2f2;
  color: #dc2626;
}

.action-btn.reject:hover {
  background: #dc2626;
  color: white;
  transform: scale(1.1);
}

.article-content {
  margin-bottom: 1rem;
}

.article-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.75rem 0;
  line-height: 1.3;
}

.article-excerpt {
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.article-attachments {
  margin-bottom: 1rem;
}

.attachment-count {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.author-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.publish-date {
  color: #6b7280;
  font-size: 0.75rem;
}

.scope-badge {
  padding: 0.25rem 0.75rem;
  background: #f3f4f6;
  color: #374151;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.reject-form {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.reject-textarea {
  width: 100%;
  min-height: 80px;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.reject-textarea:focus {
  outline: none;
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.reject-actions {
  display: flex;
  gap: 0.75rem;
}

.confirm-reject-btn {
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-reject-btn:hover {
  background: #dc2626;
}

.cancel-reject-btn {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-reject-btn:hover {
  background: #e5e7eb;
}

@media (max-width: 768px) {
  .moderation-page {
    padding: 1rem;
  }
  
  .filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group,
  .search-group {
    width: 100%;
    max-width: none;
  }
  
  .article-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .article-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>