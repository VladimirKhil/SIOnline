import { ActionCreator, Action, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import * as RunActions from './RunActions';
import ChatMode from '../../model/enums/ChatMode';
import State from '../State';
import DataContext from '../../model/DataContext';
import localization from '../../model/resources/localization';
import actionCreators from '../actionCreators';
import ChatMessage from '../../model/ChatMessage';
import Account from '../../model/Account';
import Persons from '../../model/Persons';
import PersonInfo from '../../model/PersonInfo';
import PlayerInfo from '../../model/PlayerInfo';
import Role from '../../model/enums/Role';
import PlayerStates from '../../model/enums/PlayerStates';
import tableActionCreators from '../table/tableActionCreators';
import StakeTypes from '../../model/enums/StakeTypes';
import MainView from '../../model/enums/MainView';
import Constants from '../../model/enums/Constants';

let timerRef: number | null = null;

const runChatModeChanged: ActionCreator<RunActions.RunChatModeChangedAction> = (chatMode: ChatMode) => ({
	type: RunActions.RunActionTypes.RunChatModeChanged, chatMode
});

const runChatMessageChanged: ActionCreator<RunActions.RunChatMessageChangedAction> = (message: string) => ({
	type: RunActions.RunActionTypes.RunChatMessageChanged, message
});

const runChatMessageSend: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () =>
	(dispatch: Dispatch<RunActions.KnownRunAction>, getState: () => State, dataContext: DataContext) => {
		const state = getState();

		const text = state.run.chat.message;
		if (text.length > 0) {
			dataContext.gameClient.sayAsync(text);
		}

		dispatch(runChatMessageChanged(''));

		// Временно
		dispatch(chatMessageAdded({ sender: state.user.login, text }));
		if (!state.run.chat.isVisible) {
			dispatch(activateChat());
		}
	};

const markQuestion: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () =>
	(dispatch: Dispatch<RunActions.KnownRunAction>, getState: () => State, dataContext: DataContext) => {
		dataContext.gameClient.msgAsync('MARK');
	};

const pause: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () =>
	(dispatch: Dispatch<RunActions.KnownRunAction>, getState: () => State, dataContext: DataContext) => {
		dataContext.gameClient.msgAsync('PAUSE', getState().run.stage.isGamePaused ? '-' : '+');
	};

const runShowPersons: ActionCreator<RunActions.RunShowPersonsAction> = () => ({
	type: RunActions.RunActionTypes.RunShowPersons
});

const runHidePersons: ActionCreator<RunActions.RunHidePersonsAction> = () => ({
	type: RunActions.RunActionTypes.RunHidePersons
});

const runShowTables: ActionCreator<RunActions.RunShowTablesAction> = () => ({
	type: RunActions.RunActionTypes.RunShowTables
});

const runHideTables: ActionCreator<RunActions.RunHideTablesAction> = () => ({
	type: RunActions.RunActionTypes.RunHideTables
});

const runChatVisibilityChanged: ActionCreator<RunActions.RunChatVisibilityChangedAction> = (isOpen: boolean) => ({
	type: RunActions.RunActionTypes.RunChatVisibilityChanged, isOpen
});

const playerSelected: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (playerIndex: number) => async (
	dispatch: Dispatch<RunActions.KnownRunAction>,
	getState: () => State,
	dataContext: DataContext) => {
	dataContext.gameClient.msgAsync(getState().run.selection.message, playerIndex);
	dispatch(clearDecisions());
};

const exitGame: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	dispatch: Dispatch<RunActions.KnownRunAction>,
	getState: () => State,
	dataContext: DataContext) => {
	try {
		// TODO: show progress bar
		await dataContext.gameClient.leaveGameAsync();
	} catch (e) {
		alert(localization.exitError);
	}

	if (timerRef) {
		window.clearTimeout(timerRef);
		timerRef = null;
	}

	if (getState().ui.previousMainView === MainView.Lobby) {
		actionCreators.navigateToLobby(-1)(dispatch, getState, dataContext);
	} else {
		dispatch(actionCreators.navigateToWelcome() as any);
	}
};

const chatMessageAdded: ActionCreator<RunActions.ChatMessageAddedAction> = (chatMessage: ChatMessage) => ({
	type: RunActions.RunActionTypes.ChatMessageAdded, chatMessage
});

const lastReplicChanged: ActionCreator<RunActions.LastReplicChangedAction> = (chatMessage: ChatMessage | null) => ({
	type: RunActions.RunActionTypes.LastReplicChanged, chatMessage
});

