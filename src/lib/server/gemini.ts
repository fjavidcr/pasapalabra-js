import { GoogleGenAI, Type } from '@google/genai'
import { GEMINI_API_KEY } from 'astro:env/server'
import { DEFAULT_MODEL_ID } from '$lib/config/models'
import { validateSecureToken } from '$lib/server/security'

export async function generateRoscoWords(formData: FormData) {
  const secureToken = formData.get('secureToken') as string
  const modelId = (formData.get('modelId') as string) || DEFAULT_MODEL_ID
  const difficulty = (formData.get('difficulty') as string) || 'medium'

  // Validar token antes de gastar recursos de la API
  validateSecureToken(secureToken)

  console.log(
    `--- GEMINI AI: Generating new rosco with model ${modelId} and difficulty ${difficulty} ---`
  )

  const apiKey = GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.')
  }

  const ai = new GoogleGenAI({ apiKey: apiKey })

  const difficultyInstructions = {
    easy: 'Usa palabras muy comunes, nombres de objetos cotidianos, animales o verbos simples. Las definiciones deben ser directas y fáciles de entender para cualquier persona.',
    medium:
      'Usa un nivel de vocabulario estándar de cultura general. Mezcla palabras comunes con algunas más específicas pero conocidas.',
    hard: 'Usa palabras poco frecuentes, técnicas, literarias o cultas. Las definiciones pueden ser más complejas, precisas y desafiantes.'
  }

  const systemInstruction = `
Eres un creador experto de roscos para el juego Pasapalabra en español.
Genera un rosco completo de 27 letras (A-Z, incluyendo Ñ).
NIVEL DE DIFICULTAD: ${difficulty.toUpperCase()}.
Instrucciones de nivel: ${difficultyInstructions[difficulty as keyof typeof difficultyInstructions] || difficultyInstructions.medium}

REGLAS CRÍTICAS:
1. Dinamismo: Mezcla palabras que "EMPIEZA POR" y palabras que "CONTIENE LA" de forma variada en todo el rosco.
2. Letras raras: Para letras como X, Y, Z, Q, J, siempre intenta combinaciones creativas (ej: "CONTIENE LA X").
3. NO REPETICIÓN: Bajo ninguna circunstancia repitas la misma palabra en el mismo rosco.
4. VARIEDAD HISTÓRICA: Evita las palabras más obvias o "clichés" de Pasapalabra (como "Abdomen" para la A o "Zulo" para la Z). Busca palabras frescas y originales que no se hayan usado recientemente en tus respuestas anteriores.
5. Formato: Genera exactamente 27 objetos, uno para cada letra (A, B, C, D, E, F, G, H, I, J, K, L, M, N, Ñ, O, P, Q, R, S, T, U, V, W, X, Y, Z). Si K o W son muy difíciles, usa "CONTIENE LA".
6. DEFINICIONES: Deben ser rigurosas pero adecuadas al nivel de dificultad seleccionado.
`
  const prompt = `Genera un rosco de Pasapalabra de nivel ${difficulty} con palabras variadas y originales.`

  try {
    const result = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.9, // Aumentada ligeramente para más variedad
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

    const text = result.text

    if (!text) {
      throw new Error('No text returned from Gemini API.')
    }

    return JSON.parse(text)
  } catch (err: unknown) {
    const error = err as Error
    console.error('Error generating rosco:', error)
    let errorMessage = error.message || 'Error interno al comunicarse con Gemini.'
    if (
      errorMessage.includes('429') ||
      errorMessage.toLowerCase().includes('quota') ||
      errorMessage.toLowerCase().includes('rate limit')
    ) {
      errorMessage = `[QUOTA_EXHAUSTED:${modelId}] ⚠️ Has agotado el límite para el modelo ${modelId}. Por favor, selecciona otro modelo.`
    }
    throw new Error(errorMessage, { cause: err })
  }
}
