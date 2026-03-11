# 🔵 Pasapalabra JS

Una implementación web moderna y optimizada del clásico juego de televisión "El Rosco de Pasapalabra". Desarrollado para ser rápido, reactivo y preparado para funcionar en la nube.

## ✨ Características Principales

- **Generación Dinámica por IA**: Usa la API de Google Gemini (`@google/genai`) para generar preguntas y respuestas de cada palabra del rosco.
- **Interfaz Reactiva**: Componentes interactivos y de alto rendimiento desarrollados con **Svelte 5**.
- **Estilos Modernos**: Utiliza **Tailwind CSS v4** con integración de animaciones y variantes de Tailwind.
- **Práctico y Seguro**: Implementa validación segura de tokens (HMAC/SHA256) y Server-Side Rendering (SSR).
- **Edge-Ready**: Totalmente preparado para funcionar directamente en la red de **Cloudflare Workers**.

## 📂 Estructura del Proyecto

El proyecto sigue una arquitectura optimizada para **Astro** y **Svelte**, separando claramente la lógica del servidor de la interfaz:

```text
/
├── public/                 # Assets estáticos (imágenes, favicons)
├── src/
│   ├── components/         # Componentes nativos de Astro
│   ├── layouts/            # Plantillas maestras de las páginas
│   ├── lib/
│   │   ├── components/     # Componentes interactivos de Svelte 5
│   │   ├── server/         # Lógica SSR, prompts de Gemini y utilidades de seguridad
│   │   └── state/          # Gestión de estado reactivo global del juego
│   ├── pages/              # Rutas principales de la aplicación (SSR)
│   └── styles/             # Archivos de estilos (Tailwind CSS v4)
└── package.json
```

## 🧞 Comandos Locales (Desarrollo)

Asegúrate de copiar el archivo de variables de entorno antes de iniciar:

```sh
cp .env.example .env
```

Y añade tus claves reales en el fichero `.env`. El `API_SECRET_KEY` puede ser cualquier cadena de texto aleatoria.

Desde la raíz del proyecto, puedes ejecutar estos comandos:

| Comando                   | Descripción                                      |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Instala todas las dependencias                   |
| `npm run dev`             | Inicia el servidor local en `localhost:4321`     |
| `npm run build`           | Compila la versión de producción                 |
| `npm run preview`         | Previsualiza el proyecto antes de desplegarlo    |
| `npm run lint` / `format` | Verifica y formatea el código (ESLint, Prettier) |

## ☁️ Deployment (Cloudflare Workers)

This project is pre-configured to be deployed on **Cloudflare Workers** with two separate environments: `preview` and `production`.

### 1. Login to Cloudflare

```sh
npx wrangler login
```

### 2. Create KV Namespaces for Sessions

The `@astrojs/cloudflare` adapter v12+ automatically enables session support via **Cloudflare KV**. You need to create two namespaces (one per environment) and add their IDs to `wrangler.jsonc`:

```sh
# Production namespace
npx wrangler kv namespace create SESSION

# Preview namespace (for local dev & preview deploys)
npx wrangler kv namespace create SESSION --preview
```

Copy the generated IDs into `wrangler.jsonc` under the corresponding `env.production` and `env.preview` blocks, and into the top-level `kv_namespaces` entry (with `id` and `preview_id`).

### 3. Configure Secrets

Since the local `.env` file is not used by Cloudflare, secrets must be uploaded **separately for each worker**. Both workers (`pasapalabra-js` and `pasapalabra-js-preview`) require their own secrets:

```sh
# Production
npx wrangler secret put GEMINI_API_KEY --env production
npx wrangler secret put API_SECRET_KEY --env production

# Preview
npx wrangler secret put GEMINI_API_KEY --env preview
npx wrangler secret put API_SECRET_KEY --env preview
```

> **Note:** In Cloudflare, each named worker has its own isolated secrets. Secrets set for `pasapalabra-js` are not available to `pasapalabra-js-preview` and vice versa.

### 4. Deploy

| Comando                  | Descripción                                          |
| :----------------------- | :--------------------------------------------------- |
| `npm run deploy:preview` | Build + deploy al worker de preview (`.workers.dev`) |
| `npm run deploy:pro`     | Build + deploy al worker de producción               |

When deploying to production, Wrangler may warn about differences with the remote config (e.g. a custom domain set via the dashboard). This is safe to confirm — the custom domain binding is managed independently by Cloudflare and will not be removed.

## 📄 License

This project is licensed under the **GNU General Public License v3.0**.

Copyright (C) 2026 Javi del Castillo.

See the [LICENSE](LICENSE) file for more details.
