import localization from '../model/resources/localization';

function getLocalizedError(error: Error): string {
	if (error.message === 'Failed to fetch') {
		return localization.failedToFetch;
	} else if (error.name === 'NotReadableError') {
		return localization.fileNonReadable;
	} else if (error.message.startsWith('Failed to complete negotiation with the server')) {
		return localization.failedToCompleteNegotiationWithTheServer;
	} else if (error.message.startsWith('429 API calls quota exceeded')) {
		return localization.apiCallsQuotaExceeded;
	} else {
		return error.message;
	}
}

export default function getErrorMessage(e: unknown): string {
	return e instanceof Error ? getLocalizedError(e) : (e as Record<string, unknown>).toString();
}