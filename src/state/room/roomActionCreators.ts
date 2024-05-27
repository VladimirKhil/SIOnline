import { ActionCreator, Action, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import * as RunActions from './RoomActions';
import ChatMode from '../../model/enums/ChatMode';
import State from '../State';
import DataContext from '../../model/DataContext';
import localization from '../../model/resources/localization';
import ChatMessage from '../../model/ChatMessage';
import Account from '../../model/Account';
import Persons from '../../model/Persons';
import PersonInfo from '../../model/PersonInfo';
import PlayerInfo from '../../model/PlayerInfo';
import Role from '../../model/Role';
import PlayerStates from '../../model/enums/PlayerStates';
import tableActionCreators from '../table/tableActionCreators';
import StakeTypes from '../../model/enums/StakeTypes';
import Constants from '../../model/enums/Constants';
import MessageLevel from '../../model/enums/MessageLevel';
import Messages from '../../client/game/Messages';
import JoinMode from '../../client/game/JoinMode';
import commonActionCreators from '../common/commonActionCreators';
import Path from '../../model/enums/Path';
import actionCreators from '../../logic/actionCreators';

let timerRef: number | null = null;

const runChatModeChanged: ActionCreator<RunActions.RunChatModeChangedAction> = (chatMode: ChatMode) => ({
	type: RunActions.RoomActionTypes.RoomChatModeChanged, chatMode
});

const runChatMessageChanged: ActionCreator<RunActions.RunChatMessageChangedAction> = (message: string) => ({
	type: RunActions.RoomActionTypes.RoomChatMessageChanged, message
});

const runChatMessageSend: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () =>
	(dispatch: Dispatch<RunActions.KnownRoomAction>, getState: () => State, dataContext: DataContext) => {
		const state = getState();

		const text = state.room.chat.message;
		if (text.length > 0) {
			dataContext.game.gameServerClient.sayAsync(text);
		}

		dispatch(runChatMessageChanged(''));

		// Temporary
		dispatch(chatMessageAdded({ sender: state.room.name, text, level: MessageLevel.Information }) as unknown as Action);

		if (!state.room.chat.isVisible) {
			dispatch(activateChat());
		}
	};

const markQuestion: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	_dispatch: Dispatch<RunActions.KnownRoomAction>,
	_getState: () => State,
	dataContext: DataContext
	) => {
		await dataContext.game.markQuestion();
	};

const onPass: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	_dispatch: Dispatch<RunActions.KnownRoomAction>,
	_getState: () => State,
	dataContext: DataContext
	) => {
		await dataContext.game.pass();
	};

const pause: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	_dispatch: Dispatch<RunActions.KnownRoomAction>,
	getState: () => State,
	dataContext: DataContext
	) => {
		await dataContext.game.pause(!getState().room.stage.isGamePaused);
	};

const editTable: ActionCreator<RunActions.EditTableAction> = () => ({
	type: RunActions.RoomActionTypes.EditTable
});

const giveTurn: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	dispatch: Dispatch<RunActions.KnownRoomAction>,
	getState: () => State
	) => {
		const indices = getState().room.persons.players.map((_value, index) => index);

		dispatch(selectionEnabled(indices, Messages.SetChooser));
		dispatch(showmanReplicChanged(localization.giveTurnHint));
	};

const runShowPersons: ActionCreator<RunActions.RunShowPersonsAction> = () => ({
	type: RunActions.RoomActionTypes.RoomShowPersons
});

const runHidePersons: ActionCreator<RunActions.RunHidePersonsAction> = () => ({
	type: RunActions.RoomActionTypes.RoomHidePersons
});

const runShowTables: ActionCreator<RunActions.RunShowTablesAction> = () => ({
	type: RunActions.RoomActionTypes.RoomShowTables
});

const runHideTables: ActionCreator<RunActions.RunHideTablesAction> = () => ({
	type: RunActions.RoomActionTypes.RoomHideTables
});

const runShowBanned: ActionCreator<RunActions.RunShowBannedAction> = () => ({
	type: RunActions.RoomActionTypes.RoomShowBanned
});

const runHideBanned: ActionCreator<RunActions.RunHideBannedAction> = () => ({
	type: RunActions.RoomActionTypes.RoomHideBanned
});

const runShowGameInfo: ActionCreator<RunActions.RunShowGameInfoAction> = () => ({
	type: RunActions.RoomActionTypes.RoomShowGameInfo
});

const runHideGameInfo: ActionCreator<RunActions.RunHideGameInfoAction> = () => ({
	type: RunActions.RoomActionTypes.RoomHideGameInfo
});

