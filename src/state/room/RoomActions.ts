import StakeModes from '../../client/game/StakeModes';

export const enum RoomActionTypes {
	RoomShowPersons = 'ROOM_SHOW_PERSONS',
	RoomHidePersons = 'ROOM_HIDE_PERSONS',
	RoomShowTables = 'ROOM_SHOW_TABLES',
	RoomHideTables = 'ROOM_HIDE_TABLES',
	RoomShowBanned = 'ROOM_SHOW_BANNED',
	RoomHideBanned = 'ROOM_HIDE_BANNED',
	RoomShowGameInfo = 'ROOM_SHOW_GAMEINFO',
	RoomHideGameInfo = 'ROOM_HIDE_GAMEINFO',
	RoomShowManageGame = 'ROOM_SHOW_MANAGE_GAME',
	RoomHideManageGame = 'ROOM_HIDE_MANAGE_GAME',
	TableSelected = 'TABLE_SELECTED',
	StageChanged = 'STAGE_CHANGED',
	GameStateCleared = 'GAME_STATE_CLEARED',
	AfterQuestionStateChanged = 'AFTER_QUESTION_STATE_CHANGED',
	CurrentPriceChanged = 'CURRENT_PRICE_CHANGED',
	ClearDecisions = 'CLEAR_DECISIONS',
	IsAnswering = 'IS_ANSWERING',
	AnswerChanged = 'ANSWER_CHANGED',
	SetStakes = 'SET_STAKES',
	StakeChanged = 'STAKE_CHANGED',
	SelectionEnabled = 'SELECTION_ENABLED',
	AreSumsEditableChanged = 'ARE_SUMS_EDITABLE_CHANGED',
	RunTimer = 'RUN_TIMER',
	PauseTimer = 'PAUSE_TIMER',
	ResumeTimer = 'RESUME_TIMER',
	StopTimer = 'STOP_TIMER',
	TimerMaximumChanged = 'TIMER_MAXIMUM_CHANGED',
	ShowMainTimer = 'SHOW_MAIN_TIMER',
	ClearDecisionsAndMainTimer = 'CLEAR_DECISIONS_AND_MAIN_TIMER',
	HintChanged = 'HINT_CHANGED',
	ThemeNameChanged = 'THEME_NAME_CHANGED',
	RoundsNamesChanged = 'ROUNDS_NAMES_CHANGED',
	ChooserChanged = 'CHOOSER_CHANGED',
	PlayerInGameChanged = 'PLAYER_IN_GAME_CHANGED',
	AreApellationsEnabledChanged = 'ARE_APELLATIONS_ENABLED_CHANGED',
	ButtonBlockingTimeChanged = 'BUTTON_BLOCKING_TIME_CHANGED',
	GameMetadataChanged = 'GAME_METADATA_CHANGED',
	BannedListChanged = 'BANNED_LIST_CHANGED',
	Banned = 'BANNED',
	Unbanned = 'UNBANNED',
	SelectBannedItem = 'SELECT_BANNED_ITEM',
	PlayerMediaLoaded = 'PLAYER_MEDIA_LOADED',
	Kicked = 'KICKED',
	WebCameraUrlChanged = 'WEB_CAMERA_URL_CHANGED',
	IsQuestionChanged = 'IsQuestionChanged',
}

export type RunShowPersonsAction = { type: RoomActionTypes.RoomShowPersons };
export type RunHidePersonsAction = { type: RoomActionTypes.RoomHidePersons };
export type RunShowTablesAction = { type: RoomActionTypes.RoomShowTables };
export type RunHideTablesAction = { type: RoomActionTypes.RoomHideTables };
export type RunShowBannedAction = { type: RoomActionTypes.RoomShowBanned };
export type RunHideBannedAction = { type: RoomActionTypes.RoomHideBanned };
export type RunShowGameInfoAction = { type: RoomActionTypes.RoomShowGameInfo };
export type RunHideGameInfoAction = { type: RoomActionTypes.RoomHideGameInfo };
export type RunShowManageGameAction = { type: RoomActionTypes.RoomShowManageGame };
export type RunHideManageGameAction = { type: RoomActionTypes.RoomHideManageGame };
export type TableSelectedAction = { type: RoomActionTypes.TableSelected, tableIndex: number };
export type StageChangedAction = { type: RoomActionTypes.StageChanged, stageName: string, roundIndex: number };
export type GameStateClearedAction = { type: RoomActionTypes.GameStateCleared };
export type AfterQuestionStateChangedAction = { type: RoomActionTypes.AfterQuestionStateChanged, isAfterQuestion: boolean };
export type CurrentPriceChangedAction = { type: RoomActionTypes.CurrentPriceChanged, currentPrice: number };
export type ClearDecisionsAction = { type: RoomActionTypes.ClearDecisions };
export type IsAnsweringAction = { type: RoomActionTypes.IsAnswering };
export type AnswerChangedAction = { type: RoomActionTypes.AnswerChanged, answer: string };
export type KickedAction = { type: RoomActionTypes.Kicked, kicked: boolean };

