import { API_SECRET_KEY } from 'astro:env/server'
import CryptoJS from 'crypto-js'

const TOKEN_EXPIRATION_SECONDS = 3600 // 60 minutos

/**
 * Genera un token HMAC seguro basado en el tiempo actual y la clave secreta.
 * @returns Un string con el formato "timestamp.signature"
 */
export function generateSecureToken(): string {
  const secret = API_SECRET_KEY
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

  const secret = API_SECRET_KEY
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

/**
 * Valida que una request a la API interna sea legítima.
 * Aplica 3 capas: header de cliente, origen/referer, y token HMAC.
 * @returns `null` si la request es válida, o un `Response` de error listo para devolver.
 */
export function validateApiRequest(request: Request): Response | null {
  const json = (msg: string, status: number) =>
    new Response(JSON.stringify({ error: msg }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    })

  // 1. Header de cliente personalizado
  if (request.headers.get('x-pasapalabra-client') !== 'true') {
    return json('Acceso denegado. Cliente no válido.', 403)
  }

  // 2. Validación de origen/referer
  const url = new URL(request.url)
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const allowedOrigin = import.meta.env.PROD ? url.origin : 'http://localhost:4321'

  if (
    (origin && !origin.startsWith(allowedOrigin)) ||
    (referer && !referer.startsWith(allowedOrigin))
  ) {
    return json('Acceso denegado. Origen no autorizado.', 403)
  }

  // 3. Token HMAC
  try {
    validateSecureToken(request.headers.get('x-secure-token'))
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Token inválido.'
    return json(msg, 401)
  }

  return null
}