const runShowManageGame: ActionCreator<RunActions.RunShowManageGameAction> = () => ({
	type: RunActions.RoomActionTypes.RoomShowManageGame
});

const runHideManageGame: ActionCreator<RunActions.RunHideManageGameAction> = () => ({
	type: RunActions.RoomActionTypes.RoomHideManageGame
});

const runChatVisibilityChanged: ActionCreator<RunActions.RunChatVisibilityChangedAction> = (isOpen: boolean) => ({
	type: RunActions.RoomActionTypes.RoomChatVisibilityChanged, isOpen
});

const clearDecisions: ActionCreator<RunActions.ClearDecisionsAction> = () => ({
	type: RunActions.RoomActionTypes.ClearDecisions
});

const playerSelected: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (playerIndex: number) => async (
	dispatch: Dispatch<RunActions.KnownRoomAction>,
	getState: () => State,
	dataContext: DataContext
	) => {
	if (await dataContext.game.gameServerClient.msgAsync(getState().room.selection.message, playerIndex)) {
		dispatch(clearDecisions());
		dispatch(showmanReplicChanged(''));
	}
};

const exitGame: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	dispatch: Dispatch<Action>,
	getState: () => State,
	dataContext: DataContext
) => {
	try {
		// TODO: show progress bar
		if (dataContext.game.shouldClose) {
			await actionCreators.closeSIHostClientAsync(dispatch, dataContext);
		} else {
			await dataContext.game.gameServerClient.leaveGameAsync();
		}
	} catch (e) {
		dispatch(commonActionCreators.onUserError(localization.exitError) as any);
	}

	if (timerRef) {
		window.clearTimeout(timerRef);
		timerRef = null;
	}

	dispatch(tableActionCreators.tableReset());
	dispatch(clearRoomChat());

	dispatch(stopTimer(0));
	dispatch(stopTimer(1));
	dispatch(stopTimer(2));

	dispatch(isPausedChanged(false));
	dispatch(clearDecisionsAndMainTimer());

	dispatch(commonActionCreators.stopAudio());

	const state = getState();
	dispatch(actionCreators.init({ path: state.ui.navigation.returnToLobby ? Path.Lobby : Path.Menu }) as unknown as Action);
};

let lastReplicLock: number;

const chatMessageAddedCore: ActionCreator<RunActions.ChatMessageAddedAction> = (chatMessage: ChatMessage) => ({
	type: RunActions.RoomActionTypes.ChatMessageAdded, chatMessage
});

const chatMessageAdded: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (chatMessage: ChatMessage) => (
	dispatch: Dispatch<Action>,
	getState: () => State
) => {
	dispatch(chatMessageAddedCore(chatMessage));
	const state = getState();

	if (!state.room.chat.isVisible && state.ui.windowWidth < 800) {
		dispatch(lastReplicChanged(chatMessage));

		if (lastReplicLock) {
			window.clearTimeout(lastReplicLock);
		}

		lastReplicLock = window.setTimeout(
			() => {
				dispatch(roomActionCreators.lastReplicChanged(null));
			},
			3000
		);
	}
}

const lastReplicChanged: ActionCreator<RunActions.LastReplicChangedAction> = (chatMessage: ChatMessage | null) => ({
	type: RunActions.RoomActionTypes.LastReplicChanged, chatMessage
});

const activateChat: ActionCreator<RunActions.ActivateChatAction> = () => ({
	type: RunActions.RoomActionTypes.ActivateChat
});

const showmanReplicChanged: ActionCreator<RunActions.ShowmanReplicChangedAction> = (replic: string) => ({
	type: RunActions.RoomActionTypes.ShowmanReplicChanged, replic
});

const playerReplicChanged: ActionCreator<RunActions.PlayerReplicChangedAction> = (playerIndex: number, replic: string) => ({
	type: RunActions.RoomActionTypes.PlayerReplicChanged, playerIndex, replic
});

const infoChanged: ActionCreator<RunActions.InfoChangedAction> = (all: Persons, showman: PersonInfo, players: PlayerInfo[]) => ({
	type: RunActions.RoomActionTypes.InfoChanged, all, showman, players
});

const chatPersonSelected: ActionCreator<RunActions.ChatPersonSelectedAction> = (personName: string) => ({
	type: RunActions.RoomActionTypes.ChatPersonSelected, personName
});

const tableSelected: ActionCreator<RunActions.TableSelectedAction> = (tableIndex: number) => ({
	type: RunActions.RoomActionTypes.TableSelected, tableIndex
});

