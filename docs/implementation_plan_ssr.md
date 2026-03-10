# Server-Side Rendering (SSR) del Rosco

El usuario ha solicitado que la página principal siga mostrando la pantalla de configuración primero, y que al hacer click en el botón "Generar Rosco", el sistema pida el rosco a Gemini en el servidor y devuelva el HTML de la página ya renderizado con el juego (SSR).

## Enfoque de la Solución (Formulario POST Híbrido)
Para lograr este flujo en Astro + Svelte:

1. **Pantalla inicial (GET `/`)**: [index.astro](file:///Users/fjavidcr/github/pasapalabra-js/src/pages/index.astro) carga instantáneamente y muestra la pantalla de Setup.
2. **Acción del botón (POST)**: En lugar de hacer un `fetch` AJAX en segundo plano, el botón "Generar Rosco" será ahora un botón de tipo [submit](file:///Users/fjavidcr/github/pasapalabra-js/src/lib/state/game.svelte.ts#96-103) dentro de un formulario HTML (`<form method="POST">`).
3. **Carga en el Servidor**: Al enviar el formulario, el navegador hace una petición al servidor. Astro detectará `Astro.request.method === "POST"`, validará el token de seguridad, y llamará a Gemini.
4. **Respuesta HTML**: Una vez Gemini termine (3-8 segs), Astro renderiza y devuelve el HTML completo de la pantalla del rosco (`<RoscoBoard />`), inyectando las palabras directamente en el estado inicial de Svelte (`initialWords`).
5. **Experiencia de Usuario (Spinner)**: Mantendremos el *spinner* en el botón. Al hacer clic, usaremos Svelte para cambiar el estado visual del botón a "Cargando..." mientras el navegador espera la respuesta POST del servidor.

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
  let initialWords = null;
  let errorMsg = null;
  
  if (Astro.request.method === "POST") {
      try {
          // Extraer secureToken del FormData
          // Validar el Token (misma lógica que había en el API route)
          initialWords = await generateRoscoWords();
      } catch (e) {
          errorMsg = e.message;
      }
  }
  ```
- Pasar `initialWords` y (opcionalmente) `errorMsg` al componente `<PasapalabraGame />`.
- Si hubo error, Svelte lo mostrará en el SetupScreen permitiendo reintentar. Si hubo éxito, Svelte renderizará directamente el tablero de juego en el HTML.

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
