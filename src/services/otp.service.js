/**
 * Service de gestion des OTP (One-Time Password)
 * Gère l'envoi et la vérification des codes OTP par email
 */

import { httpService } from './http.service.js'
import { API_ENDPOINTS, createApiResponse, API_RESPONSE_TYPES } from './api.config.js'

export class OtpService {
  constructor() {
    this.sentOtps = new Map() // Stockage temporaire des OTP côté frontend
  }

  /**
   * Génère un code OTP côté frontend et l'envoie au backend
   * Le frontend génère l'OTP et l'envoie avec l'email au backend
   * @param {string} email - L'adresse email
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async sendOtp(email) {
    try {
      const cleanEmail = email.trim().toLowerCase()
      console.log(`📧 Génération et envoi OTP vers ${cleanEmail}`)

      // Générer l'OTP côté frontend
      const otpCode = this.generateOtpCode()
      
      // Préparer les données exactement selon le format demandé (sans "type")
      const otpData = {
        email: cleanEmail,
        otp_code: otpCode
      }

      console.log('📤 Données OTP générées:', otpData)

      // Envoyer au backend avec le format exact
      const response = await httpService.post(API_ENDPOINTS.AUTH.SEND_OTP, otpData)

      if (response.success || response.status === 'success') {
        // Stocker les informations de l'OTP côté frontend pour le suivi
        const localOtpData = {
          email: cleanEmail,
          otp_code: otpCode,
          timestamp: Date.now(),
          attempts: 0,
          maxAttempts: 3,
          expiresIn: 5 * 60 * 1000, // 5 minutes
          sent: true
        }

        this.sentOtps.set(cleanEmail, localOtpData)

        console.log('✅ OTP généré et envoyé avec succès:', {
          email: cleanEmail,
          code: otpCode // Log pour debug (à retirer en production)
        })

        return createApiResponse(API_RESPONSE_TYPES.SUCCESS, {
          email: cleanEmail,
          message: 'Code OTP envoyé avec succès. Vérifiez votre boîte email.',
          expiresIn: 300 // 5 minutes en secondes
        })
      } else if(response.status === 409) {
        // Erreur 409 (conflit) - extraire le message de response.data
        let message = response.data.message || 'Un conflit est survenu'
        
        throw new Error(message)  
        
      }
      else {
        throw new Error(response.message || 'Erreur lors de l\'envoi de l\'OTP')
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'OTP:', error)
      
      if (error.status === 400) {
        throw new Error('Adresse email invalide')
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
      } else if (error.status === 429) {
        throw new Error('Trop de tentatives. Veuillez patienter avant de réessayer.')
      } else if (error.status >= 500) {
        throw new Error('Erreur serveur. Veuillez réessayer plus tard.')
      } else {
        throw new Error(error.message || 'Impossible d\'envoyer le code OTP')
      }
    }
  }

  /**
   * Vérifie un code OTP côté frontend uniquement
   * @param {string} email - L'adresse email
   * @param {string} otpCode - Le code OTP saisi par l'utilisateur
   * @returns {Promise<Object>} - Résultat de la vérification
   */
  async verifyOtp(email, otpCode) {
    try {
      const emailKey = email.trim().toLowerCase()
      const storedOtp = this.sentOtps.get(emailKey)

      if (!storedOtp || !storedOtp.sent) {
        throw new Error('Aucun code OTP trouvé pour cet email. Veuillez en demander un nouveau.')
      }

      // Vérifier l'expiration côté client
      if (Date.now() > storedOtp.timestamp + storedOtp.expiresIn) {
        this.sentOtps.delete(emailKey)
        throw new Error('Le code OTP a expiré. Veuillez en demander un nouveau.')
      }

      // Vérifier le nombre de tentatives côté client
      if (storedOtp.attempts >= storedOtp.maxAttempts) {
        this.sentOtps.delete(emailKey)
        throw new Error('Trop de tentatives incorrectes. Veuillez demander un nouveau code.')
      }

      // Vérification côté frontend uniquement
      console.log(`🔐 Vérification OTP côté frontend pour ${email}`)
      console.log(`📋 Code attendu: ${storedOtp.otp_code}, Code saisi: ${otpCode.trim()}`)
      
      if (storedOtp.otp_code !== otpCode.trim()) {
        storedOtp.attempts++
        const remainingAttempts = storedOtp.maxAttempts - storedOtp.attempts
        
        console.log(`❌ Code incorrect. Tentatives restantes: ${remainingAttempts}`)
        
        if (remainingAttempts <= 0) {
          this.sentOtps.delete(emailKey)
          throw new Error('Code incorrect. Trop de tentatives. Veuillez demander un nouveau code.')
        } else {
          throw new Error(`Code incorrect. Il vous reste ${remainingAttempts} tentative(s).`)
        }
      }

      // Le code est correct côté frontend - pas d'appel backend
      console.log('✅ Code OTP vérifié avec succès côté frontend pour:', email)
      
      // Marquer l'email comme vérifié
      this.markEmailAsVerified(email)

      return createApiResponse(API_RESPONSE_TYPES.SUCCESS, {
        email: email,
        verified: true,
        message: 'Email vérifié avec succès'
      })

    } catch (error) {
      console.error('❌ Erreur lors de la vérification de l\'OTP:', error)
      throw error
    }
  }

