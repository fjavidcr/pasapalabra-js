import { AVAILABLE_MODELS } from '$lib/config/models'
import { generateRoscoWords } from '$lib/server/gemini'
import { generateSecureToken, validateSecureToken } from '$lib/server/security'
import type { RoscoGenerateItem } from '$lib/types'

export async function handleGameSSR(request: Request): Promise<{
  wordsPromise: Promise<RoscoGenerateItem[]> | null
  setupErrorMsg?: string
  redirectRoute?: string
  secureToken: string
  modelId?: string
}> {
  let wordsPromise: Promise<RoscoGenerateItem[]> | null = null
  let setupErrorMsg: string | undefined
  let secureToken = ''
  let modelId: string | undefined

  try {
    secureToken = generateSecureToken()
  } catch (error) {
    console.error('Error generating secure token', error)
    // Handle error gracefully or throw if app cannot start
  }

  if (request.method === 'POST') {
    const formData = await request.formData()
    const submittedToken = formData.get('secureToken') as string
    const submittedModelId = formData.get('modelId') as string
    modelId = submittedModelId || undefined

    try {
      // Validamos sincrónicamente para redirigir rápido si expiró
      validateSecureToken(submittedToken)

      // Validamos el modelo seleccionado
      if (submittedModelId && !AVAILABLE_MODELS.some((m) => m.id === submittedModelId)) {
        throw new Error('Modelo no válido seleccionado.')
      }

      wordsPromise = generateRoscoWords(formData)
    } catch {
      return {
        wordsPromise: null,
        secureToken,
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

  return { wordsPromise, setupErrorMsg, secureToken, modelId }
}
