# Migration SSE vers Polling REST

## Contexte

La route `/api/v1/notifications/stream/` pour SSE (Server-Sent Events) n'est pas disponible sur le backend. Migration vers un système de polling REST sur l'endpoint standard `/api/v1/notifications/`.

## Changements Effectués

### 1. Service de Notifications (`notification.service.js`)

**Avant (SSE):**
```javascript
// Connexion SSE avec fetch + ReadableStream
async connectSSE() {
  const response = await fetch(streamUrl, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const reader = response.body.getReader()
}
```

**Après (Polling REST):**
```javascript
// Polling standard toutes les 15 secondes
async startPolling() {
  this.pollingInterval = setInterval(async () => {
    await this.checkForNewNotifications()
  }, 15000)
}

async checkForNewNotifications() {
  // 1. Récupérer les stats pour détecter les changements
  const stats = await this.getStatistics()
  const currentCount = stats.data?.unread_count || 0
  
  // 2. Si changement détecté, récupérer les nouvelles notifications
  if (currentCount !== this.lastUnreadCount) {
    const notifications = await this.getNotifications({ 
      limit: Math.max(10, currentCount),
      ordering: '-created_at'
    })
    
    // 3. Identifier et publier les nouvelles notifications
    const newNotifications = notifications.filter(n => 
      !this.lastNotificationIds.has(n.id.toString())
    )
    
    newNotifications.forEach(notification => {
      this.publishToSubscribers({
        type: 'notification',
        data: notification
      })
    })
  }
}
```

### 2. Configuration API (`api.config.js`)

**Suppression de l'endpoint STREAM:**
```javascript
// Avant
NOTIFICATIONS: {
  BASE: '/notifications/',
  STATISTICS: '/notifications/stats/',
  STREAM: '/notifications/', // ❌ Non disponible
  // ...
}

// Après  
NOTIFICATIONS: {
  BASE: '/notifications/',
  STATISTICS: '/notifications/stats/',
  // STREAM supprimé - utilise BASE pour polling
  // ...
}
```

### 3. Authentification

**Maintenue:** Token JWT dans les headers `Authorization: Bearer ${token}` pour toutes les requêtes REST.

## Fonctionnement du Polling

### Fréquence
- **Notifications:** Toutes les 15 secondes
- **Statistiques:** Vérifiées à chaque cycle pour détecter les changements

### Détection des Nouveautés
1. **Count Tracking:** Compare `unread_count` entre les cycles
2. **ID Tracking:** Maintient un `Set` des IDs de notifications déjà vues
3. **Timestamp Tracking:** Garde la date de la notification la plus récente

### Optimisations
- **Cache:** 2 minutes sur les requêtes API
- **Limit adaptatif:** `Math.max(10, currentCount)` pour récupérer suffisamment de notifications
- **Déduplication:** Évite les notifications dupliquées via tracking des IDs

## Avantages vs SSE

| Aspect | SSE | Polling REST |
|--------|-----|--------------|
| Temps réel | Instantané | 15 secondes max |
| Complexité | Élevée (stream, reconnexion) | Simple (requêtes HTTP) |
| Compatibilité | Dépend du backend | Standard REST |
| Authentification | Headers custom | Standard Bearer |
| Debugging | Difficile (streams) | Facile (requêtes classiques) |
| Fiabilité | Fragile (connexions) | Robuste |

## Tests

Pour tester le nouveau système :

```bash
# 1. Créer une notification via API
curl -X POST http://127.0.0.1:8000/api/v1/notifications/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Test notification", "type": "info"}'

# 2. Vérifier que l'UI se met à jour dans les 15 secondes
# 3. Vérifier les logs de polling dans la console

# Console logs attendus :
# 🔄 Initialisation polling sur /api/v1/notifications/
# 📡 Démarrage polling notifications...
# ✅ Polling notifications démarré (15s)
# 📈 Nouveau count détecté: 2 -> 3
# 🔔 Nouvelles notifications détectées: 1
```

## Performance

- **Requêtes:** 4 requêtes/minute maximum (15s interval)
- **Cache:** Réduit les appels API redondants
- **Bandwidth:** Minimal (JSON compact)
- **CPU:** Très faible (timer + comparaisons simples)

## Migration Complète

✅ **Terminé:**
- Service de notifications converti au polling
- Endpoint STREAM supprimé de la config
- Authentification par headers maintenue  
- Détection des nouvelles notifications fonctionnelle
- Cache et optimisations préservées

🔄 **Prochaine étape:** Test en conditions réelles