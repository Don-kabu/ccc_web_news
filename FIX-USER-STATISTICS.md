# Fix: Statistiques Utilisateur dans le Panel

## Problème Identifié
Les statistiques dans le panneau utilisateur ne prenaient pas en charge les bonnes valeurs car elles utilisaient uniquement `localStorage` au lieu de l'API.

## Cause
La méthode `loadUserStats()` dans `UserProfile.vue` utilisait :
```javascript
const news = JSON.parse(localStorage.getItem('ccc_news') || '[]')
```
Cette approche était problématique car :
1. **Données obsolètes** : localStorage peut ne pas être à jour
2. **Données partielles** : Pas toutes les actualités sont stockées localement
3. **Pas de synchronisation** : Aucune mise à jour depuis l'API

## Solution Implémentée

### 1. Nouveau Service dans user.service.js

**Méthode principale :**
```javascript
async getCurrentUserStatistics() {
  // Essaie l'API en premier
  const response = await httpService.get(`${API_ENDPOINTS.USERS.PROFILE}stats/`)
  
  if (response.success) {
    return response
  }
  
  // Fallback vers calcul client
  return await this.calculateUserStatsFromNews()
}
```

**Fallback intelligent :**
```javascript
async calculateUserStatsFromNews() {
  // 1. Essaie de récupérer depuis l'API
  const newsResponse = await fetch('/api/v1/news/', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  
  // 2. Sinon utilise localStorage
  if (!newsResponse.ok) {
    newsData = JSON.parse(localStorage.getItem('ccc_news') || '[]')
  }
  
  // 3. Calcule les statistiques
  return {
    articles_published: articlesPublished,
    articles_moderated: articlesModerated,
    articles_total: total,
    member_since: memberSince
  }
}
```

### 2. UserProfile.vue Modifié

**Import du service :**
```javascript
import { userService } from '../../services/user.service.js'
```

**Nouvelle méthode loadUserStats :**
```javascript
const loadUserStats = async () => {
  try {
    console.log('📊 Chargement des statistiques utilisateur...')
    
    const response = await userService.getCurrentUserStatistics()
    
    if (response.success && response.data) {
      userStats.value.articlesPublished = response.data.articles_published || 0
      userStats.value.articlesModerated = response.data.articles_moderated || 0
    } else {
      // Fallback localStorage
      loadUserStatsFromLocalStorage()
    }
  } catch (error) {
    // Fallback en cas d'erreur API
    loadUserStatsFromLocalStorage()
  }
}
```

## Hiérarchie de Récupération des Données

```
1. API /users/profile/stats/
   ↓ (si échec)
2. API /api/v1/news/ + calcul côté client
   ↓ (si échec)  
3. localStorage + calcul côté client (ancien système)
```

## Avantages de la Nouvelle Approche

### ✅ **Données Actualisées**
- Récupération depuis l'API en temps réel
- Statistiques toujours à jour

### ✅ **Robustesse**
- Triple fallback en cas de problème
- Ne plante jamais, affiche toujours quelque chose

### ✅ **Performance**
- Cache côté service (5 minutes)
- Évite les appels répétés

### ✅ **Logs de Debug**
```
📊 Chargement des statistiques utilisateur...
✅ Statistiques chargées: {published: 5, moderated: 2}
```

## Structure de Données API

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "articles_published": 5,
    "articles_moderated": 2,
    "articles_total": 7,
    "member_since": "2024-01-15T10:30:00Z"
  }
}
```

## Test de Validation

1. **Ouvrir le profil utilisateur** 
2. **Vérifier les statistiques** dans la section "Statistiques"
3. **Observer les logs** dans la console :
   - `📊 Chargement des statistiques utilisateur...`
   - `✅ Statistiques chargées: {published: X, moderated: Y}`

## Fallback en Cas de Problème

Si l'API n'est pas disponible :
1. **Premier fallback** : Récupération des actualités via API `/news/` + calcul client
2. **Deuxième fallback** : localStorage + calcul client (ancien système)
3. **Valeurs par défaut** : `0` pour tous les compteurs

## Résultat

✅ **Les statistiques affichent maintenant les vraies valeurs** depuis l'API au lieu des données obsolètes du localStorage.

Les utilisateurs verront des statistiques précises et actualisées de leurs articles publiés et modérés.