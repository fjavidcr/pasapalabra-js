import { GoogleGenAI, Type } from '@google/genai'
import { GEMINI_API_KEY } from 'astro:env/server'
import { DEFAULT_MODEL_ID } from '$lib/config/models'
import { validateSecureToken } from '$lib/server/security'

export async function generateRoscoWords(formData: FormData) {
  const secureToken = formData.get('secureToken') as string
  const modelId = (formData.get('modelId') as string) || DEFAULT_MODEL_ID
  const difficulty = (formData.get('difficulty') as string) || 'medium'
  const category = (formData.get('category') as string) || 'general'

  // Validar token antes de gastar recursos de la API
  validateSecureToken(secureToken)

  // Sanitización básica de la categoría para evitar inyecciones o contenido ofensivo
  const sanitizedCategory =
    category === 'general'
      ? 'cultura general'
      : category.trim().substring(0, 50).replace(/[<>]/g, '')

  console.log(
    `--- GEMINI AI: Generating rosco | Model: ${modelId} | Difficulty: ${difficulty} | Category: ${sanitizedCategory} ---`
  )

  const apiKey = GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.')
  }

  const ai = new GoogleGenAI({ apiKey: apiKey })

  const difficultyInstructions = {
    easy: 'Usa palabras muy comunes, nombres de objetos cotidianos, animales o verbos simples. Las definiciones deben ser directas y fáciles de entender.',
    medium:
      'Usa un nivel de vocabulario estándar de cultura general. Mezcla palabras comunes con algunas más específicas.',
    hard: 'Usa palabras poco frecuentes, técnicas, literarias o cultas. Las definiciones pueden ser desafiantes y precisas.'
  }

  const systemInstruction = `
Eres un creador experto de roscos para el juego Pasapalabra en español.
Genera un rosco completo de 27 letras (A-Z, incluyendo Ñ).

CONTEXTO DEL ROSCO:
- NIVEL DE DIFICULTAD: ${difficulty.toUpperCase()}.
- TEMÁTICA/CATEGORÍA: ${sanitizedCategory.toUpperCase()}.
- Instrucciones de nivel: ${difficultyInstructions[difficulty as keyof typeof difficultyInstructions] || difficultyInstructions.medium}

REGLAS CRÍTICAS:
1. DEFINICIONES DE DICCIONARIO: Las definiciones DEBEN ser extremadamente precisas y seguir fielmente las contenidas en el Diccionario de la Lengua Española (DLE) de la RAE.
2. RIGOR LÉXICO: No uses lenguaje coloquial ni infantil a menos que la dificultad sea "easy". Busca la máxima exactitud lexicográfica.
3. PROHIBICIONES: 
   - NUNCA incluyas la palabra a adivinar dentro de su propia definición.
   - NUNCA incluyas derivados directos de la palabra en la definición.
4. Tematización: TODAS las palabras (o la gran mayoría) deben estar relacionadas directamente con la categoría "${sanitizedCategory}".
5. Dinamismo: Mezcla palabras que "EMPIEZA POR" y palabras que "CONTIENE LA".
6. NO REPETICIÓN: No repitas la misma palabra en el mismo rosco.
7. VARIEDAD: Esfuérzate por no elegir siempre las mismas palabras que en sesiones anteriores. Busca términos originales dentro de la temática.
8. Formato: 27 objetos (A-Z, Ñ). Si K o W son imposibles para la temática, usa "CONTIENE LA" con palabras de cultura general que encajen.
`
  const prompt = `Genera un rosco de Pasapalabra sobre "${sanitizedCategory}" con dificultad ${difficulty}.`

  try {
    const result = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.4, // Aumentada ligeramente para dar variedad sin perder precisión lexigográfica
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