  /**
   * Génère un code OTP aléatoire à 6 chiffres
   * @returns {string} - Code OTP à 6 chiffres (ex: "202349")
   */
  generateOtpCode() {
    // Générer un nombre entre 100000 et 999999 pour garantir 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    console.log('🔢 Code OTP généré:', code)
    return code
  }

  /**
   * Vérifie si un email a un OTP en attente
   * @param {string} email - L'adresse email
   * @returns {boolean} - True si un OTP est en attente
   */
  hasActiveOtp(email) {
    const emailKey = email.trim().toLowerCase()
    const storedOtp = this.sentOtps.get(emailKey)
    
    if (!storedOtp || !storedOtp.sent) return false
    
    // Vérifier si le code n'a pas expiré
    return Date.now() <= storedOtp.timestamp + storedOtp.expiresIn
  }

  /**
   * Marque un email comme vérifié avec OTP
   * @param {string} email - L'adresse email
   */
  markEmailAsVerified(email) {
    const emailKey = email.trim().toLowerCase()
    
    // Stocker que l'email a été vérifié (pour validation avant enregistrement)
    const verifiedData = {
      email: emailKey,
      verified: true,
      verifiedAt: Date.now(),
      expiresAt: Date.now() + (30 * 60 * 1000) // Valide 30 minutes pour l'enregistrement
    }

    // Utiliser une clé différente pour les emails vérifiés
    this.sentOtps.set(`verified_${emailKey}`, verifiedData)
    
    // Supprimer l'OTP en attente
    this.sentOtps.delete(emailKey)
    
    console.log('✅ Email marqué comme vérifié:', email)
  }

  /**
   * Vérifie si un email a été validé avec OTP et est prêt pour l'enregistrement
   * @param {string} email - L'adresse email
   * @returns {boolean} - True si l'email est vérifié et valide
   */
  isEmailVerifiedForRegistration(email) {
    const emailKey = email.trim().toLowerCase()
    const verifiedData = this.sentOtps.get(`verified_${emailKey}`)
    
    if (!verifiedData || !verifiedData.verified) {
      return false
    }
    
    // Vérifier si la vérification n'a pas expiré
    if (Date.now() > verifiedData.expiresAt) {
      this.sentOtps.delete(`verified_${emailKey}`)
      return false
    }
    
    return true
  }

  /**
   * Obtient le temps restant pour un OTP
   * @param {string} email - L'adresse email
   * @returns {number} - Temps restant en secondes (0 si expiré/inexistant)
   */
  getOtpRemainingTime(email) {
    const emailKey = email.trim().toLowerCase()
    const storedOtp = this.sentOtps.get(emailKey)
    
    if (!storedOtp) return 0
    
    const remaining = storedOtp.timestamp + storedOtp.expiresIn - Date.now()
    return Math.max(0, Math.floor(remaining / 1000))
  }

  /**
   * Annule un OTP en cours
   * @param {string} email - L'adresse email
   */
  cancelOtp(email) {
    const emailKey = email.trim().toLowerCase()
    this.sentOtps.delete(emailKey)
    console.log('🚫 OTP annulé pour:', email)
  }

  /**
   * Nettoie les OTP expirés (à appeler périodiquement)
   */
  cleanExpiredOtps() {
    const now = Date.now()
    let cleaned = 0

    for (const [email, otpData] of this.sentOtps.entries()) {
      if (now > otpData.timestamp + otpData.expiresIn) {
        this.sentOtps.delete(email)
        cleaned++
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 ${cleaned} OTP expirés nettoyés`)
    }
  }
}

// Instance exportée
export const otpService = new OtpService()

// Nettoyer les OTP expirés toutes les minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    otpService.cleanExpiredOtps()
  }, 60000) // 1 minute
}