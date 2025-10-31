# API Endpoints - CCC Web News

Ce document définit tous les endpoints API nécessaires pour l'application CCC Web News.

## Base URL
```
https://api.cccwebnews.com/v1
```

## Authentification
Toutes les requêtes authentifiées doivent inclure le header :
```
Authorization: Bearer <jwt_token>
```

---

## 🔐 Authentication

### POST /auth/register/university
Créer une nouvelle université et un compte administrateur
```json
{
  "university": {
    "name": "Université de Paris",
    "type": "Université",
    "city": "Paris",
    "country": "France",
    "website": "https://u-paris.fr",
    "description": "Description de l'université"
  },
  "admin": {
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "admin@u-paris.fr",
    "password": "motdepasse123"
  }
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "university": { "id": "uuid", "name": "...", ... },
    "user": { "id": "uuid", "firstName": "...", "role": "ADMIN", ... },
    "token": "jwt_token"
  }
}
```

### POST /auth/register/user
Rejoindre une université existante
```json
{
  "firstName": "Marie",
  "lastName": "Martin",
  "email": "marie@u-paris.fr",
  "password": "motdepasse123",
  "phone": "+33612345678",
  "university_id": "uuid",
  "role": "STUDENT"
}
```

### POST /auth/login
Connexion utilisateur
```json
{
  "email": "user@u-paris.fr",
  "password": "motdepasse123",
  "rememberMe": true
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "Jean",
      "lastName": "Dupont",
      "email": "user@u-paris.fr",
      "role": "ADMIN",
      "university_id": "uuid",
      "university": {
        "id": "uuid",
        "name": "Université de Paris",
        "city": "Paris",
        "country": "France"
      },
      "last_login": "2025-10-31T10:00:00Z",
      "createdAt": "2025-01-15T09:00:00Z"
    },
    "token": "jwt_token"
  }
}
```

### POST /auth/refresh
Renouveler le token JWT
```json
{
  "refreshToken": "refresh_token"
}
```

### POST /auth/logout
Déconnexion
```json
{
  "token": "jwt_token"
}
```

### POST /auth/forgot-password
Mot de passe oublié
```json
{
  "email": "user@u-paris.fr"
}
```

### POST /auth/reset-password
Réinitialiser mot de passe
```json
{
  "token": "reset_token",
  "newPassword": "nouveaumotdepasse123"
}
```

---

## 👤 Users

### GET /users/profile
Obtenir le profil de l'utilisateur courant
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "user@u-paris.fr",
    "phone": "+33612345678",
    "role": "ADMIN",
    "university": { ... },
    "last_login": "2025-10-31T10:00:00Z",
    "createdAt": "2025-01-15T09:00:00Z",
    "lastPasswordChange": "2025-09-15T14:30:00Z"
  }
}
```

### PUT /users/profile
Mettre à jour le profil utilisateur
```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "newemail@u-paris.fr",
  "phone": "+33612345678"
}
```

### PUT /users/password
Changer le mot de passe
```json
{
  "currentPassword": "ancienMotDePasse",
  "newPassword": "nouveauMotDePasse123"
}
```

### GET /users/stats
Statistiques de l'utilisateur courant
**Response:**
```json
{
  "success": true,
  "data": {
    "articlesPublished": 15,
    "articlesModerated": 42,
    "totalViews": 1250,
    "membershipDays": 289
  }
}
```

### GET /users
Lister les utilisateurs (ADMIN uniquement)
**Query params:** `page`, `limit`, `search`, `role`, `university_id`

### PUT /users/:id/role
Modifier le rôle d'un utilisateur (ADMIN uniquement)
```json
{
  "role": "MODERATOR"
}
```

### DELETE /users/:id
Supprimer un utilisateur (ADMIN uniquement)

---

## 🏛️ Universities

### GET /universities
Lister toutes les universités
**Query params:** `page`, `limit`, `search`, `country`, `type`

### GET /universities/:id
Détails d'une université
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Université de Paris",
    "type": "Université",
    "city": "Paris",
    "country": "France",
    "website": "https://u-paris.fr",
    "description": "...",
    "createdAt": "2025-01-15T09:00:00Z",
    "stats": {
      "totalUsers": 1250,
      "totalNews": 89,
      "activeUsers": 340
    }
  }
}
```