const operationError: ActionCreator<RunActions.OperationErrorAction> = (error: string) => ({
	type: RunActions.RoomActionTypes.OperationError, error
});

const addTable: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	dispatch: Dispatch<RunActions.KnownRoomAction>,
	getState: () => State, dataContext: DataContext) => {
	if (getState().room.persons.players.length >= Constants.MAX_PLAYER_COUNT) {
		return;
	}

	await dataContext.game.gameServerClient.msgAsync('CONFIG', 'ADDTABLE');
};

const deleteTable: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	_dispatch: Dispatch<RunActions.KnownRoomAction>,
	getState: () => State,
	dataContext: DataContext
	) => {
	const tableIndex = getState().room.selectedTableIndex - 1;
	if (tableIndex < 0 || tableIndex >= getState().room.persons.players.length) {
		return;
	}

	await dataContext.game.gameServerClient.msgAsync('CONFIG', 'DELETETABLE', tableIndex);
};

const freeTable: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	_dispatch: Dispatch<RunActions.KnownRoomAction>,
	getState: () => State,
	dataContext: DataContext
	) => {
	const tableIndex = getState().room.selectedTableIndex;
	if (tableIndex < 0 || tableIndex >= getState().room.persons.players.length + 1) {
		return;
	}

	const isShowman = tableIndex === 0;

	await dataContext.game.gameServerClient.msgAsync('CONFIG', 'FREE', isShowman ? 'showman' : 'player', isShowman ? '' : tableIndex - 1);
};

const setTable: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (name: string) => async (
	_dispatch: Dispatch<RunActions.KnownRoomAction>,
	getState: () => State,
	dataContext: DataContext
	) => {
	const tableIndex = getState().room.selectedTableIndex;
	if (tableIndex < 0 || tableIndex >= getState().room.persons.players.length + 1) {
		return;
	}

	const isShowman = tableIndex === 0;

	await dataContext.game.gameServerClient.msgAsync('CONFIG', 'SET', isShowman ? 'showman' : 'player', isShowman ? '' : tableIndex - 1, name);
};

const changeType: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	_dispatch: Dispatch<RunActions.KnownRoomAction>,
	getState: () => State,
	dataContext: DataContext
	) => {
	const tableIndex = getState().room.selectedTableIndex;
	if (tableIndex < 0 || tableIndex >= getState().room.persons.players.length + 1) {
		return;
	}

	const isShowman = tableIndex === 0;

	await dataContext.game.gameServerClient.msgAsync('CONFIG', 'CHANGETYPE', isShowman ? 'showman' : 'player', isShowman ? '' : tableIndex - 1);
};

const kickPerson: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	_dispatch: Dispatch<RunActions.KnownRoomAction>,
	getState: () => State,
	dataContext: DataContext
	) => {
	const personName = getState().room.chat.selectedPersonName;
	if (!personName) {
		return;
	}

	await dataContext.game.gameServerClient.msgAsync('KICK', personName);
};

const banPerson: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	_dispatch: Dispatch<RunActions.KnownRoomAction>,
	getState: () => State,
	dataContext: DataContext
	) => {
	const personName = getState().room.chat.selectedPersonName;
	if (!personName) {
		return;
	}

	await dataContext.game.gameServerClient.msgAsync('BAN', personName);
};

const setHost: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	_dispatch: Dispatch<RunActions.KnownRoomAction>,
	getState: () => State,
	dataContext: DataContext
	) => {
	const personName = getState().room.chat.selectedPersonName;

	if (!personName) {
		return;
	}

	await dataContext.game.setHost(personName);
};

const personAvatarChanged: ActionCreator<RunActions.PersonAvatarChangedAction> = (personName: string, avatarUri: string) => ({
	type: RunActions.RoomActionTypes.PersonAvatarChanged, personName, avatarUri
});

const personAvatarVideoChanged: ActionCreator<RunActions.PersonAvatarVideoChangedAction> = (personName: string, avatarUri: string) => ({
	type: RunActions.RoomActionTypes.PersonAvatarVideoChanged, personName, avatarUri
});

const gameStarted: ActionCreator<RunActions.GameStartedAction> = (started: boolean) => ({ type: RunActions.RoomActionTypes.GameStarted, started });

const stageChanged: ActionCreator<RunActions.StageChangedAction> = (stageName: string, roundIndex: number) => ({
	type: RunActions.RoomActionTypes.StageChanged, stageName, roundIndex
});

