<script lang="ts">
  import { onMount } from 'svelte'
  import { ExternalLink } from '@lucide/svelte'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
  } from '$lib/components/ui/card'
  import { getGameState } from '$lib/state/game.svelte'
  import type { GameStats } from '$lib/server/sessionService'

  let { stats }: { stats?: GameStats } = $props()
  const game = getGameState()

  // Guardar stats al montar la pantalla de resultados
  onMount(() => {
    fetch('/api/save-stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pasapalabra-client': 'true',
        'x-secure-token': game.secureToken
      },
      body: JSON.stringify({ words: game.words })
    }).catch(() => {})
  })

  // Top 3 letras más falladas (de historial previo)
  let hardestLetters = $derived(
    stats
      ? Object.entries(stats.failedLetters)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
      : []
  )
  // Mapas para visualización
  const difficultyLabels: Record<string, string> = {
    easy: 'Fácil',
    medium: 'Medio',
    hard: 'Difícil'
  }

  const difficultyColors: Record<string, string> = {
    easy: 'text-emerald-400',
    medium: 'text-amber-400',
    hard: 'text-rose-400'
  }

  let difficultyLabel = $derived(game.difficulty ? difficultyLabels[game.difficulty] : 'Medio')
  let difficultyColor = $derived(
    game.difficulty ? difficultyColors[game.difficulty] : 'text-amber-400'
  )
</script>

<Card
  class="glass-card animate-in fade-in slide-in-from-bottom-8 w-full max-w-lg text-center duration-700">
  <CardHeader class="pb-2">
    <CardTitle class="text-5xl font-extrabold tracking-tight">
      <span class="bg-linear-to-br from-amber-500 to-orange-400 bg-clip-text text-transparent"
        >¡Juego Terminado!</span>
    </CardTitle>
    <CardDescription class="mt-3 text-xl font-medium">
      <div class="flex flex-col items-center gap-1">
        <span>Resumen de tu puntuación</span>
        <div class="flex items-center gap-2 text-sm font-medium">
          {#if game.category && game.category !== 'general'}
            <span class="text-slate-500">
              Tema: <span class="text-sky-400"
                >{game.category.charAt(0).toUpperCase() + game.category.slice(1)}</span>
            </span>
            <span class="h-3 w-px bg-slate-700/50"></span>
          {/if}
          <span class="text-slate-500">
            Nivel: <span class={difficultyColor}>{difficultyLabel}</span>
          </span>
        </div>
      </div>
    </CardDescription>
  </CardHeader>
  <CardContent
    class="border-border/50 my-4 flex flex-col gap-8 border-y bg-slate-50/30 py-10 dark:bg-slate-900/30">
    <div class="flex justify-center gap-12">
      <div class="flex flex-col items-center gap-3">
        <span
          class="animate-in fade-in fill-mode-both text-sm font-bold tracking-wider text-green-600 uppercase delay-150 duration-500 dark:text-green-400"
          >Acertadas</span>
        <Badge
          variant="default"
          class="animate-in zoom-in-50 slide-in-from-bottom-4 fill-mode-both bg-green-500 px-6 py-2 text-4xl shadow-[0_0_20px_rgba(34,197,94,0.6)] delay-150 duration-500 hover:bg-green-600"
          >{game.correctCount}</Badge>
      </div>
      <div class="flex flex-col items-center gap-3">
        <span
          class="animate-in fade-in fill-mode-both text-sm font-bold tracking-wider text-red-600 uppercase delay-300 duration-500 dark:text-red-400"
          >Falladas</span>
        <Badge
          variant="destructive"
          class="animate-in zoom-in-50 slide-in-from-bottom-4 fill-mode-both px-6 py-2 text-4xl shadow-[0_0_20px_rgba(239,68,68,0.6)] delay-300 duration-500"
          >{game.incorrectCount}</Badge>
      </div>
    </div>

    {#if stats && stats.played > 0}
      <div
        class="animate-in fade-in slide-in-from-bottom-4 fill-mode-both mx-auto w-full max-w-xs rounded-xl border border-slate-700/40 bg-slate-900/30 px-6 py-4 text-sm delay-[450ms] duration-500">
        <p class="mb-3 text-xs font-bold tracking-wider text-slate-400 uppercase">Tu historial</p>
        <div class="flex justify-around">
          <div class="flex flex-col items-center gap-1">
            <span class="text-2xl font-extrabold text-slate-100">{stats.played}</span>
            <span class="text-xs text-slate-500">Partidas</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <span class="text-2xl font-extrabold text-indigo-400">{stats.won}</span>
            <span class="text-xs text-slate-500">Perfectas</span>
          </div>
          {#if hardestLetters.length > 0}
            <div class="flex flex-col items-center gap-1">
              <span class="text-2xl font-extrabold text-amber-400"
                >{hardestLetters.map(([l]) => l).join(', ')}</span>
              <span class="text-xs text-slate-500">Más falladas</span>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    {#if game.words.filter((w) => w.status === 'incorrect').length > 0}
      <div
        class="animate-in fade-in slide-in-from-bottom-4 fill-mode-both mx-auto mt-4 w-full max-w-lg text-left delay-[600ms] duration-500">
        <h3 class="mb-3 px-2 text-lg font-bold text-slate-300">Has fallado:</h3>
        <ul
          class="scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent flex max-h-[40vh] w-full flex-col gap-3 overflow-y-auto pr-2">
          {#each game.words.filter((w) => w.status === 'incorrect') as item (item.letter)}
            <li
              class="flex flex-col gap-1 rounded-xl border border-slate-700/50 bg-slate-900/40 p-4 shadow-sm backdrop-blur-md">
              <div class="flex items-center gap-3">
                <span class="sr-only">Letra {item.letter}:</span>
                <span
                  aria-hidden="true"
                  class="flex size-8 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/20 text-sm font-bold text-red-400">
                  {item.letter}
                </span>
                <span class="text-lg font-bold text-slate-100">{item.word}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  href="https://dle.rae.es/{item.word.toLowerCase()}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="ml-auto text-xs font-medium text-slate-500 hover:text-sky-400"
                  title="Ver en la RAE">
                  <span class="mr-1">Ver en la RAE</span>
                  <ExternalLink class="size-3" />
                </Button>
              </div>
              <p class="mt-2 pl-11 text-sm text-slate-400">{item.definition}</p>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </CardContent>
  <CardFooter class="justify-center pt-8">
    <div class="group relative w-full sm:w-2/3">
      <div
        class="absolute -inset-1 rounded-lg bg-linear-to-r from-blue-500 to-indigo-500 opacity-30 blur transition duration-500 group-hover:opacity-75 group-hover:duration-200">
      </div>
      <Button
        size="lg"
        onclick={() => game.restart()}
        class="relative h-14 w-full text-lg font-bold shadow-xl transition-all duration-300 hover:-translate-y-1">
        Volver a Jugar
      </Button>
    </div>
  </CardFooter>
</Card>
