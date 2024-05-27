/** Defines INCOMING SIGame messages. */
const enum GameMessages {
	/** Game ads. */
	Ads = 'ADS',

	/** Asks person answer. */
	Answer = 'ANSWER',

	/** Small hint fragment. Displayed separately from the main content. */
	AtomHint = 'ATOM_HINT',

	/** Person avatar. */
	Avatar = 'AVATAR',

	/** Person has been banned. */
	Banned = 'BANNED',

	/** Person has been banned. */
	BannedList = 'BANNEDLIST',

	/** Question selection. */
	Choice = 'CHOICE',

	Choose = 'CHOOSE',

	Config = 'CONFIG',

	Connected = 'CONNECTED',

	/** Table content. */
	Content = 'CONTENT',

	/** Appends content to existing table content. */
	ContentAppend = 'CONTENT_APPEND',

	/** Defines content shape without providing real content. */
	ContentShape = 'CONTENT_SHAPE',

	/** Updates content state. */
	ContentState = 'CONTENT_STATE',

	EndTry = 'ENDTRY',

	FinalThink = 'FINALTHINK',

	/** Game metadata: game name, package name, contact uri. */
	GameMetadata = 'GAMEMETADATA',

	GameThemes = 'GAMETHEMES',

	/** Table layout. */
	Layout = 'LAYOUT',

	/** Notifies that the client has loaded the media. */
	MediaLoaded = 'MEDIALOADED',

	Out = 'OUT',

	Pause = 'PAUSE',

	Person = 'PERSON',

	QType = 'QTYPE',

	/** Current question price. */
	Question = 'QUESTION',

	QuestionCaption = 'QUESTIONCAPTION',

	/** Question has ended. */
	QuestionEnd = 'QUESTION_END',

	Replic = 'REPLIC',

	/** Question right answer. */
	RightAnswer = 'RIGHTANSWER',

	/** Notifies about complex answer start. */
	RightAnswerStart = 'RIGHT_ANSWER_START',

	/** Round themes names. */
	RoundThemes = 'ROUNDTHEMES',

	SetChooser = 'SETCHOOSER',

	/** Sets game join mode. */
	SetJoinMode = 'SETJOINMODE',

	ShowTable = 'SHOWTABLO',

	Stage = 'STAGE',

	StageInfo = 'STAGE_INFO',

	/** Stake info. */
	Stake2 = 'STAKE2',

	Stop = 'STOP',

	Sums = 'SUMS',

	Table = 'TABLO2',

	Theme = 'THEME',

	/** Theme comments. */
	ThemeComments = 'THEME_COMMENTS',

	Timer = 'TIMER',

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