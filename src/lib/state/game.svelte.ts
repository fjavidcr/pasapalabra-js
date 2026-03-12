import { getContext, setContext } from 'svelte'
import type { RoscoGenerateItem, WordItem } from '$lib/types'

export class GameState {
  status = $state<'setup' | 'playing' | 'results'>('setup')
  words = $state<WordItem[]>([])
  currentIndex = $state(0)
  answer = $state('')
  loading = $state(false)
  errorMsg = $state('')
  roscoSize = $state(320)
  secureToken = $state('')
  modelId = $state<string | undefined>(undefined)

  constructor(
    initialWords?: RoscoGenerateItem[] | WordItem[],
    initialModelId?: string,
    savedCurrentIndex?: number
  ) {
    if (initialWords && initialWords.length > 0) {
      this.words = (initialWords as (RoscoGenerateItem | WordItem)[]).map((item) => ({
        ...item,
        status: (item as WordItem).status ?? 'unanswered'
      }))
      this.status = 'playing'
      this.currentIndex = savedCurrentIndex ?? 0
      this.modelId = initialModelId
    }
  }

  setSecureToken(token: string) {
    this.secureToken = token
  }

  get currentItem() {
    return this.words[this.currentIndex]
  }

  get correctCount() {
    return this.words.filter((w) => w.status === 'correct').length
  }

  get incorrectCount() {
    return this.words.filter((w) => w.status === 'incorrect').length
  }

  normalizeString(str: string): string {
    return str
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  }

  async generateRosco() {
    try {
      this.loading = true
      this.errorMsg = ''
      const res = await fetch('/api/generate-rosco', {
        headers: {
          'x-pasapalabra-client': 'true',
          'x-secure-token': this.secureToken
        }
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Error en la petición')
      }
      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('La IA no devolvió un formato válido.')
      }
      this.words = data.map((item) => ({ ...item, status: 'unanswered' }))
      this.currentIndex = 0
      this.status = 'playing'
    } catch (err: unknown) {
      console.error(err)
      const errorMsg = err instanceof Error ? err.message : String(err)
      this.errorMsg = `Error: ${errorMsg}. Revisa la consola o tu API Key.`
    } finally {
      this.loading = false
    }
  }

  findNextUnansweredIndex(): number {
    let nextIndex = (this.currentIndex + 1) % this.words.length
    let loops = 0
    while (
      loops < this.words.length &&
      (this.words[nextIndex].status === 'correct' || this.words[nextIndex].status === 'incorrect')
    ) {
      nextIndex = (nextIndex + 1) % this.words.length
      loops++
    }
    if (loops >= this.words.length) return -1
    return nextIndex
  }

  checkGameOver() {
    const isGameOver = this.words.every((w) => w.status === 'correct' || w.status === 'incorrect')
    if (isGameOver) {
      this.status = 'results'
      // Limpiar la partida guardada al terminar
      this.saveToSession(null)
    } else {
      const nextIdx = this.findNextUnansweredIndex()
      if (nextIdx !== -1) {
        this.currentIndex = nextIdx
      }
      // Guardar estado tras cada respuesta
      this.saveToSession({
        words: $state.snapshot(this.words),
        currentIndex: this.currentIndex,
        modelId: this.modelId
      })
    }
  }

  submitAnswer() {
    if (!this.answer) return
    const isCorrect =
      this.normalizeString(this.answer) === this.normalizeString(this.currentItem.word)
    this.words[this.currentIndex].status = isCorrect ? 'correct' : 'incorrect'
    this.answer = ''
    this.checkGameOver()
  }

  passTurn() {
    this.words[this.currentIndex].status = 'passed'
    this.answer = ''
    this.checkGameOver()
  }

  async restart() {
    this.status = 'setup'
    await this.saveToSession(null)
    this.words = []
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  async saveToSession(
    game: { words: WordItem[]; currentIndex: number; modelId?: string } | null
  ): Promise<void> {
    // Fire-and-forget: no bloqueamos la UI
    // Solo guardamos si tenemos el secureToken (para evitar errores en SSR puro antes de hidratación)
    if (!this.secureToken) return

    // Si estamos guardando un estado (no borrándolo con null)
    if (game && game.words) {
      // No guardamos si no se ha interactuado con ninguna letra aún
      const hasInteraction = game.words.some((w) => w.status !== 'unanswered')
      if (!hasInteraction) return
    }

    return fetch('/api/save-game', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pasapalabra-client': 'true',
        'x-secure-token': this.secureToken
      },
      body: JSON.stringify({ game })
    })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            this.errorMsg =
              'Tu sesión de seguridad ha expirado. Por favor, recarga la página (F5) para seguir guardando tu progreso.'
          } else {
            const data = await res.json().catch(() => ({}))
            this.errorMsg = data.error || 'Error al guardar la partida.'
          }
        }
      })
      .catch(() => {
        // Error de red
        this.errorMsg = 'Error de conexión. Es posible que tu progreso no se esté guardando.'
      })
  }
}

const STATE_KEY = Symbol('GAME_STATE')

export function initGameState(
  initialWords?: RoscoGenerateItem[] | WordItem[],
  initialModelId?: string,
  savedCurrentIndex?: number
) {
  const state = new GameState(initialWords, initialModelId, savedCurrentIndex)
  setContext(STATE_KEY, state)
  return state
}

export function getGameState() {
  return getContext<GameState>(STATE_KEY)
}
