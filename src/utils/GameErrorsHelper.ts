import GameCreationResultCode from '../client/contracts/GameCreationResultCode';
import JoinGame2Result from '../client/contracts/JoinGame2Result';
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

export function getJoinErrorMessage(error: JoinGame2Result): string {
	switch (error) {
		case JoinGame2Result.InvalidRole:
			return localization.joinErrorInvalidRole;

		case JoinGame2Result.InvalidUserName:
			return localization.joinErrorInvalidUserName;

		case JoinGame2Result.GameNotFound:
			return localization.gameNotFound;

		case JoinGame2Result.InternalServerError:
			return localization.errorInternalServerError;

		case JoinGame2Result.Forbidden:
			return localization.joinModeForbidden;

		case JoinGame2Result.CommonJoinError:
			return '';

		case JoinGame2Result.AuthorizationModeNotSupported:
			return localization.joinErrorAuthorizationModeNotSupported;

		case JoinGame2Result.AuthorizationDataMissing:
			return localization.joinErrorAuthorizationDataMissing;

		case JoinGame2Result.AuthorizationFailed:
			return localization.joinErrorAuthorizationFailed;

		case JoinGame2Result.AuthorizationServiceError:
			return localization.joinErrorAuthorizationServiceError;

		case JoinGame2Result.AuthorizationInvalidUserName:
			return localization.joinErrorAuthorizationInvalidUserName;

		case JoinGame2Result.ForbiddenRole:
			return localization.joinErrorForbiddenRole;

		case JoinGame2Result.WrongPassword:
			return localization.joinErrorWrongPassword;

		case JoinGame2Result.NameIsOccupied:
			return localization.joinErrorNameIsOccupied;

		case JoinGame2Result.PositionNotFound:
			return localization.joinErrorPositionNotFound;

		case JoinGame2Result.PlaceIsOccupied:
			return localization.joinErrorPlaceIsOccupied;

		case JoinGame2Result.FreePlaceNotFound:
			return localization.joinErrorFreePlaceNotFound;

		default:
			return '';
	}
}
