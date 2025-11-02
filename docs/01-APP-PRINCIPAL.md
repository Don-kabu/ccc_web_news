# 🏠 App.vue - Le Composant Principal

## 🎯 Qu'est-ce que c'est ?

`App.vue` est le **cerveau central** de votre application. C'est comme le **chef d'orchestre** qui coordonne tous les autres composants.

## 🏗️ Que fait App.vue ?

### 1. **Gestion de l'état global** 🌍
```javascript
const currentUser = ref(null)      // Qui est connecté ?
const currentView = ref('login')   // Quelle page afficher ?
const activeTab = ref('accueil')   // Quel onglet est actif ?
```

### 2. **Navigation entre les pages** 🧭
```javascript
// Décide quelle page afficher
if (!isAuthenticated) {
  // Montrer login/register
} else {
  // Montrer l'application principale
}
```

### 3. **Système de permissions** 🔒
```javascript
const canCreateNews = computed(() => {
  return currentUser.value && hasPermission('CREATE_NEWS')
})
```

## 🧩 Composants appelés par App.vue

### 📊 Structure hiérarchique

```
App.vue (racine)
├── 🔐 LoginForm.vue          // Si pas connecté
├── 📝 RegisterForm.vue       // Si inscription
└── 📱 Interface principale   // Si connecté
    ├── 🏠 HomePage.vue
    ├── 📰 NewsPage.vue
    ├── ✍️ PublishPage.vue
    ├── 🛡️ ModerationPage.vue
    ├── 👑 AdminPage.vue
    ├── 👤 UserProfile.vue
    ├── 🔔 NotificationPanel.vue
    └── ⚙️ NotificationSettings.vue
```

## 🔄 Cycle de vie de App.vue

### 1. **Démarrage** ⚡
```javascript
onMounted(async () => {
  // 1. Vérifier si l'utilisateur est déjà connecté
  const isAuthenticated = await authService.checkAuthStatus()
  
  // 2. Si oui, récupérer ses informations
  if (isAuthenticated) {
    currentUser.value = authService.getCurrentUser()
    currentView.value = 'app'
  }
  
  // 3. Initialiser les notifications
  notificationService.initializeUser(user.id)
})
```

### 2. **Connexion réussie** ✅
```javascript
const handleLoginSuccess = async (user) => {
  // 1. Sauvegarder l'utilisateur connecté
  currentUser.value = user
  
  // 2. Changer vers l'interface principale
  currentView.value = 'app'
  
  // 3. Initialiser les services
  notificationService.initializeUser(user.id)
}
```

### 3. **Déconnexion** 🚪
```javascript
const handleLogout = async () => {
  // 1. Appeler l'API de déconnexion
  await authService.logout()
  
  // 2. Nettoyer l'état local
  currentUser.value = null
  currentView.value = 'login'
}
```

## 🎨 Interface utilisateur

### 🔐 Mode non-connecté
```vue
<div v-if="!isAuthenticated" class="auth-container">
  <div class="auth-header">
    <h1>CCC Web News</h1>
    <p>Plateforme de gestion des actualités universitaires</p>
  </div>
  
  <!-- Navigation login/register -->
  <div class="auth-nav">
    <button @click="currentView = 'login'">Connexion</button>
    <button @click="currentView = 'register'">Inscription</button>
  </div>
  
  <!-- Formulaire correspondant -->
  <LoginForm v-if="currentView === 'login'" />
  <RegisterForm v-else />
</div>
```

