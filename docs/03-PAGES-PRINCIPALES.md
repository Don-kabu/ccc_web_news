# 📄 Pages Principales de l'Application

## 🎯 Vue d'ensemble

Les pages principales constituent le **cœur fonctionnel** de l'application. Chaque page a un rôle spécifique et s'affiche selon l'onglet sélectionné.

## 📊 Structure des pages

```
App.vue (navigation)
├── 🏠 HomePage.vue           // Page d'accueil - aperçu général
├── 📰 NewsPage.vue           // Actualités - lecture et consultation
├── ✍️ PublishPage.vue        // Publication - création d'articles
├── 🛡️ ModerationPage.vue     // Modération - validation des articles
├── 👑 AdminPage.vue          // Administration - gestion globale
└── 👤 UserProfile.vue        // Profil - paramètres personnels
```

## 🏠 HomePage.vue - Page d'Accueil

### 🎯 Rôle principal

C'est la **vitrine** de l'application qui donne un aperçu de tout ce qui se passe.

### 📊 Contenu affiché

```javascript
// Données chargées au montage
const loadHomeData = async () => {
  try {
    // 1. Actualités en vedette
    const featuredNews = await newsService.getFeaturedNews(5)
    
    // 2. Actualités récentes
    const recentNews = await newsService.getNews({
      limit: 10,
      status: 'approved',
      sort_by: 'created_at'
    })
    
    // 3. Statistiques rapides
    const stats = await newsService.getNewsStats()
    
    // Mise à jour de l'interface
    homeData.value = {
      featured: featuredNews.data,
      recent: recentNews.data,
      statistics: stats.data
    }
  } catch (error) {
    console.error('Erreur chargement accueil:', error)
  }
}
```

### 🎨 Interface utilisateur

```vue
<template>
  <div class="home-page">
    <!-- Bienvenue personnalisée -->
    <header class="welcome-section">
      <h1>Bienvenue {{ currentUser.firstname }} ! 👋</h1>
      <p>{{ currentUser.university.name }}</p>
    </header>
    
    <!-- Actualités en vedette -->
    <section class="featured-news">
      <h2>⭐ Actualités en vedette</h2>
      <div class="news-grid">
        <article v-for="article in featuredNews" :key="article.id">
          <img :src="article.image_url" :alt="article.title" />
          <h3>{{ article.title }}</h3>
          <p>{{ article.excerpt }}</p>
          <span class="date">{{ formatDate(article.created_at) }}</span>
        </article>
      </div>
    </section>
    
    <!-- Actualités récentes -->
    <section class="recent-news">
      <h2>📰 Actualités récentes</h2>
      <div class="news-list">
        <div v-for="article in recentNews" :key="article.id" class="news-item">
          <h4>{{ article.title }}</h4>
          <p>{{ article.excerpt }}</p>
          <div class="news-meta">
            <span>{{ article.author.name }}</span>
            <span>{{ formatDate(article.created_at) }}</span>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Statistiques rapides -->
    <section class="quick-stats">
      <div class="stat-card">
        <h3>{{ statistics.total_articles }}</h3>
        <p>Articles publiés</p>
      </div>
      <div class="stat-card">
        <h3>{{ statistics.pending_articles }}</h3>
        <p>En attente</p>
      </div>
      <div class="stat-card">
        <h3>{{ statistics.total_users }}</h3>
        <p>Utilisateurs actifs</p>
      </div>
    </section>
  </div>
</template>
```

### 🌐 APIs utilisées

```javascript
// Endpoints appelés
GET /news/featured?limit=5      // Actualités en vedette
GET /news?status=approved       // Actualités récentes
GET /news/stats                 // Statistiques
```

## 📰 NewsPage.vue - Consultation des Actualités

### 🎯 Rôle principal

Page dédiée à la **lecture et consultation** de toutes les actualités avec filtres et recherche.

### 🔍 Système de filtres

```javascript
// État des filtres
const filters = reactive({
  search: '',           // Recherche textuelle
  category: '',         // Catégorie d'actualité
  university_id: '',    // Filtrer par université
  date_from: '',        // Date de début
  date_to: '',          // Date de fin
  status: 'approved'    // Statut (pour les modérateurs)
})

// Application des filtres
const loadNews = async () => {
  try {
    const response = await newsService.getNews({
      ...filters,
      page: currentPage.value,
      limit: 20
    })
    
    articles.value = response.data.articles
    totalPages.value = Math.ceil(response.data.total / 20)
  } catch (error) {
    showError('Erreur lors du chargement des actualités')
  }
}
```

### 🎨 Interface avec filtres

