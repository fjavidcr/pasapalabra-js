# Plan y Registro de Cambios (Pasapalabra)

Este archivo mantendrá un registro del progreso y el estado actual del desarrollo del juego Pasapalabra usando Astro puro, Cloudflare y Gemini AI.

## Tareas

- [x] **Paso 1: Inicializar nuevo proyecto Astro**
  - [x] Eliminar proyecto anterior (Vite, LitElement, src antiguo)
  - [x] Crear nuevo proyecto `astro minimal`
  - [x] Crear este archivo de registro (TODO.md)

- [x] **Paso 2: Integraciones (Cloudflare y Gemini)**
  - [x] Añadir adaptador `npx astro add cloudflare`
  - [x] Instalar `@google/genai` (SDK oficial de Google)
  - [x] Configurar variables de entorno `.env` (ignoradas en git) para `GEMINI_API_KEY`

- [x] **Paso 3: Endpoint de Backend (API de Gemini)**
  - [x] Crear el archivo `src/pages/api/generate-rosco.ts`
  - [x] Diseñar el Prompt para Gemini que devuelva el rosco (27 letras) con formato JSON estricto
  - [x] Probar el endpoint llamándolo localmente o con un mock

- [x] **Paso 4: Frontend del Juego (Astro Vanilla JS)**
  - [x] Crear el componente visual del rosco circular con CSS y HTML en `src/pages/index.astro`
  - [x] Escribir la lógica en Vanilla JS (`<script>`) para manejar el estado: Letra activa, acertadas, falladas, palabra actual.
  - [x] Botones de Jugar, Enviar Respuesta, y Pasapalabra
  - [x] Integrar el frontend con la API `/api/generate-rosco`
  - [x] Función para validar la respuesta ignorando acentos y mayúsculas/minúsculas

- [x] **Paso 5: Estilos Finales y Responsive**
  - [x] Colores del rosco: Azul (defecto), Verde (acierto), Rojo (fallo), Animación parpadeante (activa)
  - [x] Hacer el rosco adaptable a pantallas de móviles.

- [x] **Paso 6: Revisión y Commits**
  - [x] Pre-commit check
  - [x] Submit a la rama actual

## Notas

- Se usará **Gemini AI Pro** (mediante el modelo `gemini-1.5-pro` o el mejor disponible).
- Se evitarán frameworks extra como React/Vue para mantener el proyecto ligero usando solo las capacidades nativas del DOM y Astro.
- El backend usará SSR (Server-Side Rendering) y el adaptador de Cloudflare Pages, donde la API Key estará segura como Variable de Entorno.
