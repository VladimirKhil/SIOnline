import ErrorCode from '../client/contracts/ErrorCode';
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
	} else if (error.message.startsWith('HTTP 503')) {
		return 'Service Temporarily Unavailable';
	} else {
		return error.message;
	}
}

export default function getErrorMessage(e: unknown): string {
	return e instanceof Error ? getLocalizedError(e) : (e as Record<string, unknown>).toString();
}

export function getUserError(errorCode: ErrorCode, args: string[]): string {
	switch (errorCode) {
		case ErrorCode.OversizedFile: return 'File is too large';
		case ErrorCode.CannotKickYourSelf: return 'Cannot kick yourself';
		case ErrorCode.CannotKickBots: return 'Cannot kick bots';
		case ErrorCode.CannotSetHostToYourself: return 'Cannot set host to yourself';
		case ErrorCode.CannotSetHostToBots: return 'Cannot set host to bots';
		case ErrorCode.AvatarTooBig: return 'Avatar image is too big';
		case ErrorCode.InvalidAvatar: return 'Avatar image format is not supported';
		case ErrorCode.PersonAlreadyExists: return 'Person with the same name already exists';
		case ErrorCode.AppellationFailedTooFewPlayers: return 'Appellation failed: too few players';
		default: return '';
	}
}