<script lang="ts">
  import { initGameState } from "$lib/state/game.svelte";
  import { untrack } from "svelte";
  import type { RoscoGenerateItem } from "$lib/types";
  import RoscoBoard from "./RoscoBoard.svelte";
  import GameControls from "./GameControls.svelte";
  import ResultsScreen from "./ResultsScreen.svelte";
  import { AVAILABLE_MODELS } from "$lib/config/models";

  let { initialWords, secureToken, modelId }: { initialWords: RoscoGenerateItem[], secureToken: string, modelId?: string } = $props();

  const game = initGameState(untrack(() => initialWords), untrack(() => modelId));
  
  let modelLabel = $derived(AVAILABLE_MODELS.find(m => m.id === game.modelId)?.label);

  $effect(() => {
    game.setSecureToken(secureToken);
  });
</script>

{#if game.status === "playing"}
  <div class="flex flex-col items-center w-full max-w-2xl mx-auto gap-8 md:gap-12 px-4 sm:px-8 py-8 animate-in fade-in zoom-in duration-500">
    {#if modelLabel}
      <div class="text-sm font-medium text-slate-400/80 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-700/50 flex items-center shadow-lg gap-2 -mt-4">
        <span class="w-2 h-2 rounded-full bg-indigo-400 animate-[pulse_2s_ease-in-out_infinite]"></span>
        Modelo: <span class="text-indigo-300 font-semibold">{modelLabel}</span>
      </div>
    {/if}
    <RoscoBoard />
    <GameControls />
  </div>
{:else if game.status === "results"}
  <ResultsScreen />
{/if}
