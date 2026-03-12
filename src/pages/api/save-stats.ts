import type { APIRoute } from 'astro'
import { validateApiRequest } from '$lib/server/security'
import { saveStats } from '$lib/server/sessionService'
import type { WordItem } from '$lib/types'

export const POST: APIRoute = async ({ request, session }) => {
  const error = validateApiRequest(request)
  if (error) return error

  try {
    const { words }: { words: WordItem[] } = await request.json()
    if (!Array.isArray(words)) {
      return new Response(JSON.stringify({ error: 'Invalid data' }), { status: 400 })
    }
    await saveStats(session, words)
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}
