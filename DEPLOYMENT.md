# Deployment Guide - CCC Web News

Ce guide explique comment déployer l'application CCC Web News sur différentes plateformes d'hébergement gratuites.

## 🚀 Options d'hébergement gratuit

### 1. **Vercel** (Recommandé) ⭐

**Avantages :**
- Déploiement automatique depuis GitHub
- Build automatique optimisé pour Vite/Vue.js
- CDN global inclus
- HTTPS automatique
- 100 GB bandwidth/mois gratuit
- Preview deployments pour les PR

**Étapes de déploiement :**
1. Aller sur [vercel.com](https://vercel.com)
2. Se connecter avec GitHub
3. Importer le repository `ccc_web_news`
4. Vercel détecte automatiquement Vite
5. Déploiement automatique !

**URL de démo :** `https://ccc-web-news.vercel.app`

### 2. **Netlify** 

**Avantages :**
- Interface simple et intuitive
- Forms handling gratuit
- Functions serverless
- 100 GB bandwidth/mois gratuit
- Build & deploy automatique

**Étapes de déploiement :**
1. Aller sur [netlify.com](https://netlify.com)
2. "New site from Git" → connecter GitHub
3. Sélectionner le repository
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Deploy !

### 3. **GitHub Pages**

**Avantages :**
- Totalement gratuit
- Intégration native GitHub
- Pas de limite de bandwidth

**Étapes de déploiement :**
1. Dans les Settings du repo → Pages
2. Source: "GitHub Actions"
3. Le workflow `.github/workflows/deploy-gh-pages.yml` s'occupe du reste

### 4. **Firebase Hosting**

**Avantages :**
- CDN global de Google
- Intégration avec Firebase services
- 10 GB storage gratuit

**Configuration :**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 🔧 Configuration de production

### Variables d'environnement

Créer un fichier `.env.production` :
```env
VITE_API_BASE_URL=https://api.cccwebnews.com/v1
VITE_APP_TITLE=CCC Web News
VITE_APP_VERSION=1.0.0
VITE_SENTRY_DSN=your_sentry_dsn_here
VITE_ANALYTICS_ID=your_analytics_id
```

### Optimisations de build

Le fichier `vite.config.js` est déjà optimisé pour la production :
- Minification des assets
- Tree shaking
- Code splitting
- Compression gzip
- Source maps pour le debug

### Sécurité

Les fichiers de configuration incluent :
- Headers de sécurité (CSRF, XSS, etc.)
- Content Security Policy
- Cache control pour les assets
- HTTPS redirect

## 📱 PWA (Progressive Web App)

Pour transformer l'app en PWA, ajouter dans `vite.config.js` :

```js
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'CCC Web News',
        short_name: 'CCCNews',
        description: 'Plateforme de gestion des actualités universitaires',
        theme_color: '#667eea',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
```

## 🔍 Monitoring et Analytics

### 1. **Sentry** (Error tracking)
```bash
npm install @sentry/vue
```

### 2. **Google Analytics**
```bash
npm install vue-gtag
```

### 3. **Vercel Analytics** (si déployé sur Vercel)
```bash
npm install @vercel/analytics
```

## 🚀 Commandes de déploiement

### Déploiement manuel

```bash
# Build pour la production
npm run build

# Preview du build local
npm run preview

# Deploy sur Vercel
npx vercel

# Deploy sur Netlify
npx netlify deploy --prod --dir=dist

# Deploy sur Surge
npm install -g surge
surge dist ccc-web-news.surge.sh
```

### CI/CD Automatique

Les workflows GitHub Actions sont configurés pour :
- **Vercel** : `.github/workflows/deploy-vercel.yml`
- **Netlify** : `.github/workflows/deploy-netlify.yml`
- **GitHub Pages** : `.github/workflows/deploy-gh-pages.yml`

## 🌍 Domaine personnalisé

### Avec Vercel
1. Aller dans Project Settings → Domains
2. Ajouter votre domaine
3. Configurer les DNS selon les instructions

### Avec Netlify
1. Site Settings → Domain management
2. Add custom domain
3. Suivre les instructions DNS

### DNS Configuration (exemple)
```
Type: CNAME
Name: www
Value: ccc-web-news.vercel.app

Type: A
Name: @
Value: 76.76.19.61 (IP de Vercel)
```

## 📊 Performance

### Optimisations implémentées :
- ✅ Lazy loading des composants
- ✅ Image optimization
- ✅ Bundle splitting
- ✅ Tree shaking
- ✅ Minification
- ✅ Gzip compression
- ✅ CDN distribution

### Scores attendus :
- **Performance** : 90+
- **Accessibility** : 95+
- **Best Practices** : 90+
- **SEO** : 85+

## 🔄 Mise à jour

Pour les mises à jour automatiques :
1. Push sur la branche `main`
2. Le CI/CD détecte les changements
3. Build et déploiement automatiques
4. Tests de smoke automatiques

## 🆘 Dépannage

### Erreurs communes :

**Build Error: "Module not found"**
```bash
npm ci  # Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

**404 sur refresh**
- Vérifier la configuration des redirects
- S'assurer que le SPA routing est configuré

**Assets non chargés**
- Vérifier le `base` dans `vite.config.js`
- Contrôler les chemins relatifs

## 📞 Support

- **Documentation Vercel** : https://vercel.com/docs
- **Documentation Netlify** : https://docs.netlify.com
- **Documentation Vite** : https://vitejs.dev/guide/
- **Support GitHub** : Issues sur le repository