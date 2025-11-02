# 📊 Guide de Gestion des Actualités

## 🎯 Vue d'ensemble

La gestion des actualités est le **cœur** de l'application. Elle comprend la **création**, **modification**, **modération** et **publication** des articles.

## 📰 Cycle de vie d'un article

### 1️⃣ Création (PUBLIANT/MODERATOR/ADMIN)

```javascript
// Statuts possibles
const ARTICLE_STATUS = {
  DRAFT: 'draft',          // 📝 Brouillon (non publié)
  PENDING: 'pending',      // ⏳ En attente de modération
  APPROVED: 'approved',    // ✅ Approuvé et publié
  REJECTED: 'rejected',    // ❌ Rejeté par la modération
  ARCHIVED: 'archived'     // 📦 Archivé (plus visible)
}
```

**Flux de création :**
1. **PUBLIANT** écrit un article → Statut `PENDING`
2. **MODERATOR/ADMIN** écrit un article → Statut `APPROVED` (publication directe)

### 2️⃣ Modération (MODERATOR/ADMIN)

```javascript
const MODERATION_ACTIONS = {
  APPROVE: 'approve',      // ✅ Approuver → APPROVED
  REJECT: 'reject',        // ❌ Rejeter → REJECTED
  REQUEST_CHANGES: 'request_changes', // 🔄 Demander modifications
  ARCHIVE: 'archive'       // 📦 Archiver → ARCHIVED
}
```

**Flux de modération :**
1. Article `PENDING` → Modérateur examine
2. **Approuve** → `APPROVED` + notification auteur
3. **Rejette** → `REJECTED` + raison + notification auteur

### 3️⃣ Publication et visibilité

```javascript
const VISIBILITY_RULES = {
  // Qui peut voir quoi ?
  STUDENT: ['approved'],                    // Seulement articles approuvés
  PUBLIANT: ['approved', 'own_drafts'],     // Approuvés + ses brouillons
  MODERATOR: ['all'],                       // Tous les articles
  ADMIN: ['all']                           // Tous les articles
}
```

## ✍️ PublishPage.vue - Création d'articles

### 🎯 Rôle principal

Interface pour **créer** et **modifier** des articles. Gère le formulaire, la validation et l'envoi.

### 🔧 Code du composant

