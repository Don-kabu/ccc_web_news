# 🛡️ Système de Permissions et Rôles

## 🎯 Vue d'ensemble

Le système de permissions contrôle **qui peut faire quoi** dans l'application. Il est basé sur des **rôles utilisateur** avec des **permissions spécifiques**.

## 👥 Les 4 rôles utilisateur

### 👑 ADMIN - Super Administrateur
```javascript
const ADMIN_PERMISSIONS = [
  'CREATE_NEWS',      // ✍️ Créer des actualités
  'EDIT_NEWS',        // ✏️ Modifier toutes les actualités
  'DELETE_NEWS',      // 🗑️ Supprimer des actualités
  'MODERATE_NEWS',    // 🛡️ Modérer (approuver/rejeter)
  'MANAGE_USERS',     // 👤 Gérer les utilisateurs
  'MANAGE_UNIVERSITIES', // 🏫 Gérer les universités
  'VIEW_STATS',       // 📊 Voir les statistiques
  'SYSTEM_CONFIG'     // ⚙️ Configuration système
]
```

**Peut tout faire** : C'est le rôle le plus puissant, généralement pour le créateur d'une université.

### 🛡️ MODERATOR - Modérateur
```javascript
const MODERATOR_PERMISSIONS = [
  'CREATE_NEWS',      // ✍️ Créer des actualités
  'EDIT_NEWS',        // ✏️ Modifier ses actualités + celles de son université
  'MODERATE_NEWS',    // 🛡️ Modérer les actualités
  'VIEW_STATS'        // 📊 Voir les statistiques de modération
]
```

**Gère le contenu** : Responsable de la qualité des actualités publiées.

### ✍️ PUBLIANT - Rédacteur
```javascript
const PUBLIANT_PERMISSIONS = [
  'CREATE_NEWS',      // ✍️ Créer des actualités
  'EDIT_NEWS'         // ✏️ Modifier seulement ses propres actualités
]
```

**Crée du contenu** : Peut publier des actualités qui doivent être approuvées.

### 🎓 STUDENT - Étudiant
```javascript
const STUDENT_PERMISSIONS = [
  'READ_NEWS',        // 📖 Lire les actualités approuvées
  'RECEIVE_NOTIFICATIONS' // 🔔 Recevoir des notifications
]
```

**Consultation uniquement** : Peut lire les actualités mais pas en créer.

## 🎣 usePermissions.js - Le Composable

### 🎯 Rôle principal

C'est le **cerveau** du système de permissions. Il détermine ce qu'un utilisateur peut faire.

### 🔧 Code du composable

```javascript
// src/composables/usePermissions.js
import { computed } from 'vue'

// Définition des permissions disponibles
export const PERMISSIONS = {
  // Actualités
  CREATE_NEWS: 'CREATE_NEWS',
  EDIT_NEWS: 'EDIT_NEWS',
  DELETE_NEWS: 'DELETE_NEWS',
  MODERATE_NEWS: 'MODERATE_NEWS',
  
  // Utilisateurs
  MANAGE_USERS: 'MANAGE_USERS',
  VIEW_USERS: 'VIEW_USERS',
  
  // Universités
  MANAGE_UNIVERSITIES: 'MANAGE_UNIVERSITIES',
  
  // Système
  VIEW_STATS: 'VIEW_STATS',
  SYSTEM_CONFIG: 'SYSTEM_CONFIG'
}

// Permissions par rôle
const ROLE_PERMISSIONS = {
  ADMIN: [
    PERMISSIONS.CREATE_NEWS,
    PERMISSIONS.EDIT_NEWS,
    PERMISSIONS.DELETE_NEWS,
    PERMISSIONS.MODERATE_NEWS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_UNIVERSITIES,
    PERMISSIONS.VIEW_STATS,
    PERMISSIONS.SYSTEM_CONFIG
  ],
  
  MODERATOR: [
    PERMISSIONS.CREATE_NEWS,
    PERMISSIONS.EDIT_NEWS,
    PERMISSIONS.MODERATE_NEWS,
    PERMISSIONS.VIEW_STATS
  ],
  
  PUBLIANT: [
    PERMISSIONS.CREATE_NEWS,
    PERMISSIONS.EDIT_NEWS
  ],
  
  STUDENT: [
    PERMISSIONS.READ_NEWS,
    PERMISSIONS.RECEIVE_NOTIFICATIONS
  ]
}

// Le composable principal
export function usePermissions(currentUser) {
  // Vérifier si l'utilisateur a une permission spécifique
  const hasPermission = (permission) => {
    if (!currentUser.value) return false
    
    const userRole = currentUser.value.role
    const userPermissions = ROLE_PERMISSIONS[userRole] || []
    
    return userPermissions.includes(permission)
  }
  
  // Permissions calculées pour l'interface
  const canCreateNews = computed(() => hasPermission(PERMISSIONS.CREATE_NEWS))
  const canModerate = computed(() => hasPermission(PERMISSIONS.MODERATE_NEWS))
  const canManageUsers = computed(() => hasPermission(PERMISSIONS.MANAGE_USERS))
  const canViewStats = computed(() => hasPermission(PERMISSIONS.VIEW_STATS))
  
  // Vérifications spécifiques
  const canEditNews = (article) => {
    if (!currentUser.value) return false
    
    const userRole = currentUser.value.role
    
    // ADMIN peut tout modifier
    if (userRole === 'ADMIN') return true
    
    // MODERATOR peut modifier dans son université
    if (userRole === 'MODERATOR') {
      return article.university_id === currentUser.value.university_id
    }
    
    // PUBLIANT peut modifier seulement ses articles
    if (userRole === 'PUBLIANT') {
      return article.author_id === currentUser.value.id
    }
    
    return false
  }
  
  const canDeleteNews = (article) => {
    if (!currentUser.value) return false
    
    const userRole = currentUser.value.role
    
    // Seuls ADMIN et MODERATOR peuvent supprimer
    if (userRole === 'ADMIN') return true
    
    if (userRole === 'MODERATOR') {
      return article.university_id === currentUser.value.university_id
    }
    
    return false
  }
  
  return {
    hasPermission,
    canCreateNews,
    canModerate,
    canManageUsers,
    canViewStats,
    canEditNews,
    canDeleteNews
  }
}
```

