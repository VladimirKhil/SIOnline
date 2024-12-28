/** Defines OUTGOING SIGame messages. */
const enum Messages {
	/** Sends player answer. */
	Answer = 'ANSWER',

	/** Answer version. Denotes a preliminary answer printed by player. */
	AnswerVersion = 'ANSWER_VERSION',

	Atom = 'ATOM',

	/** User avatar info. */
	Avatar = 'AVATAR',

	Ban = 'BAN',

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

	SetStake = 'SET_STAKE',

	/** Toggles (removes or restores a question). */
	Toggle = 'TOGGLE',

	/** Unbans the person. */
	Unban = 'UNBAN',

	Validate = 'VALIDATE',
}

export default Messages;