import ErrorCode from '../client/contracts/ErrorCode';
import localization from '../model/resources/localization';

function getHttpErrorBodyMessage(body: unknown): string {
	if (typeof body === 'string') {
		return body;
	}

	if (body && typeof body === 'object') {
		const bodyAsRecord = body as Record<string, unknown>;
		const messageCandidates = ['message', 'error', 'detail', 'title', 'reason'];

		for (const candidate of messageCandidates) {
			const candidateValue = bodyAsRecord[candidate];
			if (typeof candidateValue === 'string' && candidateValue.trim().length > 0) {
				return candidateValue.trim();
			}
		}
	}

	return '';
}

export async function getHttpErrorDetails(response: Response): Promise<string> {
	const statusInfo = `${response.status}${response.statusText ? ` ${response.statusText}` : ''}`;

	try {
		const contentType = response.headers.get('content-type')?.toLowerCase() || '';
		let bodyMessage = '';

		if (contentType.includes('application/json')) {
			const body = await response.clone().json() as unknown;
			bodyMessage = getHttpErrorBodyMessage(body);
		} else {
			const bodyText = (await response.clone().text()).trim();
			if (bodyText.length > 0) {
				try {
					const parsedBody = JSON.parse(bodyText) as unknown;
					bodyMessage = getHttpErrorBodyMessage(parsedBody);
				} catch {
					bodyMessage = bodyText;
				}
			}
		}

		return bodyMessage.length > 0 ? `${statusInfo}: ${bodyMessage}` : statusInfo;
	} catch {
		return statusInfo;
	}
}

function getLocalizedError(error: Error): string {
	if (error.message === 'Failed to fetch' || error.message.includes('error sending request')) {
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