### 📱 Mode connecté
```vue
<div v-else class="main-app">
  <!-- En-tête avec profil et notifications -->
  <header class="app-header">
    <div class="user-info">
      <span>{{ currentUser.firstname }} {{ currentUser.lastname }}</span>
      <span class="user-role">{{ currentUser.role }}</span>
    </div>
    
    <!-- Bouton notifications -->
    <button @click="showNotifications = !showNotifications">
      🔔 {{ unreadNotificationCount }}
    </button>
    
    <!-- Bouton déconnexion -->
    <button @click="handleLogout">Déconnexion</button>
  </header>
  
  <!-- Navigation par onglets -->
  <nav class="tab-navigation">
    <button @click="activeTab = 'accueil'">🏠 Accueil</button>
    <button @click="activeTab = 'news'">📰 Actualités</button>
    <button v-if="canCreateNews" @click="activeTab = 'publier'">✍️ Publier</button>
    <button v-if="canModerate" @click="activeTab = 'moderation'">🛡️ Modération</button>
    <button v-if="canManageUsers" @click="activeTab = 'admin'">👑 Admin</button>
  </nav>
  
  <!-- Contenu de l'onglet actif -->
  <main class="main-content">
    <HomePage v-if="activeTab === 'accueil'" />
    <NewsPage v-else-if="activeTab === 'news'" />
    <PublishPage v-else-if="activeTab === 'publier'" />
    <ModerationPage v-else-if="activeTab === 'moderation'" />
    <AdminPage v-else-if="activeTab === 'admin'" />
    <UserProfile v-else-if="activeTab === 'profil'" />
  </main>
</div>
```

## 🔧 Fonctionnalités importantes

### 1. **Gestion des permissions** 🔒
```javascript
// Calcul automatique des permissions
const canCreateNews = computed(() => {
  return currentUser.value && hasPermission(PERMISSIONS.CREATE_NEWS)
})

const canModerate = computed(() => {
  return currentUser.value && hasPermission(PERMISSIONS.MODERATE_NEWS)
})

// Utilisation dans le template
<button v-if="canCreateNews" @click="activeTab = 'publier'">
  ✍️ Publier
</button>
```

### 2. **Gestion des notifications** 🔔
```javascript
// Compteur automatique
const updateNotificationCount = () => {
  if (currentUser.value) {
    const count = notificationService.getUnreadCount(currentUser.value.id)
    unreadNotificationCount.value = count
  }
}

// Mise à jour périodique
setInterval(updateNotificationCount, 60000) // Chaque minute
```

### 3. **Navigation intelligente** 🧭
```javascript
const handleTabChange = (tab) => {
  // Vérifier les permissions avant de changer d'onglet
  if (tab === 'publier' && !canCreateNews.value) {
    alert('Vous n\'avez pas les permissions nécessaires.')
    return
  }
  
  if (tab === 'moderation' && !canModerate.value) {
    alert('Accès réservé aux modérateurs.')
    return
  }
  
  activeTab.value = tab
}
```

## 🌐 Intégration avec les services API

### 📞 Appels API principaux
```javascript
// Vérification de l'authentification
const isAuthenticated = await authService.checkAuthStatus()

// Récupération des données utilisateur
const user = authService.getCurrentUser()

// Enrichissement avec les données de l'université
if (user.university_id && !user.university) {
  const universityResponse = await universityService.getUniversityById(user.university_id)
  user.university = universityResponse.data
}
```

## 🐛 Points d'attention pour les développeurs

### ❌ Erreurs communes
1. **État non réactif** : Utiliser `ref()` ou `reactive()`
2. **Permissions mal vérifiées** : Toujours vérifier côté interface ET API
3. **Gestion d'erreurs manquante** : Entourer les appels API de try/catch

### ✅ Bonnes pratiques
1. **Centraliser l'état** : Utiliser App.vue pour l'état global
2. **Séparer les responsabilités** : Logique métier dans les services
3. **Gestion d'erreurs** : Afficher des messages clairs à l'utilisateur

## 🔗 Liens avec les autres composants

- **⬇️ Enfants directs** : LoginForm, RegisterForm, toutes les pages
- **🔧 Services utilisés** : authService, universityService, notificationService
- **🎣 Composables utilisés** : usePermissions
- **📡 APIs appelées** : /auth/me, /universities/:id

---

> 💡 **Pour débugger** : Ouvrez les DevTools Vue et regardez l'état de `currentUser`, `activeTab` et les permissions calculées.