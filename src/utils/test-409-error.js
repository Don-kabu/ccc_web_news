/**
 * Test de la gestion d'erreur 409 avec response.data
 * Ce fichier sert d'exemple pour comprendre comment l'erreur 409 est gérée
 */

// Simulation d'une réponse 409 avec différentes structures
const mockError409Examples = {
  // Structure 1: data est une string
  example1: {
    status: 409,
    response: {
      data: "Un utilisateur avec cet email existe déjà. Veuillez en utiliser un autre."
    }
  },
  
  // Structure 2: data est un objet avec message
  example2: {
    status: 409,
    response: {
      data: {
        message: "Conflit détecté: l'email est déjà associé à un compte existant",
        code: "EMAIL_ALREADY_EXISTS",
        field: "email"
      }
    }
  },
  
  // Structure 3: message directement dans response
  example3: {
    status: 409,
    response: {
      message: "Ressource en conflit avec une existante"
    }
  },

  // Structure 4: format API standardisé
  example4: {
    status: 409,
    response: {
      status: 'conflict',
      data: 'Email déjà utilisé par un autre compte',
      message: 'Conflit de ressource',
      errors: {
        email: 'Cette adresse email est déjà prise'
      },
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Fonction pour tester l'extraction du message d'erreur 409
 */
export function extractError409Message(error) {
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
  
  return message
}

// Test des exemples
console.log('🧪 Test de gestion des erreurs 409:')
Object.entries(mockError409Examples).forEach(([key, errorExample]) => {
  const extractedMessage = extractError409Message(errorExample)
  console.log(`${key}: "${extractedMessage}"`)
})

export { mockError409Examples }