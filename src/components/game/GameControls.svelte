<script lang="ts">
import { Button } from '$lib/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card'
import { Input } from '$lib/components/ui/input'
import { getGameState } from '$lib/state/game.svelte'

const game = getGameState()
</script>

<Card class="w-full border-white/20 dark:border-white/10 glass-card animate-in slide-in-from-bottom-6 fade-in duration-500">
  <CardHeader class="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 pt-8 px-6 sm:px-8 border-b border-border/50 text-center sm:text-left">
    <div class="shrink-0 inline-flex justify-center items-center w-20 h-20 rounded-full bg-primary/10 shadow-inner ring-4 ring-primary/20">
      <CardTitle class="text-6xl text-primary font-black uppercase tracking-tight text-glow">
        {game.currentItem.letter}
      </CardTitle>
    </div>
    <div class="flex flex-col justify-center pt-1 sm:pt-2">
      <CardDescription class="text-xl sm:text-2xl text-foreground font-medium leading-relaxed">
        <span class="font-bold text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-500 mr-2">
          {game.currentItem.type === 'INCLUDES' ? 'Contiene la' : 'Empieza por la'} {game.currentItem.letter.toUpperCase()}:
        </span> 
        {game.currentItem.definition}
      </CardDescription>
    </div>
  </CardHeader>
  <CardContent class="pt-8 px-6 sm:px-8 pb-8">
    <form onsubmit={(e) => { e.preventDefault(); game.submitAnswer(); }} class="flex flex-col gap-8">
      <div class="relative group">
        <div class="absolute -inset-0.5 bg-linear-to-r from-primary/50 to-purple-500/50 rounded-lg blur opacity-20 group-focus-within:opacity-100 transition duration-500"></div>
        <Input 
          bind:value={game.answer} 
          placeholder="Escribe tu respuesta..." 
          autocomplete="off" 
          class="relative text-center text-2xl py-8 font-bold shadow-inner bg-white/80 dark:bg-slate-900/80 border-2 border-transparent focus-visible:border-primary/50 focus-visible:ring-primary/30 transition-all rounded-xl"
          autofocus
        />
      </div>
      <div class="flex flex-col sm:flex-row gap-4 w-full">
        <div class="relative flex-1 group">
          <div class="absolute -inset-1 bg-linear-to-r from-primary to-indigo-500 rounded-lg blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
          <Button type="submit" class="relative w-full h-14 text-lg font-bold shadow-xl hover:-translate-y-1 transition-all duration-300" size="lg">
            Enviar Respuesta
          </Button>
        </div>
        <Button type="button" variant="outline" class="h-14 flex-1 sm:flex-none sm:w-1/3 text-lg font-bold hover:-translate-y-1 transition-all duration-300 shadow-sm border-2 bg-background/50 backdrop-blur-sm" size="lg" onclick={() => game.passTurn()}>
          Pasapalabra
        </Button>
      </div>
    </form>
  </CardContent>
</Card>
