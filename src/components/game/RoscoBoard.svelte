<script lang="ts">
  import { getGameState } from "$lib/state/game.svelte";
  import { cn } from "$lib/utils";
  const game = getGameState();

  function getPositionStyle(index: number, total: number, radius: number) {
    const angle = (index / total) * 2 * Math.PI - (Math.PI / 2);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return `margin-top: ${y}px; margin-left: ${x}px;`;
  }
</script>

<div 
  class="relative rounded-full flex items-center justify-center my-4 md:my-8" 
  style="width: {game.roscoSize}px; height: {game.roscoSize}px;"
>
  {#each game.words as item, i (i)}
    <div
      class={cn(
        "absolute flex flex-col items-center justify-center rounded-full font-extrabold text-xl transition-all duration-500 shadow-md text-white border-[3px] backdrop-blur-sm",
        item.status === 'unanswered' || item.status === 'passed' ? "bg-slate-800/80 border-indigo-400" : "",
        i === game.currentIndex && item.status !== 'correct' && item.status !== 'incorrect' ? "border-white bg-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.9)] z-20 animate-pulse" : "",
        item.status === 'correct' ? "bg-green-500 border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.7)]" : "",
        item.status === 'incorrect' ? "bg-red-500 border-red-400 shadow-[0_0_20px_rgba(248,113,113,0.7)]" : ""
      )}
      style="{getPositionStyle(i, game.words.length, game.roscoSize / 2)}
             width: 44px; height: 44px;
             top: 50%; left: 50%;
             transform: translate(-50%, -50%) {i === game.currentIndex && item.status !== 'correct' && item.status !== 'incorrect' ? 'scale(1.4)' : 'scale(1)'};
             z-index: {i === game.currentIndex ? 10 : 1};"
    >
      {item.letter.toUpperCase()}
    </div>
  {/each}
</div>
