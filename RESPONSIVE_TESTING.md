# Guide de Test - Design Responsif

## Points de rupture (Breakpoints)

L'application utilise les breakpoints suivants :

- **Desktop Large** : 1200px et plus
- **Desktop** : 1024px - 1199px  
- **Tablet** : 768px - 1023px
- **Mobile** : 480px - 767px
- **Small Mobile** : 360px - 479px
- **Extra Small** : moins de 360px

## Tests à effectuer

### 1. Navigation (Navbar)

#### Desktop (1200px+)
- [ ] Logo et nom de l'université visibles
- [ ] Tous les onglets avec icônes et texte
- [ ] Informations utilisateur complètes
- [ ] Menu déroulant positionné correctement

#### Tablet (768px-1023px)
- [ ] Navigation réorganisée sur plusieurs lignes
- [ ] Onglets avec icônes uniquement
- [ ] Informations utilisateur masquées
- [ ] Menu déroulant adapté à l'écran

#### Mobile (480px-767px)
- [ ] Titre raccourci
- [ ] Onglets flexibles en grille
- [ ] Boutons de notification et utilisateur compacts
- [ ] Menu déroulant pleine largeur

#### Small Mobile (360px-479px)
- [ ] Interface ultra-compacte
- [ ] Éléments prioritaires seulement
- [ ] Touch targets >= 44px

### 2. Page d'accueil (HomePage)

#### Desktop
- [ ] Hero section avec 2 colonnes
- [ ] Grille d'actualités 3 colonnes
- [ ] Cartes d'actions 3 colonnes
- [ ] Animations fluides

#### Tablet
- [ ] Hero section 1 colonne
- [ ] Grille d'actualités 2 colonnes
- [ ] Cartes d'actions 2 colonnes

#### Mobile
- [ ] Tout en 1 colonne
- [ ] Statistiques centrées
- [ ] Cartes flottantes réduites
- [ ] Espacement optimisé

#### Small Mobile
- [ ] Cartes flottantes masquées
- [ ] Statistiques verticales
- [ ] Textes réduits

### 3. Page des actualités (NewsPage)

#### Desktop
- [ ] En-tête horizontal avec bouton
- [ ] Filtres en ligne
- [ ] Grille d'articles multiple colonnes

#### Tablet
- [ ] Grille 2 colonnes
- [ ] Filtres adaptés

#### Mobile
- [ ] En-tête vertical
- [ ] Filtres empilés
- [ ] Articles en 1 colonne
- [ ] Badges réduits

#### Small Mobile
- [ ] Onglets avec icônes seulement
- [ ] Interface ultra-compacte

### 4. Profil utilisateur (UserProfile)

#### Desktop
- [ ] Mise en page 2 colonnes
- [ ] Formulaires en grille
- [ ] Statistiques en 4 colonnes

#### Tablet/Mobile
- [ ] Mise en page 1 colonne
- [ ] En-tête centré
- [ ] Statistiques 2 colonnes puis 1

#### Small Mobile
- [ ] Avatar réduit
- [ ] Formulaires compacts
- [ ] Modals plein écran

### 5. Panneau de notifications

#### Desktop
- [ ] Panneau flottant positionné
- [ ] Largeur fixe

#### Mobile
- [ ] Panneau pleine largeur
- [ ] Position ajustée à la navbar
- [ ] Défilement optimisé

### 6. Formulaires (Login/Register)

#### Desktop
- [ ] Centré avec largeur max
- [ ] Sélecteur d'université en grille

#### Mobile
- [ ] Pleine largeur avec marges
- [ ] Sélecteur vertical
- [ ] Inputs avec taille >= 16px (évite le zoom iOS)

## Tests spéciaux

### Orientation paysage (Landscape)
- [ ] Navigation compacte
- [ ] Défilement horizontal pour onglets si nécessaire
- [ ] Modals avec hauteur limitée

### Appareils avec encoche (Notch)
- [ ] Safe area insets respectées
- [ ] Contenu non masqué par l'encoche

### Mode sombre
- [ ] Couleurs adaptées
- [ ] Contraste maintenu

### Accessibilité
- [ ] Touch targets >= 44px sur mobile
- [ ] Texte lisible (min 16px sur mobile)
- [ ] Contraste suffisant

### Performance
- [ ] Pas de débordement horizontal
- [ ] Scrollbars natives sur mobile
- [ ] Animations fluides ou désactivées selon préférences

## Outils de test recommandés

1. **Chrome DevTools**
   - Device simulation
   - Responsive design mode
   - Touch simulation

2. **Appareils réels**
   - iPhone SE (375px)
   - iPhone 12 (390px)
   - iPad (768px)
   - Android phones divers

3. **Tests automatisés**
   - Lighthouse pour performance
   - axe pour accessibilité

## Commandes de test

```bash
# Développement avec hot reload
npm run dev

# Build pour production
npm run build

# Preview du build
npm run preview
```

## Points de validation finale

- [ ] Aucun débordement horizontal sur aucun breakpoint
- [ ] Navigation fluide entre les breakpoints
- [ ] Contenu accessible et lisible à toutes les tailles
- [ ] Performance maintenue sur mobile
- [ ] Interactions tactiles optimisées
- [ ] Modals et dropdowns fonctionnels
- [ ] Print styles appliqués
- [ ] Support des préférences utilisateur (mouvement réduit, contraste élevé)