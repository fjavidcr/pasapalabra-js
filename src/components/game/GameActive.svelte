<script lang="ts">
  import { initGameState } from "$lib/state/game.svelte";
  import { untrack } from "svelte";
  import type { RoscoGenerateItem } from "$lib/types";
  import RoscoBoard from "./RoscoBoard.svelte";
  import GameControls from "./GameControls.svelte";
  import ResultsScreen from "./ResultsScreen.svelte";

  let { initialWords, secureToken }: { initialWords: RoscoGenerateItem[], secureToken: string } = $props();

  const game = initGameState(untrack(() => initialWords));

  $effect(() => {
    game.setSecureToken(secureToken);
  });
</script>

{#if game.status === "playing"}
  <div class="flex flex-col items-center w-full max-w-2xl mx-auto gap-8 md:gap-12 px-4 sm:px-8 py-8 animate-in fade-in zoom-in duration-500">
    <RoscoBoard />
    <GameControls />
  </div>
{:else if game.status === "results"}
  <ResultsScreen />
{/if}
