import ChatMode from '../../model/enums/ChatMode';
import ChatMessage from '../../model/ChatMessage';
import Account from '../../model/Account';
import Persons from '../../model/Persons';
import ShowmanInfo from '../../model/ShowmanInfo';
import PlayerInfo from '../../model/PlayerInfo';
import Role from '../../model/enums/Role';
import PlayerStates from '../../model/enums/PlayerStates';
import StakeTypes from '../../model/enums/StakeTypes';

export const enum RunActionTypes {
	RunChatModeChanged = 'RUN_CHAT_MODE_CHANGED',
	RunChatMessageChanged = 'RUN_CHAT_MESSAGE_CHANGED',
	RunChatVisibilityChanged = 'RUN_CHAT_VISIBILITY_CHANGED',
	RunShowPersons = 'RUN_SHOW_PERSONS',
	RunHidePersons = 'RUN_HIDE_PERSONS',
	ChatMessageAdded = 'CHAT_MESSAGE_ADDED',
	LastReplicChanged = 'LAST_REPLIC_CHANGED',
	ActivateChat = 'ACTIVATE_CHAT',
	ShowmanReplicChanged = 'SHOWMAN_REPLIC_CHANGED',
	PlayerReplicChanged = 'PLAYER_REPLIC_CHANGED',
	InfoChanged = 'INFO_CHANGED',
	ChatPersonSelected = 'CHAT_PERSON_SELECTED',
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
	OperationError = 'OPERATION_ERROR'
}

