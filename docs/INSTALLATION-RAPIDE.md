# ⚡ CCC Web News - Guide d'Installation Rapide

## 🎯 Installation en 5 Minutes

### Prérequis
- ✅ Node.js 18+ installé
- ✅ Git installé
- ✅ Connexion internet

### Étape 1 : Clone et Installation

```bash
# 1. Cloner le projet
git clone https://github.com/Don-kabu/ccc_web_news.git
cd ccc_web_news

# 2. Installer les dépendances
npm install

# 3. Démarrer en mode développement
npm run dev
```

🎉 **L'application est maintenant accessible sur http://localhost:5173**

![Interface de connexion](photo/login.png)

### Étape 2 : Premier Utilisateur

1. **Cliquez sur "Nouvelle Institution"**
2. **Créez votre université** avec le processus d'inscription
3. **Connectez-vous** avec vos identifiants

![Page d'accueil](photo/homepage.png)

---

## 🔧 Configuration Production

### Variables d'Environnement

Créez `.env.production` :

```env
VITE_API_BASE_URL=https://votre-api.com/api/v1
VITE_APP_NAME=Votre Institution News
```

### Build et Déploiement

```bash
# Build de production
npm run build

# Les fichiers sont dans le dossier dist/
# Déployez le contenu de dist/ sur votre serveur web
```

---

## 📱 Fonctionnalités Principales

### Pour Tous les Utilisateurs
- 👁️ **Consulter** les actualités de votre université
- 🔔 **Recevoir** des notifications en temps réel
- 🌙 **Basculer** entre thème clair/sombre
- 👤 **Gérer** votre profil

### Pour les Publiants
- ✍️ **Rédiger** et publier des actualités
- 📅 **Programmer** des publications
- 📊 **Suivre** le statut de vos articles

![Interface de publication](photo/publish.png)

### Pour les Modérateurs
- ✅ **Approuver** ou rejeter des articles
- 🛡️ **Modérer** le contenu
- 📈 **Consulter** les statistiques

### Pour les Administrateurs
- 👥 **Gérer** les utilisateurs et leurs rôles
- ⚙️ **Configurer** les paramètres système
- 📊 **Analyser** les statistiques détaillées

![Interface d'administration](photo/statistics.png)

---

## 🆘 Support Rapide

### Problèmes Courants

**❌ `npm install` échoue**
```bash
# Nettoyer le cache npm
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**❌ Port 5173 déjà utilisé**
```bash
# Utiliser un autre port
npm run dev -- --port 3000
```

**❌ Build échoue**
```bash
# Vérifier les erreurs
npm run build 2>&1 | tee build.log
```

### Logs Utiles

```bash
# Voir les logs en temps réel
npm run dev | grep -i error

# Vérifier les performances
npm run preview
```

---

## 📞 Contacts

- 📧 **Support** : support@cccwebnews.com
- 📖 **Documentation** : Consultez les fichiers `/docs/`
- 🐛 **Bugs** : Créez une issue sur GitHub

---

*Installation rapide - Version 2.0*