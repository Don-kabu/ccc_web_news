<template>
  <div class="edit-news">
    <div class="edit-header">
      <h2>Modifier l'article</h2>
      <button @click="$emit('cancel')" class="cancel-btn">
        ✕ Annuler
      </button>
    </div>

    <!-- Indicateur de chargement -->
    <div v-if="isLoading" class="loading-message">
      <div class="spinner"></div>
      <p>{{ loadingMessage }}</p>
    </div>

    <!-- Message d'erreur -->
    <div v-if="error" class="error-message">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
    </div>

    <!-- Formulaire d'édition -->
    <form v-if="form" @submit.prevent="handleSubmit" class="edit-form">
      <!-- Titre -->
      <div class="form-group">
        <label for="title" class="form-label">Titre *</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          class="form-input"
          required
          maxlength="200"
        />
        <div class="char-count">{{ form.title.length }}/200</div>
      </div>

      <!-- Résumé -->
      <div class="form-group">
        <label for="excerpt" class="form-label">Résumé *</label>
        <textarea
          id="excerpt"
          v-model="form.excerpt"
          class="form-textarea"
          rows="3"
          required
          maxlength="300"
          placeholder="Résumé de l'article en quelques phrases..."
        ></textarea>
        <div class="char-count">{{ form.excerpt.length }}/300</div>
      </div>

      <!-- Catégorie -->
      <div class="form-group">
        <label for="category" class="form-label">Niveau d'importance *</label>
        <select id="category" v-model="form.category" class="form-select" required>
          <option value="">Sélectionnez le niveau d'importance</option>
          <option value="urgente">🔴 Urgente - Information critique</option>
          <option value="importante">🟠 Importante - Information prioritaire</option>
          <option value="normale">🟡 Normale - Information standard</option>
          <option value="faible">🟢 Faible - Information secondaire</option>
        </select>
      </div>

      <!-- Contenu -->
      <div class="form-group">
        <label for="content" class="form-label">Contenu *</label>
        <div class="content-editor">
          <div class="editor-toolbar">
            <button type="button" @click="insertFormat('**', '**')" class="format-btn" title="Gras">
              <strong>B</strong>
            </button>
            <button type="button" @click="insertFormat('*', '*')" class="format-btn" title="Italique">
              <em>I</em>
            </button>
            <button type="button" @click="insertFormat('\n- ', '')" class="format-btn" title="Liste">
              ≡
            </button>
          </div>
          <textarea
            id="content"
            ref="contentTextarea"
            v-model="form.content"
            class="form-textarea content-textarea"
            rows="15"
            required
            placeholder="Rédigez le contenu de votre article ici..."
          ></textarea>
        </div>
      </div>

      <!-- Tags -->
      <div class="form-group">
        <label for="tags" class="form-label">Tags</label>
        <input
          id="tags"
          v-model="form.tags"
          type="text"
          class="form-input"
          placeholder="Séparez les tags par des virgules (ex: université, événement, étudiant)"
        />
        <div class="form-help">Les tags aident à catégoriser votre article</div>
      </div>

      <!-- URL d'image -->
      <div class="form-group">
        <label for="imageUrl" class="form-label">URL de l'image</label>
        <input
          id="imageUrl"
          v-model="form.image_url"
          type="url"
          class="form-input"
          placeholder="https://exemple.com/image.jpg"
        />
        <div v-if="form.image_url" class="image-preview">
          <img :src="form.image_url" alt="Aperçu" @error="handleImageError" />
        </div>
      </div>

      <!-- Options -->
      <div class="form-group">
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.featured" />
            <span class="checkbox-text">Article en vedette</span>
          </label>
        </div>
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.allow_comments" />
            <span class="checkbox-text">Autoriser les commentaires</span>
          </label>
        </div>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button type="button" @click="$emit('cancel')" class="btn-cancel">
          Annuler
        </button>
        <button
          type="submit"
          :disabled="isLoading || !isFormValid"
          class="btn-submit"
        >
          <span v-if="!isLoading">
            ✓ Enregistrer les modifications
          </span>
          <span v-else>
            Enregistrement...
          </span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { newsService } from '@/services/news.service.js'

