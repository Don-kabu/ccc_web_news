<template>
  <div class="publish-content">
    <div class="publish-header">
      <h1>Publier une nouvelle actualité</h1>
      <p>Partagez les dernières nouvelles de votre université</p>
    </div>

    <form @submit.prevent="handleSubmit" class="publish-form">
      <!-- Titre de l'article -->
      <div class="form-group">
        <label for="title" class="form-label">Titre de l'actualité *</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          placeholder="Saisissez un titre accrocheur..."
          class="form-input"
          required
          maxlength="200"
        />
        <div class="char-count">{{ form.title.length }}/200</div>
      </div>

      <!-- Catégorie -->
      <div class="form-group">
        <label for="category" class="form-label">Niveau d'importance *</label>
        <select
          id="category"
          v-model="form.category"
          class="form-input"
          required
        >
          <option value="">Sélectionnez le niveau d'importance</option>
          <option value="faible">🟢 Faible - Information générale</option>
          <option value="moyenne">🟡 Moyenne - Information notable</option>
          <option value="importante">🟠 Importante - Information prioritaire</option>
          <option value="urgente">🔴 Urgente - Information critique</option>
        </select>
      </div>

      <!-- Date de publication souhaitée -->
      <div class="form-group">
        <label for="desired_publication_date" class="form-label">Date de publication souhaitée</label>
        <input
          id="desired_publication_date"
          v-model="form.desired_publication_date"
          type="datetime-local"
          class="form-input"
          :min="new Date().toISOString().slice(0, 16)"
        />
        <small class="form-hint">
          Si aucune date n'est spécifiée, l'article sera publié dès validation par un modérateur.
        </small>
      </div>

      <!-- Résumé -->
      <div class="form-group">
        <label for="excerpt" class="form-label">Résumé *</label>
        <textarea
          id="excerpt"
          v-model="form.excerpt"
          placeholder="Rédigez un court résumé de l'actualité (sera affiché dans la liste)..."
          class="form-textarea"
          rows="3"
          required
          maxlength="300"
        ></textarea>
        <div class="char-count">{{ form.excerpt.length }}/300</div>
      </div>

      <!-- Contenu principal -->
      <div class="form-group">
        <label for="content" class="form-label">Contenu de l'article *</label>
        <div class="editor-toolbar">
          <button type="button" @click="insertFormat('**', '**')" class="toolbar-btn" title="Gras">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 4H14C15.0609 4 16.0783 4.42143 16.8284 5.17157C17.5786 5.92172 18 6.93913 18 8C18 9.06087 17.5786 10.0783 16.8284 10.8284C16.0783 11.5786 15.0609 12 14 12H6V4Z" stroke="currentColor" stroke-width="2"/>
              <path d="M6 12H15C16.0609 12 17.0783 12.4214 17.8284 13.1716C18.5786 13.9217 19 14.9391 19 16C19 17.0609 18.5786 18.0783 17.8284 18.8284C17.0783 19.5786 16.0609 20 15 20H6V12Z" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
          <button type="button" @click="insertFormat('*', '*')" class="toolbar-btn" title="Italique">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <line x1="19" y1="4" x2="10" y2="4" stroke="currentColor" stroke-width="2"/>
              <line x1="14" y1="20" x2="5" y2="20" stroke="currentColor" stroke-width="2"/>
              <line x1="15" y1="4" x2="9" y2="20" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
          <button type="button" @click="insertFormat('\n- ', '')" class="toolbar-btn" title="Liste">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2"/>
              <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2"/>
              <line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="3" y1="6" x2="3.01" y2="6" stroke="currentColor" stroke-width="2"/>
              <line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor" stroke-width="2"/>
              <line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        <textarea
          ref="contentTextarea"
          id="content"
          v-model="form.content"
          placeholder="Rédigez le contenu complet de votre actualité...

Vous pouvez utiliser la mise en forme Markdown :
- **Texte en gras**
- *Texte en italique*
- # Titre principal
- ## Sous-titre
- - Élément de liste

Exemple :
# Nouvelle formation en informatique

Nous sommes heureux d'annoncer l'ouverture d'une **nouvelle formation** en informatique pour la rentrée 2024.

