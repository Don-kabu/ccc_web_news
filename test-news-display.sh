#!/bin/bash

echo "🧪 Test d'affichage des actualités publiées"
echo "=========================================="

echo "🔧 Corrections apportées:"
echo "1. ✅ Permissions corrigées par rôle"
echo "2. ✅ Articles ADMIN/MODERATOR automatiquement approuvés"
echo "3. ✅ Affichage des articles selon le rôle utilisateur"
echo "4. ✅ Badges de statut ajoutés"
echo ""

echo "📊 Règles d'affichage des news:"
echo "-------------------------------"
echo "👨‍💼 ADMIN: Voit tous les articles (pending + approved + rejected)"
echo "🛡️  MODERATOR: Voit tous les articles (pending + approved + rejected)"
echo "✍️  PUBLIANT: Voit articles approuvés + ses propres articles"
echo "🎓 STUDENT: Voit articles approuvés + ses propres articles"
echo ""

echo "📝 Statuts d'articles:"
echo "----------------------"
echo "🟡 PENDING: En attente de modération"
echo "🟢 APPROVED: Publié et visible"
echo "🔴 REJECTED: Rejeté par modération"
echo ""

echo "🌐 Application disponible sur: http://localhost:5174"
echo ""

echo "📋 Script de test à exécuter dans la console navigateur:"
echo "========================================================"

cat << 'EOF'
// Nettoyer et créer des données de test
localStorage.removeItem('ccc_news');

// Créer des utilisateurs test
const adminUser = {
  id: 1,
  first_name: "Admin",
  last_name: "Test",
  role: "ADMIN",
  university_id: 1
};

const publiantUser = {
  id: 2,
  first_name: "Publiant",
  last_name: "Test", 
  role: "PUBLIANT",
  university_id: 1
};

const studentUser = {
  id: 3,
  first_name: "Student",
  last_name: "Test",
  role: "STUDENT", 
  university_id: 1
};

// Créer des articles de test avec différents statuts
const testNews = [
  {
    id: 1,
    title: "Article Admin (Auto-approuvé)",
    content: "Cet article a été publié par un administrateur et est automatiquement approuvé.",
    category: "moyenne",
    organization_level: "university",
    status: "approved",
    author: adminUser,
    created_at: new Date().toISOString(),
    university_id: 1,
    likes: 0,
    views: 0
  },
  {
    id: 2,
    title: "Article Publiant (En attente)",
    content: "Cet article a été publié par un publiant et est en attente de modération.",
    category: "faible",
    organization_level: "faculty",
    status: "pending",
    author: publiantUser,
    created_at: new Date().toISOString(),
    university_id: 1,
    likes: 0,
    views: 0
  },
  {
    id: 3,
    title: "Article Student (En attente)",
    content: "Cet article a été publié par un étudiant et est en attente de modération.",
    category: "importante",
    organization_level: "department",
    status: "pending",
    author: studentUser,
    created_at: new Date().toISOString(),
    university_id: 1,
    likes: 0,
    views: 0
  },
  {
    id: 4,
    title: "Article Approuvé",
    content: "Cet article a été approuvé par un modérateur.",
    category: "urgente",
    organization_level: "university",
    status: "approved",
    author: publiantUser,
    created_at: new Date().toISOString(),
    university_id: 1,
    likes: 0,
    views: 0
  },
  {
    id: 5,
    title: "Article Rejeté",
    content: "Cet article a été rejeté par un modérateur.",
    category: "moyenne",
    organization_level: "faculty",
    status: "rejected",
    author: publiantUser,
    created_at: new Date().toISOString(),
    university_id: 1,
    likes: 0,
    views: 0
  }
];

// Sauvegarder les articles
localStorage.setItem('ccc_news', JSON.stringify(testNews));

console.log('✅ Articles de test créés:', testNews.length);

// Test avec différents utilisateurs
function testNewsVisibility(user) {
  console.log(`\n🔍 Test avec utilisateur ${user.role}: ${user.first_name} ${user.last_name}`);
  
  const saved = JSON.parse(localStorage.getItem('ccc_news') || '[]');
  let visibleNews;
  
  if (['ADMIN', 'MODERATOR'].includes(user.role)) {
    visibleNews = saved;
    console.log(`  👀 Voit tous les articles (${visibleNews.length})`);
  } else {
    visibleNews = saved.filter(article => {
      return article.status === 'approved' || article.author.id === user.id;
    });
    console.log(`  👀 Voit ${visibleNews.length} articles`);
  }
  
  visibleNews.forEach(article => {
    console.log(`    - "${article.title}" (${article.status}) par ${article.author.first_name}`);
  });
  
  return visibleNews;
}

// Tester avec chaque type d'utilisateur
testNewsVisibility(adminUser);
testNewsVisibility(publiantUser);
testNewsVisibility(studentUser);

console.log('\n🎯 Pour tester dans l\'interface:');
console.log('1. Connectez-vous avec différents utilisateurs');
console.log('2. Allez dans l\'onglet "Actualités"');
console.log('3. Vérifiez les badges de statut des articles');
console.log('4. Testez la publication d\'un nouvel article');

// Simuler connexion admin pour voir tous les articles
localStorage.setItem('ccc_currentUser', JSON.stringify(adminUser));
console.log('\n✅ Connecté en tant qu\'Admin - Rechargez la page pour voir tous les articles');
EOF

echo ""
echo "🔄 Instructions de test manuel:"
echo "1. Ouvrir http://localhost:5174"
echo "2. Copier-coller le script ci-dessus dans la console (F12)"
echo "3. Recharger la page (F5)"
echo "4. Aller dans l'onglet 'Actualités'"
echo "5. Vérifier que les articles s'affichent avec leurs badges de statut"
echo "6. Tester la publication d'un nouvel article"
echo ""
echo "🎯 Résultat attendu:"
echo "- Articles avec badges de statut colorés"
echo "- Admin voit tous les articles"
echo "- Articles Admin/Moderator auto-approuvés"
echo "- Publiant/Student voient leurs articles + articles approuvés"