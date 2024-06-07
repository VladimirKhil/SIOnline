import localization from '../model/resources/localization';

function getLocalizedError(error: Error): string {
	return error.message === 'Failed to fetch'
		? localization.failedToFetch
		: (error.name === 'NotReadableError' ? localization.fileNonReadable : error.message);
}

export default function getErrorMessage(e: unknown): string {
	return e instanceof Error ? getLocalizedError(e) : (e as Record<string, unknown>).toString();
}