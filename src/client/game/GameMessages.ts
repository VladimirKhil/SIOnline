/** Defines INCOMING SIGame messages. */
const enum GameMessages {
	/** Small hint fragment. Displayed separately from the main content. */
	AtomHint = 'ATOM_HINT',

	/** Person has been banned. */
	Banned = 'BANNED',

	/** Person has been banned. */
	BannedList = 'BANNEDLIST',

	/** Table content. */
	Content = 'CONTENT',

	/** Appends content to existing table content. */
	ContentAppend = 'CONTENT_APPEND',

	/** Defines content shape without providing real content. */
	ContentShape = 'CONTENT_SHAPE',

	/** Updates content state. */
	ContentState = 'CONTENT_STATE',

	/** Game metadata: game name, package name, contact uri. */
	GameMetadata = 'GAMEMETADATA',

	/** Table layout. */
	Layout = 'LAYOUT',

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