import { getContext, setContext } from "svelte";
import type { WordItem, RoscoGenerateItem } from "$lib/types";

export class GameState {
    status = $state<"setup" | "playing" | "results">("setup");
    words = $state<WordItem[]>([]);
    currentIndex = $state(0);
    answer = $state("");
    loading = $state(false);
    errorMsg = $state("");
    roscoSize = $state(320);
    secureToken = $state("");

    constructor(initialWords?: RoscoGenerateItem[]) {
        if (initialWords && initialWords.length > 0) {
            this.words = initialWords.map(item => ({ ...item, status: 'unanswered' }));
            this.status = "playing";
            this.currentIndex = 0;
        }
    }

    setSecureToken(token: string) {
        this.secureToken = token;
    }

    get currentItem() {
        return this.words[this.currentIndex];
    }

    get correctCount() {
        return this.words.filter(w => w.status === 'correct').length;
    }

    get incorrectCount() {
        return this.words.filter(w => w.status === 'incorrect').length;
    }

    normalizeString(str: string): string {
        return str.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    async generateRosco() {
        try {
            this.loading = true;
            this.errorMsg = "";
            const res = await fetch('/api/generate-rosco', {
                headers: {
                    'x-pasapalabra-client': 'true',
                    'x-secure-token': this.secureToken
                }
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Error en la petición');
            }
            const data = await res.json();
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('La IA no devolvió un formato válido.');
            }
            this.words = data.map(item => ({ ...item, status: 'unanswered' }));
            this.currentIndex = 0;
            this.status = "playing";
        } catch (err: any) {
            console.error(err);
            this.errorMsg = `Error: ${err.message}. Revisa la consola o tu API Key.`;
        } finally {
            this.loading = false;
        }
    }

    findNextUnansweredIndex(): number {
        let nextIndex = (this.currentIndex + 1) % this.words.length;
        let loops = 0;
        while (
            (this.words[nextIndex].status === 'correct' || this.words[nextIndex].status === 'incorrect') &&
            loops < this.words.length
        ) {
            nextIndex = (nextIndex + 1) % this.words.length;
            loops++;
        }
        if (loops >= this.words.length) return -1;
        return nextIndex;
    }

    checkGameOver() {
        const isGameOver = this.words.every(w => w.status === 'correct' || w.status === 'incorrect');
        if (isGameOver) {
            this.status = "results";
        } else {
            const nextIdx = this.findNextUnansweredIndex();
            if (nextIdx !== -1) {
                this.currentIndex = nextIdx;
            }
        }
    }

    submitAnswer() {
        if (!this.answer) return;
        const isCorrect = this.normalizeString(this.answer) === this.normalizeString(this.currentItem.word);
        this.words[this.currentIndex].status = isCorrect ? 'correct' : 'incorrect';
        this.answer = "";
        this.checkGameOver();
    }

    passTurn() {
        this.words[this.currentIndex].status = 'passed';
        this.answer = "";
        this.checkGameOver();
    }

    restart() {
        this.words = [];
        this.status = "setup";
    }
}

const STATE_KEY = Symbol("GAME_STATE");

export function initGameState(initialWords?: RoscoGenerateItem[]) {
    const state = new GameState(initialWords);
    setContext(STATE_KEY, state);
    return state;
}

export function getGameState() {
    return getContext<ReturnType<typeof initGameState>>(STATE_KEY);
}
