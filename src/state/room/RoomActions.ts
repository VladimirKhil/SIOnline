import ChatMode from '../../model/enums/ChatMode';
import ChatMessage from '../../model/ChatMessage';
import Account from '../../model/Account';
import Persons from '../../model/Persons';
import PersonInfo from '../../model/PersonInfo';
import PlayerInfo from '../../model/PlayerInfo';
import Role from '../../client/contracts/Role';
import PlayerStates from '../../model/enums/PlayerStates';
import StakeTypes from '../../model/enums/StakeTypes';

export const enum RoomActionTypes {
	RoomChatModeChanged = 'ROOM_CHAT_MODE_CHANGED',
	RoomChatMessageChanged = 'ROOM_CHAT_MESSAGE_CHANGED',
	RoomChatVisibilityChanged = 'ROOM_CHAT_VISIBILITY_CHANGED',
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
	ChatMessageAdded = 'CHAT_MESSAGE_ADDED',
	LastReplicChanged = 'LAST_REPLIC_CHANGED',
	ActivateChat = 'ACTIVATE_CHAT',
	ShowmanReplicChanged = 'SHOWMAN_REPLIC_CHANGED',
	PlayerReplicChanged = 'PLAYER_REPLIC_CHANGED',
	InfoChanged = 'INFO_CHANGED',
	ChatPersonSelected = 'CHAT_PERSON_SELECTED',
	TableSelected = 'TABLE_SELECTED',
	PersonAvatarChanged = 'PERSON_AVATAR_CHANGED',
	GameStarted = 'GAME_STARTED',
	StageChanged = 'STAGE_CHANGED',
	PlayersStateCleared = 'PLAYERS_STATE_CLEARED',
	GameStateCleared = 'GAME_STATE_CLEARED',
	SumsChanged = 'SUMS_CHANGED',
	AfterQuestionStateChanged = 'AFTER_QUESTION_STATE_CHANGED',
	CurrentPriceChanged = 'CURRENT_PRICE_CHANGED',
	PersonAdded = 'PERSON_ADDED',
	PersonRemoved = 'PERSON_REMOVED',
	ShowmanChanged = 'SHOWMAN_CHANGED',
	PlayerAdded = 'PLAYER_ADDED',
	PlayerChanged = 'PLAYER_CHANGED',
	PlayerDeleted = 'PLAYER_DELETED',
	PlayersSwap = 'PLAYERS_SWAP',
	RoleChanged = 'ROLE_CHANGED',
	PlayerStateChanged = 'PLAYER_STATE_CHANGED',
	PlayerLostStateDropped = 'PLAYER_LOST_STATE_DROPPED',
	IsPausedChanged = 'IS_PAUSED_CHANGED',
	PlayerStakeChanged = 'PLAYER_STAKE_CHANGED',
	DecisionNeededChanged = 'DECISION_NEEDED_CHANGED',
	ClearDecisions = 'CLEAR_DECISIONS',
	IsGameButtonEnabledChanged = 'IS_GAME_BUTTON_ENABLED',
	IsAnswering = 'IS_ANSWERING',
	AnswerChanged = 'ANSWER_CHANGED',
	Validate = 'VALIDATE',
	SetStakes = 'SET_STAKES',
	StakeChanged = 'STAKE_CHANGED',
	SelectionEnabled = 'SELECTION_ENABLED',
	AreSumsEditableChanged = 'ARE_SUMS_EDITABLE_CHANGED',
	ReadingSpeedChanged = 'READING_SPEED_CHANGED',
	RunTimer = 'RUN_TIMER',
	PauseTimer = 'PAUSE_TIMER',
	ResumeTimer = 'RESUME_TIMER',
	StopTimer = 'STOP_TIMER',
	TimerMaximumChanged = 'TIMER_MAXIMUM_CHANGED',
	ActivateShowmanDecision = 'ACTIVATE_SHOWMAN_DECISION',
	ActivatePlayerDecision = 'ACTIVATE_PLAYER_DECISION',
	ShowMainTimer = 'SHOW_MAIN_TIMER',
	ClearDecisionsAndMainTimer = 'CLEAR_DECISIONS_AND_MAIN_TIMER',
	HintChanged = 'HINT_CHANGED',
	OperationError = 'OPERATION_ERROR',
	HostNameChanged = 'HOST_NAME_CHANGED',
	ThemeNameChanged = 'THEME_NAME_CHANGED',
	IsReadyChanged = 'IS_READY_CHANGED',
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
	EditTable = 'EDIT_TABLE',
	ClearRoomChat = 'ROOM_CHAT_CLEAR',
}

