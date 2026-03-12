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
  import type { GameStats } from '$lib/server/sessionService'

  let {
    secureToken,
    errorMsg,
    preferredModelId,
    preferredDifficulty,
    preferredCategory,
    stats
  }: {
    secureToken: string
    errorMsg?: string
    preferredModelId?: string
    preferredDifficulty?: string
    preferredCategory?: string
    stats?: GameStats
  } = $props()
  const game = initGameState()

  let selectedModel = $state<GeminiModelId>(DEFAULT_MODEL_ID)
  let selectedDifficulty = $state<string>('medium')
  let selectedCategory = $state<string>('general')
  let customCategory = $state<string>('')
  let exhaustedModels = $state<string[]>([])

  const CATEGORIES = [
    { id: 'general', label: 'General' },
    { id: 'ciencia', label: 'Ciencia' },
    { id: 'deporte', label: 'Deporte' },
    { id: 'historia', label: 'Historia' },
    { id: 'cine', label: 'Cine' },
    { id: 'custom', label: 'Otro' }
  ]

  $effect(() => {
    // Restaurar preferencias desde sesión SSR
    if (preferredModelId && AVAILABLE_MODELS.some((m) => m.id === preferredModelId)) {
      if (!exhaustedModels.includes(preferredModelId)) {
        selectedModel = preferredModelId as GeminiModelId
      }
    }

    if (preferredDifficulty) {
      selectedDifficulty = preferredDifficulty
    }

    if (preferredCategory) {
      if (CATEGORIES.some((c) => c.id === preferredCategory)) {
        selectedCategory = preferredCategory
      } else {
        selectedCategory = 'custom'
        customCategory = preferredCategory
      }
    }

    game.setSecureToken(secureToken)

    if (errorMsg) {
      // Check if it's a quota error for a specific model
      const quotaMatch = errorMsg.match(/\[QUOTA_EXHAUSTED:(.*?)\] (.*)/)
      if (quotaMatch) {
        const failedModelId = quotaMatch[1]
        game.errorMsg = quotaMatch[2]

        if (!exhaustedModels.includes(failedModelId)) {
          exhaustedModels = [...exhaustedModels, failedModelId]
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
        disabled={game.loading}>
        {#each AVAILABLE_MODELS as model (model.id)}
          <option value={model.id} disabled={exhaustedModels.includes(model.id)}>
            {model.label}
            {exhaustedModels.includes(model.id) ? '(Agotado hoy)' : ''}
          </option>
        {/each}
      </select>
    </div>

    <div class="group relative mx-auto mb-8 w-full text-left">
      <label for="difficulty-select" class="mb-2 block pl-1 text-sm font-bold text-slate-200">
        Nivel de Dificultad
      </label>
      <div class="grid grid-cols-3 gap-2">
        {#each [{ id: 'easy', label: 'Fácil' }, { id: 'medium', label: 'Medio' }, { id: 'hard', label: 'Difícil' }] as diff (diff.id)}
          <button
            type="button"
            class="flex h-12 items-center justify-center rounded-xl border border-slate-700 text-sm font-bold transition-all {selectedDifficulty ===
            diff.id
              ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400 ring-2 ring-indigo-500'
              : 'bg-slate-900/50 text-slate-400 hover:border-slate-500 hover:text-slate-200'}"
            onclick={() => (selectedDifficulty = diff.id)}
            disabled={game.loading}>
            {diff.label}
          </button>
        {/each}
      </div>
    </div>

    <div class="group relative mx-auto mb-8 w-full text-left">
      <label for="category-select" class="mb-2 block pl-1 text-sm font-bold text-slate-200">
        Temática del Rosco
      </label>
      <div class="grid grid-cols-3 gap-2">
        {#each CATEGORIES as cat (cat.id)}
          <button
            type="button"
            class="flex h-12 items-center justify-center rounded-xl border border-slate-700 text-sm font-bold transition-all {selectedCategory ===
            cat.id
              ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400 ring-2 ring-indigo-500'
              : 'bg-slate-900/50 text-slate-400 hover:border-slate-500 hover:text-slate-200'}"
            onclick={() => (selectedCategory = cat.id)}
            disabled={game.loading}>
            {cat.label}
          </button>
        {/each}
      </div>

      {#if selectedCategory === 'custom'}
        <div class="animate-in slide-in-from-top-2 mt-4 duration-300">
          <input
            type="text"
            bind:value={customCategory}
            placeholder="Ej: Cocina Japonesa, Mitología Egipcia..."
            maxlength="50"
            class="h-12 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            disabled={game.loading} />
        </div>
      {/if}
    </div>

    {#if stats && stats.played > 0}
      <div
        class="animate-in fade-in fill-mode-both mb-6 flex items-center justify-center gap-6 rounded-xl border border-slate-700/40 bg-slate-900/30 px-6 py-3 text-sm delay-200 duration-500">
        <div class="flex flex-col items-center gap-0.5">
          <span class="text-xl font-extrabold text-slate-100">{stats.played}</span>
          <span class="text-xs text-slate-500">Partidas</span>
        </div>
        <div class="h-8 w-px bg-slate-700/50"></div>
        <div class="flex flex-col items-center gap-0.5">
          <span class="text-xl font-extrabold text-indigo-400">{stats.won}</span>
          <span class="text-xs text-slate-500">Perfectas</span>
        </div>
        {#if Object.keys(stats.failedLetters).length > 0}
          <div class="h-8 w-px bg-slate-700/50"></div>
          <div class="flex flex-col items-center gap-0.5">
            <span class="text-xl font-extrabold text-amber-400">
              {Object.entries(stats.failedLetters)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 2)
                .map(([l]) => l)
                .join(', ')}
            </span>
            <span class="text-xs text-slate-500">Más falladas</span>
          </div>
        {/if}
      </div>
    {/if}

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
        <input type="hidden" name="difficulty" value={selectedDifficulty} />
        <input
          type="hidden"
          name="category"
          value={selectedCategory === 'custom' ? customCategory : selectedCategory} />
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
