import { GoogleGenAI, Type } from '@google/genai';
import { validateSecureToken } from '$lib/server/security';

export async function generateRoscoWords(formData: FormData) {
  const secureToken = formData.get('secureToken') as string;
  
  // Validar token antes de gastar recursos de la API
  validateSecureToken(secureToken);

  const apiKey = import.meta.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  const systemInstruction = `
Eres un creador experto de roscos para el juego Pasapalabra en español.
Genera un rosco completo de 27 letras. Para hacer el juego más dinámico e impredecible, DEBES mezclar palabras que empiecen por la letra y palabras que la contengan. 
No uses solo "empieza por", atrévete a usar "contiene la" en varias letras comunes (ej. "contiene la A", "contiene la E") y obligatoriamente para letras raras como X, Y, Z.

Asegúrate de generar exactamente 27 objetos, uno para cada letra del abecedario español (A, B, C, D, E, F, G, H, I, J, L, M, N, Ñ, O, P, Q, R, S, T, U, V, X, Y, Z - puedes omitir K y W si es muy difícil, pero la longitud ideal es 25-27 letras).
La palabra ("word") debe ser una palabra válida en el diccionario español.
La definición ("definition") debe ser clara, concisa y referirse inequívocamente a la palabra.
`;

  const prompt = "Genera un nuevo rosco de nivel intermedio ahora.";

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: "Lista de 27 letras del rosco de Pasapalabra.",
          items: {
            type: Type.OBJECT,
            properties: {
              letter: { type: Type.STRING, description: "Letra única del abecedario en mayúscula (ej: 'A', 'Ñ')." },
              word: { type: Type.STRING, description: "La palabra a adivinar." },
              definition: { type: Type.STRING, description: "La definición estilo diccionario de la palabra." },
              type: { type: Type.STRING, enum: ["STARTS_WITH", "INCLUDES"], description: "Si la palabra empieza por la letra (STARTS_WITH) o si simplemente la contiene en el medio (INCLUDES)." }
            },
            required: ["letter", "word", "definition", "type"]
          }
        }
      }
    });

    const text = result.text;

    if (!text) {
      throw new Error('No text returned from Gemini API.');
    }

    return JSON.parse(text);
  } catch (error: any) {
    console.error('Error generating rosco:', error);
    let errorMessage = error.message || 'Error interno al comunicarse con Gemini.';
    if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('rate limit')) {
      errorMessage = '⚠️ Has agotado tu límite gratuito diario de peticiones a Gemini (20 roscos). ¡Vuelve a intentarlo mañana!';
    }
    throw new Error(errorMessage);
  }
}