export type RunChatModeChangedAction = { type: RoomActionTypes.RoomChatModeChanged, chatMode: ChatMode };
export type RunChatMessageChangedAction = { type: RoomActionTypes.RoomChatMessageChanged, message: string };
export type RunChatVisibilityChangedAction = { type: RoomActionTypes.RoomChatVisibilityChanged, isOpen: boolean };
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
export type ChatMessageAddedAction = { type: RoomActionTypes.ChatMessageAdded, chatMessage: ChatMessage };
export type LastReplicChangedAction = { type: RoomActionTypes.LastReplicChanged, chatMessage: ChatMessage | null };
export type ActivateChatAction = { type: RoomActionTypes.ActivateChat };
export type ShowmanReplicChangedAction = { type: RoomActionTypes.ShowmanReplicChanged, replic: string };
export type PlayerReplicChangedAction = { type: RoomActionTypes.PlayerReplicChanged, playerIndex: number, replic: string };
export type InfoChangedAction = { type: RoomActionTypes.InfoChanged, all: Persons, showman: PersonInfo, players: PlayerInfo[] };
export type ChatPersonSelectedAction = { type: RoomActionTypes.ChatPersonSelected, personName: string };
export type TableSelectedAction = { type: RoomActionTypes.TableSelected, tableIndex: number };
export type PersonAvatarChangedAction = { type: RoomActionTypes.PersonAvatarChanged, personName: string, avatarUri: string };
export type GameStartedAction = { type: RoomActionTypes.GameStarted, started: boolean };
export type StageChangedAction = { type: RoomActionTypes.StageChanged, stageName: string, roundIndex: number };
export type PlayersStateClearedAction = { type: RoomActionTypes.PlayersStateCleared };
export type GameStateClearedAction = { type: RoomActionTypes.GameStateCleared };
export type SumsChangedAction = { type: RoomActionTypes.SumsChanged, sums: number[] };
export type AfterQuestionStateChangedAction = { type: RoomActionTypes.AfterQuestionStateChanged, isAfterQuestion: boolean };
export type CurrentPriceChangedAction = { type: RoomActionTypes.CurrentPriceChanged, currentPrice: number };
export type PersonAddedAction = { type: RoomActionTypes.PersonAdded, person: Account };
export type PersonRemovedAction = { type: RoomActionTypes.PersonRemoved, name: string };
export type ShowmanChangedAction = { type: RoomActionTypes.ShowmanChanged, name: string, isHuman?: boolean, isReady?: boolean };
export type PlayerAddedAction = { type: RoomActionTypes.PlayerAdded };
export type PlayerChangedAction = { type: RoomActionTypes.PlayerChanged, index: number, name: string, isHuman?: boolean, isReady?: boolean };
export type PlayerDeletedAction = { type: RoomActionTypes.PlayerDeleted, index: number };
export type PlayersSwapAction = { type: RoomActionTypes.PlayersSwap, index1: number, index2: number };
export type RoleChangedAction = { type: RoomActionTypes.RoleChanged, role: Role };
export type PlayerStateChangedAction = { type: RoomActionTypes.PlayerStateChanged, index: number, state: PlayerStates };
export type PlayerLostStateDroppedAction = { type: RoomActionTypes.PlayerLostStateDropped, index: number };
export type IsPausedChangedAction = { type: RoomActionTypes.IsPausedChanged, isPaused: boolean };
export type PlayerStakeChangedAction = { type: RoomActionTypes.PlayerStakeChanged, index: number, stake: number };
export type DecisionNeededChangedAction = { type: RoomActionTypes.DecisionNeededChanged, decisionNeeded: boolean };
export type ClearDecisionsAction = { type: RoomActionTypes.ClearDecisions };
export type IsGameButtonEnabledChangedAction = { type: RoomActionTypes.IsGameButtonEnabledChanged, isGameButtonEnabled: boolean };
export type IsAnsweringAction = { type: RoomActionTypes.IsAnswering };
export type AnswerChangedAction = { type: RoomActionTypes.AnswerChanged, answer: string };
export type ClearRoomChatAction = { type: RoomActionTypes.ClearRoomChat };

export type ValidateAction = {
	type: RoomActionTypes.Validate,
	name: string,
	answer: string,
	rightAnswers: string[],
	wrongAnswers: string[],
	header: string,
	message: string
};

export type SetStakesAction = {
	type: RoomActionTypes.SetStakes,
	allowedStakeTypes: Record<StakeTypes, boolean>,
	minimum: number,
	maximum: number,
	stake: number,
	step: number,
	message: string,
	areSimple: boolean
};

