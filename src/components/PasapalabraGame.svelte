<script lang="ts">
  import { setGameState } from "$lib/state/game.svelte";
  import SetupScreen from "$components/game/SetupScreen.svelte";
  import RoscoBoard from "$components/game/RoscoBoard.svelte";
  import GameControls from "$components/game/GameControls.svelte";
  import ResultsScreen from "$components/game/ResultsScreen.svelte";

  let { secureToken, initialWords, errorMsg }: { secureToken: string, initialWords?: any[], errorMsg?: string } = $props();

  // Provide state context to all child components
  const game = setGameState(initialWords);
  $effect(() => {
    game.setSecureToken(secureToken);
    if (errorMsg) {
      game.errorMsg = errorMsg;
    }
  });
</script>

<div class="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-2xl mx-auto p-4 sm:p-8">
  {#if game.status === "setup"}
    <SetupScreen />
  {:else if game.status === "playing"}
    <div class="flex flex-col items-center w-full gap-8 md:gap-12 animate-in fade-in zoom-in duration-500">
      <RoscoBoard />
      <GameControls />
    </div>
  {:else if game.status === "results"}
    <ResultsScreen />
  {/if}
</div>
