import { GoogleGenAI, Type } from '@google/genai'
import type { APIRoute } from 'astro'
import CryptoJS from 'crypto-js'

export const GET: APIRoute = async ({ request }) => {
  try {
    // 1. Basic Client Header Security
    if (request.headers.get('x-pasapalabra-client') !== 'true') {
      return new Response(JSON.stringify({ error: 'Acceso denegado. Cliente no válido.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 2. Strict Origin/Referer Validation (CORS)
    const url = new URL(request.url)
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    // En producción cambiar url.origin por la URL final (ej: https://tudominio.com)
    const allowedOrigin = import.meta.env.PROD ? url.origin : 'http://localhost:4321'

    if (
      (origin && !origin.startsWith(allowedOrigin)) ||
      (referer && !referer.startsWith(allowedOrigin))
    ) {
      return new Response(JSON.stringify({ error: 'Acceso denegado. Origen no autorizado.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 3. HMAC Cryptographic Validation (CSRF/Replay Protection)
    const secureToken = request.headers.get('x-secure-token')
    if (!secureToken || !secureToken.includes('.')) {
      return new Response(
        JSON.stringify({
          error: 'Acceso denegado. Token faltante o inválido.'
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const [timestampStr, signature] = secureToken.split('.')
    const timestamp = parseInt(timestampStr, 10)
    const now = Math.floor(Date.now() / 1000)

    // Reject tokens generated more than 5 minutes ago (300 seconds)
    if (isNaN(timestamp) || now - timestamp > 300) {
      return new Response(JSON.stringify({ error: 'Acceso denegado. Token expirado.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const secret = import.meta.env.API_SECRET_KEY
    if (!secret) {
      console.error('API_SECRET_KEY is missing in environment variables.')
      return new Response(
        JSON.stringify({
          error: 'Error del servidor. Configuración incompleta.'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const expectedSignature = CryptoJS.HmacSHA256(timestampStr, secret).toString(CryptoJS.enc.Hex)

    if (signature !== expectedSignature) {
      return new Response(JSON.stringify({ error: 'Acceso denegado. Firma inválida.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    // END SECURITY CHECKS

    const apiKey = import.meta.env.GEMINI_API_KEY

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const ai = new GoogleGenAI({ apiKey: apiKey })

    // We use gemini-2.5-flash as this is the only allowed model on the free tier for new API keys right now
    const systemInstruction = `
Eres un creador experto de roscos para el juego Pasapalabra en español.
Genera un rosco completo de 27 letras. Para hacer el juego más dinámico e impredecible, DEBES mezclar palabras que empiecen por la letra y palabras que la contengan. 
No uses solo "empieza por", atrévete a usar "contiene la" en varias letras comunes (ej. "contiene la A", "contiene la E") y obligatoriamente para letras raras como X, Y, Z.

Asegúrate de generar exactamente 27 objetos, uno para cada letra del abecedario español (A, B, C, D, E, F, G, H, I, J, L, M, N, Ñ, O, P, Q, R, S, T, U, V, X, Y, Z - puedes omitir K y W si es muy difícil, pero la longitud ideal es 25-27 letras).
La palabra ("word") debe ser una palabra válida en el diccionario español.
La definición ("definition") debe ser clara, concisa y referirse inequívocamente a la palabra.
`

    const prompt = 'Genera un nuevo rosco de nivel intermedio ahora.'

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: 'Lista de 27 letras del rosco de Pasapalabra.',
          items: {
            type: Type.OBJECT,
            properties: {
              letter: {
                type: Type.STRING,
                description: "Letra única del abecedario en mayúscula (ej: 'A', 'Ñ')."
              },
              word: {
                type: Type.STRING,
                description: 'La palabra a adivinar.'
              },
              definition: {
                type: Type.STRING,
                description: 'La definición estilo diccionario de la palabra.'
              },
              type: {
                type: Type.STRING,
                enum: ['STARTS_WITH', 'INCLUDES'],
                description:
                  'Si la palabra empieza por la letra (STARTS_WITH) o si simplemente la contiene en el medio (INCLUDES).'
              }
            },
            required: ['letter', 'word', 'definition', 'type']
          }
        }
      }
    })

    const text = response.text

    if (!text) {
      throw new Error('No text returned from Gemini API.')
    }

    // Safety check: parse the JSON to make sure it's valid before sending
    const parsedData = JSON.parse(text)

    return new Response(JSON.stringify(parsedData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (err: unknown) {
    const error = err as Error
    console.error('Error generating rosco:', error)

    // Detect Gemini Rate Limits and Quota Exceeded (429)
    let errorMessage = error.message || 'Error interno al comunicarse con Gemini.'
    let statusCode = 500

    if (
      errorMessage.includes('429') ||
      errorMessage.toLowerCase().includes('quota') ||
      errorMessage.toLowerCase().includes('rate limit')
    ) {
      errorMessage =
        '⚠️ Has agotado tu límite gratuito diario de peticiones a Gemini (20 roscos). ¡Vuelve a intentarlo mañana!'
      statusCode = 429
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