## Points clés :
- Formation de 3 ans
- *Diplôme reconnu*
- Stages en entreprise"
          class="form-textarea content-editor"
          rows="15"
          required
        ></textarea>
        <div class="char-count">{{ form.content.length }} caractères</div>
      </div>

      <!-- Pièces jointes -->
      <div class="form-group">
        <label class="form-label">Pièces jointes (optionnel)</label>
        <div class="attachments-section">
          <div class="file-upload-area" @drop="handleDrop" @dragover.prevent @dragenter.prevent>
            <input
              ref="fileInput"
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
              @change="handleFileSelect"
              style="display: none"
            />
            <div class="upload-prompt" @click="$refs.fileInput.click()">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2"/>
                <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2"/>
                <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
              </svg>
              <p>Glissez vos fichiers ici ou <span class="click-text">cliquez pour parcourir</span></p>
              <p class="file-types">Images, vidéos, audio, documents PDF, Word, PowerPoint, Excel</p>
            </div>
          </div>

          <!-- Liste des fichiers attachés -->
          <div v-if="attachments.length > 0" class="attachments-list">
            <h4>Fichiers attachés ({{ attachments.length }})</h4>
            <div class="attachment-items">
              <div
                v-for="(attachment, index) in attachments"
                :key="index"
                class="attachment-item"
              >
                <div class="attachment-preview">
                  <!-- Prévisualisation image -->
                  <img 
                    v-if="attachment.type.startsWith('image/')" 
                    :src="attachment.preview" 
                    :alt="attachment.name"
                    class="file-thumbnail"
                  />
                  <!-- Icône vidéo -->
                  <div v-else-if="attachment.type.startsWith('video/')" class="file-icon video-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <polygon points="23 12 5 2 5 22 23 12" stroke="currentColor" stroke-width="2" fill="currentColor"/>
                    </svg>
                  </div>
                  <!-- Icône audio -->
                  <div v-else-if="attachment.type.startsWith('audio/')" class="file-icon audio-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18V5L21 3V20" stroke="currentColor" stroke-width="2"/>
                      <circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="2"/>
                      <circle cx="18" cy="20" r="3" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </div>
                  <!-- Icône document -->
                  <div v-else class="file-icon doc-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
                      <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </div>
                </div>
                
                <div class="attachment-info">
                  <p class="attachment-name">{{ attachment.name }}</p>
                  <p class="attachment-meta">
                    <span class="file-type">{{ getFileTypeLabel(attachment.type) }}</span>
                    <span class="file-size">{{ formatFileSize(attachment.size) }}</span>
                  </p>
                </div>
                
                <button
                  type="button"
                  @click="removeAttachment(index)"
                  class="remove-attachment"
                  title="Supprimer ce fichier"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Options de publication -->
      <div class="form-group">
        <div class="form-options">
          <label class="checkbox-wrapper">
            <input v-model="form.is_featured" type="checkbox" class="checkbox" />
            <span class="checkbox-label">Article à la une</span>
          </label>
          
          <label class="checkbox-wrapper">
            <input v-model="form.allow_comments" type="checkbox" class="checkbox" />
            <span class="checkbox-label">Autoriser les commentaires</span>
          </label>
        </div>
      </div>

      <!-- Aperçu -->
      <div v-if="showPreview" class="preview-section">
        <h3>Aperçu de l'article</h3>
        <div class="preview-card">
          <div v-if="form.image_url" class="preview-image">
            <img :src="form.image_url" :alt="form.title" />
          </div>
          <div class="preview-content">
            <div class="preview-meta">
              <span class="preview-category" :class="getCategoryClass(form.category)">{{ getCategoryLabel(form.category) }}</span>
              <time class="preview-date">{{ new Date().toLocaleDateString('fr-FR') }}</time>
            </div>
            <h4 class="preview-title">{{ form.title || 'Titre de l\'actualité' }}</h4>
            <p class="preview-excerpt">{{ form.excerpt || 'Résumé de l\'actualité...' }}</p>
          </div>
        </div>
      </div>

      <!-- Boutons d'action -->
      <div class="form-actions">
        <button
          type="button"
          @click="togglePreview"
          class="secondary-button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
          </svg>
          {{ showPreview ? 'Masquer l\'aperçu' : 'Aperçu' }}
        </button>

        <button
          type="button"
          @click="saveDraft"
          class="secondary-button"
          :disabled="!form.title"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" stroke-width="2"/>
            <polyline points="17,21 17,13 7,13 7,21" stroke="currentColor" stroke-width="2"/>
            <polyline points="7,3 7,8 15,8" stroke="currentColor" stroke-width="2"/>
          </svg>
          Sauvegarder le brouillon
        </button>

        <button
          type="submit"
          class="primary-button"
          :disabled="isLoading || !isFormValid"
        >
          <span v-if="!isLoading">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M2 3L22 3L20 21L12 17L4 21L2 3Z" stroke="currentColor" stroke-width="2"/>
              <path d="M7 8L15 8" stroke="currentColor" stroke-width="2"/>
              <path d="M7 12L12 12" stroke="currentColor" stroke-width="2"/>
            </svg>
            Publier l'actualité
          </span>
          <div v-else class="loading-spinner">
            <svg class="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
              <path d="M4 12A8 8 0 0 1 12 4" stroke="currentColor" stroke-width="4"/>
            </svg>
            <span>Publication...</span>
          </div>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const props = defineProps({
  currentUser: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['article-published', 'tab-change'])

const form = reactive({
  title: '',
  category: '',
  desired_publication_date: '',
  excerpt: '',
  content: '',
  image_url: '',
  is_featured: false,
  allow_comments: true
})

const attachments = ref([])
const isLoading = ref(false)
const showPreview = ref(false)
const contentTextarea = ref(null)
const fileInput = ref(null)

const isFormValid = computed(() => {
  return form.title.trim() && 
         form.category && 
         form.excerpt.trim() && 
         form.content.trim()
})

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

const insertFormat = (before, after) => {
  const textarea = contentTextarea.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = form.content.substring(start, end)
  
  const newText = before + selectedText + after
  form.content = form.content.substring(0, start) + newText + form.content.substring(end)
  
  // Repositionner le curseur
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
  }, 0)
}