```vue
<template>
  <div class="news-page">
    <!-- Barre de recherche et filtres -->
    <div class="filters-section">
      <input 
        v-model="filters.search" 
        @input="debounceSearch"
        placeholder="Rechercher des actualités..." 
      />
      
      <select v-model="filters.category" @change="loadNews">
        <option value="">Toutes les catégories</option>
        <option value="académique">Académique</option>
        <option value="événement">Événement</option>
        <option value="sports">Sports</option>
      </select>
      
      <select v-model="filters.university_id" @change="loadNews">
        <option value="">Toutes les universités</option>
        <option v-for="uni in universities" :key="uni.id" :value="uni.id">
          {{ uni.name }}
        </option>
      </select>
    </div>
    
    <!-- Liste des actualités -->
    <div class="news-grid">
      <article v-for="article in articles" :key="article.id" class="news-card">
        <img :src="article.image_url" :alt="article.title" />
        <div class="news-content">
          <h3>{{ article.title }}</h3>
          <p>{{ article.excerpt }}</p>
          <div class="news-meta">
            <span class="author">{{ article.author.name }}</span>
            <span class="date">{{ formatDate(article.created_at) }}</span>
            <span class="category">{{ article.category }}</span>
          </div>
          <div class="news-actions">
            <button @click="openArticle(article)">Lire la suite</button>
            <button v-if="canModerate" @click="moderateArticle(article)">
              Modérer
            </button>
          </div>
        </div>
      </article>
    </div>
    
    <!-- Pagination -->
    <div class="pagination">
      <button 
        v-for="page in totalPages" 
        :key="page"
        @click="goToPage(page)"
        :class="{ active: page === currentPage }"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>
```

### 🔍 Recherche intelligente

```javascript
// Debounce pour éviter trop de requêtes
import { debounce } from 'lodash-es'

const debounceSearch = debounce(() => {
  loadNews()
}, 300)

// Sauvegarde des filtres
watch(filters, () => {
  localStorage.setItem('news_filters', JSON.stringify(filters))
})

// Restauration des filtres
onMounted(() => {
  const savedFilters = localStorage.getItem('news_filters')
  if (savedFilters) {
    Object.assign(filters, JSON.parse(savedFilters))
  }
  loadNews()
})
```

## ✍️ PublishPage.vue - Publication d'Articles

### 🎯 Rôle principal

Interface de **création et modification** d'articles avec éditeur riche et gestion des brouillons.

### 📝 Formulaire de publication

```javascript
// État de l'article
const article = reactive({
  title: '',
  content: '',
  excerpt: '',
  category: '',
  tags: [],
  image_url: '',
  featured: false,
  scheduled_at: null
})

// Gestion des brouillons
const saveDraft = async () => {
  try {
    const draftData = {
      ...article,
      id: Date.now(),
      status: 'draft',
      saved_at: new Date().toISOString()
    }
    
    // Sauvegarder localement
    const drafts = JSON.parse(localStorage.getItem('news_drafts') || '[]')
    drafts.push(draftData)
    localStorage.setItem('news_drafts', JSON.stringify(drafts))
    
    showSuccess('Brouillon sauvegardé')
  } catch (error) {
    showError('Erreur lors de la sauvegarde')
  }
}

// Publication de l'article
const publishArticle = async () => {
  try {
    const response = await newsService.createNews({
      ...article,
      status: determineStatus() // Auto-approuvé pour ADMIN/MODERATOR
    })
    
    if (response.status === 'success') {
      showSuccess('Article publié avec succès')
      resetForm()
    }
  } catch (error) {
    showError('Erreur lors de la publication')
  }
}

// Déterminer le statut selon le rôle
const determineStatus = () => {
  if (currentUser.value.role === 'ADMIN' || currentUser.value.role === 'MODERATOR') {
    return 'approved'
  }
  return 'pending' // PUBLIANT doit attendre la modération
}
```

### 🎨 Interface d'édition

