<script lang="ts">
import { getGameState } from '$lib/state/game.svelte'
import { cn } from '$lib/utils'

const game = getGameState()

function getPosition(index: number, total: number, radius: number) {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2
  const x = Math.cos(angle) * radius
  const y = Math.sin(angle) * radius
  return { x, y }
}
</script>

<div 
  class="relative rounded-full flex items-center justify-center my-4 md:my-8" 
  style="width: {game.roscoSize}px; height: {game.roscoSize}px;"
>
  {#each game.words as item, i (i)}
    {@const pos = getPosition(i, game.words.length, game.roscoSize / 2)}
    {@const isActive = i === game.currentIndex && item.status !== 'correct' && item.status !== 'incorrect'}
    <div
      class={cn(
        "absolute flex flex-col items-center justify-center rounded-full font-extrabold text-xl text-white border-[3px] backdrop-blur-sm rosco-item",
        item.status === 'unanswered' || item.status === 'passed' ? "bg-slate-800/80 border-indigo-400" : "",
        isActive ? "border-white bg-indigo-500 z-20 rosco-active" : "",
        item.status === 'correct' ? "bg-green-500 border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.7)]" : "",
        item.status === 'incorrect' ? "bg-red-500 border-red-400 shadow-[0_0_20px_rgba(248,113,113,0.7)]" : ""
      )}
      style="
        width: 44px; height: 44px;
        top: 50%; left: 50%;
        translate: calc(-50% + {pos.x}px) calc(-50% + {pos.y}px);
        scale: {isActive ? '1.4' : '1'};
        z-index: {isActive ? 10 : 1};
      "
    >
      {item.letter.toUpperCase()}
    </div>
  {/each}
</div>

<style>
  .rosco-item {
    /* Use explicit transitions rather than transition-all for better performance */
    transition: background-color 0.4s ease, border-color 0.4s ease, scale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease;
    will-change: transform, scale, box-shadow;
  }

  .rosco-active {
    animation: rosco-breathe 2s ease-in-out infinite;
    /* Prioritize this element for GPU acceleration */
    will-change: transform, scale, box-shadow;
  }

  @keyframes rosco-breathe {
    0%, 100% {
      scale: 1.4;
      box-shadow: 0 0 25px rgba(99, 102, 241, 0.9);
    }
    50% {
      scale: 1.3;
      box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
    }
  }
</style>
