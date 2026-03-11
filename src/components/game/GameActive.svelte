<script lang="ts">
  import { untrack } from 'svelte'
  import { AVAILABLE_MODELS } from '$lib/config/models'
  import { initGameState } from '$lib/state/game.svelte'
  import type { RoscoGenerateItem } from '$lib/types'
  import GameControls from './GameControls.svelte'
  import ResultsScreen from './ResultsScreen.svelte'
  import RoscoBoard from './RoscoBoard.svelte'

  let {
    initialWords,
    secureToken,
    modelId
  }: {
    initialWords: RoscoGenerateItem[]
    secureToken: string
    modelId?: string
  } = $props()

  const game = initGameState(
    untrack(() => initialWords),
    untrack(() => modelId)
  )

  let modelLabel = $derived(AVAILABLE_MODELS.find((m) => m.id === game.modelId)?.label)

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
        <!-- prettier-ignore -->
        <span class="h-2 w-2 animate-[pulse_2s_ease-in-out_infinite] rounded-full bg-indigo-400"></span>
        Modelo:
        <span class="font-semibold text-indigo-300">{modelLabel}</span>
      </div>
    {/if}
    <RoscoBoard />
    <GameControls />
  </div>
{:else if game.status === 'results'}
  <ResultsScreen />
{/if}
