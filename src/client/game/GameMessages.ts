/** Defines INCOMING SIGame messages. */
const enum GameMessages {
	/** Game ads. */
	Ads = 'ADS',

	/** Asks person answer. */
	Answer = 'ANSWER',

	Answers = 'ANSWERS',

	ApellationEnabled = 'APELLATION_ENABLES',

	AskSelectPlayer = 'ASK_SELECT_PLAYER',

	AskStake = 'ASK_STAKE',

	AskValidate = 'ASK_VALIDATE',

	/** Small hint fragment. Displayed separately from the main content. */
	AtomHint = 'ATOM_HINT',

	/** Person avatar. */
	Avatar = 'AVATAR',

	/** Person has been banned. */
	Banned = 'BANNED',

	/** Person has been banned. */
	BannedList = 'BANNEDLIST',

	ButtonBlockingTime = 'BUTTON_BLOCKING_TIME',

	Cancel = 'CANCEL',

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

	Disconnected = 'DISCONNECTED',

	EndTry = 'ENDTRY',

	FinalRound = 'FINALROUND',

	FinalThink = 'FINALTHINK',

	GameClosed = 'GAME_CLOSED',

	/** Game metadata: game name, package name, contact uri. */
	GameMetadata = 'GAMEMETADATA',

	GameThemes = 'GAMETHEMES',

	Hint = 'HINT',

	HostName = 'HOSTNAME',

	Info = 'INFO2',

	/** Table layout. */
	Layout = 'LAYOUT',

	/** Notifies that the client has loaded the media. */
	MediaLoaded = 'MEDIALOADED',

	MediaPreloaded = 'MEDIA_PRELOADED',

	Options2 = 'OPTIONS2',

	OralAnswer = 'ORAL_ANSWER',

	Out = 'OUT',

	Package = 'PACKAGE',

	Pass = 'PASS',

	Pause = 'PAUSE',

	Person = 'PERSON',

	PersonApellated = 'PERSONAPELLATED',

	PersonFinalAnswer = 'PERSONFINALANSWER',

	Pin = 'PIN',

	PlayerState = 'PLAYER_STATE',

	QType = 'QTYPE',

	/** Current question price. */
	Question = 'QUESTION',

	QuestionAnswers = 'QUESTION_ANSWERS',

	QuestionCaption = 'QUESTIONCAPTION',

	/** Question has ended. */
	QuestionEnd = 'QUESTION_END',

	ReadingSpeed = 'READINGSPEED',

	Ready = 'READY',

	Replic = 'REPLIC',

	Report = 'REPORT',

	Resume = 'RESUME',

	/** Question right answer. */
	RightAnswer = 'RIGHTANSWER',

	/** Notifies about complex answer start. */
	RightAnswerStart = 'RIGHT_ANSWER_START',

	RoundContent = 'ROUNDCONTENT',

	RoundsNames = 'ROUNDSNAMES',

	/** Round themes names. */
	RoundThemes2 = 'ROUND_THEMES2',

	RoundThemesComments = 'ROUND_THEMES_COMMENTS',

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

	Theme2 = 'THEME2',

	/** Theme comments. */
	ThemeComments = 'THEME_COMMENTS',

	ThemeInfo = 'THEME_INFO',

	Timeout = 'TIMEOUT',

	Timer = 'TIMER',

	/** Toggles (removes or restores a question). */
	Toggle = 'TOGGLE',

	Try = 'TRY',

	/** Person has been unbanned. */
	Unbanned = 'UNBANNED',

	UserError = 'USER_ERROR',

	/** Answer validation. */
	Validation = 'VALIDATION',

	/** Answer validation. */
	Validation2 = 'VALIDATION2',

	Winner = 'WINNER',

	WrongTry = 'WRONGTRY',
}

export default GameMessages;