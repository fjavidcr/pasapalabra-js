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

    // We use gemini-1.5-pro as requested by the user, who has Google AI Pro
    const prompt = `
Eres un creador experto de roscos para el juego Pasapalabra en español.
Genera un rosco completo de 27 letras (A-Z, incluyendo la Ñ, omitiendo la K o W si es muy difícil, o incluyéndola con "contiene la").
Tu única respuesta debe ser un arreglo JSON estricto. No incluyas markdown, bloques de código (\`\`\`json), saludos ni nada extra. SOLO el JSON.

El formato de cada objeto del arreglo debe ser exactamente este:
{
  "letter": "A",
  "word": "Adivinanza",
  "definition": "Dicho popular, que se formula en forma de rima, en el que se describe una cosa para que sea adivinada.",
  "type": "STARTS_WITH" // o "INCLUDES" para letras como la X o la W si la palabra no empieza por ellas.
}

Asegúrate de generar exactamente 27 objetos, uno para cada letra del abecedario español (A, B, C, D, E, F, G, H, I, J, L, M, N, Ñ, O, P, Q, R, S, T, U, V, X, Y, Z - puedes omitir K y W si quieres, pero intenta llegar a unas 25-27 letras). La longitud ideal es 27 letras incluyendo la Ñ.
La "word" debe ser una palabra válida en español.
La "definition" debe ser clara, concisa y estilo diccionario.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: prompt,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    });

    const text = response.text;

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
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}