const playersStateCleared: ActionCreator<RunActions.PlayersStateClearedAction> = () => ({
	type: RunActions.RoomActionTypes.PlayersStateCleared
});

const gameStateCleared: ActionCreator<RunActions.GameStateClearedAction> = () => ({
	type: RunActions.RoomActionTypes.GameStateCleared
});

const sumsChanged: ActionCreator<RunActions.SumsChangedAction> = (sums: number[]) => ({
	type: RunActions.RoomActionTypes.SumsChanged, sums
});

const afterQuestionStateChanged: ActionCreator<RunActions.AfterQuestionStateChangedAction> = (isAfterQuestion: boolean) => ({
	type: RunActions.RoomActionTypes.AfterQuestionStateChanged, isAfterQuestion
});

const currentPriceChanged: ActionCreator<RunActions.CurrentPriceChangedAction> = (currentPrice: number) => ({
	type: RunActions.RoomActionTypes.CurrentPriceChanged, currentPrice
});

const personAdded: ActionCreator<RunActions.PersonAddedAction> = (person: Account) => ({
	type: RunActions.RoomActionTypes.PersonAdded, person
});

const personRemoved: ActionCreator<RunActions.PersonRemovedAction> = (name: string) => ({
	type: RunActions.RoomActionTypes.PersonRemoved, name
});

const showmanChanged: ActionCreator<RunActions.ShowmanChangedAction> = (name: string, isHuman?: boolean, isReady?: boolean) => ({
	type: RunActions.RoomActionTypes.ShowmanChanged, name, isHuman, isReady
});

const playerAdded: ActionCreator<RunActions.PlayerAddedAction> = () => ({
	type: RunActions.RoomActionTypes.PlayerAdded
});

const playerChanged: ActionCreator<RunActions.PlayerChangedAction> = (index: number, name: string, isHuman?: boolean, isReady?: boolean) => ({
	type: RunActions.RoomActionTypes.PlayerChanged, index, name, isHuman, isReady
});

const playerSumChanged: ActionCreator<RunActions.PlayerSumChangedAction> = (index: number, value: number) => ({
	type: RunActions.RoomActionTypes.PlayerSumChanged, index, value
});

const playerDeleted: ActionCreator<RunActions.PlayerDeletedAction> = (index: number) => ({
	type: RunActions.RoomActionTypes.PlayerDeleted, index
});

const playersSwap: ActionCreator<RunActions.PlayersSwapAction> = (index1: number, index2: number) => ({
	type: RunActions.RoomActionTypes.PlayersSwap, index1, index2
});

const nameChanged: ActionCreator<RunActions.NameChangedAction> = (name: string) => ({
	type: RunActions.RoomActionTypes.NameChanged, name
});

const roleChanged: ActionCreator<RunActions.RoleChangedAction> = (role: Role) => ({
	type: RunActions.RoomActionTypes.RoleChanged, role
});

const playerStateChanged: ActionCreator<RunActions.PlayerStateChangedAction> = (index: number, state: PlayerStates) => ({
	type: RunActions.RoomActionTypes.PlayerStateChanged, index, state
});

const playerLostStateDropped: ActionCreator<RunActions.PlayerLostStateDroppedAction> = (index: number) => ({
	type: RunActions.RoomActionTypes.PlayerLostStateDropped, index
});

const isPausedChanged: ActionCreator<RunActions.IsPausedChangedAction> = (isPaused: boolean) => ({
	type: RunActions.RoomActionTypes.IsPausedChanged, isPaused
});

const playerStakeChanged: ActionCreator<RunActions.PlayerStakeChangedAction> = (index: number, stake: number) => ({
	type: RunActions.RoomActionTypes.PlayerStakeChanged, index, stake
});

const decisionNeededChanged: ActionCreator<RunActions.DecisionNeededChangedAction> = (decisionNeeded: boolean) => ({
	type: RunActions.RoomActionTypes.DecisionNeededChanged, decisionNeeded
});

const selectQuestion: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (themeIndex: number, questionIndex: number) => async (
	dispatch: Dispatch<Action>,
	getState: () => State, dataContext: DataContext
) => {
	if (!getState().table.isSelectable) {
		return;
	}

	const theme = getState().table.roundInfo[themeIndex];

	if (theme) {
		const question = theme.questions[questionIndex];

		if (question > -1) {
			if (await dataContext.game.selectQuestion(themeIndex, questionIndex)) {
				dispatch(tableActionCreators.isSelectableChanged(false));
				dispatch(decisionNeededChanged(false));
			}
		}
	}
};

