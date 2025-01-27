const enum GameCreationResultCode {
	Ok = 0,
	NoPackage = 1,
	TooMuchGames = 2,
	ServerUnderMaintainance = 3,
	BadPackage = 4,
	GameNameCollision = 5,
	InternalServerError = 6,
	ServerNotReady = 7,
	YourClientIsObsolete = 8,
	UnknownError = 9,
	JoinError = 10,
	WrongGameSettings = 11,
	TooManyGamesByAddress = 12,
}

export default GameCreationResultCode;
