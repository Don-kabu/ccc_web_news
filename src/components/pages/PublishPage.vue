<template>
  <div class="publish-content">
    <div class="publish-header">
      <h1>Publier une nouvelle actualité</h1>
      <p>Partagez les dernières nouvelles de votre université</p>
    </div>

    <form v-if="canCreateNews" @submit.prevent="handleSubmit" class="publish-form">
      <!-- Titre de l'article -->
      <div class="form-group">
        <label for="title" class="form-label">Titre de l'actualité *</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          placeholder="Saisissez un titre accrocheur..."
          class="form-input"
          :class="{ 'error': validationErrors.title }"
          required
          maxlength="200"
          @blur="validateTitle"
        />
        <div class="char-count">{{ form.title.length }}/200</div>
        <div v-if="validationErrors.title" class="validation-error">{{ validationErrors.title }}</div>
      </div>

      <!-- Niveau d'importance -->
      <div class="form-group">
        <label for="importance" class="form-label">Niveau d'importance *</label>
        <select
          id="importance"
          v-model="form.importance"
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

      <!-- Catégorie -->
      <div class="form-group">
        <label for="category" class="form-label">Catégorie *</label>
        <select
          id="category"
          v-model="form.category"
          class="form-input"
          required
        >
          <option value="">Sélectionnez une catégorie</option>
          <option value="Académique">📚 Académique</option>
          <option value="Administratif">🏛️ Administratif</option>
          <option value="Événements">🎉 Événements</option>
          <option value="Recherche">🔬 Recherche</option>
          <option value="Vie étudiante">🎓 Vie étudiante</option>
          <option value="Sports">⚽ Sports</option>
          <option value="Culture">🎭 Culture</option>
          <option value="International">🌍 International</option>
          <option value="Partenariats">🤝 Partenariats</option>
          <option value="Actualités générales">📰 Actualités générales</option>
        </select>
      </div>

      <!-- Tags -->
      <div class="form-group">
        <label for="tags" class="form-label">Tags (mots-clés)</label>
        <input
          id="tags"
          v-model="tagsInput"
          type="text"
          placeholder="examens, important, deadlines (séparés par des virgules)"
          class="form-input"
          :class="{ 'error': validationErrors.tags }"
          @input="updateTags"
          @blur="validateTags"
        />
        <small class="form-hint">
          Saisissez les mots-clés séparés par des virgules pour faciliter la recherche. Maximum 10 tags.
        </small>
        <div v-if="form.tags.length > 0" class="tags-preview">
          <span v-for="tag in form.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
        <div v-if="validationErrors.tags" class="validation-error">{{ validationErrors.tags }}</div>
      </div>

      <!-- Options de publication -->
      <div class="form-group">
        <div class="publish-options">
          <label class="checkbox-wrapper">
            <input v-model="form.publish_now" type="checkbox" class="checkbox" @change="handlePublishNowChange" />
            <span class="checkbox-label">Publier immédiatement après validation (dans 10 minutes)</span>
          </label>
        </div>
      </div>

      <!-- Date de publication programmée -->
      <div v-if="!form.publish_now" class="form-group">
        <label for="scheduled_at" class="form-label">Date de publication programmée</label>
        <input
          id="scheduled_at"
          v-model="form.scheduled_at"
          type="datetime-local"
          class="form-input"
          :class="{ 'error': validationErrors.scheduledAt }"
          :min="new Date().toISOString().slice(0, 16)"
          @blur="validateScheduledAt"
        />
        <small class="form-hint">
          Si aucune date n'est spécifiée, l'article sera programmé pour publication après validation par un modérateur.
        </small>
        <div v-if="validationErrors.scheduledAt" class="validation-error">{{ validationErrors.scheduledAt }}</div>
      </div>

      <!-- Résumé -->
      <div class="form-group">
        <label for="excerpt" class="form-label">Résumé *</label>
        <textarea
          id="excerpt"
          v-model="form.excerpt"
          placeholder="Rédigez un court résumé de l'actualité (sera affiché dans la liste)..."
          class="form-textarea"
          :class="{ 'error': validationErrors.excerpt }"
          rows="3"
          required
          maxlength="300"
          @blur="validateExcerpt"
        ></textarea>
        <div class="char-count">{{ form.excerpt.length }}/300</div>
        <div v-if="validationErrors.excerpt" class="validation-error">{{ validationErrors.excerpt }}</div>
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
          :class="{ 'error': validationErrors.content }"
          rows="15"
          required
          @blur="validateContent"
        ></textarea>
        <div class="char-count">{{ form.content.length }} caractères</div>
        <div v-if="validationErrors.content" class="validation-error">{{ validationErrors.content }}</div>
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
              <span class="preview-importance" :class="getImportanceClass(form.importance)">{{ getImportanceLabel(form.importance) }}</span>
              <span class="preview-category">{{ getCategoryLabel(form.category) }}</span>
              <time class="preview-date">{{ new Date().toLocaleDateString('fr-FR') }}</time>
            </div>
            <h4 class="preview-title">{{ form.title || 'Titre de l\'actualité' }}</h4>
            <p class="preview-excerpt">{{ form.excerpt || 'Résumé de l\'actualité...' }}</p>
            <div v-if="form.tags.length > 0" class="preview-tags">
              <span v-for="tag in form.tags" :key="tag" class="preview-tag">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Boutons d'action -->
      <div v-if="canCreateNews" class="form-actions">
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

    <!-- Message d'accès refusé pour les utilisateurs sans permissions -->
    <div v-if="!canCreateNews" class="access-denied-section">
      <div class="access-denied-content">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
          <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
        </svg>
        <h3>Accès restreint</h3>
        <p>Vous n'avez pas les permissions nécessaires pour publier des actualités.</p>
        <p>Contactez un administrateur pour obtenir le rôle de <strong>"Publiant"</strong> ou <strong>"Administrateur"</strong>.</p>
        <div class="role-info">
          <p><strong>Votre rôle actuel :</strong> {{ currentUser.role || 'Étudiant' }}</p>
          <p><strong>Rôles autorisés à publier :</strong> Publiant, Administrateur</p>
        </div>
        <button @click="$emit('tab-change', 'accueil')" class="primary-button">
          Retour à l'accueil
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { newsService } from '@/services/news.service.js'
import { usePermissions, PERMISSIONS } from '@/composables/usePermissions.js'

