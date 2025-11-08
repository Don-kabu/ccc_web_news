<template>
  <div class="news-detail">
    <!-- Mode édition -->
    <EditNews
      v-if="isEditing"
      :article="article"
      :current-user="currentUser"
      @saved="handleEditSaved"
      @cancel="isEditing = false"
    />

    <!-- Mode affichage -->
    <div v-else>
      <!-- Indicateur de chargement -->
      <div v-if="isLoading" class="loading-container">
        <div class="spinner"></div>
        <p>Chargement de l'article...</p>
      </div>

    <!-- Message d'erreur -->
    <div v-else-if="error" class="error-message">
      <div class="error-icon">⚠️</div>
      <h3>Erreur de chargement</h3>
      <p>{{ error }}</p>
      <button @click="loadArticle" class="retry-btn">
        Réessayer
      </button>
    </div>

    <!-- Contenu de l'article -->
    <div v-else-if="article" class="article-content">
      <!-- En-tête de l'article -->
      <header class="article-header">
        <div class="breadcrumb">
          <button @click="$emit('close')" class="back-btn">
            ← Retour à la liste
          </button>
        </div>
        
        <div class="article-meta">
          <div class="category-badge" :class="`category-${article.category}`">
            {{ getCategoryLabel(article.category) }}
          </div>
          <div class="article-date">
            Publié le {{ formatDate(article.created_at) }}
          </div>
        </div>

        <h1 class="article-title">{{ article.title }}</h1>
        
        <div class="article-excerpt" v-if="article.excerpt">
          {{ article.excerpt }}
        </div>

        <div class="article-author">
          <div class="author-avatar">
            {{ article.author?.first_name?.[0] || 'A' }}{{ article.author?.last_name?.[0] || 'A' }}
          </div>
          <div class="author-info">
            <div class="author-name">
              {{ article.author?.first_name }} {{ article.author?.last_name }}
            </div>
            <div class="author-role">
              {{ getRoleLabel(article.author?.role) }}
            </div>
          </div>
        </div>

        <div class="article-stats">
          <div class="stat">
            <span class="stat-icon">👁️</span>
            <span class="stat-value">{{ article.views || 0 }} vues</span>
          </div>
          <div class="stat">
            <span class="stat-icon">👍</span>
            <span class="stat-value">{{ article.likes || 0 }} j'aime</span>
          </div>
        </div>
      </header>

      <!-- Image de l'article -->
      <div v-if="article.image_url" class="article-image">
        <img :src="article.image_url" :alt="article.title" @error="handleImageError" />
      </div>

      <!-- Corps de l'article -->
      <main class="article-body">
        <div class="article-content-text" v-html="formatContent(article.content)"></div>
      </main>

      <!-- Tags -->
      <div v-if="article.tags && article.tags.length > 0" class="article-tags">
        <h4>Tags :</h4>
        <div class="tags-list">
          <span v-for="tag in article.tags" :key="tag" class="tag">
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Actions pour les auteurs/modérateurs -->
      <div v-if="canEditArticle" class="article-actions">
        <button @click="startEdit" class="edit-btn">
          ✏️ Modifier l'article
        </button>
        <button @click="deleteArticle" class="delete-btn" v-if="canDeleteArticle">
          🗑️ Supprimer l'article
        </button>
      </div>
    </div>

    <!-- Aucun article trouvé -->
    <div v-else class="no-article">
      <h3>Article non trouvé</h3>
      <p>L'article demandé n'existe pas ou n'est plus disponible.</p>
      <button @click="$emit('close')" class="back-btn">
        Retour à la liste
      </button>
    </div>
    </div> <!-- Fin mode affichage -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { newsService } from '@/services/news.service.js'
import EditNews from './EditNews.vue'

const props = defineProps({
  articleId: {
    type: [String, Number],
    required: true
  },
  currentUser: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'edit', 'delete'])

const article = ref(null)
const isLoading = ref(false)
const error = ref(null)
const isEditing = ref(false)

// Permissions calculées
const canEditArticle = computed(() => {
  if (!article.value || !props.currentUser?.id) return false
  
  // L'auteur peut modifier son article
  if (article.value.author?.id === props.currentUser.id) return true
  
  // Les admins et modérateurs peuvent modifier tous les articles
  return ['ADMIN', 'MODERATOR'].includes(props.currentUser.role)
})

const canDeleteArticle = computed(() => {
  if (!article.value || !props.currentUser?.id) return false
  
  // Seuls les admins peuvent supprimer
  if (props.currentUser.role === 'ADMIN') return true
  
  // L'auteur peut supprimer son propre article s'il n'est pas publié
  return article.value.author?.id === props.currentUser.id && 
         article.value.status !== 'PUBLISHED'
})

