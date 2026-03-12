<script lang="ts">
  import { untrack } from 'svelte'
  import { AVAILABLE_MODELS } from '$lib/config/models'
  import { initGameState } from '$lib/state/game.svelte'
  import type { GameStats } from '$lib/server/sessionService'
  import type { RoscoGenerateItem, WordItem } from '$lib/types'
  import GameControls from './GameControls.svelte'
  import ResultsScreen from './ResultsScreen.svelte'
  import RoscoBoard from './RoscoBoard.svelte'

  let {
    initialWords,
    secureToken,
    modelId,
    difficulty,
    category,
    savedCurrentIndex,
    stats
  }: {
    initialWords: RoscoGenerateItem[] | WordItem[]
    secureToken: string
    modelId?: string
    difficulty?: string
    category?: string
    savedCurrentIndex?: number
    stats?: GameStats
  } = $props()

  const game = initGameState(
    untrack(() => initialWords),
    untrack(() => modelId),
    untrack(() => savedCurrentIndex),
    untrack(() => category),
    untrack(() => difficulty)
  )

  const difficultyLabels: Record<string, string> = {
    easy: 'Fácil',
    medium: 'Medio',
    hard: 'Difícil'
  }

  const categoryLabels: Record<string, string> = {
    general: 'General',
    ciencia: 'Ciencia',
    deporte: 'Deporte',
    historia: 'Historia',
    cine: 'Cine'
  }

  const difficultyColors: Record<string, string> = {
    easy: 'text-emerald-400/90',
    medium: 'text-amber-400/90',
    hard: 'text-rose-400/90'
  }

  let modelLabel = $derived(AVAILABLE_MODELS.find((m) => m.id === game.modelId)?.label)
  let difficultyLabel = $derived(difficulty ? difficultyLabels[difficulty] : 'Medio')
  let difficultyColor = $derived(difficulty ? difficultyColors[difficulty] : 'text-amber-400/90')

  let displayCategory = $derived.by(() => {
    if (!category || category === 'general') return 'General'
    if (categoryLabels[category]) return categoryLabels[category]
    // Capitalizar categoría personalizada
    return category.charAt(0).toUpperCase() + category.slice(1)
  })

  $effect(() => {
    game.setSecureToken(secureToken)
  })
</script>

{#if game.status === 'playing'}
  <div
    class="animate-in fade-in zoom-in mx-auto flex w-full max-w-2xl flex-col items-center gap-8 px-4 py-8 duration-500 sm:px-8 md:gap-12">
    {#if modelLabel}
      <div
        class="-mt-4 flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-sm font-medium text-slate-400/80 shadow-lg">
        <span class="h-2 w-2 animate-[pulse_2s_ease-in-out_infinite] rounded-full bg-indigo-400">
        </span>
        <span class="flex items-center gap-1.5">
          <span class="text-slate-500">Modelo:</span>
          <span class="font-semibold text-indigo-300">{modelLabel}</span>
        </span>
        <span class="h-3 w-px bg-slate-700/50"></span>
        <span class="flex items-center gap-1.5">
          <span class="text-slate-500">Nivel:</span>
          <span class="font-semibold {difficultyColor}">{difficultyLabel}</span>
        </span>
        <span class="h-3 w-px bg-slate-700/50"></span>
        <span class="flex items-center gap-1.5">
          <span class="text-slate-500">Tema:</span>
          <span class="font-semibold text-sky-400/90">{displayCategory}</span>
        </span>
      </div>
    {/if}
    {#if game.errorMsg}
      <div
        class="animate-in slide-in-from-top-2 w-full rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm font-medium text-red-400">
        {game.errorMsg}
      </div>
    {/if}
    <RoscoBoard />
    <GameControls />
  </div>
{:else if game.status === 'results'}
  <ResultsScreen {stats} />
{/if}
