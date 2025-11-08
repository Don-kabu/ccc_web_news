# 📚 Documentation CCC Web News

> Guide complet pour développeurs - Application de gestion d'actualités universitaires

## 🎯 Vue d'ensemble du projet

**CCC Web News** est une application web moderne développée avec **Vue.js 3** pour la gestion et publication d'actualités dans un environnement universitaire.

### 🏗️ Architecture technique
- **Frontend** : Vue.js 3 avec Composition API
- **Build** : Vite (développement rapide)
- **Backend** : API REST à `http://127.0.0.1:8000/api`
- **Authentification** : JWT avec gestion de rôles
- **État** : Gestion réactive avec Pinia/Composables

### 👥 Système de rôles
- **🎓 STUDENT** : Lecture des actualités
- **✍️ PUBLIANT** : Création d'articles (modération requise)
- **🛡️ MODERATOR** : Modération + création
- **👑 ADMIN** : Administration complète

## 📖 Navigation de la documentation

### 🚀 Guides par composants principaux

| 📄 Guide | 🎯 Description | 👥 Pour qui |
|----------|----------------|--------------|
| **[01 - App Principal](./01-APP-PRINCIPAL.md)** | Composant racine et orchestration | Débutants |
| **[02 - Authentification](./02-AUTHENTIFICATION.md)** | Connexion, inscription, sécurité | Débutants |
| **[03 - Pages Principales](./03-PAGES-PRINCIPALES.md)** | HomePage, NewsPage, PublishPage | Débutants |

### 🔧 Guides par systèmes avancés

| 📄 Guide | 🎯 Description | 👥 Pour qui |
|----------|----------------|--------------|
| **[04 - Gestion Actualités](./04-GESTION-ACTUALITES.md)** | Cycle de vie des articles, PublishPage, ModerationPage | Intermédiaire |
| **[05 - Administration](./05-ADMINISTRATION.md)** | AdminPage, gestion utilisateurs et système | Avancé |
| **[06 - Services API](./06-SERVICES-API.md)** | Architecture API complète et tous les services | Technique |

### 🛡️ Guides sécurité et fonctionnalités

| 📄 Guide | 🎯 Description | 👥 Pour qui |
|----------|----------------|--------------|
| **[07 - Système Permissions](./07-SYSTEME-PERMISSIONS.md)** | Rôles, autorisations, usePermissions | Technique |
| **[08 - Notifications](./08-NOTIFICATIONS.md)** | Communication temps réel, WebSocket, alerts | Intermédiaire |

## 🎓 Parcours d'apprentissage recommandé

### 📚 Pour les nouveaux développeurs
```
1. 📖 Lire ce README pour comprendre l'architecture
2. 🏠 01-APP-PRINCIPAL.md → Comprendre le composant racine
3. 🔐 02-AUTHENTIFICATION.md → Système de connexion
4. 📰 03-PAGES-PRINCIPALES.md → Navigation et interfaces
5. 🔧 06-SERVICES-API.md → Communication avec le backend
```

### 🛠️ Pour les développeurs expérimentés
```
1. 📖 Ce README → Vue d'ensemble rapide
2. 🔧 06-SERVICES-API.md → Architecture des services
3. 🛡️ 07-SYSTEME-PERMISSIONS.md → Sécurité et autorisations
4. 👑 05-ADMINISTRATION.md → Fonctionnalités avancées
5. 🔔 08-NOTIFICATIONS.md → Communication temps réel
```

### 🎯 Pour des fonctionnalités spécifiques
- **Ajout de nouveaux rôles** → `07-SYSTEME-PERMISSIONS.md`
- **Nouvelles pages** → `03-PAGES-PRINCIPALES.md`
- **API endpoints** → `06-SERVICES-API.md`
- **Système de modération** → `04-GESTION-ACTUALITES.md`
- **Interface d'administration** → `05-ADMINISTRATION.md`
- **Système de notifications** → `08-NOTIFICATIONS.md`

## 🗂️ Structure du projet

```
ccc_web_news/
├── src/
│   ├── components/          # Composants Vue
│   │   ├── LoginForm.vue
│   │   ├── RegisterForm.vue
│   │   ├── HomePage.vue
│   │   ├── NewsPage.vue
│   │   ├── PublishPage.vue
│   │   ├── ModerationPage.vue
│   │   ├── AdminPage.vue
│   │   └── NotificationPanel.vue
│   ├── services/           # Services API
│   │   ├── http.service.js
│   │   ├── auth.service.js
│   │   ├── news.service.js
│   │   ├── user.service.js
│   │   ├── university.service.js
│   │   ├── moderation.service.js
│   │   ├── notification.service.js
│   │   └── admin.service.js
│   ├── composables/        # Logique réutilisable
│   │   ├── useAuth.js
│   │   ├── usePermissions.js
│   │   └── useNotifications.js
│   ├── config/
│   │   └── api.config.js   # Configuration API
│   ├── App.vue             # Composant principal
│   └── main.js            # Point d'entrée
├── docs/                   # Cette documentation complète
│   ├── README.md          # Ce guide principal
│   ├── 01-APP-PRINCIPAL.md
│   ├── 02-AUTHENTIFICATION.md
│   ├── 03-PAGES-PRINCIPALES.md
│   ├── 04-GESTION-ACTUALITES.md
│   ├── 05-ADMINISTRATION.md
│   ├── 06-SERVICES-API.md
│   ├── 07-SYSTEME-PERMISSIONS.md
│   └── 08-NOTIFICATIONS.md
└── README.md              # Guide principal du projet
```