export type SetStakesAction = {
	type: RoomActionTypes.SetStakes,
	stakeModes: StakeModes,
	minimum: number,
	maximum: number,
	step: number,
	playerName: string | null,
};

export type StakeChangedAction = { type: RoomActionTypes.StakeChanged, stake: number };
export type SelectionEnabledAction = { type: RoomActionTypes.SelectionEnabled };
export type AreSumsEditableChangedAction = { type: RoomActionTypes.AreSumsEditableChanged, areSumsEditable: boolean };
export type RunTimerAction = { type: RoomActionTypes.RunTimer, timerIndex: number, maximumTime: number, runByUser: boolean };
export type PauseTimerAction = { type: RoomActionTypes.PauseTimer, timerIndex: number, currentTime: number, pausedByUser: boolean };
export type ResumeTimerAction = { type: RoomActionTypes.ResumeTimer, timerIndex: number, runByUser: boolean };
export type StopTimerAction = { type: RoomActionTypes.StopTimer, timerIndex: number };
export type TimerMaximumChangedAction = { type: RoomActionTypes.TimerMaximumChanged, timerIndex: number, maximumTime: number };
export type ShowMainTimerAction = { type: RoomActionTypes.ShowMainTimer };
export type ClearDecisionsAndMainTimerAction = { type: RoomActionTypes.ClearDecisionsAndMainTimer };
export type HintChangedAction = { type: RoomActionTypes.HintChanged, hint: string | null };
export type ThemeNameChangedAction = { type: RoomActionTypes.ThemeNameChanged, themeName: string };
export type RoundsNamesChangedAction = { type: RoomActionTypes.RoundsNamesChanged, roundsNames: string[] };
export type AreApellationsEnabledChangedAction = { type: RoomActionTypes.AreApellationsEnabledChanged, areApellationsEnabled: boolean };
export type ButtonBlockingChangedAction = { type: RoomActionTypes.ButtonBlockingTimeChanged, buttonBlockingTime: number };

export type GameMetadataChangedAction = {
	type: RoomActionTypes.GameMetadataChanged,
	gameName: string,
	packageName: string,
	contactUri: string,
	voiceChatUri: string | null
};

export type BannedListChangedAction = { type: RoomActionTypes.BannedListChanged, bannedList: Record<string, string> };
export type BannedAction = { type: RoomActionTypes.Banned, ip: string, name: string };
export type UnbannedAction = { type: RoomActionTypes.Unbanned, ip: string };
export type SelectBannedItemAction = { type: RoomActionTypes.SelectBannedItem, ip: string };
export type WebCameraUrlChangedAction = { type: RoomActionTypes.WebCameraUrlChanged, webCameraUrl: string };
export type IsQuestionChangedAction = { type: RoomActionTypes.IsQuestionChanged, isQuestion: boolean, questionType: string };

export type KnownRoomAction =
	RunShowPersonsAction
	| RunHidePersonsAction
	| RunShowTablesAction
	| RunHideTablesAction
	| RunShowBannedAction
	| RunHideBannedAction
	| RunShowGameInfoAction
	| RunHideGameInfoAction
	| RunShowManageGameAction
	| RunHideManageGameAction
	| TableSelectedAction
	| StageChangedAction
	| GameStateClearedAction
	| AfterQuestionStateChangedAction
	| CurrentPriceChangedAction
	| ClearDecisionsAction
	| IsAnsweringAction
	| AnswerChangedAction
	| SetStakesAction
	| StakeChangedAction
	| SelectionEnabledAction
	| AreSumsEditableChangedAction
	| RunTimerAction
	| PauseTimerAction
	| ResumeTimerAction
	| StopTimerAction
	| TimerMaximumChangedAction
	| ShowMainTimerAction
	| ClearDecisionsAndMainTimerAction
	| HintChangedAction
	| ThemeNameChangedAction
	| RoundsNamesChangedAction
	| AreApellationsEnabledChangedAction
	| ButtonBlockingChangedAction
	| GameMetadataChangedAction
	| BannedListChangedAction
	| BannedAction
	| UnbannedAction
	| SelectBannedItemAction
	| KickedAction
	| WebCameraUrlChangedAction
	| IsQuestionChangedAction;
