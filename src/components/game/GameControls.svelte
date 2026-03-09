<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "$lib/components/ui/card";
  import { getGameState } from "$lib/state/game.svelte";

  const game = getGameState();
</script>

<Card class="w-full border-2 shadow-xl bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75">
  <CardHeader class="text-center pb-4 border-b">
    <CardTitle class="text-6xl text-primary uppercase mb-4 tracking-tight drop-shadow-sm">
      {game.currentItem.letter}
    </CardTitle>
    <CardDescription class="text-xl text-foreground/90 leading-relaxed max-w-[90%] mx-auto">
      <span class="font-bold text-primary mr-1">
        {game.currentItem.type === 'INCLUDES' ? 'Contiene la' : 'Empieza por la'} {game.currentItem.letter.toUpperCase()}:
      </span> 
      {game.currentItem.definition}
    </CardDescription>
  </CardHeader>
  <CardContent class="pt-6">
    <form onsubmit={(e) => { e.preventDefault(); game.submitAnswer(); }} class="flex flex-col gap-6">
      <Input 
        bind:value={game.answer} 
        placeholder="Escribe tu respuesta..." 
        autocomplete="off" 
        class="text-center text-xl py-8 font-medium shadow-inner bg-slate-50 dark:bg-slate-900 border-2 focus-visible:ring-primary/50"
        autofocus
      />
      <div class="flex gap-4 w-full">
        <Button type="submit" class="flex-1 h-14 text-lg font-bold shadow-md hover:scale-[1.02] transition-transform" size="lg">
          Enviar Respuesta
        </Button>
        <Button type="button" variant="secondary" class="h-14 text-lg font-bold hover:scale-[1.02] transition-transform shadow-md border" size="lg" onclick={() => game.passTurn()}>
          Pasapalabra
        </Button>
      </div>
    </form>
  </CardContent>
</Card>
