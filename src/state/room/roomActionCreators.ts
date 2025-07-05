import { ActionCreator, Action, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import * as RunActions from './RoomActions';
import State from '../State';
import DataContext from '../../model/DataContext';
import localization from '../../model/resources/localization';
import Account from '../../model/Account';
import Persons from '../../model/Persons';
import JoinMode from '../../client/game/JoinMode';
import { stopAudio, userErrorChanged } from '../commonSlice';
import Path from '../../model/enums/Path';
import actionCreators from '../../logic/actionCreators';
import { AppDispatch } from '../store';
import { clearChat, setIsAppellation, setIsPaused, showmanReplicChanged } from '../room2Slice';
import StakeModes from '../../client/game/StakeModes';
import { navigate } from '../../utils/Navigator';
import { clearGameLog } from '../globalActions';

let timerRef: number | null = null;

const onPass: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	_dispatch: Dispatch<RunActions.KnownRoomAction>,
	_getState: () => State,
	dataContext: DataContext
	) => {
		await dataContext.game.pass();
	};

const giveTurn: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (dispatch: Dispatch<RunActions.KnownRoomAction>) => {
	dispatch(selectionEnabled());
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

const clearDecisions: ActionCreator<RunActions.ClearDecisionsAction> = () => ({
	type: RunActions.RoomActionTypes.ClearDecisions
});

const exitGame: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (appDispatch: AppDispatch) => async (
	dispatch: Dispatch<Action>,
	getState: () => State,
	dataContext: DataContext
) => {
	try {
		// TODO: show progress bar
		if (dataContext.game.shouldClose) {
			await actionCreators.closeSIHostClientAsync(appDispatch, dataContext);
		} else {
			await dataContext.game.leaveGame();
		}
	} catch (e) {
		appDispatch(userErrorChanged(localization.exitError) as any);
	}

	if (timerRef) {
		window.clearTimeout(timerRef);
		timerRef = null;
	}

	appDispatch(clearChat());
	dispatch(onKicked(false));

	dispatch(stopTimer(0));
	dispatch(stopTimer(1));
	dispatch(stopTimer(2));

	appDispatch(setIsPaused(false));
	appDispatch(setIsAppellation(false));
	dispatch(clearDecisionsAndMainTimer());

	appDispatch(stopAudio());
	appDispatch(clearGameLog());

	const state = getState();
	dispatch(navigate({ navigation: { path: state.ui.navigation.returnToLobby ? Path.Lobby : Path.Menu }, saveState: true }) as unknown as Action);
};

const infoChanged: ActionCreator<RunActions.InfoChangedAction> = (all: Persons) => ({
	type: RunActions.RoomActionTypes.InfoChanged, all,
});

const tableSelected: ActionCreator<RunActions.TableSelectedAction> = (tableIndex: number) => ({
	type: RunActions.RoomActionTypes.TableSelected, tableIndex
});

const deleteTable: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	_dispatch: Dispatch<RunActions.KnownRoomAction>,
	getState: () => State,
	dataContext: DataContext
	) => {
	const tableIndex = getState().room.selectedTableIndex - 1;

	if (tableIndex < 0 || tableIndex >= getState().room2.persons.players.length) {
		return;
	}

	await dataContext.game.deleteTable(tableIndex);
};

const freeTable: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	_dispatch: Dispatch<RunActions.KnownRoomAction>,
	getState: () => State,
	dataContext: DataContext
	) => {
	const tableIndex = getState().room.selectedTableIndex;

	if (tableIndex < 0 || tableIndex >= getState().room2.persons.players.length + 1) {
		return;
	}

	await dataContext.game.freeTable(tableIndex === 0, tableIndex - 1);
};

const setTable: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (name: string) => async (
	_dispatch: Dispatch<RunActions.KnownRoomAction>,
	getState: () => State,
	dataContext: DataContext
	) => {
	const tableIndex = getState().room.selectedTableIndex;

	if (tableIndex < 0 || tableIndex >= getState().room2.persons.players.length + 1) {
		return;
	}

	await dataContext.game.setTable(tableIndex === 0, tableIndex - 1, name);
};

const changeType: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	_dispatch: Dispatch<RunActions.KnownRoomAction>,
	getState: () => State,
	dataContext: DataContext
	) => {
	const tableIndex = getState().room.selectedTableIndex;

	if (tableIndex < 0 || tableIndex >= getState().room2.persons.players.length + 1) {
		return;
	}

	await dataContext.game.changeTableType(tableIndex === 0, tableIndex - 1);
};

const personAvatarChanged: ActionCreator<RunActions.PersonAvatarChangedAction> = (personName: string, avatarUri: string) => ({
	type: RunActions.RoomActionTypes.PersonAvatarChanged, personName, avatarUri
});

const personAvatarVideoChanged: ActionCreator<RunActions.PersonAvatarVideoChangedAction> = (personName: string, avatarUri: string) => ({
	type: RunActions.RoomActionTypes.PersonAvatarVideoChanged, personName, avatarUri
});

const stageChanged: ActionCreator<RunActions.StageChangedAction> = (stageName: string, roundIndex: number) => ({
	type: RunActions.RoomActionTypes.StageChanged, stageName, roundIndex
});

const gameStateCleared: ActionCreator<RunActions.GameStateClearedAction> = () => ({
	type: RunActions.RoomActionTypes.GameStateCleared
});