## 🔧 Utilisation dans les composants

### 📱 Dans App.vue - Navigation

```javascript
<script setup>
import { usePermissions, PERMISSIONS } from '@/composables/usePermissions'

const currentUser = ref(null)
const { hasPermission, canCreateNews, canModerate, canManageUsers } = usePermissions(currentUser)

// Affichage conditionnel des onglets
</script>

<template>
  <nav class="tab-navigation">
    <button @click="activeTab = 'accueil'">🏠 Accueil</button>
    <button @click="activeTab = 'news'">📰 Actualités</button>
    
    <!-- Onglet Publier : PUBLIANT, MODERATOR, ADMIN -->
    <button v-if="canCreateNews" @click="activeTab = 'publier'">
      ✍️ Publier
    </button>
    
    <!-- Onglet Modération : MODERATOR, ADMIN -->
    <button v-if="canModerate" @click="activeTab = 'moderation'">
      🛡️ Modération
    </button>
    
    <!-- Onglet Admin : ADMIN seulement -->
    <button v-if="canManageUsers" @click="activeTab = 'admin'">
      👑 Administration
    </button>
  </nav>
</template>
```

### 📰 Dans NewsPage.vue - Actions sur articles

```javascript
<script setup>
import { usePermissions } from '@/composables/usePermissions'

const { canEditNews, canDeleteNews, canModerate } = usePermissions(currentUser)
</script>

<template>
  <div v-for="article in articles" :key="article.id" class="news-card">
    <h3>{{ article.title }}</h3>
    <p>{{ article.content }}</p>
    
    <div class="article-actions">
      <!-- Modifier : selon les règles complexes -->
      <button v-if="canEditNews(article)" @click="editArticle(article)">
        ✏️ Modifier
      </button>
      
      <!-- Supprimer : ADMIN + MODERATOR -->
      <button v-if="canDeleteNews(article)" @click="deleteArticle(article)">
        🗑️ Supprimer
      </button>
      
      <!-- Modérer : MODERATOR + ADMIN -->
      <button v-if="canModerate" @click="moderateArticle(article)">
        🛡️ Modérer
      </button>
    </div>
  </div>
</template>
```

### ✍️ Dans PublishPage.vue - Auto-approbation

```javascript
<script setup>
import { usePermissions, PERMISSIONS } from '@/composables/usePermissions'

const { hasPermission } = usePermissions(currentUser)

const publishArticle = async () => {
  try {
    // Déterminer le statut selon le rôle
    const status = determineArticleStatus()
    
    const response = await newsService.createNews({
      ...article,
      status: status
    })
    
    if (status === 'approved') {
      alert('Article publié immédiatement !')
    } else {
      alert('Article envoyé en modération.')
    }
  } catch (error) {
    console.error('Erreur publication:', error)
  }
}

// Logique de statut selon les permissions
const determineArticleStatus = () => {
  // ADMIN et MODERATOR : auto-approuvé
  if (hasPermission(PERMISSIONS.MODERATE_NEWS)) {
    return 'approved'
  }
  
  // PUBLIANT : doit passer par la modération
  return 'pending'
}
</script>
```

