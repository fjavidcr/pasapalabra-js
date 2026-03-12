import { AVAILABLE_MODELS } from '$lib/config/models'
import { generateRoscoWords } from '$lib/server/gemini'
import { generateSecureToken, validateSecureToken } from '$lib/server/security'
import { getStats, getSavedGame, saveGame } from '$lib/server/sessionService'
import type { RoscoGenerateItem } from '$lib/types'
import type { AstroSession } from 'astro'
import type { GameStats, SavedGame } from '$lib/server/sessionService'

export async function handleGameSSR(
  request: Request,
  session: AstroSession | undefined
): Promise<{
  setupErrorMsg?: string
  redirectRoute?: string
  secureToken: string
  preferredModelId?: string
  preferredDifficulty?: string
  preferredCategory?: string
  stats: GameStats
  savedGame?: SavedGame
}> {
  console.log(`--- SSR REQUEST: ${request.method} ${new URL(request.url).pathname} ---`)
  let setupErrorMsg: string | undefined
  let secureToken = ''

  try {
    secureToken = generateSecureToken()
  } catch (error) {
    console.error('Error generating secure token', error)
  }

  // Leer datos de sesión en paralelo
  const [preferredModelId, preferredDifficulty, preferredCategory, stats, savedGame] =
    await Promise.all([
      session
        ? (session.get('preferredModel') as Promise<string | undefined>)
        : Promise.resolve(undefined),
      session
        ? (session.get('preferredDifficulty') as Promise<string | undefined>)
        : Promise.resolve(undefined),
      session
        ? (session.get('preferredCategory') as Promise<string | undefined>)
        : Promise.resolve(undefined),
      getStats(session),
      getSavedGame(session)
    ])

  if (request.method === 'POST') {
    const formData = await request.formData()
    const submittedToken = formData.get('secureToken') as string
    const submittedModelId = formData.get('modelId') as string
    const submittedDifficulty = formData.get('difficulty') as string
    const submittedCategory = formData.get('category') as string

    try {
      validateSecureToken(submittedToken)

      if (submittedModelId && !AVAILABLE_MODELS.some((m) => m.id === submittedModelId)) {
        throw new Error('Modelo no válido seleccionado.')
      }

      if (session) {
        if (submittedModelId) {
          session.set('preferredModel', submittedModelId)
        }
        if (submittedDifficulty) {
          session.set('preferredDifficulty', submittedDifficulty)
        }
        if (submittedCategory) {
          session.set('preferredCategory', submittedCategory)
        }
      }

      // 1. Generar el rosco
      const words = await generateRoscoWords(formData)

      // 2. Guardarlo en la sesión para poder recuperarlo tras la redirección
      // (Es necesario para evitar el aviso de POST del navegador al refrescar)
      if (session) {
        await saveGame(session, {
          words: words.map((w: RoscoGenerateItem) => ({ ...w, status: 'unanswered' })),
          currentIndex: 0,
          modelId: submittedModelId || undefined,
          difficulty: submittedDifficulty || 'medium',
          category: submittedCategory || 'general'
        })
      }

      // 3. Redirigir a GET / para que la URL sea limpia y el renderizado sea SSR
      return {
        secureToken,
        stats,
        redirectRoute: '/'
      }
    } catch {
      return {
        secureToken,
        preferredModelId,
        stats,
        redirectRoute: '/?error=expired'
      }
    }
  } else if (request.method === 'GET') {
    const url = new URL(request.url)
    if (url.searchParams.get('error') === 'expired') {
      setupErrorMsg =
        'La sesión había expirado por inactividad, pero la hemos renovado automáticamente. Por favor, inténtalo de nuevo.'
    }
  }

  return {
    setupErrorMsg,
    secureToken,
    preferredModelId,
    preferredDifficulty,
    preferredCategory,
    stats,
    savedGame
  }
}
