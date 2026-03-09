<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { getGameState } from "$lib/state/game.svelte";

  const game = getGameState();
</script>

<Card class="w-full text-center max-w-lg border-2 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
  <CardHeader>
    <CardTitle class="text-4xl font-extrabold tracking-tight">¡Juego Terminado!</CardTitle>
    <CardDescription class="text-lg mt-2">Aquí tienes los resultados de tu rosco</CardDescription>
  </CardHeader>
  <CardContent class="flex flex-col gap-8 py-8 border-y bg-slate-50/50 dark:bg-slate-900/50">
    <div class="flex justify-center gap-12">
      <div class="flex flex-col items-center gap-3">
        <span class="text-sm text-green-600 dark:text-green-400 font-bold uppercase tracking-wider">Acertadas</span>
        <Badge variant="default" class="bg-green-500 hover:bg-green-600 text-4xl px-6 py-2 shadow-lg shadow-green-500/20">{game.correctCount}</Badge>
      </div>
      <div class="flex flex-col items-center gap-3">
        <span class="text-sm text-red-600 dark:text-red-400 font-bold uppercase tracking-wider">Falladas</span>
        <Badge variant="destructive" class="text-4xl px-6 py-2 shadow-lg shadow-red-500/20">{game.incorrectCount}</Badge>
      </div>
    </div>
  </CardContent>
  <CardFooter class="justify-center pt-8">
    <Button size="lg" onclick={() => game.restart()} class="w-full sm:w-2/3 h-14 text-lg font-bold shadow-md hover:scale-105 transition-transform">
      Volver a Jugar
    </Button>
  </CardFooter>
</Card>
