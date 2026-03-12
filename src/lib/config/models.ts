export const AVAILABLE_MODELS = [
  {
    id: 'gemini-3.1-flash-lite-preview',
    label: 'Gemini 3.1 Flash Lite Preview'
  },
  { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash Preview' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' }
] as const

export type GeminiModelId = (typeof AVAILABLE_MODELS)[number]['id']

export const DEFAULT_MODEL_ID: GeminiModelId = 'gemini-3.1-flash-lite-preview'
