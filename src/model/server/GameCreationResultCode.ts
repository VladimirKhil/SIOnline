const enum GameCreationResultCode {
	Ok,
	NoPackage,
	TooMuchGames,
	ServerUnderMaintainance,
	BadPackage,
	GameNameCollision,
	InternalServerError,
	ServerNotReady,
	YourClientIsObsolete,
	UnknownError,
	JoinError,
	WrongGameSettings,
	TooManyGamesByAddress
}

export default GameCreationResultCode;
