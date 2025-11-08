# 👨‍💻 CCC Web News - Guide de Développement

## 🎯 Contributing au Projet

Ce guide est destiné aux développeurs souhaitant contribuer au projet CCC Web News.

---

## 🏗️ Architecture du Code

### Structure des Composants

```
src/components/
├── auth/                    # Authentification
│   ├── LoginForm.vue       # Formulaire de connexion
│   ├── RegisterForm.vue    # Inscription université
│   └── EmailVerification.vue # Vérification OTP
├── common/                  # Composants réutilisables
│   ├── PasswordValidator.vue # Validation mot de passe
│   └── LoadingSpinner.vue   # Indicateur de chargement
├── layout/                  # Mise en page
│   └── Navbar.vue          # Barre de navigation
├── pages/                   # Pages principales
│   ├── HomePage.vue        # Accueil
│   ├── NewsPage.vue        # Liste actualités
│   ├── PublishPage.vue     # Publication
│   ├── ModerationPage.vue  # Modération
│   ├── AdminPage.vue       # Administration
│   └── UserProfile.vue     # Profil utilisateur
└── ui/                      # Éléments d'interface
    └── ThemeToggle.vue     # Sélecteur de thème
```

### Pattern de Composition API

Tous les composants utilisent la Composition API de Vue 3 :

```vue
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { serviceExample } from '@/services/example.service.js'

// Props
const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

// Émissions
const emit = defineEmits(['update', 'delete'])

// État réactif
const isLoading = ref(false)
const errors = ref({})

// Computed properties
const hasErrors = computed(() => Object.keys(errors.value).length > 0)

// Méthodes
const handleAction = async () => {
  try {
    isLoading.value = true
    const result = await serviceExample.performAction(props.data)
    emit('update', result)
  } catch (error) {
    errors.value = { general: error.message }
  } finally {
    isLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Initialisation
})

// Watchers
watch(() => props.data, (newData) => {
  // Réaction aux changements
}, { deep: true })
</script>

<template>
  <div class="component-container">
    <!-- Interface utilisateur -->
  </div>
</template>

<style scoped>
/* Styles spécifiques au composant */
</style>
```

---

## 🛠️ Services et Logique Métier

### Architecture des Services

Chaque service suit le même pattern :

```javascript
// services/example.service.js
import { httpService } from './http.service.js'

class ExampleService {
  constructor() {
    this.cache = new Map()
    this.endpoints = {
      list: '/examples',
      create: '/examples',
      update: '/examples/:id',
      delete: '/examples/:id'
    }
  }

  async getAll(filters = {}) {
    try {
      const cacheKey = JSON.stringify(filters)
      
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)
      }

      const response = await httpService.get(this.endpoints.list, { params: filters })
      
      if (response.success) {
        this.cache.set(cacheKey, response)
        return response
      }
      
      throw new Error(response.message)
    } catch (error) {
      console.error('ExampleService.getAll:', error)
      return { success: false, error: error.message }
    }
  }

  async create(data) {
    try {
      const response = await httpService.post(this.endpoints.create, data)
      
      if (response.success) {
        this.clearCache()
        return response
      }
      
      throw new Error(response.message)
    } catch (error) {
      console.error('ExampleService.create:', error)
      throw error
    }
  }

  clearCache() {
    this.cache.clear()
  }
}

export const exampleService = new ExampleService()
```

### Gestion des Erreurs

```javascript
// services/error.service.js
class ErrorService {
  static handle(error, context = '') {
    console.error(`[${context}]`, error)

    // Structurer l'erreur
    const structuredError = {
      message: error.message || 'Une erreur est survenue',
      code: error.code || 'UNKNOWN_ERROR',
      context,
      timestamp: new Date().toISOString(),
      stack: error.stack
    }

    // Log pour monitoring
    this.logError(structuredError)

    // Notification utilisateur si nécessaire
    if (this.shouldNotifyUser(error)) {
      this.notifyUser(structuredError.message)
    }

    return structuredError
  }

  static logError(error) {
    // Envoi vers service de monitoring
    if (import.meta.env.PROD) {
      // Analytics/Sentry/etc.
    }
  }

  static shouldNotifyUser(error) {
    // Ne pas notifier pour certaines erreurs
    const silentErrors = ['NETWORK_ERROR', 'TIMEOUT']
    return !silentErrors.includes(error.code)
  }

  static notifyUser(message) {
    // Notification toast/alert
    window.dispatchEvent(new CustomEvent('show-notification', {
      detail: { type: 'error', message }
    }))
  }
}
```

---

## 🎨 Conventions de Style

### CSS et Design System

Variables CSS globales définies dans `src/App.vue` :

