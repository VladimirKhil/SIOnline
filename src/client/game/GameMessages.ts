/** Defines INCOMING SIGame messages. */
const enum GameMessages {
	/** Game ads. */
	Ads = 'ADS',

	/** Asks person answer. */
	Answer = 'ANSWER',

	/** Defines acceptable deviation for number answers. */
	AnswerDeviation = 'ANSWER_DEVIATION',

	Answers = 'ANSWERS',

	Appellation = 'APPELLATION',

	AskReview = 'ASK_REVIEW',

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

	FinalThink = 'FINALTHINK',

	GameClosed = 'GAME_CLOSED',

	GameError = 'GAME_ERROR',

	/** Game metadata: game name, package name, contact uri. */
	GameMetadata = 'GAMEMETADATA',

	GameStatistics = 'GAME_STATISTICS',

	GameThemes = 'GAMETHEMES',

	Hint = 'HINT',

	HostName = 'HOSTNAME',

	Info = 'INFO2',

	/** Table layout. */
	Layout = 'LAYOUT',

	/** Notifies that the client has loaded the media. */
	MediaLoaded = 'MEDIALOADED',

	MediaPreloaded = 'MEDIA_PRELOADED',

	/** Notifies about media preload progress. */
	MediaPreloadProgress = 'MEDIA_PRELOAD_PROGRESS',

	Options2 = 'OPTIONS2',

	OralAnswer = 'ORAL_ANSWER',

	Out = 'OUT',

	Package = 'PACKAGE',

	PackageAuthors = 'PACKAGE_AUTHORS',

	PackageComments = 'PACKAGE_COMMENTS',

	PackageDate = 'PACKAGE_DATE',

	PackageSources = 'PACKAGE_SOURCES',

	Pass = 'PASS',

	Pause = 'PAUSE',

	Person = 'PERSON',

	PersonApellated = 'PERSONAPELLATED',

	PersonFinalAnswer = 'PERSONFINALANSWER',

	PersonFinalStake = 'PERSONFINALSTAKE',

	PersonStake = 'PERSONSTAKE',

	Pin = 'PIN',

	/** Displays player's answer to the question. */
	PlayerAnswer = 'PLAYER_ANSWER',

	PlayerAppellating = 'PLAYER_APPELLATING',

	PlayerScoreChanged = 'PLAYER_SCORE_CHANGED',

	PlayerState = 'PLAYER_STATE',

	QType = 'QTYPE',

	/** Current question price. */
	Question = 'QUESTION',

	QuestionAnswers = 'QUESTION_ANSWERS',

	/** Authors of the question (if any). */
	QuestionAuthors = 'QUESTION_AUTHORS',

	QuestionCaption = 'QUESTIONCAPTION',

	/** Comments for the question (if any). */
	QuestionComments = 'QUESTION_COMMENTS',

	/** Question has ended. */
	QuestionEnd = 'QUESTION_END',

	/** Sources of the question (if any). */
	QuestionSources = 'QUESTION_SOURCES',

	ReadingSpeed = 'READINGSPEED',

	Ready = 'READY',

	Replic = 'REPLIC',

	Report = 'REPORT',

	Resume = 'RESUME',

	/** Question right answer. */
	RightAnswer = 'RIGHTANSWER',

	/** Notifies about complex answer start. */
	RightAnswerStart = 'RIGHT_ANSWER_START',

	RoundAuthors = 'ROUND_AUTHORS',

	RoundComments = 'ROUND_COMMENTS',

	RoundContent = 'ROUNDCONTENT',

	RoundEnd = 'ROUND_END',

	RoundsNames = 'ROUNDSNAMES',

	RoundSources = 'ROUND_SOURCES',

	/** Round themes names. */
	RoundThemes2 = 'ROUND_THEMES2',

	RoundThemesComments = 'ROUND_THEMES_COMMENTS',

	SetChooser = 'SETCHOOSER',

	/** Sets game join mode. */
	SetJoinMode = 'SETJOINMODE',

	/** Defines localizable showman replic. */
	ShowmanReplic = 'SHOWMAN_REPLIC',

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