```vue
<template>
  <div class="publish-page">
    <h1>✍️ Nouvelle actualité</h1>
    
    <form @submit.prevent="publishArticle" class="publish-form">
      <!-- Titre -->
      <div class="form-group">
        <label>Titre de l'actualité</label>
        <input 
          v-model="article.title" 
          type="text" 
          placeholder="Un titre accrocheur..."
          required 
        />
      </div>
      
      <!-- Résumé -->
      <div class="form-group">
        <label>Résumé</label>
        <textarea 
          v-model="article.excerpt" 
          placeholder="Résumé en quelques lignes..."
          rows="3"
        ></textarea>
      </div>
      
      <!-- Catégorie -->
      <div class="form-group">
        <label>Catégorie</label>
        <select v-model="article.category" required>
          <option value="">Choisir une catégorie</option>
          <option value="académique">Académique</option>
          <option value="événement">Événement</option>
          <option value="sports">Sports</option>
          <option value="culture">Culture</option>
        </select>
      </div>
      
      <!-- Upload d'image -->
      <div class="form-group">
        <label>Image principale</label>
        <input 
          type="file" 
          @change="handleImageUpload"
          accept="image/*"
        />
        <img v-if="article.image_url" :src="article.image_url" class="preview" />
      </div>
      
      <!-- Éditeur de contenu -->
      <div class="form-group">
        <label>Contenu de l'article</label>
        <div class="editor-toolbar">
          <button type="button" @click="formatText('bold')">B</button>
          <button type="button" @click="formatText('italic')">I</button>
          <button type="button" @click="insertList">Liste</button>
        </div>
        <textarea 
          v-model="article.content" 
          class="content-editor"
          placeholder="Rédigez votre article ici..."
          rows="15"
          required
        ></textarea>
      </div>
      
      <!-- Options avancées -->
      <div class="form-group">
        <label>
          <input v-model="article.featured" type="checkbox" />
          Mettre en vedette
        </label>
      </div>
      
      <!-- Actions -->
      <div class="form-actions">
        <button type="button" @click="saveDraft" class="secondary">
          💾 Sauvegarder en brouillon
        </button>
        <button type="submit" class="primary" :disabled="isLoading">
          {{ isLoading ? 'Publication...' : '🚀 Publier' }}
        </button>
      </div>
    </form>
    
    <!-- Liste des brouillons -->
    <div v-if="drafts.length > 0" class="drafts-section">
      <h3>📋 Brouillons sauvegardés</h3>
      <div v-for="draft in drafts" :key="draft.id" class="draft-item">
        <h4>{{ draft.title }}</h4>
        <span>{{ formatDate(draft.saved_at) }}</span>
        <button @click="loadDraft(draft)">Reprendre</button>
        <button @click="deleteDraft(draft.id)">Supprimer</button>
      </div>
    </div>
  </div>
</template>
```

## 🌐 APIs utilisées par les pages

### 📡 Endpoints principaux

```javascript
// HomePage
GET /news/featured           // Actualités en vedette
GET /news/recent            // Actualités récentes  
GET /news/stats             // Statistiques

// NewsPage
GET /news                   // Liste avec filtres et pagination
GET /news/categories        // Catégories disponibles
GET /universities           // Pour le filtre université

// PublishPage
POST /news                  // Créer un nouvel article
POST /media/upload          // Upload d'images
GET /news/drafts            // Récupérer les brouillons (si API)
```

## 🔄 Navigation entre les pages

### 📊 Gestion dans App.vue

```javascript
// Navigation par onglets
const handleTabChange = (tab) => {
  // Vérification des permissions
  if (tab === 'publier' && !canCreateNews.value) {
    alert('Vous n\'avez pas les permissions pour publier.')
    return
  }
  
  if (tab === 'moderation' && !canModerate.value) {
    alert('Accès réservé aux modérateurs.')
    return
  }
  
  // Changement d'onglet
  activeTab.value = tab
}

// Affichage conditionnel
<HomePage v-if="activeTab === 'accueil'" />
<NewsPage v-else-if="activeTab === 'news'" />
<PublishPage v-else-if="activeTab === 'publier'" />
```

## 🎯 Interactions entre les pages

### 🔗 Communication via événements

```javascript
// PublishPage émet après publication
window.dispatchEvent(new CustomEvent('news:created', {
  detail: { article: newArticle }
}))

// HomePage écoute et met à jour
window.addEventListener('news:created', (event) => {
  // Recharger les actualités récentes
  loadRecentNews()
})

// NewsPage écoute et ajoute à la liste
window.addEventListener('news:created', (event) => {
  articles.value.unshift(event.detail.article)
})
```

## 🐛 Gestion d'erreurs communes

### ❌ Problèmes fréquents

1. **Chargement lent** : Pagination et lazy loading
2. **Images manquantes** : Placeholder par défaut
3. **Permissions insuffisantes** : Vérification avant affichage
4. **Erreurs réseau** : Retry automatique et fallback

### ✅ Solutions implémentées

```javascript
// Retry automatique
const loadWithRetry = async (apiCall, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}

// Placeholder pour images
const handleImageError = (event) => {
  event.target.src = '/placeholder-image.jpg'
}

// États de chargement
const isLoading = ref(false)
const error = ref(null)
const data = ref([])
```

---

> 💡 **Navigation** : Utilisez les DevTools Vue pour inspecter l'état des composants et voir les données chargées en temps réel.