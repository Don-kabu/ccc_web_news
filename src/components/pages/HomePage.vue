<template>
  <div class="home-page">
    <!-- Section hero -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          Bienvenue à 
          <span class="gradient-text">{{ currentUser.university?.name || 'CCC Web News' }}</span>
        </h1>
        <p class="hero-subtitle">
          Restez informé des dernières actualités de votre université
        </p>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-number">{{ newsCount }}</span>
            <span class="stat-label">Articles</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ studentsCount }}</span>
            <span class="stat-label">Étudiants</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ teachersCount }}</span>
            <span class="stat-label">Publiants</span>
          </div>
        </div>
      </div>
      <div class="hero-visual">
        <div class="floating-cards">
          <div class="card card-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
              <path d="M14 2V8H20" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="card card-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              <path d="M12 1V3" stroke="currentColor" stroke-width="2"/>
              <path d="M12 21V23" stroke="currentColor" stroke-width="2"/>
              <path d="M4.22 4.22L5.64 5.64" stroke="currentColor" stroke-width="2"/>
              <path d="M18.36 18.36L19.78 19.78" stroke="currentColor" stroke-width="2"/>
              <path d="M1 12H3" stroke="currentColor" stroke-width="2"/>
              <path d="M21 12H23" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="card card-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
              <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.6988C21.7033 16.0434 20.9983 15.5827 20.2 15.3859" stroke="currentColor" stroke-width="2"/>
              <path d="M16 3.13C16.7983 3.32675 17.5033 3.78742 18.0094 4.44281C18.5155 5.09821 18.8 5.90856 18.8 6.744C18.8 7.57944 18.5155 8.38979 18.0094 9.04519C17.5033 9.70058 16.7983 10.1613 16 10.358" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
        </div>
      </div>
    </section>

    <!-- Dernières actualités -->
    <section class="recent-news">
      <div class="section-header">
        <h2>Dernières Actualités</h2>
        <button @click="$emit('tab-change', 'news')" class="view-all-btn">
          Voir tout
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 12H19" stroke="currentColor" stroke-width="2"/>
            <path d="M12 5L19 12L12 19" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
      
      <div class="news-grid" v-if="recentNews.length > 0">
        <article 
          v-for="article in recentNews" 
          :key="article.id" 
          class="news-card"
          @click="openArticle(article)"
        >
          <div class="card-header">
            <div class="author-info">
              <div class="author-avatar">
                {{ article.author.first_name.charAt(0) }}{{ article.author.last_name.charAt(0) }}
              </div>
              <div class="author-details">
                <span class="author-name">{{ article.author.first_name }} {{ article.author.last_name }}</span>
                <span class="publish-date">{{ formatDate(article.created_at) }}</span>
              </div>
            </div>
            <div class="article-category">
              {{ article.category }}
            </div>
          </div>
          
          <h3 class="article-title">{{ article.title }}</h3>
          <p class="article-excerpt">{{ article.content.substring(0, 150) }}...</p>
          
          <div class="card-footer">
            <div class="article-tags" v-if="article.tags">
              <span v-for="tag in article.tags.slice(0, 2)" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>
            <button class="read-more">
              Lire la suite
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M7 17L17 7" stroke="currentColor" stroke-width="2"/>
                <path d="M7 7H17V17" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
        </article>
      </div>
      
      <div v-else class="no-news">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="1.5"/>
          <path d="M14 2V8H20" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        <h3>Aucune actualité pour le moment</h3>
        <p>Soyez le premier à publier une actualité !</p>
        <button @click="$emit('tab-change', 'publier')" class="publish-btn">
          Publier un article
        </button>
      </div>
    </section>

    <!-- Actions rapides -->
    <section class="quick-actions">
      <h2>Actions Rapides</h2>
      <div class="actions-grid">
        <button @click="$emit('tab-change', 'publier')" class="action-card">
          <div class="action-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19" stroke="currentColor" stroke-width="2"/>
              <path d="M5 12L19 12" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <h3>Publier un Article</h3>
          <p>Partagez vos actualités avec la communauté</p>
        </button>
        
        <button @click="$emit('tab-change', 'news')" class="action-card">
          <div class="action-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
              <path d="M14 2V8H20" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <h3>Parcourir les News</h3>
          <p>Découvrez toutes les actualités</p>
        </button>
        
        <button @click="$emit('profile-click')" class="action-card">
          <div class="action-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <h3>Mon Profil</h3>
          <p>Gérez vos informations personnelles</p>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  currentUser: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['tab-change', 'profile-click'])

const recentNews = ref([])
const newsCount = ref(0)
const studentsCount = ref(0)
const teachersCount = ref(0)

onMounted(() => {
  loadRecentNews()
  loadStats()
})

