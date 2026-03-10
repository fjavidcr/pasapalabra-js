<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { getGameState } from "$lib/state/game.svelte";

  const game = getGameState();
</script>

<Card class="w-full text-center max-w-lg glass-card animate-in fade-in slide-in-from-bottom-8 duration-700">
  <CardHeader class="pb-2">
    <CardTitle class="text-5xl font-extrabold tracking-tight">
      <span class="bg-clip-text text-transparent bg-linear-to-br from-amber-500 to-orange-400">¡Juego Terminado!</span>
    </CardTitle>
    <CardDescription class="text-xl mt-3 font-medium">Resumen de tu puntuación</CardDescription>
  </CardHeader>
  <CardContent class="flex flex-col gap-8 py-10 my-4 border-y border-border/50 bg-slate-50/30 dark:bg-slate-900/30">
    <div class="flex justify-center gap-12">
      <div class="flex flex-col items-center gap-3">
        <span class="text-sm text-green-600 dark:text-green-400 font-bold uppercase tracking-wider animate-in fade-in duration-500 delay-150 fill-mode-both">Acertadas</span>
        <Badge variant="default" class="bg-green-500 hover:bg-green-600 text-4xl px-6 py-2 shadow-[0_0_20px_rgba(34,197,94,0.6)] animate-in zoom-in-50 slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">{game.correctCount}</Badge>
      </div>
      <div class="flex flex-col items-center gap-3">
        <span class="text-sm text-red-600 dark:text-red-400 font-bold uppercase tracking-wider animate-in fade-in duration-500 delay-300 fill-mode-both">Falladas</span>
        <Badge variant="destructive" class="text-4xl px-6 py-2 shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-in zoom-in-50 slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">{game.incorrectCount}</Badge>
      </div>
    </div>

    {#if game.words.filter(w => w.status === 'incorrect').length > 0}
      <div class="mt-4 text-left w-full max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 delay-[600ms] fill-mode-both">
        <h3 class="text-lg font-bold mb-3 text-slate-300 px-2">Has fallado:</h3>
        <ul class="flex flex-col gap-3 max-h-[40vh] overflow-y-auto w-full pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {#each game.words.filter(w => w.status === 'incorrect') as item}
            <li class="p-4 rounded-xl bg-slate-900/40 border border-slate-700/50 flex flex-col gap-1 shadow-sm backdrop-blur-md">
              <div class="flex items-center gap-3">
                <span class="flex items-center justify-center size-8 rounded-full bg-red-500/20 text-red-400 font-bold border border-red-500/30 shrink-0 text-sm">
                  {item.letter}
                </span>
                <span class="text-lg font-bold text-slate-100">{item.word}</span>
              </div>
              <p class="text-sm text-slate-400 mt-2 pl-11">{item.definition}</p>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </CardContent>
  <CardFooter class="justify-center pt-8">
    <div class="relative group w-full sm:w-2/3">
      <div class="absolute -inset-1 bg-linear-to-r from-blue-500 to-indigo-500 rounded-lg blur opacity-30 group-hover:opacity-75 transition duration-500 group-hover:duration-200"></div>
      <Button size="lg" onclick={() => game.restart()} class="relative w-full h-14 text-lg font-bold shadow-xl transition-all duration-300 hover:-translate-y-1">
        Volver a Jugar
      </Button>
    </div>
  </CardFooter>
</Card>