```javascript
<!-- src/components/PublishPage.vue -->
<template>
  <div class="publish-page">
    <div class="page-header">
      <h1>✍️ {{ isEditing ? 'Modifier' : 'Publier' }} un article</h1>
      <p v-if="!isEditing">Rédigez votre actualité pour la communauté universitaire</p>
    </div>
    
    <!-- Formulaire de publication -->
    <form @submit.prevent="submitArticle" class="publish-form">
      <!-- Titre -->
      <div class="form-group">
        <label for="title">📝 Titre de l'article *</label>
        <input
          id="title"
          v-model="article.title"
          type="text"
          maxlength="200"
          required
          placeholder="Ex: Nouvelle bibliothèque inaugurée"
        >
        <div class="char-count">
          {{ article.title.length }}/200 caractères
        </div>
      </div>
      
      <!-- Catégorie -->
      <div class="form-group">
        <label for="category">🏷️ Catégorie *</label>
        <select id="category" v-model="article.category_id" required>
          <option value="">-- Choisir une catégorie --</option>
          <option 
            v-for="category in categories" 
            :key="category.id" 
            :value="category.id"
          >
            {{ category.icon }} {{ category.name }}
          </option>
        </select>
      </div>
      
      <!-- Contenu principal -->
      <div class="form-group">
        <label for="content">📄 Contenu de l'article *</label>
        <textarea
          id="content"
          v-model="article.content"
          required
          rows="10"
          placeholder="Rédigez le contenu de votre article..."
        ></textarea>
        <div class="editor-toolbar">
          <button type="button" @click="insertText('**', '**')" title="Gras">
            <strong>B</strong>
          </button>
          <button type="button" @click="insertText('*', '*')" title="Italique">
            <em>I</em>
          </button>
          <button type="button" @click="insertText('\n- ', '')" title="Liste">
            📋
          </button>
        </div>
      </div>
      
      <!-- Image principale -->
      <div class="form-group">
        <label for="image">🖼️ Image principale</label>
        <input
          id="image"
          type="file"
          accept="image/*"
          @change="handleImageUpload"
        >
        <div v-if="article.image_url" class="image-preview">
          <img :src="article.image_url" alt="Aperçu">
          <button type="button" @click="removeImage">🗑️ Supprimer</button>
        </div>
      </div>
      
      <!-- Tags -->
      <div class="form-group">
        <label for="tags">🏷️ Tags (optionnel)</label>
        <input
          id="tags"
          v-model="tagInput"
          type="text"
          placeholder="Ex: bibliothèque, étudiants, campus"
          @keypress.enter.prevent="addTag"
        >
        <div class="tags-list">
          <span 
            v-for="tag in article.tags" 
            :key="tag" 
            class="tag"
          >
            {{ tag }}
            <button type="button" @click="removeTag(tag)">×</button>
          </span>
        </div>
      </div>
      
      <!-- Programmation -->
      <div class="form-group">
        <label>
          <input 
            type="checkbox" 
            v-model="article.is_scheduled"
          >
          📅 Programmer la publication
        </label>
        
        <div v-if="article.is_scheduled" class="schedule-inputs">
          <input
            type="datetime-local"
            v-model="article.scheduled_at"
            :min="minDateTime"
          >
        </div>
      </div>
      
      <!-- Options avancées -->
      <details class="advanced-options">
        <summary>⚙️ Options avancées</summary>
        
        <div class="form-group">
          <label>
            <input 
              type="checkbox" 
              v-model="article.allow_comments"
            >
            💬 Autoriser les commentaires
          </label>
        </div>
        
        <div class="form-group">
          <label>
            <input 
              type="checkbox" 
              v-model="article.featured"
            >
            ⭐ Article à la une
          </label>
        </div>
        
        <div class="form-group">
          <label for="excerpt">📝 Résumé (optionnel)</label>
          <textarea
            id="excerpt"
            v-model="article.excerpt"
            rows="3"
            maxlength="300"
            placeholder="Résumé court pour les aperçus..."
          ></textarea>
        </div>
      </details>
      
      <!-- Actions -->
      <div class="form-actions">
        <button 
          type="button" 
          @click="saveDraft"
          class="btn btn-secondary"
          :disabled="!canSaveDraft"
        >
          💾 Sauvegarder brouillon
        </button>
        
        <button 
          type="submit" 
          class="btn btn-primary"
          :disabled="!canPublish"
        >
          {{ getPublishButtonText() }}
        </button>
      </div>
      
      <!-- Informations sur le statut -->
      <div class="publish-info">
        <div v-if="currentUser.role === 'PUBLIANT'" class="info-box warning">
          ⏳ <strong>Modération requise :</strong> Votre article sera examiné avant publication.
        </div>
        
        <div v-else class="info-box success">
          ✅ <strong>Publication directe :</strong> Votre article sera publié immédiatement.
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { newsService } from '@/services/news.service'
import { categoryService } from '@/services/category.service'
import { useAuth } from '@/composables/useAuth'
import { useNotifications } from '@/composables/useNotifications'
import { usePermissions, PERMISSIONS } from '@/composables/usePermissions'

// Router et route
const router = useRouter()
const route = useRoute()

// Composables
const { currentUser } = useAuth()
const { addNotification } = useNotifications(currentUser)
const { hasPermission } = usePermissions(currentUser)

// État local
const isEditing = computed(() => !!route.params.id)
const categories = ref([])
const tagInput = ref('')

// Article à publier/modifier
const article = reactive({
  title: '',
  content: '',
  excerpt: '',
  category_id: '',
  image_url: '',
  tags: [],
  is_scheduled: false,
  scheduled_at: '',
  allow_comments: true,
  featured: false,
  status: 'draft'
})

// Date minimum pour programmation
const minDateTime = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 5) // Au moins 5 minutes dans le futur
  return now.toISOString().slice(0, 16)
})

// Validations
const canSaveDraft = computed(() => {
  return article.title.trim().length > 0
})

const canPublish = computed(() => {
  return article.title.trim().length > 0 && 
         article.content.trim().length > 0 && 
         article.category_id
})

// Texte du bouton de publication
const getPublishButtonText = () => {
  if (isEditing.value) {
    return '✏️ Mettre à jour'
  }
  
  if (article.is_scheduled) {
    return '📅 Programmer'
  }
  
  if (hasPermission(PERMISSIONS.MODERATE_NEWS)) {
    return '🚀 Publier immédiatement'
  }
  
  return '📤 Envoyer en modération'
}

// Charger les catégories
const loadCategories = async () => {
  try {
    const response = await categoryService.getCategories()
    categories.value = response.data.categories
  } catch (error) {
    console.error('Erreur chargement catégories:', error)
    addNotification({
      type: 'error',
      message: 'Erreur lors du chargement des catégories'
    })
  }
}

// Charger article pour modification
const loadArticle = async () => {
  if (!isEditing.value) return
  
  try {
    const response = await newsService.getNewsById(route.params.id)
    const loadedArticle = response.data.article
    
    // Copier les propriétés
    Object.assign(article, loadedArticle)
    
    // Convertir les tags si c'est un string
    if (typeof article.tags === 'string') {
      article.tags = article.tags.split(',').map(tag => tag.trim())
    }
  } catch (error) {
    console.error('Erreur chargement article:', error)
    addNotification({
      type: 'error',
      message: 'Erreur lors du chargement de l\'article'
    })
    router.push('/news')
  }
}

// Gestion de l'upload d'image
const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // Validation du fichier
  if (file.size > 5 * 1024 * 1024) { // 5MB max
    addNotification({
      type: 'error',
      message: 'L\'image ne doit pas dépasser 5MB'
    })
    return
  }
  
  try {
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await newsService.uploadImage(formData)
    article.image_url = response.data.image_url
    
    addNotification({
      type: 'success',
      message: 'Image uploadée avec succès'
    })
  } catch (error) {
    console.error('Erreur upload image:', error)
    addNotification({
      type: 'error',
      message: 'Erreur lors de l\'upload de l\'image'
    })
  }
}

// Supprimer l'image
const removeImage = () => {
  article.image_url = ''
}

// Gestion des tags
const addTag = () => {
  const tag = tagInput.value.trim().toLowerCase()
  
  if (tag && !article.tags.includes(tag) && article.tags.length < 10) {
    article.tags.push(tag)
    tagInput.value = ''
  }
}

const removeTag = (tagToRemove) => {
  article.tags = article.tags.filter(tag => tag !== tagToRemove)
}

// Insérer du texte formaté
const insertText = (before, after) => {
  const textarea = document.getElementById('content')
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = article.content.substring(start, end)
  
  const newText = before + selectedText + after
  article.content = article.content.substring(0, start) + newText + article.content.substring(end)
  
  // Repositionner le curseur
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
  }, 0)
}

// Sauvegarder comme brouillon
const saveDraft = async () => {
  if (!canSaveDraft.value) return
  
  try {
    const articleData = {
      ...article,
      status: 'draft'
    }
    
    let response
    if (isEditing.value) {
      response = await newsService.updateNews(route.params.id, articleData)
    } else {
      response = await newsService.createNews(articleData)
    }
    
    addNotification({
      type: 'success',
      message: 'Brouillon sauvegardé'
    })
    
    // Rediriger vers l'édition si c'était une création
    if (!isEditing.value) {
      router.push(`/publish/${response.data.article.id}`)
    }
  } catch (error) {
    console.error('Erreur sauvegarde brouillon:', error)
    addNotification({
      type: 'error',
      message: 'Erreur lors de la sauvegarde'
    })
  }
}

// Publier l'article
const submitArticle = async () => {
  if (!canPublish.value) return
  
  try {
    // Déterminer le statut
    let status = 'pending' // Par défaut pour PUBLIANT
    
    if (hasPermission(PERMISSIONS.MODERATE_NEWS)) {
      status = article.is_scheduled ? 'scheduled' : 'approved'
    }
    
    const articleData = {
      ...article,
      status,
      tags: article.tags.join(',') // Convertir en string pour l'API
    }
    
    let response
    if (isEditing.value) {
      response = await newsService.updateNews(route.params.id, articleData)
    } else {
      response = await newsService.createNews(articleData)
    }
    
    const message = status === 'approved' 
      ? 'Article publié avec succès !'
      : status === 'scheduled'
      ? 'Article programmé avec succès !'
      : 'Article envoyé en modération'
    
    addNotification({
      type: 'success',
      message
    })
    
    // Rediriger selon le contexte
    if (status === 'approved' || status === 'scheduled') {
      router.push('/news')
    } else {
      router.push('/my-articles')
    }
  } catch (error) {
    console.error('Erreur publication:', error)
    addNotification({
      type: 'error',
      message: 'Erreur lors de la publication'
    })
  }
}

// Initialisation
onMounted(async () => {
  await loadCategories()
  await loadArticle()
})
</script>

<style scoped>
.publish-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.publish-form {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.editor-toolbar {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.editor-toolbar button {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: #f8f9fa;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.editor-toolbar button:hover {
  background: #e9ecef;
}

.image-preview {
  margin-top: 15px;
  text-align: center;
}

.image-preview img {
  max-width: 300px;
  max-height: 200px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.tag button {
  background: none;
  border: none;
  color: #1976d2;
  cursor: pointer;
  font-weight: bold;
}

.schedule-inputs {
  margin-top: 10px;
}

.advanced-options {
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 15px;
  margin: 20px 0;
}

.advanced-options summary {
  cursor: pointer;
  font-weight: bold;
  margin-bottom: 15px;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #545b62;
}

.publish-info {
  margin-top: 20px;
}

.info-box {
  padding: 15px;
  border-radius: 8px;
  font-size: 14px;
}

.info-box.warning {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
}

.info-box.success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}
</style>
```