const toggleQuestion: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (themeIndex: number, questionIndex: number) => async (
	_dispatch: Dispatch<Action>,
	getState: () => State, dataContext: DataContext
) => {
	const theme = getState().table.roundInfo[themeIndex];

	if (theme && theme.questions[questionIndex]) {
		await dataContext.game.toggle(themeIndex, questionIndex);
	}
};

const selectTheme: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (themeIndex: number) => async (
	dispatch: Dispatch<Action>,
	getState: () => State, dataContext: DataContext
) => {
	if (!getState().table.isSelectable) {
		return;
	}

	const theme = getState().table.roundInfo[themeIndex];

	if (theme) {
		if (await dataContext.game.deleteTheme(themeIndex)) {
			dispatch(tableActionCreators.isSelectableChanged(false));
			dispatch(decisionNeededChanged(false));
		}
	}
};

const selectAnswerOption: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (label: string) => async (
	dispatch: Dispatch<Action>,
	getState: () => State, dataContext: DataContext
) => {
	if (!getState().table.isSelectable) {
		return;
	}

	if (await dataContext.game.gameServerClient.msgAsync(Messages.Answer, label)) {
		dispatch(tableActionCreators.isSelectableChanged(false));
		dispatch(decisionNeededChanged(false));
	}
};

const isGameButtonEnabledChanged: ActionCreator<RunActions.IsGameButtonEnabledChangedAction> = (isGameButtonEnabled: boolean) => ({
	type: RunActions.RoomActionTypes.IsGameButtonEnabledChanged, isGameButtonEnabled
});

const pressGameButton: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	dispatch: Dispatch<any>,
	getState: () => State,
	dataContext: DataContext
	) => {
	const deltaTime = Date.now() - getState().table.canPressUpdateTime;

	if (!await dataContext.game.pressButton(deltaTime)) {
		return;
	}

	dispatch(isGameButtonEnabledChanged(false));

	setTimeout(
		() => {
			dispatch(isGameButtonEnabledChanged(true));
		},
		getState().room.buttonBlockingTimeSeconds * 1000
	);
};

const apellate: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	_dispatch: Dispatch<any>,
	_getState: () => State,
	dataContext: DataContext
	) => {
	await dataContext.game.gameServerClient.msgAsync('APELLATE', '+');
};

const disagree: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	_dispatch: Dispatch<any>,
	_getState: () => State,
	dataContext: DataContext
	) => {
	await dataContext.game.gameServerClient.msgAsync('APELLATE', '-');
};

const isAnswering: ActionCreator<RunActions.IsAnsweringAction> = () => ({
	type: RunActions.RoomActionTypes.IsAnswering
});

const onAnswerChanged: ActionCreator<RunActions.AnswerChangedAction> = (answer: string) => ({
	type: RunActions.RoomActionTypes.AnswerChanged, answer
});

let isAnswerVersionThrottled = false;
let answerLock: number | null = null;

const updateAnswer: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (answer: string) => async (
	dispatch: Dispatch<any>,
	_getState: () => State,
	dataContext: DataContext
	) => {
	dispatch(onAnswerChanged(answer));

	if (isAnswerVersionThrottled) {
		return;
	}

	isAnswerVersionThrottled = true;

	answerLock = window.setTimeout(
		async () => {
			isAnswerVersionThrottled = false;
			await dataContext.game.sendAnswerVersion(answer);
		},
		3000
	);
};

const sendAnswer: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	dispatch: Dispatch<any>,
	getState: () => State,
	dataContext: DataContext
	) => {
	if (answerLock) {
		window.clearTimeout(answerLock);
		answerLock = null;
	}

	const { answer } = getState().room;

	if (await dataContext.game.gameServerClient.msgAsync('ANSWER', answer)) {
		dispatch(clearDecisions());
	}
};

const validate: ActionCreator<RunActions.ValidateAction> = (
	name: string,
	answer: string,
	rightAnswers: string[],
	wrongAnswers: string[],
	header: string,
	message: string,
	showExtraRightButtons: boolean,
) => ({
	type: RunActions.RoomActionTypes.Validate, name, answer, rightAnswers, wrongAnswers, header, message, showExtraRightButtons
});

const approveAnswer: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (factor: number) => async (
	dispatch: Dispatch<any>,
	_getState: () => State,
	dataContext: DataContext
	) => {
		if (await dataContext.game.gameServerClient.msgAsync(Messages.IsRight, '+', factor)) {
			dispatch(clearDecisions());
		}
	};