const activateChat: ActionCreator<RunActions.ActivateChatAction> = () => ({
	type: RunActions.RunActionTypes.ActivateChat
});

const showmanReplicChanged: ActionCreator<RunActions.ShowmanReplicChangedAction> = (replic: string) => ({
	type: RunActions.RunActionTypes.ShowmanReplicChanged, replic
});

const playerReplicChanged: ActionCreator<RunActions.PlayerReplicChangedAction> = (playerIndex: number, replic: string) => ({
	type: RunActions.RunActionTypes.PlayerReplicChanged, playerIndex, replic
});

const infoChanged: ActionCreator<RunActions.InfoChangedAction> = (all: Persons, showman: PersonInfo, players: PlayerInfo[]) => ({
	type: RunActions.RunActionTypes.InfoChanged, all, showman, players
});

const chatPersonSelected: ActionCreator<RunActions.ChatPersonSelectedAction> = (personName: string) => ({
	type: RunActions.RunActionTypes.ChatPersonSelected, personName
});

const tableSelected: ActionCreator<RunActions.TableSelectedAction> = (tableIndex: number) => ({
	type: RunActions.RunActionTypes.TableSelected, tableIndex
});

const operationError: ActionCreator<RunActions.OperationErrorAction> = (error: string) => ({
	type: RunActions.RunActionTypes.OperationError, error
});

const addTable: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	dispatch: Dispatch<RunActions.KnownRunAction>,
	getState: () => State, dataContext: DataContext) => {
	if (getState().run.persons.players.length >= Constants.MAX_PLAYERS_COUNT) {
		return;
	}

	try {
		dataContext.gameClient.msgAsync('CONFIG', 'ADDTABLE');
	} catch (e) {
		dispatch(operationError(e.message));
	}
};

const deleteTable: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	dispatch: Dispatch<RunActions.KnownRunAction>,
	getState: () => State, dataContext: DataContext) => {
	const tableIndex = getState().run.selectedTableIndex - 1;
	if (tableIndex <= 0 || tableIndex >= getState().run.persons.players.length) {
		return;
	}

	try {
		dataContext.gameClient.msgAsync('CONFIG', 'DELETETABLE', tableIndex);
	} catch (e) {
		dispatch(operationError(e.message));
	}
};

const kickPerson: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	dispatch: Dispatch<RunActions.KnownRunAction>,
	getState: () => State, dataContext: DataContext) => {
	const personName = getState().run.chat.selectedPersonName;
	if (!personName) {
		return;
	}

	try {
		dataContext.gameClient.msgAsync('KICK', personName);
	} catch (e) {
		dispatch(operationError(e.message));
	}
};

const banPerson: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	dispatch: Dispatch<RunActions.KnownRunAction>,
	getState: () => State, dataContext: DataContext) => {
	const personName = getState().run.chat.selectedPersonName;
	if (!personName) {
		return;
	}

	try {
		dataContext.gameClient.msgAsync('BAN', personName);
	} catch (e) {
		dispatch(operationError(e.message));
	}
};

const personAvatarChanged: ActionCreator<RunActions.PersonAvatarChangedAction> = (personName: string, avatarUri: string) => ({
	type: RunActions.RunActionTypes.PersonAvatarChanged, personName, avatarUri
});

const gameStarted: ActionCreator<RunActions.GameStartedAction> = () => ({ type: RunActions.RunActionTypes.GameStarted });

const stageChanged: ActionCreator<RunActions.StageChangedAction> = (stageName: string) => ({
	type: RunActions.RunActionTypes.StageChanged, stageName
});

const playersStateCleared: ActionCreator<RunActions.PlayersStateClearedAction> = () => ({
	type: RunActions.RunActionTypes.PlayersStateCleared
});

const gameStateCleared: ActionCreator<RunActions.GameStateClearedAction> = () => ({
	type: RunActions.RunActionTypes.GameStateCleared
});

const sumsChanged: ActionCreator<RunActions.SumsChangedAction> = (sums: number[]) => ({
	type: RunActions.RunActionTypes.SumsChanged, sums
});

const afterQuestionStateChanged: ActionCreator<RunActions.AfterQuestionStateChangedAction> = (isAfterQuestion: boolean) => ({
	type: RunActions.RunActionTypes.AfterQuestionStateChanged, isAfterQuestion
});

const currentPriceChanged: ActionCreator<RunActions.CurrentPriceChangedAction> = (currentPrice: number) => ({
	type: RunActions.RunActionTypes.CurrentPriceChanged, currentPrice
});