### PUT /universities/:id
Mettre à jour une université (ADMIN de l'université)
```json
{
  "name": "Nouveau nom",
  "type": "Université",
  "city": "Paris",
  "country": "France",
  "website": "https://new-website.fr",
  "description": "Nouvelle description"
}
```

---

## 📰 News

### GET /news
Lister les actualités
**Query params:** 
- `page` (default: 1)
- `limit` (default: 20)
- `status` (draft, pending, approved, rejected)
- `importance` (urgente, importante, moyenne, faible)
- `author_id`
- `university_id`
- `search`
- `category`
- `dateFrom`, `dateTo`

**Response:**
```json
{
  "success": true,
  "data": {
    "news": [
      {
        "id": "uuid",
        "title": "Nouvelle importante",
        "excerpt": "Résumé de l'actualité...",
        "content": "Contenu complet...",
        "importance": "importante",
        "category": "Académique",
        "status": "approved",
        "author": {
          "id": "uuid",
          "firstName": "Jean",
          "lastName": "Dupont"
        },
        "university": {
          "id": "uuid",
          "name": "Université de Paris"
        },
        "publishedAt": "2025-10-31T10:00:00Z",
        "createdAt": "2025-10-30T15:30:00Z",
        "views": 1250,
        "tags": ["important", "examens"]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### GET /news/:id
Détails d'une actualité
**Response:** Même structure qu'un élément de la liste + `content` complet

### POST /news
Créer une nouvelle actualité
```json
{
  "title": "Titre de l'actualité",
  "excerpt": "Résumé court...",
  "content": "Contenu complet en HTML...",
  "importance": "importante",
  "category": "Académique",
  "tags": ["examens", "important"],
  "publishNow": false,
  "scheduledAt": "2025-11-01T09:00:00Z"
}
```

### PUT /news/:id
Modifier une actualité (auteur ou ADMIN/MODERATOR)
```json
{
  "title": "Nouveau titre",
  "excerpt": "Nouveau résumé...",
  "content": "Nouveau contenu...",
  "importance": "urgente",
  "category": "Urgences",
  "tags": ["urgent", "fermeture"]
}
```

### PUT /news/:id/status
Modifier le statut d'une actualité (MODERATOR/ADMIN)
```json
{
  "status": "approved",
  "moderatorComment": "Actualité validée après vérification"
}
```

### DELETE /news/:id
Supprimer une actualité (auteur ou ADMIN)

### POST /news/:id/view
Enregistrer une vue (analytics)

---

## 🔔 Notifications

### GET /notifications
Lister les notifications de l'utilisateur
**Query params:** `page`, `limit`, `read`, `type`
**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "title": "🚨 URGENT: Fermeture exceptionnelle",
        "content": "L'université sera fermée demain...",
        "type": "urgent",
        "importance": "urgente",
        "read": false,
        "article_id": "uuid",
        "sent_at": "2025-10-31T08:00:00Z"
      }
    ],
    "unreadCount": 5,
    "pagination": { ... }
  }
}
```

### PUT /notifications/:id/read
Marquer une notification comme lue

### PUT /notifications/read-all
Marquer toutes les notifications comme lues

### GET /notifications/settings
Obtenir les paramètres de notification
**Response:**
```json
{
  "success": true,
  "data": {
    "frequency": "daily",
    "importance": {
      "urgente": true,
      "importante": true,
      "moyenne": true,
      "faible": false
    },
    "channels": {
      "web": true,
      "email": true,
      "mobile": false
    },
    "dailyTime": "09:00",
    "weeklyDay": 1,
    "weeklyTime": "09:00"
  }
}
```

### PUT /notifications/settings
Mettre à jour les paramètres de notification
```json
{
  "frequency": "immediate",
  "importance": {
    "urgente": true,
    "importante": true,
    "moyenne": false,
    "faible": false
  },
  "channels": {
    "web": true,
    "email": false,
    "mobile": true
  },
  "dailyTime": "08:00"
}
```

---

## 📊 Analytics & Statistics

### GET /analytics/news
Statistiques des actualités (MODERATOR/ADMIN)
**Query params:** `period` (day, week, month, year), `university_id`
**Response:**
```json
{
  "success": true,
  "data": {
    "totalNews": 89,
    "publishedNews": 76,
    "pendingNews": 8,
    "rejectedNews": 5,
    "totalViews": 15420,
    "averageViews": 203,
    "byImportance": {
      "urgente": 5,
      "importante": 25,
      "moyenne": 40,
      "faible": 6
    },
    "byCategory": {
      "Académique": 35,
      "Événements": 20,
      "Urgences": 5,
      "Informations": 16
    },
    "timeline": [
      {
        "date": "2025-10-31",
        "published": 3,
        "views": 450
      }
    ]
  }
}
```

### GET /analytics/users
Statistiques des utilisateurs (ADMIN)
**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "activeUsers": 840,
    "newUsers": 15,
    "byRole": {
      "STUDENT": 1180,
      "PUBLIANT": 45,
      "MODERATOR": 20,
      "ADMIN": 5
    },
    "loginStats": {
      "daily": 340,
      "weekly": 680,
      "monthly": 980
    }
  }
}
```

---

## 🔍 Search

### GET /search
Recherche globale
**Query params:** `q`, `type` (news, users, universities), `filters`
**Response:**
```json
{
  "success": true,
  "data": {
    "results": {
      "news": [
        {
          "id": "uuid",
          "title": "Résultat 1",
          "excerpt": "...",
          "type": "news",
          "relevance": 0.95
        }
      ],
      "users": [...],
      "universities": [...]
    },
    "totalResults": 25,
    "searchTime": "0.15s"
  }
}
```

---

## 📁 File Upload

### POST /upload/image
Upload d'image pour les actualités
**Request:** FormData avec file
**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://cdn.cccwebnews.com/images/uuid.jpg",
    "filename": "image.jpg",
    "size": 245760,
    "mimeType": "image/jpeg"
  }
}
```

