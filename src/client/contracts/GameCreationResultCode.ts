const enum GameCreationResultCode {
	Ok = 'Ok',
	NoPackage = 'NoPackage',
	TooMuchGames = 'TooMuchGames',
	ServerUnderMaintainance = 'ServerUnderMaintainance',
	BadPackage = 'BadPackage',
	GameNameCollision = 'GameNameCollision',
	InternalServerError = 'InternalServerError',
	ServerNotReady = 'ServerNotReady',
	YourClientIsObsolete = 'YourClientIsObsolete',
	UnknownError = 'UnknownError',
	JoinError = 'JoinError',
	WrongGameSettings = 'WrongGameSettings',
	TooManyGamesByAddress = 'TooManyGamesByAddress',
}

export default GameCreationResultCode;