const props = defineProps({
  article: {
    type: Object,
    required: true
  },
  currentUser: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['saved', 'cancel'])

const isLoading = ref(false)
const loadingMessage = ref('')
const error = ref(null)
const contentTextarea = ref(null)

const form = reactive({
  title: '',
  excerpt: '',
  category: '',
  content: '',
  tags: '',
  image_url: '',
  featured: false,
  allow_comments: true
})

// Validation du formulaire
const isFormValid = computed(() => {
  return form.title.trim() && 
         form.excerpt.trim() && 
         form.category && 
         form.content.trim()
})

// Initialiser le formulaire avec les données de l'article
onMounted(() => {
  if (props.article) {
    form.title = props.article.title || ''
    form.excerpt = props.article.excerpt || ''
    form.category = props.article.category || ''
    form.content = props.article.content || ''
    form.tags = props.article.tags ? props.article.tags.join(', ') : ''
    form.image_url = props.article.image_url || ''
    form.featured = props.article.featured || false
    form.allow_comments = props.article.allow_comments !== false
  }
})

const handleSubmit = async () => {
  if (!isFormValid.value) {
    alert('Veuillez remplir tous les champs obligatoires')
    return
  }

  isLoading.value = true
  loadingMessage.value = 'Enregistrement des modifications...'
  error.value = null
  
  try {
    // Préparer les données pour l'API
    const updateData = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      category: form.category,
      content: form.content.trim(),
      tags: form.tags ? form.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      image_url: form.image_url || null,
      featured: form.featured,
      allow_comments: form.allow_comments
    }
    
    // Mettre à jour l'article via l'API
    const response = await newsService.updateNews(props.article.id, updateData)
    
    if (response.success) {
      emit('saved', response.data)
      alert('Article modifié avec succès !')
    } else {
      throw new Error(response.message || 'Erreur lors de la modification')
    }
    
  } catch (err) {
    console.error('Erreur lors de la modification:', err)
    error.value = 'Impossible de se connecter à l\'API pour modifier l\'article'
    alert('Erreur lors de la modification de l\'article')
  } finally {
    isLoading.value = false
    loadingMessage.value = ''
  }
}

// Insertion de formatage de texte
const insertFormat = (before, after) => {
  const textarea = contentTextarea.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = form.content.substring(start, end)
  
  const newText = before + selectedText + after
  form.content = form.content.substring(0, start) + newText + form.content.substring(end)
  
  // Repositionner le curseur
  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
  })
}

const handleImageError = () => {
  alert('Impossible de charger l\'image. Vérifiez l\'URL.')
}
</script>

<style scoped>
.edit-news {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.edit-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.cancel-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.5rem;
}

.cancel-btn:hover {
  color: #374151;
}

/* Messages de statut */
.loading-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  color: #6b7280;
}

.spinner {
  width: 2rem;
  height: 2rem;
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
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Formulaire déjà stylé par les éléments individuels */

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.char-count {
  text-align: right;
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.form-help {
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

/* Éditeur de contenu */
.content-editor {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f9fafb;
  border-bottom: 1px solid #d1d5db;
}

.format-btn {
  padding: 0.25rem 0.5rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.format-btn:hover {
  background: #f3f4f6;
}

.content-textarea {
  border: none;
  border-radius: 0;
  resize: vertical;
}

.content-textarea:focus {
  border: none;
  box-shadow: none;
}

/* Aperçu de l'image */
.image-preview {
  margin-top: 0.5rem;
  max-width: 300px;
}

.image-preview img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

/* Cases à cocher */
.checkbox-group {
  margin-bottom: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
}

.checkbox-text {
  font-weight: 500;
  color: #374151;
}

/* Actions */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel, .btn-submit {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-submit {
  background: #3b82f6;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #2563eb;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .edit-news {
    padding: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn-cancel, .btn-submit {
    width: 100%;
  }
}
</style>