const props = defineProps({
  currentUser: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['article-published', 'tab-change'])

// Système de permissions
const { hasPermission } = usePermissions(props.currentUser)
const canCreateNews = computed(() => hasPermission.value(PERMISSIONS.CREATE_NEWS))

// État pour les erreurs
const error = ref(null)
const isLoading = ref(false)
const validationErrors = ref({
  title: '',
  excerpt: '',
  content: '',
  scheduledAt: '',
  tags: ''
})

const form = reactive({
  title: '',
  excerpt: '',
  content: '',
  importance: '',
  category: '',
  tags: [],
  publish_now: false,
  scheduled_at: '',
  is_featured: false,
  allow_comments: true
})

const tagsInput = ref('')

const attachments = ref([])
const showPreview = ref(false)
const contentTextarea = ref(null)
const fileInput = ref(null)

// Validation en temps réel
const validateTitle = () => {
  if (form.title.length < 10) {
    validationErrors.value.title = 'Le titre doit contenir au moins 10 caractères.'
  } else {
    validationErrors.value.title = ''
  }
}

const validateExcerpt = () => {
  if (form.excerpt.length < 20) {
    validationErrors.value.excerpt = 'L\'extrait doit contenir au moins 20 caractères.'
  } else {
    validationErrors.value.excerpt = ''
  }
}

const validateContent = () => {
  if (form.content.length < 50) {
    validationErrors.value.content = 'Le contenu doit contenir au moins 50 caractères.'
  } else {
    validationErrors.value.content = ''
  }
}

const validateScheduledAt = () => {
  if (form.scheduled_at && !form.publish_now) {
    const scheduledDate = new Date(form.scheduled_at)
    const now = new Date()
    if (scheduledDate <= now) {
      validationErrors.value.scheduledAt = 'La date de programmation doit être dans le futur.'
    } else {
      validationErrors.value.scheduledAt = ''
    }
  } else {
    validationErrors.value.scheduledAt = ''
  }
}

const validateTags = () => {
  if (form.tags.length > 10) {
    validationErrors.value.tags = 'Maximum 10 tags autorisés.'
  } else {
    validationErrors.value.tags = ''
  }
}

const isFormValid = computed(() => {
  // Effectuer toutes les validations
  validateTitle()
  validateExcerpt()
  validateContent()
  validateScheduledAt()
  validateTags()
  
  // Vérifier qu'il n'y a pas d'erreurs et que les champs requis sont remplis
  const hasNoErrors = !validationErrors.value.title && 
                      !validationErrors.value.excerpt && 
                      !validationErrors.value.content && 
                      !validationErrors.value.scheduledAt && 
                      !validationErrors.value.tags
  
  const hasRequiredFields = form.title.trim() && 
                           form.importance && 
                           form.category && 
                           form.excerpt.trim() && 
                           form.content.trim()
  
  return hasNoErrors && hasRequiredFields
})

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

// Gestion des tags
const updateTags = () => {
  const tags = tagsInput.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
  form.tags = [...new Set(tags)] // Supprimer les doublons
  validateTags() // Valider après mise à jour
}

// Gestion des options de publication
const handlePublishNowChange = () => {
  if (form.publish_now) {
    // Définir scheduled_at à 10 minutes dans le futur par défaut
    const now = new Date()
    const in10Minutes = new Date(now.getTime() + 10 * 60 * 1000) // +10 minutes
    form.scheduled_at = in10Minutes.toISOString().slice(0, 16) // Format datetime-local
    console.log('🕒 Publication immédiate: scheduled_at défini à', form.scheduled_at)
  } else {
    form.scheduled_at = ''
  }
  validateScheduledAt() // Valider après changement
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
    case 'Académique': return '📚 Académique'
    case 'Administratif': return '🏛️ Administratif'
    case 'Événements': return '🎉 Événements'
    case 'Recherche': return '🔬 Recherche'
    case 'Vie étudiante': return '🎓 Vie étudiante'
    case 'Sports': return '⚽ Sports'
    case 'Culture': return '🎭 Culture'
    case 'International': return '🌍 International'
    case 'Partenariats': return '🤝 Partenariats'
    case 'Actualités générales': return '📰 Actualités générales'
    default: return category || 'Non défini'
  }
}