```css
:root {
  /* Couleurs principales */
  --primary-color: #667eea;
  --primary-dark: #5a67d8;
  --secondary-color: #764ba2;
  
  /* Couleurs de fond */
  --background-primary: #f8fafc;
  --background-secondary: #ffffff;
  
  /* Texte */
  --text-primary: #1a202c;
  --text-secondary: #4a5568;
  --text-muted: #718096;
  
  /* Bordures */
  --border-color: #e2e8f0;
  --border-radius: 0.5rem;
  
  /* Ombres */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

### Classes Utilitaires

```css
/* Classes communes réutilisables */
.primary-button {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.loading-spinner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### Naming Conventions

```css
/* BEM Methodology */
.component-name {}                    /* Block */
.component-name__element {}           /* Element */
.component-name--modifier {}          /* Modifier */

/* Exemples */
.card {}
.card__header {}
.card__content {}
.card--large {}
.card--featured {}

.button {}
.button--primary {}
.button--secondary {}
.button--disabled {}
```

---

## 🧪 Tests et Qualité

### Tests Unitaires

```javascript
// tests/components/ExampleComponent.test.js
import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import ExampleComponent from '@/components/ExampleComponent.vue'

describe('ExampleComponent', () => {
  const mockProps = {
    data: { id: 1, name: 'Test' }
  }

  it('affiche les données correctement', () => {
    const wrapper = mount(ExampleComponent, {
      props: mockProps
    })

    expect(wrapper.find('[data-testid="name"]').text()).toBe('Test')
    expect(wrapper.find('[data-testid="id"]').text()).toBe('1')
  })

  it('émet un événement lors du clic', async () => {
    const wrapper = mount(ExampleComponent, {
      props: mockProps
    })

    await wrapper.find('[data-testid="action-button"]').trigger('click')

    expect(wrapper.emitted('action')).toBeTruthy()
    expect(wrapper.emitted('action')[0]).toEqual([mockProps.data])
  })

  it('gère les erreurs de chargement', async () => {
    const wrapper = mount(ExampleComponent, {
      props: { ...mockProps, hasError: true }
    })

    expect(wrapper.find('[data-testid="error-message"]').exists()).toBe(true)
  })
})
```

### Tests d'Intégration

```javascript
// tests/integration/auth.test.js
import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import LoginForm from '@/components/auth/LoginForm.vue'
import { authService } from '@/services/auth.service.js'

vi.mock('@/services/auth.service.js')

describe('Processus d\'authentification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('connecte un utilisateur avec succès', async () => {
    const mockUser = { id: 1, email: 'test@university.com' }
    authService.login.mockResolvedValue({ success: true, user: mockUser })

    const wrapper = mount(LoginForm)

    await wrapper.find('#email').setValue('test@university.com')
    await wrapper.find('#password').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')

    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@university.com',
      password: 'password123'
    })

    expect(wrapper.emitted('login-success')).toBeTruthy()
    expect(wrapper.emitted('login-success')[0]).toEqual([mockUser])
  })

  it('affiche une erreur pour identifiants incorrects', async () => {
    authService.login.mockResolvedValue({ 
      success: false, 
      message: 'Email ou mot de passe incorrect' 
    })

    const wrapper = mount(LoginForm)

    await wrapper.find('#email').setValue('wrong@email.com')
    await wrapper.find('#password').setValue('wrongpassword')
    await wrapper.find('form').trigger('submit.prevent')

    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="error-message"]').text())
      .toBe('Email ou mot de passe incorrect')
  })
})
```

### Linting et Formatage

Configuration ESLint (`.eslintrc.js`) :

```javascript
module.exports = {
  env: {
    node: true,
  },
  extends: [
    'eslint:recommended',
    '@vue/eslint-config-prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/multi-word-component-names': 'off',
    'vue/no-reserved-component-names': 'off',
  },
}
```

---

## 📦 Workflows de Développement

### Git Flow

```bash
# Branches principales
main                    # Production
develop                # Intégration

# Branches de fonctionnalité
feature/auth-system    # Nouvelle fonctionnalité
feature/user-management

# Branches de correction
hotfix/login-bug       # Correction urgente
bugfix/notification-issue

# Processus de travail
git checkout develop
git pull origin develop
git checkout -b feature/ma-fonctionnalite

# ... développement ...

git add .
git commit -m "feat: ajouter validation email avec OTP"
git push origin feature/ma-fonctionnalite

# Créer une Pull Request vers develop
```

### Commits Conventionnels

```bash
# Format : type(scope): description

# Types principaux :
feat:     # Nouvelle fonctionnalité
fix:      # Correction de bug
docs:     # Documentation
style:    # Formatage, pas de changement logique
refactor: # Refactoring sans nouveau feature ni bug fix
test:     # Ajout ou modification de tests
chore:    # Maintenance (build, CI, etc.)

# Exemples :
git commit -m "feat(auth): ajouter vérification OTP par email"
git commit -m "fix(news): corriger affichage des images"
git commit -m "docs: mettre à jour guide utilisateur"
git commit -m "style(admin): améliorer responsive des tableaux"
git commit -m "refactor(services): simplifier gestion des erreurs"
git commit -m "test(components): ajouter tests pour LoginForm"
git commit -m "chore(deps): mettre à jour Vue vers 3.4"
```

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Run tests
      run: npm run test:unit
    
    - name: Build application
      run: npm run build
    
    - name: Run E2E tests
      run: npm run test:e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to production
      run: |
        npm run build
        # Script de déploiement
```

---

## 🔍 Debugging et Monitoring

### Vue DevTools

```javascript
// main.js - Configuration pour développement
if (import.meta.env.DEV) {
  const app = createApp(App)
  app.config.performance = true
  app.mount('#app')
}
```

### Logging Structuré

```javascript
// utils/logger.js
class Logger {
  static levels = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
  }

  static log(level, message, data = {}) {
    if (this.shouldLog(level)) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: level.toUpperCase(),
        message,
        data,
        url: window.location.href,
        userAgent: navigator.userAgent
      }

      console.log(`[${logEntry.level}] ${logEntry.message}`, logEntry.data)

      // Envoi vers service de monitoring en production
      if (import.meta.env.PROD && level <= this.levels.WARN) {
        this.sendToMonitoring(logEntry)
      }
    }
  }

  static shouldLog(level) {
    const currentLevel = import.meta.env.DEV ? this.levels.DEBUG : this.levels.INFO
    return this.levels[level] <= currentLevel
  }

  static error(message, data) { this.log('ERROR', message, data) }
  static warn(message, data) { this.log('WARN', message, data) }
  static info(message, data) { this.log('INFO', message, data) }
  static debug(message, data) { this.log('DEBUG', message, data) }
}

