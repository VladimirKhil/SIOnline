/** Defines OUTGOING SIGame messages. */
const enum Messages {
	/** Sends player answer. */
	Answer = 'ANSWER',

	/** Answer version. Denotes a preliminary answer printed by player. */
	AnswerVersion = 'ANSWER_VERSION',

	Apellate = 'APELLATE',

	Atom = 'ATOM',

	/** User avatar info. */
	Avatar = 'AVATAR',

	Ban = 'BAN',

	Change = 'CHANGE',

	/** Question selection. */
	Choice = 'CHOICE',

	Config = 'CONFIG',

	Delete = 'DELETE',

	I = 'I',

	Info = 'INFO',

	/** Validates player answer. */
	IsRight = 'ISRIGHT',

	Mark = 'MARK',

	/** Notifies that media has been successfully loaded. */
	MediaLoaded = 'MEDIALOADED',

	MediaPreloaded = 'MEDIA_PRELOADED',

	Move = 'MOVE',

	Moveable = 'MOVEABLE',

	Pass = 'PASS',

	Pause = 'PAUSE',

	Picture = 'PICTURE',

	Pin = 'PIN',

	Ready = 'READY',

	Report = 'REPORT',

	SelectPlayer = 'SELECT_PLAYER',

	/** Gives turn to player. */
	SetChooser = 'SETCHOOSER',

	/** Sets person as host. */
	SetHost = 'SETHOST',

	/** Sets game join mode. */
	SetJoinMode = 'SETJOINMODE',

	SetOptions = 'SET_OPTIONS',

	SetStake = 'SET_STAKE',

	Start = 'START',

	/** Toggles (removes or restores a question). */
	Toggle = 'TOGGLE',

	/** Unbans the person. */
	Unban = 'UNBAN',

	Validate = 'VALIDATE',
}

export default Messages;