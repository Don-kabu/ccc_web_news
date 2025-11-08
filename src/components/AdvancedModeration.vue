<template>
  <div class="advanced-moderation">
    <div class="moderation-header">
      <h3>Actions de modération</h3>
      <div class="article-status">
        <span :class="`status-badge status-${article.status?.toLowerCase()}`">
          {{ getStatusLabel(article.status) }}
        </span>
      </div>
    </div>

    <!-- Historique des modérations -->
    <div v-if="statusHistory?.length" class="status-history">
      <h4>Historique des modérations</h4>
      <div class="history-list">
        <div v-for="entry in statusHistory" :key="entry.id" class="history-entry">
          <div class="history-info">
            <div class="history-status">
              <span :class="`status-dot status-${entry.status?.toLowerCase()}`"></span>
              {{ getStatusLabel(entry.status) }}
            </div>
            <div class="history-meta">
              <span class="moderator">{{ entry.moderated_by || 'Système' }}</span>
              <span class="date">{{ formatDate(entry.moderated_at) }}</span>
            </div>
          </div>
          <div v-if="entry.comment" class="history-comment">
            {{ entry.comment }}
          </div>
        </div>
      </div>
    </div>

    <!-- Actions de modération -->
    <div class="moderation-actions">
      <div class="action-section">
        <h4>Actions disponibles</h4>
        
        <!-- Approuver -->
        <div v-if="canApprove" class="action-card approve">
          <div class="action-header">
            <div class="action-icon">✅</div>
            <div class="action-info">
              <h5>Approuver l'article</h5>
              <p>Publier l'article immédiatement</p>
            </div>
          </div>
          <div class="action-content">
            <textarea
              v-model="approvalComment"
              placeholder="Commentaire d'approbation (optionnel)"
              rows="2"
              class="action-textarea"
            ></textarea>
            <div class="action-buttons">
              <button @click="handleApprove" :disabled="isLoading" class="btn-approve">
                <span v-if="!isLoading">Approuver</span>
                <span v-else>Approbation...</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Demander des modifications -->
        <div v-if="canRequestChanges" class="action-card changes">
          <div class="action-header">
            <div class="action-icon">🔄</div>
            <div class="action-info">
              <h5>Demander des modifications</h5>
              <p>Renvoyer à l'auteur pour révision</p>
            </div>
          </div>
          <div class="action-content">
            <textarea
              v-model="changesComment"
              placeholder="Décrivez les modifications demandées..."
              rows="3"
              class="action-textarea"
              required
            ></textarea>
            <div class="action-buttons">
              <button 
                @click="handleRequestChanges" 
                :disabled="isLoading || !changesComment.trim()" 
                class="btn-changes"
              >
                <span v-if="!isLoading">Demander modifications</span>
                <span v-else>Envoi...</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Rejeter -->
        <div v-if="canReject" class="action-card reject">
          <div class="action-header">
            <div class="action-icon">❌</div>
            <div class="action-info">
              <h5>Rejeter l'article</h5>
              <p>Rejeter définitivement la publication</p>
            </div>
          </div>
          <div class="action-content">
            <textarea
              v-model="rejectionReason"
              placeholder="Motif du rejet (obligatoire)..."
              rows="3"
              class="action-textarea"
              required
            ></textarea>
            <div class="action-buttons">
              <button 
                @click="handleReject" 
                :disabled="isLoading || !rejectionReason.trim()" 
                class="btn-reject"
              >
                <span v-if="!isLoading">Rejeter</span>
                <span v-else>Rejet...</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Archiver -->
        <div v-if="canArchive" class="action-card archive">
          <div class="action-header">
            <div class="action-icon">📁</div>
            <div class="action-info">
              <h5>Archiver l'article</h5>
              <p>Déplacer vers les archives</p>
            </div>
          </div>
          <div class="action-content">
            <textarea
              v-model="archiveReason"
              placeholder="Raison de l'archivage (optionnel)"
              rows="2"
              class="action-textarea"
            ></textarea>
            <div class="action-buttons">
              <button @click="handleArchive" :disabled="isLoading" class="btn-archive">
                <span v-if="!isLoading">Archiver</span>
                <span v-else>Archivage...</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message d'erreur -->
    <div v-if="error" class="error-message">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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

