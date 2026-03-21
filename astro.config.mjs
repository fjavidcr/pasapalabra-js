// @ts-check

import cloudflare from '@astrojs/cloudflare'
import svelte from '@astrojs/svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, envField } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    imageService: 'compile',
    sessionKVBindingName: 'SESSION'
  }),
  integrations: [svelte()],
  session: {},

  env: {
    schema: {
      API_SECRET_KEY: envField.string({ context: 'server', access: 'secret' }),
      GEMINI_API_KEY: envField.string({ context: 'server', access: 'secret' })
    }
  },

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ['node:async_hooks']
    },
    build: {
      assetsInlineLimit: 0,
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (
              id.includes('svelte/src/internal/client/runtime.js') ||
              id.includes('svelte/src/index-client.js')
            ) {
              return 'svelte-core'
            }
          }
        }
      }
    }
  }
})
