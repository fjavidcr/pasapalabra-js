import type { AstroSession } from 'astro'
import type { WordItem } from '$lib/types'

// ─── Stats (Feature 2) ────────────────────────────────────────────────────

export interface GameStats {
  played: number
  won: number
  failedLetters: Record<string, number>
}

const DEFAULT_STATS: GameStats = { played: 0, won: 0, failedLetters: {} }

export async function getStats(session: AstroSession | undefined): Promise<GameStats> {
  if (!session) return DEFAULT_STATS
  return ((await session.get('stats')) as GameStats) ?? DEFAULT_STATS
}

export async function saveStats(
  session: AstroSession | undefined,
  words: WordItem[]
): Promise<void> {
  if (!session) return

  const current = await getStats(session)
  const won = words.every((w) => w.status === 'correct')
  const failedLetters = { ...current.failedLetters }

  for (const w of words) {
    if (w.status === 'incorrect') {
      failedLetters[w.letter] = (failedLetters[w.letter] ?? 0) + 1
    }
  }

  const updated: GameStats = {
    played: current.played + 1,
    won: current.won + (won ? 1 : 0),
    failedLetters
  }

  session.set('stats', updated)
}

// ─── Saved Game (Feature 3) ──────────────────────────────────────────────

export interface SavedGame {
  words: WordItem[]
  currentIndex: number
  modelId?: string
  difficulty?: string
}

export async function getSavedGame(
  session: AstroSession | undefined
): Promise<SavedGame | undefined> {
  if (!session) return undefined
  const game = (await session.get('savedGame')) as SavedGame | undefined
  if (game) {
    console.log(
      `--- SESSION: Restoring game with ${game.words.filter((w) => w.status !== 'unanswered').length} answers ---`
    )
  }
  return game
}

export async function saveGame(
  session: AstroSession | undefined,
  game: SavedGame | null
): Promise<void> {
  if (!session) return
  if (game === null) {
    console.log('--- SESSION: Cleaning saved game ---')
    session.set('savedGame', undefined)
  } else {
    console.log(
      `--- SESSION: Saving game with ${game.words.filter((w) => w.status !== 'unanswered').length} answers ---`
    )
    session.set('savedGame', game)
  }
}
