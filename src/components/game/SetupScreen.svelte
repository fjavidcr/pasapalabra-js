<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "$lib/components/ui/card";
  import { getGameState } from "$lib/state/game.svelte";
  import { LoaderCircle } from "@lucide/svelte";

  const game = getGameState();
</script>

<Card class="w-full mx-auto text-center max-w-lg border-white/10 glass-card animate-in fade-in slide-in-from-bottom-8 duration-700">
  <CardHeader class="pb-6 pt-10">
    <CardTitle class="text-6xl font-extrabold tracking-tight mb-2">
      <span class="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-indigo-400 to-purple-400 drop-shadow-sm">Pasapalabra AI</span>
    </CardTitle>
    <CardDescription class="text-2xl mt-4 font-medium text-slate-300">El Rosco Inteligente con Gemini</CardDescription>
  </CardHeader>
  <CardContent class="px-8 pb-10">
    {#if game.errorMsg}
      <div class="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium animate-in slide-in-from-top-2">
        {game.errorMsg}
      </div>
    {/if}
    <p class="text-slate-400 mb-10 text-lg leading-relaxed">
      Ponte a prueba con un rosco completamente único de <span class="text-white font-bold">27 letras</span> generado en tiempo real.
    </p>
    <div class="relative group w-full mx-auto">
      <div class="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-50 group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>
      <Button size="lg" disabled={game.loading} onclick={() => game.generateRosco()} class="relative w-full flex items-center justify-center gap-2 h-14 text-lg font-bold shadow-xl transition-all duration-300 hover:-translate-y-1">
        {#if game.loading}
        <LoaderCircle class="animate-spin" data-icon="inline-start" />
        Generando Rosco...
      {:else}
        Generar Rosco
      {/if}
      </Button>
    </div>
  </CardContent>
</Card>
