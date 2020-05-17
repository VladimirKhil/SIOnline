import localization from '../model/resources/localization';

const messagesMap: Record<number, string> = {
	1: localization.errorPackageNotFound,
	2: localization.errorTooManyGames,
	3: localization.errorServerUnderMaintainance,
	4: localization.errorBadPackage,
	5: localization.errorDuplicateGameName,
	6: localization.errorInternalServerError,
	7: localization.errorServerNotReady,
	8: localization.errorObsoleteVersion // Неактуально для веб-версии
};

export function getMessage(code: number): string {
	const message = messagesMap[code];
	return message || localization.errorUnknownError;
}
