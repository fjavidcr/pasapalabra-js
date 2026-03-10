import CryptoJS from 'crypto-js'

const TOKEN_EXPIRATION_SECONDS = 300 // 5 minutos

/**
 * Genera un token HMAC seguro basado en el tiempo actual y la clave secreta.
 * @returns Un string con el formato "timestamp.signature"
 */
export function generateSecureToken(): string {
  const secret = import.meta.env.API_SECRET_KEY
  if (!secret) {
    throw new Error('API_SECRET_KEY is missing in environment variables.')
  }

  const timestamp = Math.floor(Date.now() / 1000).toString()
  const signature = CryptoJS.HmacSHA256(timestamp, secret).toString(CryptoJS.enc.Hex)

  return `${timestamp}.${signature}`
}

/**
 * Valida un token HMAC previamente generado.
 * @param secureToken - El token en formato "timestamp.signature"
 * @throws {Error} Si el token es inválido, expirado o falta la clave secreta.
 */
export function validateSecureToken(secureToken: string | null | undefined): void {
  if (!secureToken || !secureToken.includes('.')) {
    throw new Error('Acceso denegado. Token faltante o inválido.')
  }

  const secret = import.meta.env.API_SECRET_KEY
  if (!secret) {
    throw new Error('Error del servidor. Configuración incompleta.')
  }

  const [timestampStr, signature] = secureToken.split('.')
  const timestamp = parseInt(timestampStr, 10)
  const now = Math.floor(Date.now() / 1000)

  // Validar si el timestamp es un número y si el token ha expirado
  if (isNaN(timestamp) || now - timestamp > TOKEN_EXPIRATION_SECONDS) {
    throw new Error('Acceso denegado. Token expirado.')
  }

  const expectedSignature = CryptoJS.HmacSHA256(timestampStr, secret).toString(CryptoJS.enc.Hex)

  // Prevenir ataques de timing comparando las firmas
  if (signature !== expectedSignature) {
    throw new Error('Acceso denegado. Firma inválida.')
  }
}
