# 🔐 Système d'Authentification

## 🎯 Vue d'ensemble

Le système d'authentification gère la **connexion**, l'**inscription** et la **sécurité** de l'application. Il est composé de deux composants principaux.

## 🧩 Composants d'authentification

### 📊 Structure hiérarchique

```
App.vue
├── 🔓 LoginForm.vue          // Connexion des utilisateurs
└── 📝 RegisterForm.vue       // Inscription + création d'université
```

## 🔓 LoginForm.vue - Connexion

### 🎯 Rôle principal
- Permettre aux utilisateurs de se connecter
- Gérer le "Se souvenir de moi"
- Proposer de rejoindre une université existante

### 🔧 Fonctionnalités

#### 1. **Connexion standard** 🏠

```javascript
const handleLogin = async () => {
  try {
    // Appel API pour la connexion
    const response = await authService.login({
      email: loginForm.email,
      password: loginForm.password
    })
    
    // Si succès, émettre l'événement vers App.vue
    emit('login-success', response.data.user)
  } catch (error) {
    errorMessage.value = error.message
  }
}
```

#### 2. **Rejoindre une université** 🎓

```javascript
const handleJoinUniversity = async () => {
  try {
    // Inscription directe dans une université existante
    const response = await authService.register({
      email: joinForm.email,
      password: joinForm.password,
      role: 'STUDENT', // Rôle par défaut
      university_id: selectedUniversity.id
    })
    
    emit('login-success', response.data.user)
  } catch (error) {
    errorMessage.value = error.message
  }
}
```

### 🌐 APIs utilisées

```javascript
// Services importés
import { authService, universityService } from '@/services'

// Endpoints appelés
POST /auth/login          // Connexion
POST /auth/register       // Inscription
GET  /universities        // Liste des universités disponibles
```

### 📋 État du composant

```javascript
// Formulaire de connexion
const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false
})

// Formulaire pour rejoindre une université
const joinForm = reactive({
  university_id: '',
  email: '',
  password: '',
  role: 'STUDENT'
})

// État de l'interface
const isLoading = ref(false)
const errorMessage = ref('')
const showJoinForm = ref(false)
const availableUniversities = ref([])
```

## 📝 RegisterForm.vue - Inscription

### 🎯 Rôle principal
- Créer un nouveau compte utilisateur
- Créer une nouvelle université
- Faire de l'utilisateur l'administrateur de sa nouvelle université

### 🔧 Processus d'inscription

#### 1. **Étape 1 : Informations personnelles** 👤

```javascript
const userForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: ''
})
```

#### 2. **Étape 2 : Informations université** 🏫

```javascript
const universityForm = reactive({
  name: '',
  acronym: '',
  country: '',
  city: '',
  website: '',
  description: ''
})
```

#### 3. **Étape 3 : Vérification OTP** 📱

```javascript
const verificationForm = reactive({
  code: '',
  phoneNumber: ''
})
```

#### 4. **Traitement final** ✅

```javascript
const handleRegisterComplete = async () => {
  try {
    // 1. Créer l'université
    const universityResponse = await universityService.createUniversity(universityForm)
    
    // 2. Créer l'utilisateur comme ADMIN de cette université
    const userResponse = await authService.register({
      ...userForm,
      role: 'ADMIN',
      university_id: universityResponse.data.id
    })
    
    // 3. Émettre vers App.vue
    emit('register-success', {
      user: userResponse.data.user,
      university: universityResponse.data
    })
  } catch (error) {
    handleError(error)
  }
}
```

## 🔄 Flux d'authentification complet

### 📊 Diagramme de flux

```
1. Utilisateur remplit le formulaire
         ↓
2. Validation côté client
         ↓
3. Appel API vers le backend
         ↓
4. Backend vérifie les identifiants
         ↓
5. Retour de tokens + données utilisateur
         ↓
6. Sauvegarde locale + émission d'événement
         ↓
7. App.vue met à jour l'état global
         ↓
8. Redirection vers l'interface principale
```

### 🔑 Gestion des tokens

```javascript
// Dans authService.js
class AuthService {
  async login(credentials) {
    const response = await httpService.post('/auth/login', credentials)
    
    if (response.status === 'success') {
      // Sauvegarder les tokens
      localStorage.setItem('ccc_access_token', response.data.tokens.access_token)
      localStorage.setItem('ccc_refresh_token', response.data.tokens.refresh_token)
      localStorage.setItem('ccc_currentUser', JSON.stringify(response.data.user))
      
      return response
    }
  }
  
  // Auto-ajout du token dans les headers
  getAuthHeaders() {
    const token = localStorage.getItem('ccc_access_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }
}
```

## 🛡️ Sécurité et validation

### ✅ Validations côté client

```javascript
// Validation email
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Validation mot de passe
const isValidPassword = (password) => {
  return password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
}

// Validation université
const isValidUniversity = (university) => {
  return university.name && university.acronym && university.country
}
```