// Charger l'article au montage et quand l'ID change
onMounted(() => {
  loadArticle()
})

watch(() => props.articleId, () => {
  if (props.articleId) {
    loadArticle()
  }
})

const loadArticle = async () => {
  if (!props.articleId) return
  
  try {
    isLoading.value = true
    error.value = null
    
    const response = await newsService.getNewsById(props.articleId)
    
    if (response.success && response.data) {
      article.value = response.data
      
      // Enregistrer la vue de l'article
      await newsService.recordNewsView(props.articleId)
    } else {
      throw new Error(response.message || 'Article non trouvé')
    }
  } catch (err) {
    console.error('Erreur lors du chargement de l\'article:', err)
    error.value = 'Impossible de charger l\'article. Vérifiez votre connexion.'
    article.value = null
  } finally {
    isLoading.value = false
  }
}

const deleteArticle = async () => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return
  
  try {
    const response = await newsService.deleteNews(article.value.id)
    
    if (response.success) {
      alert('Article supprimé avec succès !')
      emit('delete', article.value.id)
      emit('close')
    } else {
      throw new Error(response.message || 'Erreur lors de la suppression')
    }
  } catch (err) {
    console.error('Erreur lors de la suppression:', err)
    alert('Erreur lors de la suppression de l\'article')
  }
}

// Fonctions utilitaires
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getCategoryLabel = (category) => {
  const categories = {
    'urgente': '🔴 Urgente',
    'importante': '🟠 Importante',
    'normale': '🟡 Normale',
    'faible': '🟢 Faible'
  }
  return categories[category] || category
}

const getRoleLabel = (role) => {
  const roles = {
    'ADMIN': 'Administrateur',
    'MODERATOR': 'Modérateur',
    'PUBLIANT': 'Publiant',
    'STUDENT': 'Étudiant'
  }
  return roles[role] || role
}

const formatContent = (content) => {
  // Conversion simple du markdown vers HTML
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}

const handleImageError = () => {
  if (article.value) {
    article.value.image_url = null
  }
}

// Fonctions pour l'édition
const startEdit = () => {
  isEditing.value = true
}

const handleEditSaved = (updatedArticle) => {
  article.value = updatedArticle
  isEditing.value = false
  emit('edit', updatedArticle)
}
</script>

<style scoped>
.news-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* États de chargement et d'erreur */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
  color: #6b7280;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-message {
  text-align: center;
  padding: 2rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  color: #dc2626;
}

.error-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background: #b91c1c;
}

/* En-tête de l'article */
.article-header {
  margin-bottom: 2rem;
}

.breadcrumb {
  margin-bottom: 1rem;
}

.back-btn {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.5rem 0;
}

.back-btn:hover {
  text-decoration: underline;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.category-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.category-urgente {
  background: #fef2f2;
  color: #dc2626;
}

.category-importante {
  background: #fff7ed;
  color: #ea580c;
}

.category-normale {
  background: #fefce8;
  color: #ca8a04;
}

.category-faible {
  background: #f0fdf4;
  color: #16a34a;
}

.article-date {
  color: #6b7280;
  font-size: 0.9rem;
}

.article-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.article-excerpt {
  font-size: 1.2rem;
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.article-author {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.author-avatar {
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.author-name {
  font-weight: 600;
  color: #111827;
}

.author-role {
  font-size: 0.9rem;
  color: #6b7280;
}

.article-stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.9rem;
}

/* Image de l'article */
.article-image {
  margin-bottom: 2rem;
  border-radius: 12px;
  overflow: hidden;
}

.article-image img {
  width: 100%;
  height: auto;
  display: block;
}

/* Corps de l'article */
.article-body {
  margin-bottom: 3rem;
}

.article-content-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #374151;
}

.article-content-text :deep(strong) {
  font-weight: 600;
  color: #111827;
}

.article-content-text :deep(em) {
  font-style: italic;
  color: #6b7280;
}

/* Tags */
.article-tags {
  margin-bottom: 2rem;
}

.article-tags h4 {
  margin-bottom: 0.5rem;
  color: #374151;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: #f3f4f6;
  color: #374151;
  border-radius: 12px;
  font-size: 0.9rem;
}

/* Actions */
.article-actions {
  display: flex;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.edit-btn, .delete-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.edit-btn {
  background: #3b82f6;
  color: white;
}

.edit-btn:hover {
  background: #2563eb;
}

.delete-btn {
  background: #ef4444;
  color: white;
}

.delete-btn:hover {
  background: #dc2626;
}

/* Aucun article */
.no-article {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

/* Responsive */
@media (max-width: 768px) {
  .news-detail {
    padding: 1rem;
  }
  
  .article-title {
    font-size: 2rem;
  }
  
  .article-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .article-actions {
    flex-direction: column;
  }
}
</style>