const getImportanceLabel = (importance) => {
  switch(importance) {
    case 'faible': return '🟢 Faible'
    case 'moyenne': return '🟡 Moyenne'
    case 'importante': return '🟠 Importante'
    case 'urgente': return '🔴 Urgente'
    default: return importance || 'Non défini'
  }
}

const getImportanceClass = (importance) => {
  switch(importance) {
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
  
  try {
    const drafts = JSON.parse(localStorage.getItem('news_drafts') || '[]')
    const draft = {
      id: Date.now(),
      ...form,
      author_id: props.currentUser.id,
      author: `${props.currentUser.first_name} ${props.currentUser.last_name}`,
      university_id: props.currentUser.university_id,
      saved_at: new Date().toISOString()
    }
    
    drafts.push(draft)
    localStorage.setItem('news_drafts', JSON.stringify(drafts))
    
    alert('Brouillon sauvegardé avec succès !')
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du brouillon:', error)
    alert('Erreur lors de la sauvegarde du brouillon')
  }
}

const handleSubmit = async () => {
  // Effectuer toutes les validations avant la soumission
  validateTitle()
  validateExcerpt()
  validateContent()
  validateScheduledAt()
  validateTags()
  
  if (!isFormValid.value) {
    // Construire un message d'erreur détaillé
    const errors = []
    if (validationErrors.value.title) errors.push(`• ${validationErrors.value.title}`)
    if (validationErrors.value.excerpt) errors.push(`• ${validationErrors.value.excerpt}`)
    if (validationErrors.value.content) errors.push(`• ${validationErrors.value.content}`)
    if (validationErrors.value.scheduledAt) errors.push(`• ${validationErrors.value.scheduledAt}`)
    if (validationErrors.value.tags) errors.push(`• ${validationErrors.value.tags}`)
    
    if (errors.length > 0) {
      alert(`Veuillez corriger les erreurs suivantes :\n\n${errors.join('\n')}`)
    } else {
      alert('Veuillez remplir tous les champs obligatoires')
    }
    return
  }

  isLoading.value = true
  error.value = null
  
  try {
    // Préparer les données selon le format spécifié
    const articleData = {
      title: form.title,
      excerpt: form.excerpt,
      content: form.content,
      importance: form.importance,
      category: form.category,
      tags: form.tags,
      publish_now: form.publish_now,
      scheduled_at: form.publish_now 
        ? (form.scheduled_at || new Date(Date.now() + 10 * 60 * 1000).toISOString()) // +10min si publish_now
        : (form.scheduled_at || new Date().toISOString()) // ou maintenant si pas de date spécifiée
    }
    
    console.log('📝 Données de publication:', articleData)
    
    // Créer l'article via l'API
    const response = await newsService.createNews(articleData)
    
    if (response.success) {
      // Émettre un événement pour notifier les autres composants
      window.dispatchEvent(new CustomEvent('news-published', { detail: response.data }))
      
      // Émettre vers le parent
      emit('article-published', response.data)
      
      // Supprimer le brouillon correspondant si existe
      await removeDraftIfExists()
      
      // Réinitialiser le formulaire
      resetForm()
      
      alert('Article publié avec succès !')
    } else {
      throw new Error(response.message || 'Erreur lors de la publication')
    }
    
  } catch (err) {
    console.error('Erreur lors de la publication:', err)
    error.value = 'Impossible de se connecter à l\'API pour publier l\'article'
    alert('Erreur lors de la publication de l\'article')
  } finally {
    isLoading.value = false
  }
}

// Fonction utilitaire pour supprimer un brouillon correspondant
const removeDraftIfExists = async () => {
  // Pour l'instant, on garde la logique localStorage pour les brouillons
  // car l'API ne semble pas avoir d'endpoint pour les brouillons
  if (form.title) {
    try {
      const drafts = JSON.parse(localStorage.getItem('ccc_news_drafts') || '[]')
      const updatedDrafts = drafts.filter(draft => 
        !(draft.title === form.title && draft.author_id === props.currentUser.id)
      )
      localStorage.setItem('ccc_news_drafts', JSON.stringify(updatedDrafts))
    } catch (error) {
      console.warn('Erreur lors de la suppression du brouillon:', error)
    }
  }
}

// Fonction pour réinitialiser le formulaire
const resetForm = () => {
  Object.keys(form).forEach(key => {
    if (typeof form[key] === 'boolean') {
      form[key] = key === 'allow_comments'
    } else if (key === 'tags') {
      form[key] = []
    } else {
      form[key] = ''
    }
  })
  tagsInput.value = ''
  attachments.value = []
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
@media (max-width: 1200px) {
  .publish-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .publish-form {
    order: 1;
  }
  
  .preview-panel {
    order: 2;
  }
}

@media (max-width: 768px) {
  .publish-page {
    padding: 1rem;
  }
  
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .form-group label {
    font-size: 0.875rem;
  }
  
  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 0.75rem;
    font-size: 1rem;
  }
  
  .textarea-container textarea {
    min-height: 120px;
  }
  
  .file-upload-area {
    padding: 1.5rem;
  }
  
  .upload-text h3 {
    font-size: 1rem;
  }
  
  .upload-text p {
    font-size: 0.875rem;
  }
  
  .attachment-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.75rem;
  }
  
  .attachment-preview {
    align-self: center;
  }
  
  .attachment-info {
    text-align: center;
    width: 100%;
  }
  
  .attachment-info h4 {
    font-size: 0.9rem;
  }
  
  .attachment-info p {
    font-size: 0.8rem;
  }
  
  .remove-attachment {
    align-self: center;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .preview-panel {
    position: static;
    height: auto;
    max-height: none;
  }
  
  .preview-content {
    max-height: 400px;
    overflow-y: auto;
  }
}

@media (max-width: 480px) {
  .publish-page {
    padding: 0.75rem;
  }
  
  .page-header h1 {
    font-size: 1.25rem;
  }
  
  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 0.6rem;
    font-size: 0.9rem;
  }
  
  .textarea-container {
    min-height: 100px;
  }
  
  .textarea-counter {
    font-size: 0.75rem;
  }
  
  .file-upload-area {
    padding: 1rem;
  }
  
  .upload-text h3 {
    font-size: 0.9rem;
  }
  
  .upload-text p {
    font-size: 0.8rem;
  }
  
  .attachment-item {
    padding: 0.5rem;
  }
  
  .attachment-preview img,
  .attachment-preview video {
    width: 60px;
    height: 60px;
  }
  
  .form-actions button {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
  }
  
  .preview-panel h3 {
    font-size: 1rem;
  }
  
  .preview-content {
    padding: 0.75rem;
    max-height: 300px;
  }
  
  .preview-category {
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
  }
}

