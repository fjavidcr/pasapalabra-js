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

This project is pre-configured to be deployed on **Cloudflare Workers**. You can deploy it manually directly from your terminal by following these steps:

1. **Login to Cloudflare**
   Authenticate the Astro CLI with your Cloudflare account:

   ```sh
   npx wrangler login
   ```

2. **Configure Secrets**
   Since the local `.env` file is ignored during deployment, you need to add your environment variables as secrets to your Cloudflare account:

   ```sh
   npx wrangler secret put GEMINI_API_KEY
   npx wrangler secret put API_SECRET_KEY
   ```

   _(Paste the values when prompted)_

3. **Deploy**
   Run the deployment script, which will build the project and upload it:
   ```sh
   npm run deploy
   ```
   The terminal will output the public URL (e.g. `*.workers.dev`) where the app is live.

## 📄 License

This project is licensed under the **GNU General Public License v3.0**.

Copyright (C) 2026 Javi del Castillo.

See the [LICENSE](LICENSE) file for more details.