const personAdded: ActionCreator<RunActions.PersonAddedAction> = (person: Account) => ({
	type: RunActions.RunActionTypes.PersonAdded, person
});

const personRemoved: ActionCreator<RunActions.PersonRemovedAction> = (name: string) => ({
	type: RunActions.RunActionTypes.PersonRemoved, name
});

const showmanChanged: ActionCreator<RunActions.ShowmanChangedAction> = (name: string) => ({
	type: RunActions.RunActionTypes.ShowmanChanged, name
});

const playerAdded: ActionCreator<RunActions.PlayerAddedAction> = () => ({
	type: RunActions.RunActionTypes.PlayerAdded
});

const playerChanged: ActionCreator<RunActions.PlayerChangedAction> = (index: number, name: string) => ({
	type: RunActions.RunActionTypes.PlayerChanged, index, name
});

const playerDeleted: ActionCreator<RunActions.PlayerDeletedAction> = (index: number) => ({
	type: RunActions.RunActionTypes.PlayerDeleted, index
});

const playersSwap: ActionCreator<RunActions.PlayersSwapAction> = (index1: number, index2: number) => ({
	type: RunActions.RunActionTypes.PlayersSwap, index1, index2
});

const roleChanged: ActionCreator<RunActions.RoleChangedAction> = (role: Role) => ({
	type: RunActions.RunActionTypes.RoleChanged, role
});

const playerStateChanged: ActionCreator<RunActions.PlayerStateChangedAction> = (index: number, state: PlayerStates) => ({
	type: RunActions.RunActionTypes.PlayerStateChanged, index, state
});

const playerLostStateDropped: ActionCreator<RunActions.PlayerLostStateDroppedAction> = (index: number) => ({
	type: RunActions.RunActionTypes.PlayerLostStateDropped, index
});

const isPausedChanged: ActionCreator<RunActions.IsPausedChangedAction> = (isPaused: boolean) => ({
	type: RunActions.RunActionTypes.IsPausedChanged, isPaused
});

const playerStakeChanged: ActionCreator<RunActions.PlayerStakeChangedAction> = (index: number, stake: number) => ({
	type: RunActions.RunActionTypes.PlayerStakeChanged, index, stake
});

const decisionNeededChanged: ActionCreator<RunActions.DecisionNeededChangedAction> = (decisionNeeded: boolean) => ({
	type: RunActions.RunActionTypes.DecisionNeededChanged, decisionNeeded
});

const clearDecisions: ActionCreator<RunActions.ClearDecisionsAction> = () => ({
	type: RunActions.RunActionTypes.ClearDecisions
});

const selectQuestion: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (themeIndex: number, questionIndex: number) => async (
	dispatch: Dispatch<Action>,
	getState: () => State, dataContext: DataContext
) => {
	if (!getState().run.table.isSelectable) {
		return;
	}

	const theme = getState().run.table.roundInfo[themeIndex];
	if (theme) {
		const question = theme.questions[questionIndex];
		if (question > -1) {
			dataContext.gameClient.msgAsync('CHOICE', themeIndex, questionIndex);
			dispatch(tableActionCreators.isSelectableChanged(false));
			dispatch(decisionNeededChanged(false));
		}
	}
};

const selectTheme: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (themeIndex: number) => async (
	dispatch: Dispatch<Action>,
	getState: () => State, dataContext: DataContext
) => {
	if (!getState().run.table.isSelectable) {
		return;
	}

	const theme = getState().run.table.roundInfo[themeIndex];
	if (theme) {
		dataContext.gameClient.msgAsync('DELETE', themeIndex);
		dispatch(tableActionCreators.isSelectableChanged(false));
		dispatch(decisionNeededChanged(false));
	}
};

const isGameButtonEnabledChanged: ActionCreator<RunActions.IsGameButtonEnabledChangedAction> = (isGameButtonEnabled: boolean) => ({
	type: RunActions.RunActionTypes.IsGameButtonEnabledChanged, isGameButtonEnabled
});

const pressGameButton: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	dispatch: Dispatch<any>,
	_getState: () => State,
	dataContext: DataContext) => {
	dataContext.gameClient.msgAsync('I');

	dispatch(isGameButtonEnabledChanged(false));
	setTimeout(
		() => {
			dispatch(isGameButtonEnabledChanged(true));
		},
		3000
	);
};

