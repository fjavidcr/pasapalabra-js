<script lang="ts">
  import { setGameState } from "$lib/state/game.svelte";
  import SetupScreen from "./game/SetupScreen.svelte";
  import RoscoBoard from "./game/RoscoBoard.svelte";
  import GameControls from "./game/GameControls.svelte";
  import ResultsScreen from "./game/ResultsScreen.svelte";

  // Provide state context to all child components
  const game = setGameState();
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
