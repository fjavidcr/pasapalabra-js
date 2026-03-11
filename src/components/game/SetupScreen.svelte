<script lang="ts">
  import { LoaderCircle } from '@lucide/svelte'
  import { Button } from '$lib/components/ui/button'
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
  } from '$lib/components/ui/card'
  import { AVAILABLE_MODELS, DEFAULT_MODEL_ID, type GeminiModelId } from '$lib/config/models'
  import { initGameState } from '$lib/state/game.svelte'

  let { secureToken, errorMsg }: { secureToken: string; errorMsg?: string } = $props()
  const game = initGameState()

  let selectedModel = $state<GeminiModelId>(DEFAULT_MODEL_ID)
  let exhaustedModels = $state<string[]>([])
  let modelsLoaded = $state(false)

  $effect(() => {
    // Solo cargar del localStorage si no lo hemos hecho aún en esta sesión
    if (!modelsLoaded && typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('pasapalabra_exhausted_models')
      if (stored) {
        try {
          exhaustedModels = JSON.parse(stored)
        } catch {
          // Ignore parse errors
        }
      }
      // Restaurar selección anterior si no está agotado
      const storedModel = localStorage.getItem('pasapalabra_selected_model') as GeminiModelId
      if (storedModel && AVAILABLE_MODELS.some((m) => m.id === storedModel)) {
        if (!exhaustedModels.includes(storedModel)) {
          selectedModel = storedModel
        }
      }
      modelsLoaded = true
    }

    game.setSecureToken(secureToken)

    if (errorMsg) {
      // Check if it's a quota error for a specific model
      const quotaMatch = errorMsg.match(/\[QUOTA_EXHAUSTED:(.*?)\] (.*)/)
      if (quotaMatch) {
        const failedModelId = quotaMatch[1]
        game.errorMsg = quotaMatch[2]

        if (!exhaustedModels.includes(failedModelId)) {
          const newExhausted = [...exhaustedModels, failedModelId]
          exhaustedModels = newExhausted
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('pasapalabra_exhausted_models', JSON.stringify(newExhausted))
          }
        }

        // Auto-select another available model if the current one is exhausted
        if (selectedModel === failedModelId) {
          const alternative = AVAILABLE_MODELS.find((m) => !exhaustedModels.includes(m.id))
          if (alternative) {
            selectedModel = alternative.id
          }
        }
      } else {
        game.errorMsg = errorMsg
      }

      // Limpiar la URL de parámetros de error para que si el usuario recarga F5 no lo vuelva a ver
      if (typeof window !== 'undefined' && window.location.search.includes('error=')) {
        const url = new URL(window.location.href)
        url.searchParams.delete('error')
        window.history.replaceState({}, '', url.pathname + url.search)
      }
    }
  })
</script>

<Card
  class="glass-card animate-in fade-in slide-in-from-bottom-8 mx-auto w-full max-w-lg border-white/10 text-center duration-700">
  <CardHeader class="px-6 pt-12 pb-6 sm:px-10">
    <CardTitle class="mb-2 text-5xl font-extrabold tracking-tight sm:text-6xl">
      <span
        class="bg-linear-to-r from-violet-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm"
        >Pasapalabra AI</span>
    </CardTitle>
    <CardDescription class="mt-4 text-xl font-medium text-slate-300 sm:text-2xl"
      >El Rosco Inteligente con Gemini</CardDescription>
  </CardHeader>
  <CardContent class="px-6 pb-12 sm:px-10">
    {#if game.errorMsg}
      <div
        class="animate-in slide-in-from-top-2 mb-8 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-left text-sm font-medium text-red-400">
        {game.errorMsg}
      </div>
    {/if}
    <p class="mb-8 text-lg leading-relaxed text-slate-400">
      Ponte a prueba con un rosco completamente único de <span class="font-bold text-white"
        >27 letras</span> generado en tiempo real.
    </p>

    <div class="group relative mx-auto mb-8 w-full text-left">
      <label for="model-select" class="mb-2 block pl-1 text-sm font-bold text-slate-200">
        Modelo de Inteligencia Artificial
      </label>
      <select
        id="model-select"
        class="h-14 w-full cursor-pointer rounded-xl border border-slate-700 bg-slate-900/80 px-4 text-slate-100 shadow-inner transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        bind:value={selectedModel}
        onchange={() => {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('pasapalabra_selected_model', selectedModel)
          }
        }}
        disabled={game.loading}>
        {#each AVAILABLE_MODELS as model (model.id)}
          <option value={model.id} disabled={exhaustedModels.includes(model.id)}>
            {model.label}
            {exhaustedModels.includes(model.id) ? '(Agotado hoy)' : ''}
          </option>
        {/each}
      </select>
    </div>

    <div class="group relative mx-auto w-full">
      <div
        class="absolute -inset-1 rounded-xl bg-linear-to-r from-indigo-500 to-purple-500 opacity-50 blur transition duration-500 group-hover:opacity-100 group-hover:duration-200">
      </div>
      <form
        method="POST"
        onsubmit={() => {
          game.loading = true
        }}>
        <input type="hidden" name="secureToken" value={game.secureToken} />
        <input type="hidden" name="modelId" value={selectedModel} />
        <Button
          type="submit"
          size="lg"
          disabled={game.loading || AVAILABLE_MODELS.every((m) => exhaustedModels.includes(m.id))}
          class="relative flex h-14 w-full items-center justify-center gap-2 text-lg font-bold shadow-xl transition-all duration-300 hover:-translate-y-1">
          {#if game.loading}
            <LoaderCircle class="animate-spin" data-icon="inline-start" />
            Generando Rosco...
          {:else if AVAILABLE_MODELS.every((m) => exhaustedModels.includes(m.id))}
            Todos los modelos agotados
          {:else}
            Generar Rosco
          {/if}
        </Button>
      </form>
    </div>
  </CardContent>
</Card>
