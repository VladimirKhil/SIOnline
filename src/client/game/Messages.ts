const enum Messages {
	/** Answer version. Denotes a preliminary answer printed by player. */
	AnswerVersion = 'ANSWER_VERSION',
	MediaLoaded = 'MEDIALOADED',
	/** Toggles (removes or restores a question). */
	Toggle = 'TOGGLE',
	Unban = 'UNBAN',
}

export default Messages;