/** Defines INCOMING SIGame messages. */
const enum GameMessages {
	/** Game ads. */
	Ads = 'ADS',

	/** Asks person answer. */
	Answer = 'ANSWER',

	/** Small hint fragment. Displayed separately from the main content. */
	AtomHint = 'ATOM_HINT',

	/** Person has been banned. */
	Banned = 'BANNED',

	/** Person has been banned. */
	BannedList = 'BANNEDLIST',

	/** Question selection. */
	Choice = 'CHOICE',

	/** Table content. */
	Content = 'CONTENT',

	/** Appends content to existing table content. */
	ContentAppend = 'CONTENT_APPEND',

	/** Defines content shape without providing real content. */
	ContentShape = 'CONTENT_SHAPE',

	/** Updates content state. */
	ContentState = 'CONTENT_STATE',

	EndTry = 'ENDTRY',

	/** Game metadata: game name, package name, contact uri. */
	GameMetadata = 'GAMEMETADATA',

	GameThemes = 'GAMETHEMES',

	/** Table layout. */
	Layout = 'LAYOUT',

	/** Notifies that the client has loaded the media. */
	MediaLoaded = 'MEDIALOADED',

	/** Current question price. */
	Question = 'QUESTION',

	/** Question has ended. */
	QuestionEnd = 'QUESTION_END',

	Replic = 'REPLIC',

	/** Question right answer. */
	RightAnswer = 'RIGHTANSWER',

	/** Notifies about complex answer start. */
	RightAnswerStart = 'RIGHT_ANSWER_START',

	/** Round themes names. */
	RoundThemes = 'ROUNDTHEMES',

	/** Sets game join mode. */
	SetJoinMode = 'SETJOINMODE',

	Stage = 'STAGE',

	/** Stake info. */
	Stake2 = 'STAKE2',

	/** Theme comments. */
	ThemeComments = 'THEME_COMMENTS',

	/** Toggles (removes or restores a question). */
	Toggle = 'TOGGLE',

	Try = 'TRY',

	/** Person has been unbanned. */
	Unbanned = 'UNBANNED',

	/** Answer validation. */
	Validation = 'VALIDATION',

	/** Answer validation. */
	Validation2 = 'VALIDATION2',
}

export default GameMessages;