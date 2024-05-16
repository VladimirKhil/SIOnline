/** Defines OUTGOING SIGame messages. */
const enum Messages {
	/** Sends player answer. */
	Answer = 'ANSWER',

	/** Answer version. Denotes a preliminary answer printed by player. */
	AnswerVersion = 'ANSWER_VERSION',

	/** User avatar info. */
	Avatar = 'AVATAR',

	/** Question selection. */
	Choice = 'CHOICE',

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

	Ready = 'READY',

	/** Gives turn to player. */
	SetChooser = 'SETCHOOSER',

	/** Sets person as host. */
	SetHost = 'SETHOST',

	/** Sets game join mode. */
	SetJoinMode = 'SETJOINMODE',

	/** Toggles (removes or restores a question). */
	Toggle = 'TOGGLE',

	/** Unbans the person. */
	Unban = 'UNBAN',
}

export default Messages;