/** Defines INCOMING SIGame messages. */
const enum GameMessages {
	/** Person has been banned. */
	Banned = 'BANNED',

	/** Person has been banned. */
	BannedList = 'BANNEDLIST',

	/** Game metadata: game name, package name, contact uri. */
	GameMetadata = 'GAMEMETADATA',

	/** Notifies that the client has loaded the media. */
	MediaLoaded = 'MEDIALOADED',

	/** Question has ended. */
	QuestionEnd = 'QUESTION_END',

	/** Sets game join mode. */
	SetJoinMode = 'SETJOINMODE',

	/** Stake info. */
	Stake2 = 'STAKE2',

	/** Toggles (removes or restores a question). */
	Toggle = 'TOGGLE',

	/** Person has been unbanned. */
	Unbanned = 'UNBANNED',

	/** Answer validation. */
	Validation = 'VALIDATION',

	/** Answer validation. */
	Validation2 = 'VALIDATION2',
}

export default GameMessages;