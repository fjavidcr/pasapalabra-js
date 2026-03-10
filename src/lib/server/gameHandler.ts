import { generateRoscoWords } from '$lib/server/gemini';
import { generateSecureToken, validateSecureToken } from '$lib/server/security';
import type { RoscoGenerateItem } from '$lib/types';

export async function handleGameSSR(request: Request): Promise<{
	wordsPromise: Promise<RoscoGenerateItem[]> | null;
	setupErrorMsg?: string;
	redirectRoute?: string;
	secureToken: string;
}> {
	let wordsPromise: Promise<RoscoGenerateItem[]> | null = null;
	let setupErrorMsg: string | undefined = undefined;
	let secureToken = '';

	try {
		secureToken = generateSecureToken();
	} catch (error) {
		console.error('Error generating secure token', error);
		// Handle error gracefully or throw if app cannot start
	}

	if (request.method === "POST") {
		const formData = await request.formData();
		const submittedToken = formData.get('secureToken') as string;
		
		try {
			// Validamos sincrónicamente para redirigir rápido si expiró
			validateSecureToken(submittedToken);
			wordsPromise = generateRoscoWords(formData);
		} catch (error: any) {
			return { wordsPromise: null, secureToken, redirectRoute: '/?error=expired' };
		}
	} else if (request.method === "GET") {
		const url = new URL(request.url);
		if (url.searchParams.get('error') === 'expired') {
			setupErrorMsg = 'La sesión había expirado por inactividad, pero la hemos renovado automáticamente. Por favor, inténtalo de nuevo.';
		}
	}

	return { wordsPromise, setupErrorMsg, secureToken };
}
