const enum Messages {
	/** Answer version. Denotes a preliminary answer printed by player. */
	AnswerVersion = 'ANSWER_VERSION',
	/** Validates player answer. */
	IsRight = 'ISRIGHT',
	/** Notifies that media has been successfully loaded. */
	MediaLoaded = 'MEDIALOADED',
	/** Sets person as host. */
	SetHost = 'SETHOST',
	/** Toggles (removes or restores a question). */
	Toggle = 'TOGGLE',
	/** Unbans the person. */
	Unban = 'UNBAN',
}

export default Messages;