export type StakeChangedAction = { type: RoomActionTypes.StakeChanged, stake: number };
export type SelectionEnabledAction = { type: RoomActionTypes.SelectionEnabled, allowedIndices: number[], message: string };
export type AreSumsEditableChangedAction = { type: RoomActionTypes.AreSumsEditableChanged, areSumsEditable: boolean };
export type ReadingSpeedChangedAction = { type: RoomActionTypes.ReadingSpeedChanged, readingSpeed: number };
export type RunTimerAction = { type: RoomActionTypes.RunTimer, timerIndex: number, maximumTime: number, runByUser: boolean };
export type PauseTimerAction = { type: RoomActionTypes.PauseTimer, timerIndex: number, currentTime: number, pausedByUser: boolean };
export type ResumeTimerAction = { type: RoomActionTypes.ResumeTimer, timerIndex: number, runByUser: boolean };
export type StopTimerAction = { type: RoomActionTypes.StopTimer, timerIndex: number };
export type TimerMaximumChangedAction = { type: RoomActionTypes.TimerMaximumChanged, timerIndex: number, maximumTime: number };
export type ActivateShowmanDecisionAction = { type: RoomActionTypes.ActivateShowmanDecision };
export type ActivatePlayerDecisionAction = { type: RoomActionTypes.ActivatePlayerDecision, playerIndex: number };
export type ShowMainTimerAction = { type: RoomActionTypes.ShowMainTimer };
export type ClearDecisionsAndMainTimerAction = { type: RoomActionTypes.ClearDecisionsAndMainTimer };
export type HintChangedAction = { type: RoomActionTypes.HintChanged, hint: string | null };
export type OperationErrorAction = { type: RoomActionTypes.OperationError, error: string };
export type HostNameChangedAction = { type: RoomActionTypes.HostNameChanged, hostName: string | null };
export type ThemeNameChangedAction = { type: RoomActionTypes.ThemeNameChanged, themeName: string };
export type IsReadyChangedAction = { type: RoomActionTypes.IsReadyChanged, personIndex: number, isReady: boolean };
export type RoundsNamesChangedAction = { type: RoomActionTypes.RoundsNamesChanged, roundsNames: string[] };
export type ChooserChangedAction = { type: RoomActionTypes.ChooserChanged, chooserIndex: number };
export type PlayerInGameChangedAction = { type: RoomActionTypes.PlayerInGameChanged, playerIndex: number, inGame: boolean };
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
export type PlayerMediaLoadedAction = { type: RoomActionTypes.PlayerMediaLoaded, playerIndex: number };
export type EditTableAction = { type: RoomActionTypes.EditTable };

export type KnownRoomAction =
	RunChatModeChangedAction
	| RunChatMessageChangedAction
	| RunChatVisibilityChangedAction
	| RunShowPersonsAction
	| RunHidePersonsAction
	| RunShowTablesAction
	| RunHideTablesAction
	| RunShowBannedAction
	| RunHideBannedAction
	| RunShowGameInfoAction
	| RunHideGameInfoAction
	| RunShowManageGameAction
	| RunHideManageGameAction
	| ChatMessageAddedAction
	| LastReplicChangedAction
	| ActivateChatAction
	| ShowmanReplicChangedAction
	| PlayerReplicChangedAction
	| InfoChangedAction
	| ChatPersonSelectedAction
	| TableSelectedAction
	| PersonAvatarChangedAction
	| GameStartedAction
	| StageChangedAction
	| PlayersStateClearedAction
	| GameStateClearedAction
	| SumsChangedAction
	| AfterQuestionStateChangedAction
	| CurrentPriceChangedAction
	| PersonAddedAction
	| PersonRemovedAction
	| ShowmanChangedAction
	| PlayerAddedAction
	| PlayerChangedAction
	| PlayerDeletedAction
	| PlayersSwapAction
	| RoleChangedAction
	| PlayerStateChangedAction
	| PlayerLostStateDroppedAction
	| IsPausedChangedAction
	| PlayerStakeChangedAction
	| DecisionNeededChangedAction
	| ClearDecisionsAction
	| IsGameButtonEnabledChangedAction
	| IsAnsweringAction
	| AnswerChangedAction
	| ValidateAction
	| SetStakesAction
	| StakeChangedAction
	| SelectionEnabledAction
	| AreSumsEditableChangedAction
	| ReadingSpeedChangedAction
	| RunTimerAction
	| PauseTimerAction
	| ResumeTimerAction
	| StopTimerAction
	| TimerMaximumChangedAction
	| ActivateShowmanDecisionAction
	| ActivatePlayerDecisionAction
	| ShowMainTimerAction
	| ClearDecisionsAndMainTimerAction
	| HintChangedAction
	| OperationErrorAction
	| HostNameChangedAction
	| ThemeNameChangedAction
	| IsReadyChangedAction
	| RoundsNamesChangedAction
	| ChooserChangedAction
	| PlayerInGameChangedAction
	| AreApellationsEnabledChangedAction
	| ButtonBlockingChangedAction
	| GameMetadataChangedAction
	| BannedListChangedAction
	| BannedAction
	| UnbannedAction
	| SelectBannedItemAction
	| PlayerMediaLoadedAction
	| EditTableAction
	| ClearRoomChatAction;
