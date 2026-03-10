<script lang="ts">
import { LoaderCircle } from '@lucide/svelte'
import { Button } from '$lib/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card'
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
      } catch (e) {}
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

<Card class="w-full mx-auto text-center max-w-lg border-white/10 glass-card animate-in fade-in slide-in-from-bottom-8 duration-700">
  <CardHeader class="pb-6 pt-12 px-6 sm:px-10">
    <CardTitle class="text-5xl sm:text-6xl font-extrabold tracking-tight mb-2">
      <span class="bg-clip-text text-transparent bg-linear-to-r from-violet-400 via-indigo-400 to-purple-400 drop-shadow-sm">Pasapalabra AI</span>
    </CardTitle>
    <CardDescription class="text-xl sm:text-2xl mt-4 font-medium text-slate-300">El Rosco Inteligente con Gemini</CardDescription>
  </CardHeader>
  <CardContent class="px-6 sm:px-10 pb-12">
    {#if game.errorMsg}
      <div class="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium animate-in slide-in-from-top-2 text-left">
        {game.errorMsg}
      </div>
    {/if}
    <p class="text-slate-400 mb-8 text-lg leading-relaxed">
      Ponte a prueba con un rosco completamente único de <span class="text-white font-bold">27 letras</span> generado en tiempo real.
    </p>

    <div class="mb-8 text-left w-full mx-auto relative group">
      <label for="model-select" class="block text-sm font-bold text-slate-200 mb-2 pl-1">
        Modelo de Inteligencia Artificial
      </label>
      <select 
        id="model-select"
        class="w-full h-14 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
        bind:value={selectedModel}
        onchange={() => {
          if (typeof localStorage !== 'undefined') {
             localStorage.setItem('pasapalabra_selected_model', selectedModel);
          }
        }}
        disabled={game.loading}
      >
        {#each AVAILABLE_MODELS as model}
          <option value={model.id} disabled={exhaustedModels.includes(model.id)}>
            {model.label} {exhaustedModels.includes(model.id) ? '(Agotado hoy)' : ''}
          </option>
        {/each}
      </select>
    </div>

    <div class="relative group w-full mx-auto">
      <div class="absolute -inset-1 bg-linear-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-50 group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>
      <form method="POST" onsubmit={() => { game.loading = true; }}>
        <input type="hidden" name="secureToken" value={game.secureToken} />
        <input type="hidden" name="modelId" value={selectedModel} />
        <Button type="submit" size="lg" disabled={game.loading || AVAILABLE_MODELS.every(m => exhaustedModels.includes(m.id))} class="relative w-full flex items-center justify-center gap-2 h-14 text-lg font-bold shadow-xl transition-all duration-300 hover:-translate-y-1">
          {#if game.loading}
          <LoaderCircle class="animate-spin" data-icon="inline-start" />
          Generando Rosco...
        {:else if AVAILABLE_MODELS.every(m => exhaustedModels.includes(m.id))}
          Todos los modelos agotados
        {:else}
          Generar Rosco
        {/if}
        </Button>
      </form>
    </div>
  </CardContent>
</Card>