@media (max-width: 360px) {
  .publish-page {
    padding: 0.5rem;
  }
  
  .page-header h1 {
    font-size: 1.1rem;
  }
  
  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 0.5rem;
    font-size: 0.85rem;
  }
  
  .file-upload-area {
    padding: 0.75rem;
  }
  
  .attachment-item {
    padding: 0.4rem;
  }
  
  .attachment-preview img,
  .attachment-preview video {
    width: 50px;
    height: 50px;
  }
  
  .form-actions button {
    padding: 0.6rem 1.25rem;
    font-size: 0.85rem;
  }
  
  .preview-content {
    padding: 0.5rem;
    max-height: 250px;
  }
}

/* Landscape orientation optimizations */
@media (max-height: 500px) and (orientation: landscape) {
  .publish-container {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  
  .preview-panel {
    position: static;
    height: auto;
    max-height: 80vh;
  }
  
  .textarea-container textarea {
    min-height: 80px;
  }
  
  .file-upload-area {
    padding: 1rem;
  }
}

/* Styles pour les tags */
.tags-preview {
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: var(--primary-light, #e0e7ff);
  color: var(--primary-color, #667eea);
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid var(--primary-color, #667eea);
}

/* Styles pour les options de publication */
.publish-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 0.25rem;
  border: 2px solid var(--border-color, #e2e8f0);
  appearance: none;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.checkbox:checked {
  background: var(--primary-color, #667eea);
  border-color: var(--primary-color, #667eea);
}

.checkbox:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
}

.checkbox-label {
  font-size: 0.9rem;
  color: var(--text-primary, #1a202c);
  font-weight: 500;
}

/* Styles pour l'aperçu amélioré */
.preview-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.preview-importance {
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.preview-category {
  padding: 0.25rem 0.5rem;
  background: var(--background-secondary, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary, #4a5568);
}

.preview-date {
  font-size: 0.75rem;
  color: var(--text-muted, #718096);
}

.preview-tags {
  margin-top: 0.75rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.preview-tag {
  background: var(--background-primary, #f8fafc);
  color: var(--text-secondary, #4a5568);
  padding: 0.2rem 0.4rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 500;
  border: 1px solid var(--border-light, #f1f5f9);
}

/* Styles pour les niveaux d'importance */
.preview-importance.faible {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.preview-importance.moyenne {
  background: rgba(234, 179, 8, 0.1);
  color: #ca8a04;
  border: 1px solid rgba(234, 179, 8, 0.3);
}

.preview-importance.importante {
  background: rgba(249, 115, 22, 0.1);
  color: #ea580c;
  border: 1px solid rgba(249, 115, 22, 0.3);
}

.preview-importance.urgente {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.3);
  animation: pulse-urgent 2s infinite;
}

/* Styles pour la validation */
.form-input.error,
.form-textarea.error {
  border-color: var(--error-color, #f56565) !important;
  background-color: rgba(245, 101, 101, 0.05);
  box-shadow: 0 0 0 3px rgba(245, 101, 101, 0.1);
}

.validation-error {
  color: var(--error-color, #f56565);
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-weight: 500;
}

.validation-error::before {
  content: '⚠️';
  font-size: 0.75rem;
}

/* Styles pour les sections d'accès refusé */
.access-denied-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
}

.access-denied-content {
  text-align: center;
  max-width: 500px;
  background: var(--background-secondary, #ffffff);
  padding: 3rem 2rem;
  border-radius: 16px;
  border: 1px solid var(--border-color, #e2e8f0);
  box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
}

.access-denied-content svg {
  color: var(--error-color, #f56565);
  margin-bottom: 1.5rem;
}

.access-denied-content h3 {
  color: var(--text-primary, #1a202c);
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.access-denied-content p {
  color: var(--text-secondary, #4a5568);
  margin-bottom: 1rem;
  line-height: 1.6;
}

.role-info {
  background: var(--background-primary, #f8fafc);
  padding: 1.5rem;
  border-radius: 12px;
  margin: 1.5rem 0;
  border: 1px solid var(--border-light, #f1f5f9);
}

.role-info p {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.role-info p:last-child {
  margin-bottom: 0;
}

.access-denied-content button {
  margin-top: 1.5rem;
}
</style>