## 🛡️ ModerationPage.vue - Interface de modération

### 🎯 Objectif

Permet aux **MODERATOR** et **ADMIN** de **réviser**, **approuver** ou **rejeter** les articles en attente.

### 🔧 Code simplifié

```javascript
<template>
  <div class="moderation-page">
    <h1>🛡️ Modération des actualités</h1>
    
    <!-- Statistiques -->
    <div class="stats-cards">
      <div class="stat-card pending">
        <h3>⏳ En attente</h3>
        <div class="stat-number">{{ stats.pending }}</div>
      </div>
      <div class="stat-card approved">
        <h3>✅ Approuvés aujourd'hui</h3>
        <div class="stat-number">{{ stats.approved_today }}</div>
      </div>
      <div class="stat-card rejected">
        <h3>❌ Rejetés</h3>
        <div class="stat-number">{{ stats.rejected }}</div>
      </div>
    </div>
    
    <!-- Filtres -->
    <div class="filters">
      <select v-model="filters.status">
        <option value="pending">⏳ En attente</option>
        <option value="approved">✅ Approuvés</option>
        <option value="rejected">❌ Rejetés</option>
        <option value="all">📄 Tous</option>
      </select>
      
      <select v-model="filters.category">
        <option value="">Toutes catégories</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>
    </div>
    
    <!-- Liste des articles -->
    <div class="articles-list">
      <div 
        v-for="article in filteredArticles" 
        :key="article.id"
        class="article-card"
        :class="article.status"
      >
        <!-- Header -->
        <div class="article-header">
          <div class="status-badge">
            {{ getStatusIcon(article.status) }} {{ getStatusText(article.status) }}
          </div>
          <div class="article-date">
            📅 {{ formatDate(article.created_at) }}
          </div>
        </div>
        
        <!-- Contenu -->
        <div class="article-content">
          <h3>{{ article.title }}</h3>
          <p class="excerpt">{{ article.excerpt || truncateText(article.content, 150) }}</p>
          
          <!-- Métadonnées -->
          <div class="metadata">
            <span>👤 {{ article.author.username }}</span>
            <span>🏫 {{ article.university.name }}</span>
            <span>🏷️ {{ article.category.name }}</span>
          </div>
        </div>
        
        <!-- Actions de modération -->
        <div class="moderation-actions" v-if="article.status === 'pending'">
          <button 
            @click="openModerationModal(article, 'approve')"
            class="btn btn-approve"
          >
            ✅ Approuver
          </button>
          
          <button 
            @click="openModerationModal(article, 'reject')"
            class="btn btn-reject"
          >
            ❌ Rejeter
          </button>
          
          <button 
            @click="previewArticle(article)"
            class="btn btn-preview"
          >
            👁️ Aperçu
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal de modération -->
    <div v-if="showModerationModal" class="modal-overlay" @click="closeModerationModal">
      <div class="modal-content" @click.stop>
        <h3>
          {{ moderationAction === 'approve' ? '✅ Approuver' : '❌ Rejeter' }} l'article
        </h3>
        
        <div class="article-preview">
          <h4>{{ selectedArticle.title }}</h4>
          <p>{{ selectedArticle.excerpt }}</p>
        </div>
        
        <div class="form-group" v-if="moderationAction === 'reject'">
          <label>📝 Raison du rejet *</label>
          <textarea 
            v-model="moderationReason"
            placeholder="Expliquez pourquoi cet article est rejeté..."
            required
          ></textarea>
        </div>
        
        <div class="form-group" v-if="moderationAction === 'approve'">
          <label>📝 Commentaire (optionnel)</label>
          <textarea 
            v-model="moderationComment"
            placeholder="Commentaire pour l'auteur..."
          ></textarea>
        </div>
        
        <div class="modal-actions">
          <button @click="closeModerationModal" class="btn btn-secondary">
            Annuler
          </button>
          <button 
            @click="confirmModeration"
            class="btn"
            :class="moderationAction === 'approve' ? 'btn-approve' : 'btn-reject'"
          >
            {{ moderationAction === 'approve' ? '✅ Confirmer approbation' : '❌ Confirmer rejet' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { moderationService } from '@/services/moderation.service'
import { categoryService } from '@/services/category.service'
import { useAuth } from '@/composables/useAuth'
import { useNotifications } from '@/composables/useNotifications'

// Composables
const { currentUser } = useAuth()
const { addNotification } = useNotifications(currentUser)

// État
const articles = ref([])
const categories = ref([])
const stats = ref({
  pending: 0,
  approved_today: 0,
  rejected: 0
})

// Filtres
const filters = reactive({
  status: 'pending',
  category: '',
  author: '',
  date_from: '',
  date_to: ''
})

// Modal de modération
const showModerationModal = ref(false)
const selectedArticle = ref(null)
const moderationAction = ref('') // 'approve' ou 'reject'
const moderationReason = ref('')
const moderationComment = ref('')

// Articles filtrés
const filteredArticles = computed(() => {
  let filtered = articles.value
  
  if (filters.status !== 'all') {
    filtered = filtered.filter(article => article.status === filters.status)
  }
  
  if (filters.category) {
    filtered = filtered.filter(article => article.category_id === filters.category)
  }
  
  return filtered
})

// Méthodes
const loadArticles = async () => {
  try {
    const response = await moderationService.getArticlesForModeration(filters)
    articles.value = response.data.articles
  } catch (error) {
    console.error('Erreur chargement articles:', error)
  }
}

const loadStats = async () => {
  try {
    const response = await moderationService.getModerationStats()
    stats.value = response.data.stats
  } catch (error) {
    console.error('Erreur chargement stats:', error)
  }
}

const openModerationModal = (article, action) => {
  selectedArticle.value = article
  moderationAction.value = action
  moderationReason.value = ''
  moderationComment.value = ''
  showModerationModal.value = true
}

const closeModerationModal = () => {
  showModerationModal.value = false
  selectedArticle.value = null
  moderationAction.value = ''
}

const confirmModeration = async () => {
  try {
    const data = {
      action: moderationAction.value,
      reason: moderationReason.value,
      comment: moderationComment.value
    }
    
    await moderationService.moderateArticle(selectedArticle.value.id, data)
    
    addNotification({
      type: 'success',
      message: `Article ${moderationAction.value === 'approve' ? 'approuvé' : 'rejeté'}`
    })
    
    closeModerationModal()
    await loadArticles()
    await loadStats()
  } catch (error) {
    console.error('Erreur modération:', error)
    addNotification({
      type: 'error',
      message: 'Erreur lors de la modération'
    })
  }
}

// Utilitaires
const getStatusIcon = (status) => {
  const icons = {
    pending: '⏳',
    approved: '✅',
    rejected: '❌',
    draft: '📝'
  }
  return icons[status] || '❓'
}

const getStatusText = (status) => {
  const texts = {
    pending: 'En attente',
    approved: 'Approuvé',
    rejected: 'Rejeté',
    draft: 'Brouillon'
  }
  return texts[status] || status
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Watchers
watch(filters, () => {
  loadArticles()
}, { deep: true })

// Initialisation
onMounted(async () => {
  await Promise.all([
    loadArticles(),
    loadStats(),
    loadCategories()
  ])
})
</script>
```

