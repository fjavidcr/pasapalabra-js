<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
  } from '$lib/components/ui/card'
  import { Input } from '$lib/components/ui/input'
  import { getGameState } from '$lib/state/game.svelte'

  const game = getGameState()
</script>

<Card
  class="glass-card animate-in slide-in-from-bottom-6 fade-in w-full border-white/20 duration-500 dark:border-white/10">
  <CardHeader
    class="border-border/50 flex flex-col items-center gap-6 border-b px-6 pt-8 pb-6 text-center sm:flex-row sm:items-start sm:px-8 sm:text-left">
    <div
      class="bg-primary/10 ring-primary/20 inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-full shadow-inner ring-4">
      <CardTitle class="text-primary text-glow text-6xl font-black tracking-tight uppercase">
        {game.currentItem.letter}
      </CardTitle>
    </div>
    <div class="flex flex-col justify-center pt-1 sm:pt-2">
      <CardDescription class="text-foreground text-xl leading-relaxed font-medium sm:text-2xl">
        <span
          class="from-primary mr-2 bg-linear-to-r to-purple-500 bg-clip-text font-bold text-transparent">
          {game.currentItem.type === 'INCLUDES' ? 'Contiene la' : 'Empieza por la'}
          {game.currentItem.letter.toUpperCase()}:
        </span>
        {game.currentItem.definition}
      </CardDescription>
    </div>
  </CardHeader>
  <CardContent class="px-6 pt-8 pb-8 sm:px-8">
    <form
      onsubmit={(e) => {
        e.preventDefault()
        game.submitAnswer()
      }}
      class="flex flex-col gap-8">
      <div class="group relative">
        <div
          class="from-primary/50 absolute -inset-0.5 rounded-lg bg-linear-to-r to-purple-500/50 opacity-20 blur transition duration-500 group-focus-within:opacity-100">
        </div>
        <Input
          bind:value={game.answer}
          placeholder="Escribe tu respuesta..."
          autocomplete="off"
          class="focus-visible:border-primary/50 focus-visible:ring-primary/30 relative rounded-xl border-2 border-transparent bg-white/80 py-8 text-center text-2xl font-bold shadow-inner transition-all dark:bg-slate-900/80"
          autofocus />
      </div>
      <div class="flex w-full flex-col gap-4 sm:flex-row">
        <div class="group relative flex-1">
          <div
            class="from-primary absolute -inset-1 rounded-lg bg-linear-to-r to-indigo-500 opacity-40 blur transition duration-500 group-hover:opacity-100">
          </div>
          <Button
            type="submit"
            class="relative h-14 w-full text-lg font-bold shadow-xl transition-all duration-300 hover:-translate-y-1"
            size="lg">
            Enviar Respuesta
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          class="bg-background/50 h-14 flex-1 border-2 text-lg font-bold shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 sm:w-1/3 sm:flex-none"
          size="lg"
          onclick={() => game.passTurn()}>
          Pasapalabra
        </Button>
      </div>
    </form>
  </CardContent>
</Card>
