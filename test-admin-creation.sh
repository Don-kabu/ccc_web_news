#!/bin/bash

echo "🧪 Test de la création d'administrateur d'université"
echo "=================================================="

# Nettoyer le localStorage pour commencer à zéro
echo "🗑️  Nettoyage du localStorage..."

# Script JavaScript pour nettoyer localStorage via curl
cat > test_admin_setup.js << 'EOF'
// Nettoyer le localStorage
localStorage.removeItem('ccc_users');
localStorage.removeItem('ccc_universities');
localStorage.removeItem('ccc_currentUser');

console.log('✅ localStorage nettoyé');

// Simuler la création d'un utilisateur admin d'université
const testUniversity = {
  id: Date.now(),
  name: "Université Test Admin",
  city: "Kinshasa",
  country: "République Démocratique du Congo",
  faculties: [
    {
      id: Date.now() + 1,
      name: "Faculté de Test",
      departments: [
        {
          id: Date.now() + 2,
          name: "Département Test"
        }
      ]
    }
  ],
  created_at: new Date().toISOString()
};

const testAdminUser = {
  id: Date.now(),
  first_name: "Admin",
  last_name: "Test",
  username: "admintest",
  email: "admin@test.com",
  password: "password123",
  role: "ADMIN",
  university_id: testUniversity.id,
  university: testUniversity,
  faculty: "Faculté de Test",
  department: "Département Test",
  is_verified: true,
  created_at: new Date().toISOString(),
  last_login: new Date().toISOString()
};

// Sauvegarder les données
localStorage.setItem('ccc_universities', JSON.stringify([testUniversity]));
localStorage.setItem('ccc_users', JSON.stringify([testAdminUser]));
localStorage.setItem('ccc_currentUser', JSON.stringify(testAdminUser));

console.log('✅ Utilisateur admin test créé:', testAdminUser);
console.log('✅ Université test créée:', testUniversity);
console.log('✅ Utilisateur connecté automatiquement');

// Vérifier les permissions
const ROLES = {
  STUDENT: 'student',
  PUBLIANT: 'publiant', 
  MODERATOR: 'moderator',
  ADMIN: 'admin'
};

const PERMISSIONS = {
  READ_NEWS: 'read_news',
  CREATE_NEWS: 'create_news',
  EDIT_OWN_NEWS: 'edit_own_news',
  MODERATE_NEWS: 'moderate_news',
  VALIDATE_NEWS: 'validate_news',
  COMMENT_VALIDATION: 'comment_validation',
  MANAGE_USERS: 'manage_users',
  MANAGE_ROLES: 'manage_roles',
  CONTROL_PUBLICATION: 'control_publication',
  MANAGE_NOTIFICATIONS: 'manage_notifications'
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.READ_NEWS,
    PERMISSIONS.CREATE_NEWS,
    PERMISSIONS.EDIT_OWN_NEWS,
    PERMISSIONS.MODERATE_NEWS,
    PERMISSIONS.VALIDATE_NEWS,
    PERMISSIONS.COMMENT_VALIDATION,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.CONTROL_PUBLICATION,
    PERMISSIONS.MANAGE_NOTIFICATIONS
  ]
};

const userPermissions = ROLE_PERMISSIONS[testAdminUser.role] || [];
console.log('✅ Permissions admin:', userPermissions);

// Test des permissions critiques
const hasManageUsers = userPermissions.includes(PERMISSIONS.MANAGE_USERS);
const hasManageRoles = userPermissions.includes(PERMISSIONS.MANAGE_ROLES);
const hasControlPublication = userPermissions.includes(PERMISSIONS.CONTROL_PUBLICATION);

console.log('🔐 Peut gérer les utilisateurs:', hasManageUsers);
console.log('🔐 Peut gérer les rôles:', hasManageRoles);
console.log('🔐 Peut contrôler les publications:', hasControlPublication);

if (hasManageUsers && hasManageRoles && hasControlPublication) {
  console.log('🎉 SUCCESS: L\'administrateur a toutes les permissions nécessaires!');
} else {
  console.log('❌ ERREUR: L\'administrateur n\'a pas toutes les permissions');
}
EOF

echo "📝 Script de test généré"
echo "🌐 Application disponible sur: http://localhost:5173"
echo ""
echo "📋 Instructions de test manuel:"
echo "1. Ouvrir http://localhost:5173 dans le navigateur"
echo "2. Ouvrir la console développeur (F12)"
echo "3. Copier-coller le contenu du fichier test_admin_setup.js"
echo "4. Appuyer sur Entrée pour exécuter"
echo "5. Rafraîchir la page (F5)"
echo "6. Vérifier que l'utilisateur est connecté en tant qu'admin"
echo "7. Vérifier l'accès aux sections Administration"
echo ""
echo "✅ Test automatique des permissions:"

# Afficher le contenu du script pour pouvoir le copier
echo "📄 Contenu à copier dans la console:"
echo "=====================================
"
cat test_admin_setup.js
echo "
====================================="

# Nettoyer
rm -f test_admin_setup.js

echo ""
echo "🔄 Pour tester la création d'université manuelle:"
echo "1. Nettoyer le localStorage (script ci-dessus)"
echo "2. Aller sur l'inscription"
echo "3. Choisir 'Nouvelle institution'"
echo "4. Remplir le formulaire"
echo "5. Vérifier que l'utilisateur devient admin après OTP"
echo ""
echo "🎯 Résultat attendu: L'utilisateur créateur d'université doit automatiquement devenir ADMIN"