const rejectAnswer: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	dispatch: Dispatch<any>,
	_getState: () => State,
	dataContext: DataContext
	) => {
		if (await dataContext.game.gameServerClient.msgAsync(Messages.IsRight, '-')) {
			dispatch(clearDecisions());
		}
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
	type: RunActions.RoomActionTypes.SetStakes, allowedStakeTypes, minimum, maximum, stake, step, message, areSimple
});

const stakeChanged: ActionCreator<RunActions.StakeChangedAction> = (stake: number) => ({
	type: RunActions.RoomActionTypes.StakeChanged, stake
});

const sendNominal: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	dispatch: Dispatch<any>,
	_getState: () => State,
	dataContext: DataContext
	) => {
		if (await dataContext.game.gameServerClient.msgAsync('STAKE', 0)) {
			dispatch(clearDecisions());
		}
	};

const sendStake: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (stake?: number) => async (
	dispatch: Dispatch<any>,
	getState: () => State,
	dataContext: DataContext
	) => {
		const state = getState();

		let result : boolean;

		if (state.room.stakes.message === 'STAKE') { // Bad design
			result = await dataContext.game.gameServerClient.msgAsync('STAKE', 1, stake ?? state.room.stakes.stake);
		} else {
			result = await dataContext.game.gameServerClient.msgAsync(state.room.stakes.message, stake ?? state.room.stakes.stake);
		}

		if (result) {
			dispatch(clearDecisions());
		}
	};

const sendPass: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	dispatch: Dispatch<any>,
	_getState: () => State,
	dataContext: DataContext
	) => {
	if (await dataContext.game.gameServerClient.msgAsync('STAKE', 2)) {
		dispatch(clearDecisions());
	}
};

const sendAllIn: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	dispatch: Dispatch<any>,
	_getState: () => State,
	dataContext: DataContext
	) => {
	if (await dataContext.game.gameServerClient.msgAsync('STAKE', 3)) {
		dispatch(clearDecisions());
	}
};

const selectionEnabled: ActionCreator<RunActions.SelectionEnabledAction> = (allowedIndices: number[], message: string) => ({
	type: RunActions.RoomActionTypes.SelectionEnabled, allowedIndices, message
});

const showLeftSeconds = (leftSeconds: number, dispatch: Dispatch<RunActions.KnownRoomAction>): void => {
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
	await dataContext.game.gameServerClient.msgAsync('ATOM');
};

const areSumsEditableChanged: ActionCreator<RunActions.AreSumsEditableChangedAction> = (areSumsEditable: boolean) => ({
	type: RunActions.RoomActionTypes.AreSumsEditableChanged, areSumsEditable
});

const changePlayerSum: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (
	playerIndex: number,
	sum: number
) => async (
	_dispatch: Dispatch<any>,
	_getState: () => State,
	dataContext: DataContext
	) => {
	await dataContext.game.gameServerClient.msgAsync('CHANGE', playerIndex + 1, sum); // playerIndex here starts with 1
};

const readingSpeedChanged: ActionCreator<RunActions.ReadingSpeedChangedAction> = (readingSpeed: number) => ({
	type: RunActions.RoomActionTypes.ReadingSpeedChanged, readingSpeed
});

const runTimer: ActionCreator<RunActions.RunTimerAction> = (timerIndex: number, maximumTime: number, runByUser: boolean) => ({
	type: RunActions.RoomActionTypes.RunTimer, timerIndex, maximumTime, runByUser
});

const pauseTimer: ActionCreator<RunActions.PauseTimerAction> = (timerIndex: number, currentTime: number, pausedByUser: boolean) => ({
	type: RunActions.RoomActionTypes.PauseTimer, timerIndex, currentTime, pausedByUser
});

const resumeTimer: ActionCreator<RunActions.ResumeTimerAction> = (timerIndex: number, runByUser: boolean) => ({
	type: RunActions.RoomActionTypes.ResumeTimer, timerIndex, runByUser
});

const stopTimer: ActionCreator<RunActions.StopTimerAction> = (timerIndex: number) => ({
	type: RunActions.RoomActionTypes.StopTimer, timerIndex
});

const timerMaximumChanged: ActionCreator<RunActions.TimerMaximumChangedAction> = (timerIndex: number, maximumTime: number) => ({
	type: RunActions.RoomActionTypes.TimerMaximumChanged, timerIndex, maximumTime
});

const activateShowmanDecision: ActionCreator<RunActions.ActivateShowmanDecisionAction> = () => ({
	type: RunActions.RoomActionTypes.ActivateShowmanDecision
});

