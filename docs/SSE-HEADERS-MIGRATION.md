# Migration SSE vers Headers d'Authentification

## Contexte

La route `/api/v1/notifications/stream/` a été modifiée pour utiliser l'authentification par headers au lieu de paramètres d'URL pour des raisons de sécurité.

## Changements Effectués

### ❌ Ancienne méthode (non sécurisée)
```javascript
// Le token était passé en paramètre URL - NON SÉCURISÉ
const sseUrl = `${baseUrl}/notifications/stream/?token=${token}`
const eventSource = new EventSource(sseUrl)
```

**Problèmes :**
- Token visible dans l'URL (logs serveur, historique navigateur)
- EventSource ne supporte pas les headers personnalisés
- Risque de fuite du token d'authentification

### ✅ Nouvelle méthode (sécurisée)
```javascript
// Token passé dans les headers - SÉCURISÉ
const response = await fetch('/api/v1/notifications/stream/', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'text/event-stream',
    'Cache-Control': 'no-cache'
  }
})

// Lecture manuelle du stream
const reader = response.body.getReader()
const decoder = new TextDecoder()
// ... traitement du stream
```

## Fichiers Modifiés

### 1. `src/services/notification.service.js`
- ✅ Suppression du fallback EventSource avec token en paramètre
- ✅ Utilisation exclusive de `fetch` avec headers
- ✅ Ajout de l'endpoint `API_ENDPOINTS.NOTIFICATIONS.STREAM`

### 2. `src/components/test/SSETestComponent.vue`
- ✅ Suppression du test avec paramètres URL
- ✅ Test uniquement avec la méthode headers
- ✅ Utilisation de `buildApiUrl()` et `API_ENDPOINTS`

### 3. `src/services/api.config.js`
- ✅ Ajout de `STREAM: '/notifications/stream/'` dans `API_ENDPOINTS.NOTIFICATIONS`

### 4. `docs/DOCUMENTATION-TECHNIQUE-COMPLETE.md`
- ✅ Mise à jour des exemples de code
- ✅ Documentation de la nouvelle méthode fetch + ReadableStream

## Configuration Backend Requise

Le backend doit supporter :

```http
GET /api/v1/notifications/stream/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Accept: text/event-stream
Cache-Control: no-cache
```

**Headers de réponse attendus :**
```http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Authorization, Accept, Cache-Control
```

## Avantages de la Nouvelle Méthode

### 🔒 Sécurité Améliorée
- Token d'authentification dans les headers (non visible dans l'URL)
- Pas de trace du token dans les logs d'accès serveur
- Réduction des risques de fuite de token

### 🚀 Robustesse
- Gestion d'erreurs HTTP plus précise
- Contrôle total sur la lecture du stream
- Fallback automatique vers polling en cas d'échec

### 📊 Monitoring
- Meilleur logging des erreurs de connexion
- Détection des problèmes de connexion réseau
- Métriques plus précises

## Impact sur l'Utilisateur Final

✅ **Aucun impact** - Les notifications en temps réel fonctionnent de manière transparente

En cas d'échec de la connexion SSE, le système bascule automatiquement vers le polling (vérification toutes les 30 secondes).

## Tests

Utiliser le composant de test SSE disponible dans l'application :
- Navigation : Interface → Test SSE
- Teste uniquement la méthode avec headers
- Affiche les logs de connexion détaillés

## Dépannage

### Erreur de Connexion SSE
1. Vérifier que le token d'authentification est valide
2. S'assurer que le backend supporte les headers Authorization
3. Vérifier la configuration CORS pour les headers personnalisés

### Fallback vers Polling
Si le polling est activé automatiquement, cela indique que :
- La connexion SSE a échoué
- Le backend ne supporte pas encore les SSE avec headers
- Problème de connectivité réseau

### Debug
Activer les logs détaillés en mode développement :
```javascript
// Dans la console du navigateur
localStorage.setItem('debug_sse', 'true')
```

## Migration pour les Développeurs

Si vous avez du code qui utilise l'ancienne méthode :

```diff
- const eventSource = new EventSource(`/api/v1/notifications/stream/?token=${token}`)
+ const response = await fetch('/api/v1/notifications/stream/', {
+   headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'text/event-stream' }
+ })
+ const reader = response.body.getReader()
+ // ... traitement manuel du stream
```

Ou utilisez directement le service :
```javascript
import { notificationService } from '@/services/notification.service.js'

// Initialiser les notifications en temps réel
notificationService.initializeRealTimeNotifications()
```