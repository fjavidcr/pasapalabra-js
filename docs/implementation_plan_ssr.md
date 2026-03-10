# Server-Side Rendering (SSR) con Streaming del Rosco

El objetivo es implementar **Streaming SSR** en Astro para que la página cargue instantáneamente y el componente del juego se renderice en el servidor conforme Gemini genere las palabras.

## Enfoque de la Solución (SSR Streaming)
Para lograr este flujo en Astro + Svelte:

1. **Pantalla inicial (GET `/`)**: Muestra la pantalla de Setup.
2. **Acción del botón (POST `/`)**: El formulario se envía a la misma página.
3. **Streaming en el Servidor**:
   - Astro detecta el POST.
   - La página empieza a enviarse al navegador (Layout, cabeceras).
   - Se usa una promesa (Promise) para llamar a Gemini.
   - El componente del juego se "suspende" o se renderiza condicionalmente cuando la promesa se resuelve.
4. **Respuesta Progresiva**: El navegador recibe el HTML base y, unos segundos después, el fragmento del juego sin recargar la página (o mediante una carga progresiva del stream).
5. **Hidratación**: Una vez llega el HTML del juego, Svelte toma el control en el cliente.

## Proposed Changes

### 1. Extracción Lógica de Gemini (Server Utility)
Para no duplicar código y poder llamarlo tanto desde Astro como desde la API (si fuera necesario en el futuro), moveremos la lógica.

#### [NEW] `src/lib/server/gemini.ts`
- Contendrá la función `generateRoscoWords()` que extrae la funcionalidad de [src/pages/api/generate-rosco.ts](file:///Users/fjavidcr/github/pasapalabra-js/src/pages/api/generate-rosco.ts) y devuelve directamente el Array de objetos del rosco.

---
### 2. Modificación de Svelte para soportar SSR

#### [MODIFY] [src/lib/state/game.svelte.ts](file:///Users/fjavidcr/github/pasapalabra-js/src/lib/state/game.svelte.ts)
- Modificar la clase [GameState](file:///Users/fjavidcr/github/pasapalabra-js/src/lib/state/game.svelte.ts#11-115) para que su constructor acepte un parámetro opcional `initialWords`.
- Si `initialWords` está presente, el estado inicial será `"playing"`, con el índice en `0`.

#### [MODIFY] [src/components/PasapalabraGame.svelte](file:///Users/fjavidcr/github/pasapalabra-js/src/components/PasapalabraGame.svelte)
- Exportar la prop `initialWords` (con un tipo adecuado).
- Inicializar [setGameState(initialWords)](file:///Users/fjavidcr/github/pasapalabra-js/src/lib/state/game.svelte.ts#118-121).

#### [MODIFY] [src/components/game/SetupScreen.svelte](file:///Users/fjavidcr/github/pasapalabra-js/src/components/game/SetupScreen.svelte)
- Transformar la estructura principal para incluir un `<form method="POST">`.
- Añadir el `secureToken` como un campo oculto (`<input type="hidden">`).
- Actualizar el botón para que sea `type="submit"`. Al hacer `onsubmit`, cambiará una variable reactiva `loading = true` para mostrar el spinner mientras el navegador cambia de página.

---
### 3. Ajustes en la Página Principal de Astro

#### [MODIFY] [src/pages/index.astro](file:///Users/fjavidcr/github/pasapalabra-js/src/pages/index.astro)
- En el bloque del servidor `---`, detectar si es un POST:
  ```ts
  let wordsPromise = null;
  
  if (Astro.request.method === "POST") {
      const formData = await Astro.request.formData();
      // Validar Token...
      wordsPromise = generateRoscoWords(formData); // Retorna la Promesa directamente
  }
  ```
- En el HTML, usar el componente del juego con la promesa:
  ```astro
  {wordsPromise ? (
    <PasapalabraGame client:load wordsPromise={wordsPromise} />
  ) : (
    <SetupScreen client:load />
  )}
  ```
- *Nota*: Para que el streaming funcione realmente bien en Cloudflare, nos aseguraremos de que el layout no bloquee el renderizado inicial.

---
### [DELETE] Archivo API Obsoleto
#### [DELETE] [src/pages/api/generate-rosco.ts](file:///Users/fjavidcr/github/pasapalabra-js/src/pages/api/generate-rosco.ts)
- Dado que todo el control recae ahora en el SSR de Astro al hacer POST, la ruta de API base deja de ser necesaria y simplifica el proyecto.

## Verification Plan

### Automated Tests
- Usar `svelte-check` para verificar el correcto tipado de la nueva prop `initialWords`.

### Manual Verification
1. Entrar a `http://localhost:4321`. Se debe cargar la pantalla Setup de forma instantánea.
2. Hacer click en "Generar Rosco". El botón debe girar el spinner.
3. El navegador empezará a cargar. Pasados unos segundos de espera de Gemini, el navegador recibe y pinta el HTML.
4. Inspeccionar el HTML fuente (`Ctrl+U`): El código recibido de la red debe contener la estructura del rosco (las 27 letras del SVG pre-dibujadas), validando que se ha renderizado exitosamente en el servidor (SSR).