const loadRecentNews = () => {
  const savedNews = JSON.parse(localStorage.getItem('ccc_news') || '[]')
  recentNews.value = savedNews.slice(0, 3)
  newsCount.value = savedNews.length
}

const loadStats = () => {
  const users = JSON.parse(localStorage.getItem('ccc_users') || '[]')
  studentsCount.value = users.filter(u => u.role === 'STUDENT').length
  teachersCount.value = users.filter(u => u.role === 'PUBLIANT').length
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const openArticle = (article) => {
  console.log('Ouvrir l\'article:', article.title)
}
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.hero-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
  padding: 3rem 0;
  margin-bottom: 4rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 1rem;
  line-height: 1.1;
}

.gradient-text {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-weight: 500;
}

.hero-visual {
  position: relative;
  height: 400px;
}

.floating-cards {
  position: relative;
  height: 100%;
}

.card {
  position: absolute;
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: float 6s ease-in-out infinite;
}

.card-1 {
  top: 20%;
  right: 20%;
  animation-delay: 0s;
  color: #6366f1;
}

.card-2 {
  top: 60%;
  right: 50%;
  animation-delay: -2s;
  color: #8b5cf6;
}

.card-3 {
  top: 40%;
  right: 10%;
  animation-delay: -4s;
  color: #ec4899;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.news-card {
  background: var(--background-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.news-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  border-color: rgba(99, 102, 241, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
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
  font-size: 0.75rem;
  font-weight: 600;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.publish-date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.article-category {
  padding: 0.25rem 0.75rem;
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
}

.article-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  line-height: 1.3;
}

.article-excerpt {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.article-tags {
  display: flex;
  gap: 0.5rem;
}

.tag {
  padding: 0.25rem 0.5rem;
  background: var(--background-primary);
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
}

.read-more {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #6366f1;
  background: none;
  border: none;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.no-news {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-muted);
}

.no-news svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-news h3 {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.publish-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  font-weight: 600;
  cursor: pointer;
}

.quick-actions {
  margin-top: 4rem;
}

.quick-actions h2 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: var(--background-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  border-color: rgba(99, 102, 241, 0.3);
}

.action-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
}

.action-card h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.action-card p {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

@media (max-width: 1200px) {
  .hero-section {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  
  .news-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .home-page {
    padding: 1rem;
  }
  
  .hero-section {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 2rem 0;
  }
  
  .hero-title {
    font-size: 2rem;
    line-height: 1.2;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .hero-stats {
    justify-content: center;
    gap: 1.5rem;
  }
  
  .stat-number {
    font-size: 1.8rem;
  }
  
  .floating-cards {
    transform: scale(0.8);
  }
  
  .news-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .action-card h3 {
    font-size: 1.1rem;
  }
  
  .action-card p {
    font-size: 0.875rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .home-page {
    padding: 0.75rem;
  }
  
  .hero-section {
    padding: 1.5rem 0;
    gap: 1.5rem;
  }
  
  .hero-title {
    font-size: 1.5rem;
  }
  
  .hero-subtitle {
    font-size: 0.9rem;
  }
  
  .hero-stats {
    gap: 1rem;
  }
  
  .stat-item {
    text-align: center;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .stat-label {
    font-size: 0.75rem;
  }
  
  .floating-cards {
    transform: scale(0.6);
  }
  
  .card {
    width: 60px;
    height: 60px;
  }
  
  .news-grid {
    gap: 0.75rem;
  }
  
  .news-card {
    padding: 1rem;
  }
  
  .news-card h3 {
    font-size: 1rem;
  }
  
  .news-card p {
    font-size: 0.8rem;
  }
  
  .action-card {
    padding: 1rem;
  }
  
  .action-card h3 {
    font-size: 1rem;
  }
  
  .action-card p {
    font-size: 0.8rem;
  }
  
  .section-title {
    font-size: 1.25rem;
  }
}

@media (max-width: 360px) {
  .home-page {
    padding: 0.5rem;
  }
  
  .hero-title {
    font-size: 1.25rem;
  }
  
  .hero-subtitle {
    font-size: 0.8rem;
  }
  
  .hero-stats {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .stat-number {
    font-size: 1.25rem;
  }
  
  .floating-cards {
    display: none;
  }
  
  .news-card {
    padding: 0.75rem;
  }
  
  .action-card {
    padding: 0.75rem;
  }
  
  .section-title {
    font-size: 1.1rem;
  }
}

/* Landscape orientation optimizations */
@media (max-height: 500px) and (orientation: landscape) {
  .hero-section {
    padding: 1rem 0;
    gap: 1.5rem;
  }
  
  .hero-visual {
    display: none;
  }
  
  .hero-stats {
    flex-direction: row;
    gap: 2rem;
  }
}
</style>