const activatePlayerDecision: ActionCreator<RunActions.ActivatePlayerDecisionAction> = (playerIndex: number) => ({
	type: RunActions.RoomActionTypes.ActivatePlayerDecision, playerIndex
});

const showMainTimer: ActionCreator<RunActions.ShowMainTimerAction> = () => ({
	type: RunActions.RoomActionTypes.ShowMainTimer
});

const clearDecisionsAndMainTimer: ActionCreator<RunActions.ClearDecisionsAndMainTimerAction> = () => ({
	type: RunActions.RoomActionTypes.ClearDecisionsAndMainTimer
});

const hintChanged: ActionCreator<RunActions.HintChangedAction> = (hint: string | null) => ({
	type: RunActions.RoomActionTypes.HintChanged, hint
});

const startGame: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	_dispatch: Dispatch<RunActions.KnownRoomAction>,
	_getState: () => State,
	dataContext: DataContext
) => {
	await dataContext.game.gameServerClient.msgAsync('START');
};

const ready: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (isReady: boolean) => async (
	_dispatch: Dispatch<RunActions.KnownRoomAction>,
	_getState: () => State,
	dataContext: DataContext
) => {
	await dataContext.game.gameServerClient.msgAsync('READY', isReady ? '+' : '-');
};

const roundsNamesChanged: ActionCreator<RunActions.RoundsNamesChangedAction> = (roundsNames: string[]) => ({
	type: RunActions.RoomActionTypes.RoundsNamesChanged, roundsNames
});

const hostNameChanged: ActionCreator<RunActions.HostNameChangedAction> = (hostName: string | null) => ({
	type: RunActions.RoomActionTypes.HostNameChanged, hostName
});

const themeNameChanged: ActionCreator<RunActions.ThemeNameChangedAction> = (themeName: string) => ({
	type: RunActions.RoomActionTypes.ThemeNameChanged, themeName
});

const updateCaption: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (questionCaption: string) => (
	dispatch: Dispatch<any>,
	getState: () => State
) => {
	const { themeName } = getState().room.stage;
	dispatch(tableActionCreators.captionChanged(`${themeName}, ${questionCaption}`));
};

const moveNext: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	_dispatch: Dispatch<any>,
	_getState: () => State,
	dataContext: DataContext) => {
	await dataContext.game.gameServerClient.msgAsync('MOVE', '1');
};

const navigateToRound: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (roundIndex: number) => async (
	_dispatch: Dispatch<any>,
	_getState: () => State,
	dataContext: DataContext) => {
	await dataContext.game.gameServerClient.msgAsync('MOVE', '3', roundIndex);
};

const isReadyChanged: ActionCreator<RunActions.IsReadyChangedAction> = (personIndex: number, isReady: boolean) => ({
	type: RunActions.RoomActionTypes.IsReadyChanged, personIndex, isReady
});

const chooserChanged: ActionCreator<RunActions.ChooserChangedAction> = (chooserIndex: number) => ({
	type: RunActions.RoomActionTypes.ChooserChanged, chooserIndex
});

const playerInGameChanged: ActionCreator<RunActions.PlayerInGameChangedAction> = (playerIndex: number, inGame: boolean) => ({
	type: RunActions.RoomActionTypes.PlayerInGameChanged, playerIndex, inGame
});

const areApellationsEnabledChanged: ActionCreator<RunActions.AreApellationsEnabledChangedAction> = (areApellationsEnabled: boolean) => ({
	type: RunActions.RoomActionTypes.AreApellationsEnabledChanged, areApellationsEnabled
});

const buttonBlockingTimeChanged: ActionCreator<RunActions.ButtonBlockingChangedAction> = (buttonBlockingTime: number) => ({
	type: RunActions.RoomActionTypes.ButtonBlockingTimeChanged, buttonBlockingTime
});

const gameMetadataChanged: ActionCreator<RunActions.GameMetadataChangedAction> = (
	gameName: string,
	packageName: string,
	contactUri: string,
	voiceChatUri: string | null
) => ({
	type: RunActions.RoomActionTypes.GameMetadataChanged, gameName, packageName, contactUri, voiceChatUri
});

const bannedListChanged: ActionCreator<RunActions.BannedListChangedAction> = (bannedList: Record<string, string>) => ({
	type: RunActions.RoomActionTypes.BannedListChanged, bannedList
});

const banned: ActionCreator<RunActions.BannedAction> = (ip: string, name: string) => ({
	type: RunActions.RoomActionTypes.Banned, ip, name
});

