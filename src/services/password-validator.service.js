/**
 * Service de validation des mots de passe selon les standards Django
 * Implémente les contraintes de sécurité par défaut de Django
 */

export class PasswordValidatorService {
  constructor() {
    // Configuration des contraintes Django par défaut
    this.config = {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false, // Django n'exige pas forcément de caractères spéciaux
      commonPasswords: [
        'password', 'password123', '123456', '123456789', 'qwerty',
        'abc123', 'password1', 'admin', 'letmein', 'welcome', 'monkey',
        'dragon', 'master', 'hello', 'freedom', 'whatever', 'qazwsx',
        'trustno1', 'jordan23', 'harley', 'password!'
      ]
    }
  }

  /**
   * Valide un mot de passe selon les règles Django
   * @param {string} password - Le mot de passe à valider
   * @param {Object} userData - Données utilisateur pour éviter les mots de passe similaires
   * @returns {Object} - { isValid: boolean, errors: string[] }
   */
  validate(password, userData = {}) {
    const errors = []

    // 1. Validation de la longueur minimale
    if (!this.validateMinLength(password)) {
      errors.push(`Le mot de passe doit contenir au moins ${this.config.minLength} caractères`)
    }

    // 2. Validation des mots de passe trop communs
    if (!this.validateCommonPasswords(password)) {
      errors.push('Ce mot de passe est trop commun')
    }

    // 3. Validation que le mot de passe n'est pas entièrement numérique
    if (!this.validateNotNumericOnly(password)) {
      errors.push('Le mot de passe ne peut pas être entièrement numérique')
    }

    // 4. Validation de la similarité avec les données utilisateur
    const similarityErrors = this.validateUserSimilarity(password, userData)
    errors.push(...similarityErrors)

    // 5. Validations de complexité (optionnelles mais recommandées)
    const complexityErrors = this.validateComplexity(password)
    errors.push(...complexityErrors)

    return {
      isValid: errors.length === 0,
      errors: errors
    }
  }

  /**
   * Validation de la longueur minimale
   */
  validateMinLength(password) {
    return password && password.length >= this.config.minLength
  }

  /**
   * Validation contre les mots de passe communs
   */
  validateCommonPasswords(password) {
    const lowerPassword = password.toLowerCase()
    return !this.config.commonPasswords.some(common => 
      lowerPassword.includes(common.toLowerCase())
    )
  }

  /**
   * Validation que le mot de passe n'est pas entièrement numérique
   */
  validateNotNumericOnly(password) {
    return !/^\d+$/.test(password)
  }

  /**
   * Validation de la similarité avec les données utilisateur
   */
  validateUserSimilarity(password, userData) {
    const errors = []
    const lowerPassword = password.toLowerCase()

    // Vérifier la similarité avec le nom d'utilisateur/email
    if (userData.email) {
      const emailPart = userData.email.split('@')[0].toLowerCase()
      if (emailPart.length > 3 && lowerPassword.includes(emailPart)) {
        errors.push('Le mot de passe ne peut pas être trop similaire à votre adresse email')
      }
    }

    // Vérifier la similarité avec le prénom/nom
    if (userData.first_name && userData.first_name.length > 2) {
      if (lowerPassword.includes(userData.first_name.toLowerCase())) {
        errors.push('Le mot de passe ne peut pas contenir votre prénom')
      }
    }

    if (userData.last_name && userData.last_name.length > 2) {
      if (lowerPassword.includes(userData.last_name.toLowerCase())) {
        errors.push('Le mot de passe ne peut pas contenir votre nom de famille')
      }
    }

    return errors
  }

  /**
   * Validation de la complexité (règles supplémentaires)
   */
  validateComplexity(password) {
    const errors = []

    // Au moins une lettre majuscule
    if (this.config.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une lettre majuscule')
    }

    // Au moins une lettre minuscule
    if (this.config.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une lettre minuscule')
    }

    // Au moins un chiffre
    if (this.config.requireNumbers && !/\d/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre')
    }

    // Au moins un caractère spécial (optionnel)
    if (this.config.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial')
    }

    return errors
  }

  /**
   * Validation en temps réel pour l'affichage progressif
   */
  validateRealTime(password, userData = {}) {
    const checks = {
      minLength: this.validateMinLength(password),
      notNumericOnly: this.validateNotNumericOnly(password),
      notCommon: this.validateCommonPasswords(password),
      hasUppercase: this.config.requireUppercase ? /[A-Z]/.test(password) : true,
      hasLowercase: this.config.requireLowercase ? /[a-z]/.test(password) : true,
      hasNumbers: this.config.requireNumbers ? /\d/.test(password) : true,
      notSimilarToUser: this.validateUserSimilarity(password, userData).length === 0
    }

    const strength = this.calculatePasswordStrength(password, checks)

    return {
      checks,
      strength,
      isValid: Object.values(checks).every(check => check === true)
    }
  }

  /**
   * Calcule la force du mot de passe (0-100)
   */
  calculatePasswordStrength(password, checks = null) {
    if (!password) return 0

    if (!checks) {
      const validation = this.validateRealTime(password)
      checks = validation.checks
    }

    let score = 0
    const maxScore = 100

    // Points pour chaque critère respecté
    if (checks.minLength) score += 20
    if (checks.notNumericOnly) score += 15
    if (checks.notCommon) score += 15
    if (checks.hasUppercase) score += 15
    if (checks.hasLowercase) score += 15
    if (checks.hasNumbers) score += 10
    if (checks.notSimilarToUser) score += 10

    // Bonus pour la longueur supplémentaire
    if (password.length > 12) score += 10
    if (password.length > 16) score += 5

    // Bonus pour les caractères spéciaux
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 5

    return Math.min(score, maxScore)
  }

  /**
   * Retourne le niveau de force du mot de passe
   */
  getPasswordStrengthLevel(strength) {
    if (strength < 30) return { level: 'weak', label: 'Faible', color: '#ef4444' }
    if (strength < 60) return { level: 'medium', label: 'Moyen', color: '#f97316' }
    if (strength < 80) return { level: 'strong', label: 'Fort', color: '#eab308' }
    return { level: 'very-strong', label: 'Très fort', color: '#22c55e' }
  }
}

// Instance exportée
export const passwordValidator = new PasswordValidatorService()