const handleImageError = () => {
  alert('Impossible de charger l\'image. Vérifiez l\'URL.')
}

// Gestion des pièces jointes
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  addAttachments(files)
}

const handleDrop = (event) => {
  event.preventDefault()
  const files = Array.from(event.dataTransfer.files)
  addAttachments(files)
}

const addAttachments = (files) => {
  const maxFileSize = 50 * 1024 * 1024 // 50MB max par fichier
  
  files.forEach(file => {
    if (file.size > maxFileSize) {
      alert(`Le fichier "${file.name}" est trop volumineux (max 50MB)`)
      return
    }
    
    // Vérifier si le fichier n'est pas déjà ajouté
    if (attachments.value.some(att => att.name === file.name && att.size === file.size)) {
      alert(`Le fichier "${file.name}" est déjà ajouté`)
      return
    }
    
    const attachment = {
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: null
    }
    
    // Créer une prévisualisation pour les images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        attachment.preview = e.target.result
      }
      reader.readAsDataURL(file)
    }
    
    attachments.value.push(attachment)
  })
}

const removeAttachment = (index) => {
  attachments.value.splice(index, 1)
}

const getFileTypeLabel = (type) => {
  if (type.startsWith('image/')) return 'Image'
  if (type.startsWith('video/')) return 'Vidéo'
  if (type.startsWith('audio/')) return 'Audio'
  if (type.includes('pdf')) return 'PDF'
  if (type.includes('word') || type.includes('document')) return 'Document'
  if (type.includes('presentation') || type.includes('powerpoint')) return 'Présentation'
  if (type.includes('spreadsheet') || type.includes('excel')) return 'Tableur'
  return 'Fichier'
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
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

const getCategoryClass = (category) => {
  switch(category) {
    case 'urgente': return 'urgente'
    case 'importante': return 'importante'
    case 'moyenne': return 'moyenne'
    case 'faible': return 'faible'
    default: return 'default'
  }
}

const saveDraft = () => {
  if (!form.title.trim()) {
    alert('Veuillez saisir un titre pour sauvegarder le brouillon')
    return
  }
  
  const drafts = JSON.parse(localStorage.getItem('news_drafts') || '[]')
  const draft = {
    id: Date.now(),
    ...form,
    author: `${props.currentUser.first_name} ${props.currentUser.last_name}`,
    university_id: props.currentUser.university_id,
    saved_at: new Date().toISOString()
  }
  
  drafts.push(draft)
  localStorage.setItem('news_drafts', JSON.stringify(drafts))
  
  alert('Brouillon sauvegardé avec succès !')
}

const handleSubmit = async () => {
  if (!isFormValid.value) {
    alert('Veuillez remplir tous les champs obligatoires')
    return
  }

  isLoading.value = true
  
  try {
    // Simulation d'un délai de publication
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Créer l'article
    const article = {
      id: Date.now(),
      ...form,
      // Propriétés selon cahier des charges
      original_title: form.title, // Titre avant modération
      original_content: form.content, // Contenu avant modération
      moderated_title: null, // Titre après modération (null initialement)
      moderated_content: null, // Contenu après modération (null initialement)
      
      // Dates selon cahier des charges
      created_at: new Date().toISOString(), // Date de rédaction
      moderated_at: null, // Date de modération
      desired_publication_date: form.desired_publication_date || new Date().toISOString(),
      effective_publication_date: null, // Date effective de publication
      
      // Modération détaillée
      moderator_approval: null, // true/false/null
      moderator_id: null, // ID du modérateur
      invalidation_admin_id: null, // Administrateur ayant invalidé
      invalidation_reason: null, // Motivation de l'invalidation
      moderation_comments: null, // Commentaires du modérateur
      
      attachments: attachments.value.map(att => ({
        name: att.name,
        size: att.size,
        type: att.type,
        preview: att.preview
      })),
      author: {
        id: props.currentUser.id,
        first_name: props.currentUser.first_name,
        last_name: props.currentUser.last_name,
        role: props.currentUser.role
      },
      university_id: props.currentUser.university_id,
      likes: 0,
      views: 0,
      status: 'pending' // Tous les articles sont en attente de modération par défaut
    }
    
    // Sauvegarder dans localStorage
    const news = JSON.parse(localStorage.getItem('ccc_news') || '[]')
    news.unshift(article) // Ajouter en première position
    localStorage.setItem('ccc_news', JSON.stringify(news))
    
    // Émettre un événement pour notifier les autres composants
    window.dispatchEvent(new CustomEvent('news-published', { detail: article }))
    
    // Supprimer le brouillon si l'article a été sauvegardé en tant que brouillon
    if (form.title) {
      const drafts = JSON.parse(localStorage.getItem('ccc_news_drafts') || '[]')
      const updatedDrafts = drafts.filter(draft => 
        !(draft.title === form.title && draft.author_id === props.currentUser.id)
      )
      localStorage.setItem('ccc_news_drafts', JSON.stringify(updatedDrafts))
    }
    
    // Réinitialiser le formulaire
    Object.keys(form).forEach(key => {
      if (typeof form[key] === 'boolean') {
        form[key] = key === 'allow_comments'
      } else {
        form[key] = ''
      }
    })
    attachments.value = []
    
    alert('Article soumis avec succès ! Il sera visible après validation par un modérateur.')
    emit('article-published', article)
    emit('tab-change', 'news')
    
  } catch (error) {
    console.error('Erreur lors de la publication:', error)
    alert('Erreur lors de la publication. Veuillez réessayer.')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Styles pour la section des pièces jointes */
.attachments-section {
  margin-top: 0.5rem;
}

.file-upload-area {
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  background: #f8fafc;
}

.file-upload-area:hover {
  border-color: #6366f1;
  background: #f1f5f9;
}

.file-upload-area.dragover {
  border-color: #6366f1;
  background: #ede9fe;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-prompt svg {
  color: #6b7280;
}

.upload-prompt p {
  margin: 0;
  color: #374151;
  font-weight: 500;
}

.click-text {
  color: #6366f1;
  text-decoration: underline;
}

.file-types {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 400;
}

.attachments-list {
  margin-top: 1.5rem;
}

.attachments-list h4 {
  margin: 0 0 1rem 0;
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
}

.attachment-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.attachment-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.attachment-preview {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  overflow: hidden;
}

.file-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.file-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.video-icon {
  background: #fef3c7;
  color: #f59e0b;
}

.audio-icon {
  background: #dcfce7;
  color: #16a34a;
}

.doc-icon {
  background: #dbeafe;
  color: #2563eb;
}

.attachment-info {
  flex: 1;
  min-width: 0;
}

.attachment-name {
  margin: 0 0 0.25rem 0;
  font-weight: 500;
  color: #111827;
  font-size: 0.875rem;
  word-break: break-word;
}

.attachment-meta {
  margin: 0;
  font-size: 0.75rem;
  color: #6b7280;
  display: flex;
  gap: 0.5rem;
}

.file-type {
  font-weight: 500;
}

.remove-attachment {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-attachment:hover {
  background: #fef2f2;
  color: #dc2626;
}

/* Responsive */
@media (max-width: 768px) {
  .file-upload-area {
    padding: 1.5rem;
  }
  
  .attachment-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .attachment-preview {
    align-self: center;
  }
  
  .attachment-info {
    text-align: center;
    width: 100%;
  }
  
  .remove-attachment {
    align-self: center;
  }
}

/* Styles pour les catégories d'importance */
.preview-category {
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.preview-category.faible {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.preview-category.moyenne {
  background: rgba(234, 179, 8, 0.1);
  color: #ca8a04;
}

.preview-category.importante {
  background: rgba(249, 115, 22, 0.1);
  color: #ea580c;
}

.preview-category.urgente {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  animation: pulse-urgent 2s infinite;
}

@keyframes pulse-urgent {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
</style>