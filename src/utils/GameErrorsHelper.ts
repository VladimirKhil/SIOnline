import localization from '../model/resources/localization';

export function getMessage(code: number): string {
	switch (code) {
		case 1:
			return localization.errorPackageNotFound;

		case 2:
			return localization.errorTooManyGames;

		case 3:
			return localization.errorServerUnderMaintainance;

		case 4:
			return localization.errorBadPackage;

		case 5:
			return localization.errorDuplicateGameName;

		case 6:
			return localization.errorInternalServerError;

		case 7:
			return localization.errorServerNotReady;

		case 8:
			return localization.errorObsoleteVersion;

		case 9:
			return localization.errorUnknownError;

		case 10:
			return localization.joinError;

		case 11:
			return localization.wrongGameSettings;

		case 12:
			return localization.tooManyGamesByIp;

		default:
			return localization.errorUnknownError;
	}
}