## 📊 Statistiques et analytics

### 📈 Dashboard de modération

```javascript
// Données pour les graphiques
const getModerationCharts = async () => {
  const response = await moderationService.getChartData({
    period: 'last_30_days'
  })
  
  return {
    // Articles par jour
    dailyArticles: {
      labels: response.data.daily_labels,
      datasets: [{
        label: 'Articles publiés',
        data: response.data.daily_published,
        borderColor: '#28a745',
        backgroundColor: 'rgba(40, 167, 69, 0.1)'
      }, {
        label: 'Articles rejetés',
        data: response.data.daily_rejected,
        borderColor: '#dc3545',
        backgroundColor: 'rgba(220, 53, 69, 0.1)'
      }]
    },
    
    // Répartition par catégorie
    categoryDistribution: {
      labels: response.data.categories,
      datasets: [{
        data: response.data.category_counts,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', 
          '#4BC0C0', '#9966FF', '#FF9F40'
        ]
      }]
    }
  }
}
```

## 🚀 Optimisations et bonnes pratiques

### ⚡ Performance

```javascript
// Pagination pour éviter de charger tous les articles
const loadArticles = async (page = 1) => {
  const params = {
    page,
    limit: 20,
    ...filters
  }
  
  const response = await moderationService.getArticlesForModeration(params)
  
  if (page === 1) {
    articles.value = response.data.articles
  } else {
    articles.value.push(...response.data.articles)
  }
  
  hasMoreArticles.value = response.data.has_more
}

// Recherche avec debounce
const searchQuery = ref('')
const debouncedSearch = debounce(async (query) => {
  filters.search = query
  await loadArticles(1)
}, 500)

watch(searchQuery, (newQuery) => {
  debouncedSearch(newQuery)
})
```

### 🔄 Auto-refresh

```javascript
// Rafraîchissement automatique des stats
let refreshInterval = null

onMounted(() => {
  // Rafraîchir toutes les 30 secondes
  refreshInterval = setInterval(loadStats, 30000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
```

### 🎯 Raccourcis clavier

```javascript
// Raccourcis pour modération rapide
const handleKeydown = (event) => {
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
    return // Ne pas intercepter dans les champs de saisie
  }
  
  switch (event.key) {
    case 'a':
      // Approuver le premier article en attente
      approveFirst()
      break
    case 'r':
      // Rejeter le premier article en attente
      rejectFirst()
      break
    case 'n':
      // Article suivant
      selectNext()
      break
    case 'p':
      // Article précédent
      selectPrevious()
      break
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
```

---

> 💡 **Workflow** : La modération efficace nécessite des outils rapides et des raccourcis pour traiter un grand volume d'articles.