const unbanned: ActionCreator<RunActions.UnbannedAction> = (ip: string) => ({
	type: RunActions.RoomActionTypes.Unbanned, ip
});

const selectBannedItem: ActionCreator<RunActions.SelectBannedItemAction> = (ip: string) => ({
	type: RunActions.RoomActionTypes.SelectBannedItem, ip
});

const unban: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (ip: string) => async (
	_dispatch: Dispatch<any>,
	_getState: () => State,
	dataContext: DataContext
) => {
	await dataContext.game.unban(ip);
};

const playerMediaLoaded: ActionCreator<RunActions.PlayerMediaLoadedAction> = (playerIndex: number) => ({
	type: RunActions.RoomActionTypes.PlayerMediaLoaded, playerIndex
});

const mediaLoaded: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	_dispatch: Dispatch<any>,
	_getState: () => State,
	dataContext: DataContext
) => {
	await dataContext.game.mediaLoaded();
};

const clearRoomChat: ActionCreator<RunActions.ClearRoomChatAction> = () => ({
	type: RunActions.RoomActionTypes.ClearRoomChat
});

const joinModeChanged: ActionCreator<RunActions.JoinModeChangedAction> = (joinMode: JoinMode) => ({
	type: RunActions.RoomActionTypes.JoinModeChanged, joinMode
});

const setJoinMode: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (joinMode: JoinMode) => async (
	_dispatch: Dispatch<any>,
	getState: () => State,
	dataContext: DataContext
) => {
	const currentJoinMode = getState().room.joinMode;

	if (currentJoinMode !== joinMode) {
		await dataContext.game.setJoinMode(joinMode);
	}
};

const onKicked: ActionCreator<RunActions.KickedAction> = () => ({
	type: RunActions.RoomActionTypes.Kicked
});

const onReconnect: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	_dispatch: Dispatch<any>,
	_getState: () => State,
	dataContext: DataContext
) => {
	await dataContext.game.info();
};

const avatarVisibleChanged: ActionCreator<RunActions.AvatarVisibleChangedAction> = (isVisible: boolean) => ({
	type: RunActions.RoomActionTypes.AvatarVisibleChanged, isVisible
});

const webCameraUrlChanged: ActionCreator<RunActions.WebCameraUrlChangedAction> = (webCameraUrl: string) => ({
	type: RunActions.RoomActionTypes.WebCameraUrlChanged, webCameraUrl
});

const setWebCamera: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (webCameraUrl: string) => async (
	dispatch: Dispatch<any>,
	_getState: () => State,
	dataContext: DataContext
) => {
	dispatch(webCameraUrlChanged(webCameraUrl));
	await dataContext.game.sendVideoAvatar(webCameraUrl);
};

const roomActionCreators = {
	runChatModeChanged,
	runChatMessageChanged,
	runChatMessageSend,
	markQuestion,
	onPass,
	pause,
	editTable,
	giveTurn,
	runShowPersons,
	runHidePersons,
	runShowTables,
	runHideTables,
	runShowBanned,
	runHideBanned,
	runShowGameInfo,
	runHideGameInfo,
	runShowManageGame,
	runHideManageGame,
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
	freeTable,
	setTable,
	changeType,
	kickPerson,
	banPerson,
	setHost,
	personAvatarChanged,
	personAvatarVideoChanged,
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
	playerSumChanged,
	playerDeleted,
	playersSwap,
	nameChanged,
	roleChanged,
	playerStateChanged,
	playerLostStateDropped,
	isPausedChanged,
	playerStakeChanged,
	decisionNeededChanged,
	clearDecisions,
	selectQuestion,
	toggleQuestion,
	selectTheme,
	pressGameButton,
	apellate,
	disagree,
	isAnswering,
	updateAnswer,
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
	operationError,
	hostNameChanged,
	themeNameChanged,
	updateCaption,
	moveNext,
	navigateToRound,
	isReadyChanged,
	ready,
	roundsNamesChanged,
	chooserChanged,
	playerInGameChanged,
	areApellationsEnabledChanged,
	buttonBlockingTimeChanged,
	gameMetadataChanged,
	bannedListChanged,
	banned,
	unbanned,
	selectBannedItem,
	unban,
	playerMediaLoaded,
	mediaLoaded,
	clearRoomChat,
	joinModeChanged,
	setJoinMode,
	selectAnswerOption,
	onKicked,
	onReconnect,
	avatarVisibleChanged,
	setWebCamera,
};

export default roomActionCreators;