## 🐛 Debugging et développement

### 🔍 Outils de debug disponibles

```javascript
// Dans la console du navigateur
window.__DEBUG_AUTH__        // État authentification
window.__DEBUG_PERMISSIONS__ // Système de permissions
window.__DEBUG_NOTIFICATIONS__ // Notifications et WebSocket
```

### 🚨 Problèmes courants

| ❌ Problème | ✅ Solution | 📄 Guide |
|-------------|-------------|----------|
| API non accessible | Vérifier `src/config/api.config.js` | 06-SERVICES-API |
| Permissions incorrectes | Vérifier rôle utilisateur | 07-SYSTEME-PERMISSIONS |
| Notifications non reçues | WebSocket déconnecté | 08-NOTIFICATIONS |
| Articles non visibles | Statut de modération | 04-GESTION-ACTUALITES |
| Interface admin bloquée | Vérifications de permissions | 05-ADMINISTRATION |

### 🔧 Commandes de développement

```bash
# Démarrer le serveur de développement
npm run dev

# Build de production
npm run build

# Tests
npm run test

# Linting
npm run lint
```

## 🎯 Concepts clés à maîtriser

### 🧩 Vue.js 3 Composition API
- `ref()` et `reactive()` pour la réactivité
- `computed()` pour les propriétés calculées
- `watch()` pour observer les changements
- `onMounted()` pour l'initialisation

### 🔌 Services API
- **httpService** : Couche HTTP avec intercepteurs
- **authService** : Gestion authentification/JWT
- **newsService** : CRUD articles
- **userService** : Gestion utilisateurs
- **moderationService** : Workflow de modération
- **notificationService** : Communication temps réel
- **adminService** : Fonctionnalités d'administration

### 🛡️ Sécurité
- **JWT tokens** avec refresh automatique
- **Permissions basées sur les rôles**
- **Validation côté client ET serveur**
- **Protection CSRF**
- **Audit trail** pour actions critiques

### 🔔 Communication
- **WebSocket** pour notifications temps réel
- **Système d'alertes** multi-niveaux
- **Notifications push** (desktop/mobile)
- **Emails automatiques** selon les événements

## 💡 Conseils pour les développeurs

### ✅ Bonnes pratiques
1. **Toujours valider côté serveur** les permissions
2. **Utiliser les composables** pour la logique réutilisable
3. **Gérer les erreurs** avec try/catch et notifications
4. **Tester les changements** avec différents rôles
5. **Documenter** les nouvelles fonctionnalités
6. **Suivre le flux de modération** pour les articles
7. **Respecter la hiérarchie des permissions**

### ⚠️ Pièges à éviter
1. **Sécurité côté client uniquement** - DANGER !
2. **Oublier la réactivité** Vue.js
3. **Hardcoder les URLs** d'API
4. **Négliger la gestion d'erreurs**
5. **Mélanger logique métier et affichage**
6. **Ignorer les notifications utilisateur**
7. **Court-circuiter le système de permissions**

## 🤝 Contribution

### 📝 Ajouter une nouvelle fonctionnalité
1. **Lire** le guide correspondant dans docs/
2. **Créer** le service API si nécessaire
3. **Implémenter** le composant Vue
4. **Ajouter** les permissions appropriées
5. **Intégrer** les notifications si pertinent
6. **Tester** avec différents rôles
7. **Documenter** les changements

### 🔄 Modifier un composant existant
1. **Comprendre** le rôle actuel (voir docs/)
2. **Identifier** les dépendances
3. **Modifier** en préservant l'API
4. **Vérifier** l'impact sur les permissions
5. **Tester** l'impact sur les autres composants
6. **Mettre à jour** la documentation

### 🛡️ Checklist sécurité
- [ ] Permissions vérifiées côté serveur
- [ ] Validation des données d'entrée
- [ ] Gestion appropriée des erreurs
- [ ] Audit des actions sensibles
- [ ] Tests avec tous les rôles utilisateur

---

## 📚 Guides Utilisateurs et Installation

### 👤 **Documentation Utilisateur**
- **[📖 Guide Utilisateur Complet](../GUIDE-UTILISATEUR-COMPLET.md)** - Manuel d'utilisation détaillé avec captures d'écran
- **[⚡ Installation Rapide](../INSTALLATION-RAPIDE.md)** - Démarrer en 5 minutes
- **[💻 Guide de Développement](../GUIDE-DEVELOPPEMENT.md)** - Conventions, tests, contribution

### 🖼️ **Captures d'Écran et Workflows**
- **[📋 Index de Documentation Complète](INDEX-DOCUMENTATION.md)** - Navigation visuelle avec captures d'écran
- Toutes les captures d'écran sont disponibles dans le dossier `photo/` avec des workflows visuels complets

---

> 🚀 **Prêt à développer ?** Commencez par le guide qui correspond à votre niveau et vos besoins ! Pour les utilisateurs finaux, consultez les [guides d'utilisation](../GUIDE-UTILISATEUR-COMPLET.md). Cette documentation complète couvre tous les aspects de l'application CCC Web News.