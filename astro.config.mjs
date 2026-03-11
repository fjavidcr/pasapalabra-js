// @ts-check

import cloudflare from '@astrojs/cloudflare'
import svelte from '@astrojs/svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, envField } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  integrations: [svelte()],

  env: {
    schema: {
      API_SECRET_KEY: envField.string({ context: 'server', access: 'secret' }),
      GEMINI_API_KEY: envField.string({ context: 'server', access: 'secret' })
    }
  },

  vite: {
    plugins: [tailwindcss()]
  }
})