// Utilisation dans les composants
import { Logger } from '@/utils/logger.js'

export default {
  setup() {
    const handleError = (error) => {
      Logger.error('Erreur lors du chargement des données', {
        error: error.message,
        stack: error.stack,
        component: 'DataLoader'
      })
    }
  }
}
```

### Performance Monitoring

```javascript
// utils/performance.js
class PerformanceMonitor {
  static measureComponent(name, fn) {
    return async (...args) => {
      const start = performance.now()
      
      try {
        const result = await fn(...args)
        const duration = performance.now() - start
        
        Logger.debug(`Performance: ${name}`, {
          duration: `${duration.toFixed(2)}ms`,
          args: args.length
        })
        
        return result
      } catch (error) {
        const duration = performance.now() - start
        
        Logger.error(`Performance Error: ${name}`, {
          duration: `${duration.toFixed(2)}ms`,
          error: error.message
        })
        
        throw error
      }
    }
  }

  static trackUserAction(action, data = {}) {
    Logger.info(`User Action: ${action}`, {
      timestamp: Date.now(),
      data,
      page: window.location.pathname
    })

    // Analytics
    if (window.gtag) {
      gtag('event', action, {
        event_category: 'User Interaction',
        ...data
      })
    }
  }
}

// Utilisation
const loadNews = PerformanceMonitor.measureComponent('loadNews', async (filters) => {
  return await newsService.getNews(filters)
})
```

---

## 📋 Checklist de Contribution

Avant de soumettre une Pull Request :

### ✅ Code Quality

- [ ] Code respecte les conventions ESLint
- [ ] Composants utilisent la Composition API
- [ ] Noms de variables/fonctions descriptifs en français
- [ ] Pas de console.log en production
- [ ] Gestion d'erreurs appropriée

### ✅ Tests

- [ ] Tests unitaires pour nouvelles fonctionnalités
- [ ] Tests d'intégration si nécessaire
- [ ] Tous les tests passent
- [ ] Coverage minimum maintenu

### ✅ Documentation

- [ ] Code commenté si logique complexe
- [ ] README mis à jour si nécessaire
- [ ] Guide utilisateur mis à jour
- [ ] Changelog mis à jour

### ✅ UI/UX

- [ ] Interface responsive (mobile, tablette, desktop)
- [ ] Thème sombre et clair supportés
- [ ] Accessibilité respectée (alt text, contraste)
- [ ] Loading states et feedback utilisateur

### ✅ Performance

- [ ] Images optimisées
- [ ] Pas de memory leaks
- [ ] Code splitting approprié
- [ ] Bundle size raisonnable

---

*Guide de développement - Version 2.0*