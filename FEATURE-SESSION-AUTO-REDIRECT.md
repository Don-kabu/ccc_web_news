# Feature: Redirection Automatique lors de Session Expirée

## Problème Résolu
L'utilisateur demandait : "je veux que quand la session expire que ca puisse directement me rediriger vers le login directement"

## Fonctionnalité Implémentée

### 🔄 **Renouvellement Automatique de Token**
Le système tente automatiquement de renouveler le token d'accès avant de rediriger vers la page de connexion.

**Workflow :**
```
1. Requête API → 401 Unauthorized
2. Tentative de renouvellement automatique du token
3a. SI réussi → Relance automatique de la requête originale
3b. SI échec → Redirection vers login avec notification
```

### 🔒 **Gestion Intelligente de Session**

**Détection automatique :**
- Toutes les requêtes HTTP sont interceptées
- Les erreurs 401 (Unauthorized) déclenchent le processus automatique
- Gestion transparente pour l'utilisateur

**Process de fallback :**
```javascript
// 1. Tentative de renouvellement
const refreshResult = await this.tryTokenRefresh()

if (refreshResult.success) {
  // ✅ Succès : L'utilisateur continue son travail sans interruption
  return this.retryOriginalRequest(response, originalUrl)
} else {
  // ❌ Échec : Redirection automatique avec notification
  this.handleUnauthorized()
}
```

### 🔔 **Notification Utilisateur Élégante**

**Notification visuelle :**
- Apparition en haut à droite avec animation fluide
- Design moderne avec dégradé rouge et icône
- Message informatif : "Session expirée, redirection vers la page de connexion..."
- Disparition automatique après 3 secondes

**Style de notification :**
```css
background: linear-gradient(135deg, #ef4444, #dc2626);
border-radius: 12px;
box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
backdrop-filter: blur(10px);
animation: slideIn 0.3s ease-out;
```

### 🎯 **Redirection Automatique**

**Processus de redirection :**
1. **Délai de grâce** : 1.5 secondes pour laisser l'utilisateur voir le message
2. **Nettoyage complet** : Suppression de tous les tokens et données de session
3. **Rechargement automatique** : `window.location.reload()` pour revenir à l'état d'authentification

## Implémentation Technique

### HttpService Enhancement
```javascript
// Intercepteur de réponses amélioré
if (response.status === HTTP_STATUS.UNAUTHORIZED) {
  const refreshResult = await this.tryTokenRefresh()
  
  if (refreshResult.success) {
    return this.retryOriginalRequest(response, originalUrl)
  } else {
    this.handleUnauthorized() // Redirection automatique
  }
}
```

### App.vue Event Handling
```javascript
// Écoute des événements de session expirée
window.addEventListener('auth:session-expired', handleSessionExpired)

const handleSessionExpired = (event) => {
  // Nettoyage de l'état de l'application
  currentUser.value = null
  showNotifications.value = false
  currentView.value = 'login'
  
  // Notification visuelle
  showSessionExpiredNotification(event.detail.message)
}
```

### AuthService Integration
```javascript
// Méthode de renouvellement automatique
async tryTokenRefresh() {
  const refreshToken = localStorage.getItem('ccc_refresh_token')
  
  if (refreshToken) {
    const tokenData = await authService.refreshToken()
    return { success: !!tokenData.access_token, tokenData }
  }
  
  return { success: false, reason: 'no_refresh_token' }
}
```

## Avantages de la Solution

### ✅ **Expérience Utilisateur Optimale**
- **Transparence** : L'utilisateur ne remarque rien si le renouvellement fonctionne
- **Information** : Notification claire en cas de redirection forcée
- **Continuité** : Pas de perte de données ou de contexte

### ✅ **Sécurité Renforcée**
- **Nettoyage complet** : Suppression de tous les tokens et données sensibles
- **Redirection immédiate** : Pas d'accès non autorisé possible
- **Gestion centralisée** : Un seul point de contrôle pour l'authentification

### ✅ **Robustesse Technique**
- **Gestion d'erreurs** : Fallback en cas d'échec de renouvellement
- **Performance** : Relance automatique des requêtes sans perte
- **Monitoring** : Logs détaillés pour le debug

## Scénarios d'Usage

### **Scénario 1 : Renouvellement Réussi**
```
1. Utilisateur navigue dans l'app depuis 30 minutes
2. Token expire, requête API échoue (401)
3. Système renouvelle automatiquement le token
4. Requête originale est relancée et réussit
5. Utilisateur continue sans interruption
```

### **Scénario 2 : Redirection Nécessaire**
```
1. Refresh token également expiré ou invalide
2. Notification apparaît : "Session expirée..."
3. Nettoyage automatique des données de session
4. Redirection vers la page de connexion après 1.5s
5. Utilisateur voit le formulaire de login
```

## Configuration et Personnalisation

### Délais Configurables
```javascript
// Dans httpService.handleUnauthorized()
setTimeout(() => {
  window.location.reload()
}, 1500) // Modifiable selon besoins
```

### Styles de Notification Personnalisables
```javascript
// Dans App.vue showSessionExpiredNotification()
notification.style.cssText = `
  position: fixed;
  top: 20px;
  right: 20px;
  // Styles personnalisables...
`
```

## Monitoring et Debug

### Logs de Debug
```
🔄 Tentative de renouvellement automatique du token...
✅ Token renouvelé automatiquement, relance de la requête
🔒 Session expirée détectée
🌐 API Request: GET /api/v1/profile
📡 API Response: 401 /api/v1/profile
```

### Events Personnalisés
- `auth:session-expired` : Session expirée avec détails
- `notification-received` : Mise à jour des notifications
- `auth:login` : Connexion réussie
- `auth:logout` : Déconnexion

## Résultat

✅ **L'utilisateur est maintenant automatiquement redirigé vers la page de connexion quand sa session expire**, avec une tentative intelligente de renouvellement automatique et une notification élégante pour l'informer du processus.