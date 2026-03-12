import type { APIRoute } from 'astro'
import { validateApiRequest } from '$lib/server/security'
import { saveGame } from '$lib/server/sessionService'
import type { SavedGame } from '$lib/server/sessionService'

export const POST: APIRoute = async ({ request, session }) => {
  const error = validateApiRequest(request)
  if (error) {
    console.error('--- API SAVE-GAME: Security validation failed ---')
    return error
  }

  try {
    const body: { game: SavedGame | null } = await request.json()
    console.log(`--- API SAVE-GAME: Received ${body.game ? 'game state' : 'null'} ---`)
    await saveGame(session, body.game)
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (err) {
    console.error('--- API SAVE-GAME: Server error ---', err)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}