const apellate: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	_dispatch: Dispatch<any>,
	_getState: () => State,
	dataContext: DataContext) => {
	dataContext.gameClient.msgAsync('APELLATE', '+');
};

const isAnswering: ActionCreator<RunActions.IsAnsweringAction> = () => ({
	type: RunActions.RunActionTypes.IsAnswering
});

const onAnswerChanged: ActionCreator<RunActions.AnswerChangedAction> = (answer: string) => ({
	type: RunActions.RunActionTypes.AnswerChanged, answer
});

const sendAnswer: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	dispatch: Dispatch<any>,
	getState: () => State,
	dataContext: DataContext) => {
	dataContext.gameClient.msgAsync('ANSWER', getState().run.answer);
	dispatch(clearDecisions());
};

const validate: ActionCreator<RunActions.ValidateAction> = (
	name: string,
	answer: string,
	rightAnswers: string[],
	wrongAnswers: string[],
	header: string,
	message: string
) => ({
	type: RunActions.RunActionTypes.Validate, name, answer, rightAnswers, wrongAnswers, header, message
});

const approveAnswer: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () =>
	async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		dataContext.gameClient.msgAsync('ISRIGHT', '+');
		dispatch(clearDecisions());
	};

const rejectAnswer: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () =>
	async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		dataContext.gameClient.msgAsync('ISRIGHT', '-');
		dispatch(clearDecisions());
	};

const setStakes: ActionCreator<RunActions.SetStakesAction> = (
	allowedStakeTypes: Record<StakeTypes, boolean>,
	minimum: number,
	maximum: number,
	stake: number,
	step: number,
	message: string,
	areSimple: boolean
) => ({
	type: RunActions.RunActionTypes.SetStakes, allowedStakeTypes, minimum, maximum, stake, step, message, areSimple
});

const stakeChanged: ActionCreator<RunActions.StakeChangedAction> = (stake: number) => ({
	type: RunActions.RunActionTypes.StakeChanged, stake
});

const sendNominal: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () =>
	async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		dataContext.gameClient.msgAsync('STAKE', 0);
		dispatch(clearDecisions());
	};

const sendStake: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () =>
	async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		const state = getState();

		if (state.run.stakes.message === 'STAKE') { // Bad design
			dataContext.gameClient.msgAsync('STAKE', 1, state.run.stakes.stake);
		} else {
			dataContext.gameClient.msgAsync(state.run.stakes.message, state.run.stakes.stake);
		}

		dispatch(clearDecisions());
	};

const sendPass: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	dispatch: Dispatch<any>,
	_getState: () => State,
	dataContext: DataContext) => {
	dataContext.gameClient.msgAsync('STAKE', 2);
	dispatch(clearDecisions());
};

const sendAllIn: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	dispatch: Dispatch<any>,
	_getState: () => State,
	dataContext: DataContext) => {
	dataContext.gameClient.msgAsync('STAKE', 3);
	dispatch(clearDecisions());
};

const selectionEnabled: ActionCreator<RunActions.SelectionEnabledAction> = (allowedIndices: number[], message: string) => ({
	type: RunActions.RunActionTypes.SelectionEnabled, allowedIndices, message
});

const showLeftSeconds = (leftSeconds: number, dispatch: Dispatch<RunActions.KnownRunAction>): void => {
	let leftSecondsString = (leftSeconds % 60).toString();

	if (leftSecondsString.length < 2) {
		leftSecondsString = `0${leftSeconds}`;
	}

	dispatch(showmanReplicChanged(
		`${localization.theGameWillStartIn} 00:00:${leftSecondsString} ${localization.orByFilling}`
	));

	if (leftSeconds > 0) {
		timerRef = window.setTimeout(
			() => {
				showLeftSeconds(leftSeconds - 1, dispatch);
			},
			1000
		);
	}
};

const onMediaEnded: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	_dispatch: Dispatch<Action>,
	_getState: () => State,
	dataContext: DataContext
) => {
	dataContext.gameClient.msgAsync('ATOM');
};

const areSumsEditableChanged: ActionCreator<RunActions.AreSumsEditableChangedAction> = (areSumsEditable: boolean) => ({
	type: RunActions.RunActionTypes.AreSumsEditableChanged, areSumsEditable
});

const changePlayerSum: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (
	playerIndex: number,
	sum: number
) => async (
	dispatch: Dispatch<any>,
	getState: () => State,
	dataContext: DataContext) => {
	dataContext.gameClient.msgAsync('CHANGE', playerIndex + 1, sum); // playerIndex здесь почему-то начинается с 1
};

