# Gestion des Erreurs HTTP 409 - Conflit

## 📋 Vue d'ensemble

Le code de statut HTTP 409 (Conflict) indique que la requête ne peut pas être traitée à cause d'un conflit avec l'état actuel de la ressource.

## 🔧 Implémentation

### 1. Configuration API

```javascript
// api.config.js
export const HTTP_STATUS = {
  // ... autres status
  CONFLICT: 409,
  // ... 
}

export const API_RESPONSE_TYPES = {
  // ... autres types
  CONFLICT: 'conflict',
  // ...
}
```

### 2. Service HTTP

```javascript
// http.service.js
if (response.status === HTTP_STATUS.CONFLICT) {
  throw new ApiError('Conflit de ressource', HTTP_STATUS.CONFLICT, errorData)
}
```

### 3. Service OTP - Gestion spécialisée

```javascript
// otp.service.js
} else if (error.status === 409) {
  // Erreur 409 (conflit) - extraire le message de response.data
  let message = 'Un conflit est survenu'
  
  if (error.response) {
    // Essayer de récupérer le message depuis différentes structures possibles
    if (typeof error.response.data === 'string') {
      message = error.response.data
    } else if (error.response.data && typeof error.response.data === 'object') {
      message = error.response.data.message || error.response.data
    } else if (error.response.message) {
      message = error.response.message
    }
  }
  
  throw new Error(message)
}
```

## 📊 Structures de réponse supportées

### Structure 1: String directe
```json
{
  "data": "Un utilisateur avec cet email existe déjà"
}
```

### Structure 2: Objet avec message
```json
{
  "data": {
    "message": "Email déjà utilisé",
    "code": "EMAIL_EXISTS"
  }
}
```

### Structure 3: Message dans response
```json
{
  "message": "Conflit de ressource"
}
```

### Structure 4: Format API standardisé
```json
{
  "status": "conflict",
  "data": "Message d'erreur détaillé",
  "message": "Conflit détecté",
  "errors": {
    "email": "Cette adresse est déjà prise"
  }
}
```

## 🎯 Utilisation dans les composants

```javascript
// EmailVerification.vue
try {
  const response = await otpService.sendOtp(email.value)
  // ... traitement succès
} catch (error) {
  // L'erreur 409 est maintenant automatiquement gérée
  // Le message de response.data est extrait et affiché
  sendError.value = error.message
}
```

## 🧪 Test

Utilisez le fichier `utils/test-409-error.js` pour tester différentes structures de réponse 409.

## ⚡ Avantages

1. **Flexibilité** : Support de multiples formats de réponse
2. **Robustesse** : Fallback vers un message par défaut
3. **Clarté** : Messages d'erreur explicites pour l'utilisateur
4. **Maintenabilité** : Logique centralisée dans le service