export type RunChatModeChangedAction = { type: RunActionTypes.RunChatModeChanged, chatMode: ChatMode };
export type RunChatMessageChangedAction = { type: RunActionTypes.RunChatMessageChanged, message: string };
export type RunChatVisibilityChangedAction = { type: RunActionTypes.RunChatVisibilityChanged, isOpen: boolean };
export type RunShowPersonsAction = { type: RunActionTypes.RunShowPersons };
export type RunHidePersonsAction = { type: RunActionTypes.RunHidePersons };
export type ChatMessageAddedAction = { type: RunActionTypes.ChatMessageAdded, chatMessage: ChatMessage };
export type LastReplicChangedAction = { type: RunActionTypes.LastReplicChanged, chatMessage: ChatMessage | null };
export type ActivateChatAction = { type: RunActionTypes.ActivateChat };
export type ShowmanReplicChangedAction = { type: RunActionTypes.ShowmanReplicChanged, replic: string };
export type PlayerReplicChangedAction = { type: RunActionTypes.PlayerReplicChanged, playerIndex: number, replic: string };
export type InfoChangedAction = { type: RunActionTypes.InfoChanged, all: Persons, showman: ShowmanInfo, players: PlayerInfo[] };
export type ChatPersonSelectedAction = { type: RunActionTypes.ChatPersonSelected, personName: string };
export type PersonAvatarChangedAction = { type: RunActionTypes.PersonAvatarChanged, personName: string, avatarUri: string };
export type GameStartedAction = { type: RunActionTypes.GameStarted };
export type StageChangedAction = { type: RunActionTypes.StageChanged, stageName: string };
export type PlayersStateClearedAction = { type: RunActionTypes.PlayersStateCleared };
export type GameStateClearedAction = { type: RunActionTypes.GameStateCleared };
export type SumsChangedAction = { type: RunActionTypes.SumsChanged, sums: number[] };
export type AfterQuestionStateChangedAction = { type: RunActionTypes.AfterQuestionStateChanged, isAfterQuestion: boolean };
export type CurrentPriceChangedAction = { type: RunActionTypes.CurrentPriceChanged, currentPrice: number };
export type PersonAddedAction = { type: RunActionTypes.PersonAdded, person: Account };
export type PersonRemovedAction = { type: RunActionTypes.PersonRemoved, name: string };
export type ShowmanChangedAction = { type: RunActionTypes.ShowmanChanged, name: string };
export type PlayerAddedAction = { type: RunActionTypes.PlayerAdded };
export type PlayerChangedAction = { type: RunActionTypes.PlayerChanged, index: number, name: string };
export type PlayerDeletedAction = { type: RunActionTypes.PlayerDeleted, index: number };
export type PlayersSwapAction = { type: RunActionTypes.PlayersSwap, index1: number, index2: number };
export type RoleChangedAction = { type: RunActionTypes.RoleChanged, role: Role };
export type PlayerStateChangedAction = { type: RunActionTypes.PlayerStateChanged, index: number, state: PlayerStates };
export type PlayerLostStateDroppedAction = { type: RunActionTypes.PlayerLostStateDropped, index: number };
export type IsPausedChangedAction = { type: RunActionTypes.IsPausedChanged, isPaused: boolean };
export type PlayerStakeChangedAction = { type: RunActionTypes.PlayerStakeChanged, index: number, stake: number };
export type DecisionNeededChangedAction = { type: RunActionTypes.DecisionNeededChanged, decisionNeeded: boolean };
export type ClearDecisionsAction = { type: RunActionTypes.ClearDecisions };
export type IsGameButtonEnabledChangedAction = { type: RunActionTypes.IsGameButtonEnabledChanged, isGameButtonEnabled: boolean };
export type IsAnsweringAction = { type: RunActionTypes.IsAnswering };
export type AnswerChangedAction = { type: RunActionTypes.AnswerChanged, answer: string };
export type ValidateAction = {
	type: RunActionTypes.Validate,
	name: string,
	answer: string,
	rightAnswers: string[],
	wrongAnswers: string[],
	header: string,
	message: string
};
export type SetStakesAction = {
	type: RunActionTypes.SetStakes,
	allowedStakeTypes: Record<StakeTypes, boolean>,
	minimum: number,
	maximum: number,
	stake: number,
	step: number,
	message: string,
	areSimple: boolean
};
export type StakeChangedAction = { type: RunActionTypes.StakeChanged, stake: number };
export type SelectionEnabledAction = { type: RunActionTypes.SelectionEnabled, allowedIndices: number[], message: string };
export type AreSumsEditableChangedAction = { type: RunActionTypes.AreSumsEditableChanged, areSumsEditable: boolean };
export type ReadingSpeedChangedAction = { type: RunActionTypes.ReadingSpeedChanged, readingSpeed: number };
export type RunTimerAction = { type: RunActionTypes.RunTimer, timerIndex: number, maximumTime: number, runByUser: boolean };
export type PauseTimerAction = { type: RunActionTypes.PauseTimer, timerIndex: number, currentTime: number, pausedByUser: boolean };
export type ResumeTimerAction = { type: RunActionTypes.ResumeTimer, timerIndex: number, runByUser: boolean };
export type StopTimerAction = { type: RunActionTypes.StopTimer, timerIndex: number };
export type TimerMaximumChangedAction = { type: RunActionTypes.TimerMaximumChanged, timerIndex: number, maximumTime: number };
export type ActivateShowmanDecisionAction = { type: RunActionTypes.ActivateShowmanDecision };
export type ActivatePlayerDecisionAction = { type: RunActionTypes.ActivatePlayerDecision, playerIndex: number };
export type ShowMainTimerAction = { type: RunActionTypes.ShowMainTimer };
export type ClearDecisionsAndMainTimerAction = { type: RunActionTypes.ClearDecisionsAndMainTimer };
export type HintChangedAction = { type: RunActionTypes.HintChanged, hint: string | null };
export type OperationErrorAction = { type: RunActionTypes.OperationError, error: string };

export type KnownRunAction =
	RunChatModeChangedAction
	| RunChatMessageChangedAction
	| RunChatVisibilityChangedAction
	| RunShowPersonsAction
	| RunHidePersonsAction
	| ChatMessageAddedAction
	| LastReplicChangedAction
	| ActivateChatAction
	| ShowmanReplicChangedAction
	| PlayerReplicChangedAction
	| InfoChangedAction
	| ChatPersonSelectedAction
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
	| OperationErrorAction;