const readingSpeedChanged: ActionCreator<RunActions.ReadingSpeedChangedAction> = (readingSpeed: number) => ({
	type: RunActions.RunActionTypes.ReadingSpeedChanged, readingSpeed
});

const runTimer: ActionCreator<RunActions.RunTimerAction> = (timerIndex: number, maximumTime: number, runByUser: boolean) => ({
	type: RunActions.RunActionTypes.RunTimer, timerIndex, maximumTime, runByUser
});

const pauseTimer: ActionCreator<RunActions.PauseTimerAction> = (timerIndex: number, currentTime: number, pausedByUser: boolean) => ({
	type: RunActions.RunActionTypes.PauseTimer, timerIndex, currentTime, pausedByUser
});

const resumeTimer: ActionCreator<RunActions.ResumeTimerAction> = (timerIndex: number, runByUser: boolean) => ({
	type: RunActions.RunActionTypes.ResumeTimer, timerIndex, runByUser
});

const stopTimer: ActionCreator<RunActions.StopTimerAction> = (timerIndex: number) => ({
	type: RunActions.RunActionTypes.StopTimer, timerIndex
});

const timerMaximumChanged: ActionCreator<RunActions.TimerMaximumChangedAction> = (timerIndex: number, maximumTime: number) => ({
	type: RunActions.RunActionTypes.TimerMaximumChanged, timerIndex, maximumTime
});

const activateShowmanDecision: ActionCreator<RunActions.ActivateShowmanDecisionAction> = () => ({
	type: RunActions.RunActionTypes.ActivateShowmanDecision
});

const activatePlayerDecision: ActionCreator<RunActions.ActivatePlayerDecisionAction> = (playerIndex: number) => ({
	type: RunActions.RunActionTypes.ActivatePlayerDecision, playerIndex
});

const showMainTimer: ActionCreator<RunActions.ShowMainTimerAction> = () => ({
	type: RunActions.RunActionTypes.ShowMainTimer
});

const clearDecisionsAndMainTimer: ActionCreator<RunActions.ClearDecisionsAndMainTimerAction> = () => ({
	type: RunActions.RunActionTypes.ClearDecisionsAndMainTimer
});

const hintChanged: ActionCreator<RunActions.HintChangedAction> = (hint: string | null) => ({
	type: RunActions.RunActionTypes.HintChanged, hint
});

const startGame: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => (
	_dispatch: Dispatch<RunActions.KnownRunAction>,
	_getState: () => State,
	dataContext: DataContext
) => {
	dataContext.gameClient.msgAsync('START');
};

const runActionCreators = {
	runChatModeChanged,
	runChatMessageChanged,
	runChatMessageSend,
	markQuestion,
	pause,
	runShowPersons,
	runHidePersons,
	runShowTables,
	runHideTables,
	runChatVisibilityChanged,
	playerSelected,
	exitGame,
	chatMessageAdded,
	lastReplicChanged,
	activateChat,
	showmanReplicChanged,
	playerReplicChanged,
	infoChanged,
	chatPersonSelected,
	tableSelected,
	addTable,
	deleteTable,
	kickPerson,
	banPerson,
	personAvatarChanged,
	gameStarted,
	stageChanged,
	playersStateCleared,
	gameStateCleared,
	sumsChanged,
	afterQuestionStateChanged,
	currentPriceChanged,
	personAdded,
	personRemoved,
	showmanChanged,
	playerAdded,
	playerChanged,
	playerDeleted,
	playersSwap,
	roleChanged,
	playerStateChanged,
	playerLostStateDropped,
	isPausedChanged,
	playerStakeChanged,
	decisionNeededChanged,
	clearDecisions,
	selectQuestion,
	selectTheme,
	pressGameButton,
	apellate,
	isAnswering,
	onAnswerChanged,
	sendAnswer,
	validate,
	approveAnswer,
	rejectAnswer,
	setStakes,
	stakeChanged,
	sendNominal,
	sendStake,
	sendPass,
	sendAllIn,
	selectionEnabled,
	showLeftSeconds,
	onMediaEnded,
	areSumsEditableChanged,
	changePlayerSum,
	readingSpeedChanged,
	runTimer,
	pauseTimer,
	resumeTimer,
	stopTimer,
	timerMaximumChanged,
	activateShowmanDecision,
	activatePlayerDecision,
	showMainTimer,
	clearDecisionsAndMainTimer,
	hintChanged,
	startGame,
	operationError
};

export default runActionCreators;
