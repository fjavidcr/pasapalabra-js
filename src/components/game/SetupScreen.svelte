<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "$lib/components/ui/card";
  import { getGameState } from "$lib/state/game.svelte";

  const game = getGameState();
</script>

<Card class="w-full text-center max-w-lg border-2 shadow-lg">
  <CardHeader>
    <CardTitle class="text-4xl text-primary font-extrabold tracking-tight">Pasapalabra AI</CardTitle>
    <CardDescription class="text-lg mt-2">Rosco generado con Google Gemini</CardDescription>
  </CardHeader>
  <CardContent>
    {#if game.errorMsg}
      <div class="px-4 py-3 mb-6 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800" role="alert">
        {game.errorMsg}
      </div>
    {/if}
    <p class="text-muted-foreground mb-8">
      Genera un rosco completamente nuevo de 27 letras usando inteligencia artificial de última generación.
    </p>
    <Button size="lg" disabled={game.loading} onclick={() => game.generateRosco()} class="w-full sm:w-2/3 h-14 text-lg font-bold shadow-md hover:scale-105 transition-transform">
      {#if game.loading}
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Generando Rosco...
      {:else}
        Generar Rosco
      {/if}
    </Button>
  </CardContent>
</Card>
