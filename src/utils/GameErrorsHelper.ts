import GameCreationResultCode from '../client/contracts/GameCreationResultCode';
import JoinGameErrorType from '../client/contracts/JoinGameErrorType';
import localization from '../model/resources/localization';

export function getMessage(code: GameCreationResultCode): string {
	switch (code) {
		case GameCreationResultCode.NoPackage:
			return localization.errorPackageNotFound;

		case GameCreationResultCode.TooMuchGames:
			return localization.errorTooManyGames;

		case GameCreationResultCode.ServerUnderMaintainance:
			return localization.errorServerUnderMaintainance;

		case GameCreationResultCode.BadPackage:
			return localization.errorBadPackage;

		case GameCreationResultCode.GameNameCollision:
			return localization.errorDuplicateGameName;

		case GameCreationResultCode.InternalServerError:
			return localization.errorInternalServerError;

		case GameCreationResultCode.ServerNotReady:
			return localization.errorServerNotReady;

		case GameCreationResultCode.YourClientIsObsolete:
			return localization.errorObsoleteVersion;

		case GameCreationResultCode.UnknownError:
			return localization.errorUnknownError;

		case GameCreationResultCode.JoinError:
			return localization.joinError + ': ';

		case GameCreationResultCode.WrongGameSettings:
			return localization.wrongGameSettings;

		case GameCreationResultCode.TooManyGamesByAddress:
			return localization.tooManyGamesByIp;

		default:
			return localization.errorUnknownError;
	}
}

export function getJoinErrorMessage(error: JoinGameErrorType): string {
	switch (error) {
		case JoinGameErrorType.GameNotFound:
			return localization.gameNotFound;

		case JoinGameErrorType.InternalServerError:
			return localization.errorInternalServerError;

		case JoinGameErrorType.Forbidden:
			return '';

		default:
			return '';
	}
}