## 🛡️ Sécurité et vérifications

### ⚠️ Important : Double vérification

```javascript
// ❌ MAUVAIS : Seulement côté client
<button v-if="canDeleteNews" @click="deleteArticle">Supprimer</button>

// ✅ BON : Client + Serveur
<button v-if="canDeleteNews" @click="deleteArticle">Supprimer</button>

const deleteArticle = async (article) => {
  try {
    // Le backend DOIT aussi vérifier les permissions
    await newsService.deleteNews(article.id)
  } catch (error) {
    if (error.status === 403) {
      alert('Vous n\'avez pas les permissions pour cette action.')
    }
  }
}
```

### 🔒 Vérifications côté backend

Votre API doit **toujours vérifier** les permissions :

```python
# Exemple côté backend (pseudo-code)
def delete_news(user, article_id):
    article = get_article(article_id)
    
    # Vérifier les permissions
    if user.role == 'ADMIN':
        # ADMIN peut tout supprimer
        pass
    elif user.role == 'MODERATOR':
        # MODERATOR seulement dans son université
        if article.university_id != user.university_id:
            raise PermissionError("Accès refusé")
    else:
        # Autres rôles ne peuvent pas supprimer
        raise PermissionError("Accès refusé")
    
    # Supprimer l'article
    delete_article(article_id)
```

## 🎯 Cas d'usage spécifiques

### 🔄 Changement de rôle dynamique

```javascript
// Dans AdminPage.vue
const changeUserRole = async (userId, newRole) => {
  try {
    await userService.updateUser(userId, { role: newRole })
    
    // Si c'est l'utilisateur actuel, mettre à jour localement
    if (userId === currentUser.value.id) {
      currentUser.value.role = newRole
      
      // Les permissions seront automatiquement recalculées
      // grâce à la réactivité de Vue
    }
    
    alert('Rôle modifié avec succès')
  } catch (error) {
    alert('Erreur lors du changement de rôle')
  }
}
```

### 📊 Filtrage des actualités selon le rôle

```javascript
// Dans NewsPage.vue
const loadNews = async () => {
  const params = {
    page: currentPage.value,
    limit: 20
  }
  
  // Filtrer selon le rôle
  if (currentUser.value.role === 'STUDENT') {
    // Étudiants : seulement les actualités approuvées
    params.status = 'approved'
  } else if (currentUser.value.role === 'PUBLIANT') {
    // Publiants : approuvées + leurs propres brouillons
    params.author_id = currentUser.value.id
  } else if (hasPermission(PERMISSIONS.MODERATE_NEWS)) {
    // Modérateurs : toutes les actualités pour modération
    // Pas de filtre de statut
  }
  
  const response = await newsService.getNews(params)
  articles.value = response.data.articles
}
```

### 🔔 Notifications selon les permissions

```javascript
// Dans le service de notifications
const sendNotification = (type, data) => {
  // Notifications pour tous
  if (type === 'general_announcement') {
    notifyAllUsers(data)
  }
  
  // Notifications pour modérateurs
  if (type === 'article_pending') {
    const moderators = users.filter(user => 
      hasPermission(user, PERMISSIONS.MODERATE_NEWS)
    )
    notifyUsers(moderators, data)
  }
  
  // Notifications pour admins
  if (type === 'new_user_registered') {
    const admins = users.filter(user => user.role === 'ADMIN')
    notifyUsers(admins, data)
  }
}
```

## 🐛 Debugging des permissions

### 🔍 Console de debug

```javascript
// Ajouter dans usePermissions.js (mode dev)
if (import.meta.env.DEV) {
  window.__DEBUG_PERMISSIONS__ = {
    currentUser: currentUser.value,
    permissions: ROLE_PERMISSIONS[currentUser.value?.role] || [],
    checkPermission: hasPermission
  }
}

// Dans la console du navigateur
console.log('Utilisateur actuel:', window.__DEBUG_PERMISSIONS__.currentUser)
console.log('Permissions:', window.__DEBUG_PERMISSIONS__.permissions)
console.log('Peut créer news:', window.__DEBUG_PERMISSIONS__.checkPermission('CREATE_NEWS'))
```

### ⚠️ Erreurs communes

1. **Oubli de réactivité** : Utiliser `computed()` pour les permissions
2. **Vérification seulement côté client** : Toujours vérifier côté serveur
3. **Permissions hardcodées** : Utiliser le système centralisé
4. **Rôles non synchronisés** : Mettre à jour après changement de rôle

---

> 💡 **Sécurité** : Les permissions côté client sont pour l'UX. La vraie sécurité se fait côté serveur.