const afterQuestionStateChanged: ActionCreator<RunActions.AfterQuestionStateChangedAction> = (isAfterQuestion: boolean) => ({
	type: RunActions.RoomActionTypes.AfterQuestionStateChanged, isAfterQuestion
});

const isQuestionChanged: ActionCreator<RunActions.IsQuestionChangedAction> = (isQuestion: boolean, questionType: string) => ({
	type: RunActions.RoomActionTypes.IsQuestionChanged, isQuestion, questionType,
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

const apellate: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	_dispatch: Dispatch<any>,
	_getState: () => State,
	dataContext: DataContext
	) => {
	await dataContext.game.apellate(true);
};

const disagree: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	_dispatch: Dispatch<any>,
	_getState: () => State,
	dataContext: DataContext
	) => {
	await dataContext.game.apellate(false);
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
	getState: () => State,
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
			const latestAnswer = getState().room.answer;

			if (latestAnswer) {
				await dataContext.game.sendAnswerVersion(latestAnswer);
			}
		},
		3000
	);
};

const sendAnswer: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (dispatch: Dispatch<any>) => {
	if (answerLock) {
		window.clearTimeout(answerLock);
		answerLock = null;
	}

	dispatch(clearDecisions());
};

const setStakes: ActionCreator<RunActions.SetStakesAction> = (
	stakeModes: StakeModes,
	minimum: number,
	maximum: number,
	step: number,
	playerName: string | null,
) => ({
	type: RunActions.RoomActionTypes.SetStakes, stakeModes, minimum, maximum, step, playerName
});

const stakeChanged: ActionCreator<RunActions.StakeChangedAction> = (stake: number) => ({
	type: RunActions.RoomActionTypes.StakeChanged, stake
});

const selectionEnabled: ActionCreator<RunActions.SelectionEnabledAction> = () => ({
	type: RunActions.RoomActionTypes.SelectionEnabled
});

const showLeftSeconds = (leftSeconds: number, appDispatch: AppDispatch): void => {
	let leftSecondsString = (leftSeconds % 60).toString();

	if (leftSecondsString.length < 2) {
		leftSecondsString = `0${leftSeconds}`;
	}

	appDispatch(showmanReplicChanged(`${localization.theGameWillStartIn} 00:00:${leftSecondsString} ${localization.orByFilling}`));

	if (leftSeconds > 0) {
		timerRef = window.setTimeout(
			() => {
				showLeftSeconds(leftSeconds - 1, appDispatch);
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
	await dataContext.game.onMediaCompleted();
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
	await dataContext.game.setPlayerScore(playerIndex, sum);
};

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
	await dataContext.game.start();
};

const ready: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (isReady: boolean) => async (
	_dispatch: Dispatch<RunActions.KnownRoomAction>,
	_getState: () => State,
	dataContext: DataContext
) => {
	await dataContext.game.ready(isReady);
};

const roundsNamesChanged: ActionCreator<RunActions.RoundsNamesChangedAction> = (roundsNames: string[]) => ({
	type: RunActions.RoomActionTypes.RoundsNamesChanged, roundsNames
});

const themeNameChanged: ActionCreator<RunActions.ThemeNameChangedAction> = (themeName: string) => ({
	type: RunActions.RoomActionTypes.ThemeNameChanged, themeName
});

const moveNext: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	_dispatch: Dispatch<any>,
	_getState: () => State,
	dataContext: DataContext
) => {
	await dataContext.game.moveNext();
};

const navigateToRound: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (roundIndex: number) => async (
	_dispatch: Dispatch<any>,
	_getState: () => State,
	dataContext: DataContext
) => {
	await dataContext.game.moveToRound(roundIndex);
};

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

const mediaLoaded: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	_dispatch: Dispatch<any>,
	_getState: () => State,
	dataContext: DataContext
) => {
	await dataContext.game.mediaLoaded();
};

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

const onKicked: ActionCreator<RunActions.KickedAction> = (kicked: boolean) => ({
	type: RunActions.RoomActionTypes.Kicked, kicked,
});

const onReconnect: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (
	_dispatch: Dispatch<any>,
	_getState: () => State,
	dataContext: DataContext
) => {
	await dataContext.game.info();
};

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
	onPass,
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
	exitGame,
	infoChanged,
	tableSelected,
	deleteTable,
	freeTable,
	setTable,
	changeType,
	personAvatarChanged,
	personAvatarVideoChanged,
	stageChanged,
	gameStateCleared,
	afterQuestionStateChanged,
	isQuestionChanged,
	currentPriceChanged,
	personAdded,
	personRemoved,
	clearDecisions,
	apellate,
	disagree,
	isAnswering,
	updateAnswer,
	sendAnswer,
	setStakes,
	stakeChanged,
	selectionEnabled,
	showLeftSeconds,
	onMediaEnded,
	areSumsEditableChanged,
	changePlayerSum,
	runTimer,
	pauseTimer,
	resumeTimer,
	stopTimer,
	timerMaximumChanged,
	showMainTimer,
	clearDecisionsAndMainTimer,
	hintChanged,
	startGame,
	themeNameChanged,
	moveNext,
	navigateToRound,
	ready,
	roundsNamesChanged,
	areApellationsEnabledChanged,
	buttonBlockingTimeChanged,
	gameMetadataChanged,
	bannedListChanged,
	banned,
	unbanned,
	selectBannedItem,
	unban,
	mediaLoaded,
	joinModeChanged,
	setJoinMode,
	onKicked,
	onReconnect,
	setWebCamera,
};

export default roomActionCreators;