### 🔒 Gestion des erreurs

```javascript
const handleError = (error) => {
  switch (error.status) {
    case 401:
      errorMessage.value = 'Email ou mot de passe incorrect'
      break
    case 409:
      errorMessage.value = 'Un compte existe déjà avec cet email'
      break
    case 422:
      errorMessage.value = 'Données invalides. Vérifiez vos informations.'
      break
    default:
      errorMessage.value = 'Une erreur est survenue. Réessayez plus tard.'
  }
}
```

## 🎨 Interface utilisateur

### 🔓 LoginForm - Interface

```vue
<template>
  <form @submit.prevent="handleLogin" class="auth-form">
    <!-- Champ email -->
    <div class="form-group">
      <label>Email</label>
      <input v-model="loginForm.email" type="email" required />
    </div>
    
    <!-- Champ mot de passe -->
    <div class="form-group">
      <label>Mot de passe</label>
      <input v-model="loginForm.password" type="password" required />
    </div>
    
    <!-- Se souvenir de moi -->
    <div class="form-group">
      <label>
        <input v-model="loginForm.rememberMe" type="checkbox" />
        Se souvenir de moi
      </label>
    </div>
    
    <!-- Bouton connexion -->
    <button type="submit" :disabled="isLoading">
      {{ isLoading ? 'Connexion...' : 'Se connecter' }}
    </button>
    
    <!-- Lien pour rejoindre une université -->
    <button type="button" @click="showJoinForm = true">
      Rejoindre une université existante
    </button>
  </form>
</template>
```

### 📝 RegisterForm - Interface multi-étapes

```vue
<template>
  <form @submit.prevent="handleNext" class="auth-form">
    <!-- Étape 1 : Utilisateur -->
    <div v-if="currentStep === 1">
      <h3>Informations personnelles</h3>
      <input v-model="userForm.firstName" placeholder="Prénom" required />
      <input v-model="userForm.lastName" placeholder="Nom" required />
      <input v-model="userForm.email" type="email" placeholder="Email" required />
      <input v-model="userForm.password" type="password" placeholder="Mot de passe" required />
    </div>
    
    <!-- Étape 2 : Université -->
    <div v-if="currentStep === 2">
      <h3>Votre université</h3>
      <input v-model="universityForm.name" placeholder="Nom de l'université" required />
      <input v-model="universityForm.acronym" placeholder="Sigle (ex: UDS)" required />
      <input v-model="universityForm.country" placeholder="Pays" required />
      <input v-model="universityForm.city" placeholder="Ville" required />
    </div>
    
    <!-- Étape 3 : Vérification -->
    <div v-if="currentStep === 3">
      <h3>Vérification</h3>
      <p>Code envoyé au {{ verificationForm.phoneNumber }}</p>
      <input v-model="verificationForm.code" placeholder="Code de vérification" required />
    </div>
    
    <!-- Navigation -->
    <div class="form-actions">
      <button v-if="currentStep > 1" type="button" @click="previousStep">
        Retour
      </button>
      <button type="submit" :disabled="isLoading">
        {{ isLastStep ? 'Terminer' : 'Suivant' }}
      </button>
    </div>
  </form>
</template>
```

## 🔗 Communication avec App.vue

### 📡 Événements émis

```javascript
// LoginForm.vue
emit('login-success', user)        // Connexion réussie
emit('switch-to-register')         // Basculer vers inscription

// RegisterForm.vue
emit('register-success', { user, university })  // Inscription réussie
emit('switch-to-login')                         // Basculer vers connexion
```

### 📥 Réception dans App.vue

```javascript
// Dans App.vue
const handleLoginSuccess = async (user) => {
  currentUser.value = user
  currentView.value = 'app'
  notificationService.initializeUser(user.id)
}

const handleRegisterSuccess = async ({ user, university }) => {
  // Créer l'université et l'utilisateur admin
  currentUser.value = { ...user, role: 'ADMIN', university }
  currentView.value = 'app'
}
```

## 🐛 Debugging courant

### ❌ Problèmes fréquents

1. **Token expiré** : L'utilisateur est déconnecté automatiquement
2. **Email déjà utilisé** : Message d'erreur lors de l'inscription
3. **Université déjà existante** : Vérification de l'unicité du nom/sigle
4. **Validation OTP échouée** : Code incorrect ou expiré

### ✅ Solutions

```javascript
// Auto-refresh des tokens
window.addEventListener('auth:logout', (event) => {
  if (event.detail.reason === 'token_expired') {
    alert('Votre session a expiré. Veuillez vous reconnecter.')
    currentView.value = 'login'
  }
})
```

---

> 💡 **Pour tester** : Utilisez les DevTools pour voir les appels API dans l'onglet Network et vérifiez les tokens dans localStorage.