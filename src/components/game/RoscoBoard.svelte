<script lang="ts">
  import { getGameState } from "$lib/state/game.svelte";

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
      class="absolute flex flex-col items-center justify-center rounded-full font-bold text-lg transition-all duration-300 shadow-sm"
      style="{getPositionStyle(i, game.words.length, game.roscoSize / 2)}
             width: 38px; height: 38px;
             top: 50%; left: 50%;
             transform: translate(-50%, -50%) {i === game.currentIndex && item.status !== 'correct' && item.status !== 'incorrect' ? 'scale(1.35)' : 'scale(1)'};
             z-index: {i === game.currentIndex ? 10 : 1};"
      class:bg-slate-800={item.status === 'unanswered' || item.status === 'passed'}
      class:text-white={true}
      class:border-2={true}
      class:border-blue-500={item.status === 'unanswered' || item.status === 'passed'}
      class:border-white={i === game.currentIndex && item.status !== 'correct' && item.status !== 'incorrect'}
      class:shadow-[0_0_20px_rgba(59,130,246,0.8)]={i === game.currentIndex && item.status !== 'correct' && item.status !== 'incorrect'}
      class:bg-green-500={item.status === 'correct'}
      class:border-green-500={item.status === 'correct'}
      class:shadow-[0_0_15px_rgba(34,197,94,0.5)]={item.status === 'correct'}
      class:bg-red-500={item.status === 'incorrect'}
      class:border-red-500={item.status === 'incorrect'}
      class:shadow-[0_0_15px_rgba(239,68,68,0.5)]={item.status === 'incorrect'}
    >
      {item.letter.toUpperCase()}
    </div>
  {/each}
</div>