const emit = defineEmits(['statusUpdated'])

const isLoading = ref(false)
const error = ref(null)
const statusHistory = ref([])
const approvalComment = ref('')
const changesComment = ref('')
const rejectionReason = ref('')
const archiveReason = ref('')

// Permissions calculées
const canApprove = computed(() => {
  return ['PENDING', 'NEEDS_REVISION'].includes(props.article.status) &&
         ['ADMIN', 'MODERATOR'].includes(props.currentUser.role)
})

const canRequestChanges = computed(() => {
  return ['PENDING'].includes(props.article.status) &&
         ['ADMIN', 'MODERATOR'].includes(props.currentUser.role)
})

const canReject = computed(() => {
  return ['PENDING', 'NEEDS_REVISION'].includes(props.article.status) &&
         ['ADMIN', 'MODERATOR'].includes(props.currentUser.role)
})

const canArchive = computed(() => {
  return ['ADMIN'].includes(props.currentUser.role)
})

// Charger l'historique au montage
onMounted(async () => {
  if (props.article?.id) {
    await loadStatusHistory()
  }
})

const loadStatusHistory = async () => {
  try {
    const response = await newsService.getStatusHistory(props.article.id)
    if (response.success) {
      statusHistory.value = response.data || []
    }
  } catch (err) {
    console.error('Erreur lors du chargement de l\'historique:', err)
    // L'historique n'est pas critique, on n'affiche pas d'erreur
  }
}

const handleApprove = async () => {
  if (!confirm('Êtes-vous sûr de vouloir approuver cet article ?')) return
  
  isLoading.value = true
  error.value = null
  
  try {
    const response = await newsService.approveArticle(
      props.article.id,
      approvalComment.value.trim()
    )
    
    if (response.success) {
      emit('statusUpdated', {
        ...props.article,
        status: 'PUBLISHED',
        comment: approvalComment.value.trim()
      })
      await loadStatusHistory()
      approvalComment.value = ''
      alert('Article approuvé avec succès !')
    } else {
      throw new Error(response.message || 'Erreur lors de l\'approbation')
    }
  } catch (err) {
    console.error('Erreur lors de l\'approbation:', err)
    error.value = 'Impossible de se connecter à l\'API pour approuver l\'article'
  } finally {
    isLoading.value = false
  }
}

const handleRequestChanges = async () => {
  if (!changesComment.value.trim()) {
    alert('Veuillez spécifier les modifications demandées')
    return
  }
  
  if (!confirm('Êtes-vous sûr de vouloir demander des modifications ?')) return
  
  isLoading.value = true
  error.value = null
  
  try {
    const response = await newsService.requestChanges(
      props.article.id,
      changesComment.value.trim()
    )
    
    if (response.success) {
      emit('statusUpdated', {
        ...props.article,
        status: 'NEEDS_REVISION',
        comment: changesComment.value.trim()
      })
      await loadStatusHistory()
      changesComment.value = ''
      alert('Demande de modifications envoyée avec succès !')
    } else {
      throw new Error(response.message || 'Erreur lors de la demande')
    }
  } catch (err) {
    console.error('Erreur lors de la demande de modifications:', err)
    error.value = 'Impossible de se connecter à l\'API pour demander les modifications'
  } finally {
    isLoading.value = false
  }
}

const handleReject = async () => {
  if (!rejectionReason.value.trim()) {
    alert('Veuillez spécifier le motif du rejet')
    return
  }
  
  if (!confirm('Êtes-vous sûr de vouloir rejeter cet article ? Cette action est définitive.')) return
  
  isLoading.value = true
  error.value = null
  
  try {
    const response = await newsService.rejectArticle(
      props.article.id,
      rejectionReason.value.trim()
    )
    
    if (response.success) {
      emit('statusUpdated', {
        ...props.article,
        status: 'REJECTED',
        comment: rejectionReason.value.trim()
      })
      await loadStatusHistory()
      rejectionReason.value = ''
      alert('Article rejeté avec succès !')
    } else {
      throw new Error(response.message || 'Erreur lors du rejet')
    }
  } catch (err) {
    console.error('Erreur lors du rejet:', err)
    error.value = 'Impossible de se connecter à l\'API pour rejeter l\'article'
  } finally {
    isLoading.value = false
  }
}