### DELETE /upload/:filename
Supprimer un fichier uploadé

---

## 📧 Email Services

### POST /email/send-notification
Envoyer une notification par email (système interne)
```json
{
  "to": "user@university.edu",
  "subject": "Nouvelle actualité importante",
  "template": "news_notification",
  "data": {
    "userName": "Jean Dupont",
    "newsTitle": "Titre de l'actualité",
    "newsExcerpt": "Résumé...",
    "newsUrl": "https://app.cccwebnews.com/news/uuid"
  }
}
```

---

## ⚠️ Error Responses

Toutes les erreurs suivent ce format :
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Message d'erreur lisible",
    "details": {
      "field": "email",
      "reason": "Format d'email invalide"
    },
    "timestamp": "2025-10-31T10:00:00Z"
  }
}
```

### Codes d'erreur courants :
- `VALIDATION_ERROR` (400) - Erreur de validation
- `UNAUTHORIZED` (401) - Non authentifié
- `FORBIDDEN` (403) - Pas les permissions
- `NOT_FOUND` (404) - Ressource non trouvée
- `CONFLICT` (409) - Conflit (email déjà utilisé, etc.)
- `RATE_LIMIT_EXCEEDED` (429) - Trop de requêtes
- `INTERNAL_ERROR` (500) - Erreur serveur

---

## 🔐 Security Headers

Tous les endpoints doivent retourner ces headers de sécurité :
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

---

## 📝 Notes d'implémentation

1. **Pagination** : Utiliser `page` et `limit` avec des valeurs par défaut (page=1, limit=20)
2. **Filtrage** : Supporter les opérateurs `eq`, `neq`, `like`, `in`, `gte`, `lte`
3. **Tri** : Paramètre `sort` avec format `field:direction` (ex: `createdAt:desc`)
4. **Rate Limiting** : 100 req/min par utilisateur, 1000 req/min par IP
5. **Validation** : Valider tous les inputs côté serveur
6. **Logs** : Logger toutes les actions sensibles (création, modification, suppression)
7. **Cache** : Mettre en cache les listes publiques (universités, actualités approuvées)
8. **Webhooks** : Support pour les notifications temps réel (WebSocket ou Server-Sent Events)

---

## 🚀 Environnements

### Development
```
Base URL: https://api-dev.cccwebnews.com/v1
Rate Limit: 1000 req/min
```

### Staging
```
Base URL: https://api-staging.cccwebnews.com/v1
Rate Limit: 500 req/min
```

### Production
```
Base URL: https://api.cccwebnews.com/v1
Rate Limit: 100 req/min
```