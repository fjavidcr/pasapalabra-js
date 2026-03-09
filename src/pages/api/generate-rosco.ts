import { GoogleGenAI } from '@google/genai';
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const apiKey = import.meta.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    // We use gemini-2.5-flash as this is the only allowed model on the free tier for new API keys right now
    const prompt = `
Eres un creador experto de roscos para el juego Pasapalabra en español.
Genera un rosco completo de 27 letras. Para hacer el juego más dinámico e impredecible, DEBES mezclar palabras que empiecen por la letra y palabras que la contengan. 
No uses solo "empieza por", atrévete a usar "contiene la" en varias letras comunes (ej. "contiene la A", "contiene la E") y obligatoriamente para letras raras como X, Y, Z.

Tu única respuesta debe ser un arreglo JSON estricto. No incluyas markdown, bloques de código (\`\`\`json), saludos ni nada extra. SOLO el JSON.

El formato de cada objeto del arreglo debe ser exactamente este:
{
  "letter": "A",
  "word": "Ondear",
  "definition": "Moverse algo, especialmente una bandera, formando ondas.",
  "type": "INCLUDES" // Usa "STARTS_WITH" si empieza por la letra, o "INCLUDES" si la contiene. ¡Usa una buena mezcla de ambos!
}

Asegúrate de generar exactamente 27 objetos, uno para cada letra del abecedario español (A, B, C, D, E, F, G, H, I, J, L, M, N, Ñ, O, P, Q, R, S, T, U, V, X, Y, Z - puedes omitir K y W si es muy difícil, pero la longitud ideal es 25-27 letras).
La "word" debe ser una palabra válida en el diccionario español.
La "definition" debe ser clara, concisa y referirse inequívocamente a la palabra.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    });

    const text = response.text;

    if (!text) {
      throw new Error('No text returned from Gemini API.');
    }

    // Safety check: parse the JSON to make sure it's valid before sending
    const parsedData = JSON.parse(text);

    return new Response(JSON.stringify(parsedData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error: any) {
    console.error('Error generating rosco:', error);
    
    // Detect Gemini Rate Limits and Quota Exceeded (429)
    let errorMessage = error.message || 'Error interno al comunicarse con Gemini.';
    let statusCode = 500;
    
    if (
      errorMessage.includes('429') || 
      errorMessage.toLowerCase().includes('quota') || 
      errorMessage.toLowerCase().includes('rate limit')
    ) {
      errorMessage = '⚠️ Has agotado tu límite gratuito diario de peticiones a Gemini (20 roscos). ¡Vuelve a intentarlo mañana!';
      statusCode = 429;
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}