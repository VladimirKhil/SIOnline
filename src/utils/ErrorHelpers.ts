import localization from '../model/resources/localization';

function getLocalizedError(error: Error): string {
	if (error.message === 'Failed to fetch') {
		return localization.failedToFetch;
	} else if (error.name === 'NotReadableError') {
		return localization.fileNonReadable;
	} else if (error.message.startsWith('Failed to complete negotiation with the server')) {
		return localization.failedToCompleteNegotiationWithTheServer;
	} else {
		return error.message;
	}
}

export default function getErrorMessage(e: unknown): string {
	return e instanceof Error ? getLocalizedError(e) : (e as Record<string, unknown>).toString();
}