const handleArchive = async () => {
  if (!confirm('Êtes-vous sûr de vouloir archiver cet article ?')) return
  
  isLoading.value = true
  error.value = null
  
  try {
    const response = await newsService.archiveArticle(
      props.article.id,
      archiveReason.value.trim()
    )
    
    if (response.success) {
      emit('statusUpdated', {
        ...props.article,
        status: 'ARCHIVED',
        comment: archiveReason.value.trim()
      })
      await loadStatusHistory()
      archiveReason.value = ''
      alert('Article archivé avec succès !')
    } else {
      throw new Error(response.message || 'Erreur lors de l\'archivage')
    }
  } catch (err) {
    console.error('Erreur lors de l\'archivage:', err)
    error.value = 'Impossible de se connecter à l\'API pour archiver l\'article'
  } finally {
    isLoading.value = false
  }
}

const getStatusLabel = (status) => {
  const labels = {
    'PENDING': 'En attente',
    'PUBLISHED': 'Publié',
    'REJECTED': 'Rejeté',
    'NEEDS_REVISION': 'Révision demandée',
    'ARCHIVED': 'Archivé',
    'DRAFT': 'Brouillon'
  }
  return labels[status] || status
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.advanced-moderation {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.moderation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.moderation-header h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-pending { background: #fef3c7; color: #92400e; }
.status-published { background: #d1fae5; color: #065f46; }
.status-rejected { background: #fee2e2; color: #991b1b; }
.status-needs_revision { background: #dbeafe; color: #1e40af; }
.status-archived { background: #f3f4f6; color: #374151; }

/* Historique */
.status-history {
  margin-bottom: 2rem;
}

.status-history h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

/* History entries have individual margin-bottom */

.history-entry {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid #e5e7eb;
  margin-bottom: 1rem;
}

.history-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.history-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.status-pending { background: #f59e0b; }
.status-dot.status-published { background: #10b981; }
.status-dot.status-rejected { background: #ef4444; }
.status-dot.status-needs_revision { background: #3b82f6; }
.status-dot.status-archived { background: #6b7280; }

.history-meta {
  font-size: 0.8rem;
  color: #6b7280;
}

.history-comment {
  font-style: italic;
  color: #4b5563;
  margin-top: 0.5rem;
}

/* Actions */
.action-section h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.action-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 1rem;
  overflow: hidden;
  transition: border-color 0.2s;
}

.action-card:hover {
  border-color: #d1d5db;
}

.action-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
}

.action-icon {
  font-size: 1.5rem;
}

.action-info h5 {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: #111827;
}

.action-info p {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
}

.action-content {
  padding: 1rem;
}

.action-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  resize: vertical;
  margin-bottom: 1rem;
}

.action-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
}

.btn-approve, .btn-changes, .btn-reject, .btn-archive {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-approve {
  background: #10b981;
  color: white;
}

.btn-approve:hover:not(:disabled) {
  background: #059669;
}

.btn-changes {
  background: #3b82f6;
  color: white;
}

.btn-changes:hover:not(:disabled) {
  background: #2563eb;
}

.btn-reject {
  background: #ef4444;
  color: white;
}

.btn-reject:hover:not(:disabled) {
  background: #dc2626;
}

.btn-archive {
  background: #6b7280;
  color: white;
}

.btn-archive:hover:not(:disabled) {
  background: #4b5563;
}

.btn-approve:disabled, .btn-changes:disabled, .btn-reject:disabled, .btn-archive:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Message d'erreur */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  margin-top: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .moderation-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .history-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .action-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>