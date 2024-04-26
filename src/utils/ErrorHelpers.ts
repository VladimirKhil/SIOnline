import localization from '../model/resources/localization';

function getLocalizedError(error: string): string {
	return error === 'Failed to fetch' ? localization.failedToFetch : error;
}

export default function getErrorMessage(e: unknown): string {
	return e instanceof Error ? getLocalizedError(e.message) : (e as Record<string, unknown>).toString();
}