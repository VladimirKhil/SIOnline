import { Action, Dispatch, ActionCreator } from 'redux';
import * as Actions from './Actions';
import State from './State';
import Sex from '../model/enums/Sex';
import { ThunkAction } from 'redux-thunk';
import Role from '../model/enums/Role';
import DataContext from '../model/DataContext';

import 'es6-promise/auto';
import { saveState } from './SavedState';
import OnlineMode from '../model/enums/OnlineMode';
import GamesFilter from '../model/enums/GamesFilter';
import localization from '../model/resources/localization';
import ChatMode from '../model/enums/ChatMode';

import * as signalR from '@microsoft/signalr';
import * as signalRMsgPack from '@microsoft/signalr-protocol-msgpack';
import GameType from '../model/enums/GameType';
import * as GameErrorsHelper from '../utils/GameErrorsHelper';
import GameInfo from '../model/server/GameInfo';
import { sendMessageToServer, attachListeners } from '../utils/ConnectionHelpers';
import MainView from '../model/enums/MainView';
import runActionCreators from './run/runActionCreators';
import Slice from '../model/server/Slice';

const isConnectedChanged: ActionCreator<Actions.IsConnectedChangedAction> = (isConnected: boolean) => ({
	type: Actions.ActionTypes.IsConnectedChanged, isConnected
});

const onConnectionChanged: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (isConnected: boolean, message: string) =>
	async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		dispatch(isConnectedChanged(isConnected));

		const state = getState();
		if (state.ui.mainView === MainView.Game) {
			dispatch(runActionCreators.chatMessageAdded({ sender: '', text: message }));
		} else {
			dispatch(receiveMessage('', message));
		}

		if (!isConnected) {
			return;
		}

		// Необходимо восстановить состояние, в котором находится лобби или игра
		if (state.ui.mainView === MainView.Game) {
			await sendMessageToServer(dataContext.connection, 'INFO');
		} else {
			navigateToGamesList(-1)(dispatch, getState, dataContext);
		}
	};

const computerAccountsChanged: ActionCreator<Actions.ComputerAccountsChangedAction> = (computerAccounts: string[]) => ({
	type: Actions.ActionTypes.ComputerAccountsChanged, computerAccounts
});

const navigateToLogin: ActionCreator<Actions.NavigateToLoginAction> = () => ({
	type: Actions.ActionTypes.NavigateToLogin
});

const showSettings: ActionCreator<Actions.ShowSettingsAction> = (show: boolean) => ({
	type: Actions.ActionTypes.ShowSettings, show
});

const navigateToHowToPlay: ActionCreator<Actions.NavigateToHowToPlayAction> = () => ({
	type: Actions.ActionTypes.NavigateToHowToPlay
});

const navigateBack: ActionCreator<Actions.NavigateBackAction> = () => ({
	type: Actions.ActionTypes.NavigateBack
});

const onLoginChanged: ActionCreator<Actions.LoginChangedAction> = (newLogin: string) => ({
	type: Actions.ActionTypes.LoginChanged, newLogin
});

const loginStart: ActionCreator<Actions.LoginStartAction> = () => ({
	type: Actions.ActionTypes.LoginStart
});

const loginEnd: ActionCreator<Actions.LoginEndAction> = (error: string | null = null) => ({
	type: Actions.ActionTypes.LoginEnd, error
});

const saveStateToStorage = (state: State) => {
	saveState({
		login: state.user.login,
		game: {
			name: state.game.name,
			role: state.game.role,
			type: state.game.type,
			playersCount: state.game.playersCount
		},
		settings: state.settings
	});
};

const login: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () =>
	async (dispatch: Dispatch<Actions.KnownAction>, getState: () => State, dataContext: DataContext) => {
		dispatch(loginStart());

		const state = getState();

		const response = await fetch(`${dataContext.serverUri}/api/Account/LogOn`, {
			method: 'POST',
			credentials: 'include',
			body: `login=${state.user.login}&password=`,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		});

		if (response.ok) {
			saveStateToStorage(state);

			const token = await response.text();
			const queryString = `?token=${encodeURIComponent(token)}`;

			let connectionBuilder = new signalR.HubConnectionBuilder()
				.withAutomaticReconnect()
				.withUrl(`${dataContext.serverUri}/sionline${queryString}`);

			if (dataContext.config.useMessagePackProtocol) {
				connectionBuilder = connectionBuilder.withHubProtocol(new signalRMsgPack.MessagePackHubProtocol());
			}

			dataContext.connection = connectionBuilder.build();

			try {
				await dataContext.connection.start();

				attachListeners(dataContext.connection, dispatch);

				const computerAccounts: string[] = await dataContext.connection.invoke('GetComputerAccounts');

				dispatch(computerAccountsChanged(computerAccounts));

				dispatch(loginEnd());
				navigateToGamesList(-1)(dispatch, getState, dataContext);

			} catch (error) {
				dispatch(loginEnd(`${localization.cannotConnectToServer}: ${error.message}`));
			}
		} else {
			const errorText =
				response.status === 409 ? localization.duplicateUserName :
				response.status === 0 ? localization.cannotConnectToServer : response.statusText;

			dispatch(loginEnd(errorText));
		}
	};

const navigateToGamesListInternal: ActionCreator<Actions.NavigateToGamesListAction> = () => ({
	type: Actions.ActionTypes.NavigateToGamesList
});

const navigateToGamesList: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (gameId: number, showInfo?: boolean) =>
	async (dispatch: Dispatch<Actions.KnownAction>, getState: () => State, dataContext: DataContext) => {
		dispatch(navigateToGamesListInternal());

		if (gameId > -1) {
			dispatch(selectGame(gameId, showInfo));
		} else {
			window.history.pushState({}, '', dataContext.config.rootUri);
		}

		const server = dataContext.connection;

		if (!server) {
			return;
		}

		// Фильтрацию осуществляем на клиенте
		try {
			const hostInfo = await server.invoke('GetGamesHostInfo');

			dataContext.contentUris = hostInfo.contentPublicBaseUrls;

			dispatch(clearGames());

			let fromId = 0;
			let gamesSlice: Slice<GameInfo> = { data: [], isLastSlice: false };
			do {
				fromId = gamesSlice.data.length > 0 ? gamesSlice.data[gamesSlice.data.length - 1].gameID + 1 : 0;

				gamesSlice = await server.invoke('GetGamesSlice', fromId);

				dispatch(receiveGames(gamesSlice.data));
			} while (!gamesSlice.isLastSlice);

			const users: string[] = await server.invoke('GetUsers');

			const sortedUsers = users.sort((user1: string, user2: string) => { return user1.localeCompare(user2); });

			dispatch(receiveUsers(sortedUsers));

			const news: string | null = await server.invoke('GetNews');

			if (news !== null) {
				dispatch(receiveMessage(localization.news, news));
			}

			dispatch(onlineLoadFinish());
		} catch (error) {
			alert(error.message); // TODO: normal error message
		}
	};

const clearGames: ActionCreator<Actions.ClearGamesAction> = () => ({
	type: Actions.ActionTypes.ClearGames
});

const receiveGames: ActionCreator<Actions.ReceiveGamesAction> = (games: any[]) => ({
	type: Actions.ActionTypes.ReceiveGames, games
});

const receiveUsers: ActionCreator<Actions.ReceiveUsersAction> = (users: string[]) => ({
	type: Actions.ActionTypes.ReceiveUsers, users
});

const receiveMessage: ActionCreator<Actions.ReceiveMessageAction> = (sender: string, message: string) => ({
	type: Actions.ActionTypes.ReceiveMessage, sender, message
});

const onlineLoadFinish: ActionCreator<Actions.OnlineLoadFinishedAction> = () => ({
	type: Actions.ActionTypes.OnlineLoadFinished
});

const onOnlineModeChanged: ActionCreator<Actions.OnlineModeChangedAction> = (mode: OnlineMode) => ({
	type: Actions.ActionTypes.OnlineModeChanged, mode
});

const onExit: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () =>
	async (dispatch: Dispatch<Actions.KnownAction>, getState: () => State, dataContext: DataContext) => {
		const server = dataContext.connection;

		if (!server) {
			return;
		}

		server.invoke('LogOut').then(() => {
			document.cookie = 'SIOnline=; path=/';
			dispatch(navigateToLogin());
		}).catch((message) => {
			alert(message);
		});
	};

const onGamesFilterToggle: ActionCreator<Actions.GamesFilterToggleAction> = (filter: GamesFilter) => ({
	type: Actions.ActionTypes.GamesFilterToggle, filter
});

const selectGame: ActionCreator<Actions.SelectGameAction> = (gameId: number, showInfo: boolean) => ({
	type: Actions.ActionTypes.SelectGame, gameId, showInfo
});

const closeGameInfo: ActionCreator<Actions.CloseGameInfoAction> = () => ({
	type: Actions.ActionTypes.CloseGameInfo
});

const newAutoGame: ActionCreator<Actions.NewAutoGameAction> = () => ({
	type: Actions.ActionTypes.NewAutoGame
});

const newGame: ActionCreator<Actions.NewGameAction> = () => ({
	type: Actions.ActionTypes.NewGame
});

const newGameCancel: ActionCreator<Actions.NewGameCancelAction> = () => ({
	type: Actions.ActionTypes.NewGameCancel
});

const joinGame: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (gameId: number, role: Role) =>
	async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		try {
			const state = getState();

			if (!dataContext.connection) {
				return;
			}

			const result = await dataContext.connection.invoke('JoinGameNew', gameId, role, state.settings.sex === Sex.Male, state.online.password);

			if (result.errorMessage) {
				alert(`${localization.joinError}: ${result.errorMessage}`);
			} else {
				dispatch(gameSet(gameId, false, false, role));

				await gameInit(gameId, dataContext, role);
			}

			saveStateToStorage(state);
		} catch (error) {
			alert(error.message); // TODO: normal error in UI
		}
	};

const passwordChanged: ActionCreator<Actions.PasswordChangedAction> = (newPassword: string) => ({
	type: Actions.ActionTypes.PasswordChanged, newPassword
});

const chatModeChanged: ActionCreator<Actions.ChatModeChangedAction> = (chatMode: ChatMode) => ({
	type: Actions.ActionTypes.ChatModeChanged, chatMode
});

const gameCreated: ActionCreator<Actions.GameCreatedAction> = (game: GameInfo) => ({
	type: Actions.ActionTypes.GameCreated, game
});

const gameChanged: ActionCreator<Actions.GameChangedAction> = (game: GameInfo) => ({
	type: Actions.ActionTypes.GameChanged, game
});

const gameDeleted: ActionCreator<Actions.GameDeletedAction> = (gameId: number) => ({
	type: Actions.ActionTypes.GameDeleted, gameId
});

const userJoined: ActionCreator<Actions.UserJoinedAction> = (login: string) => ({
	type: Actions.ActionTypes.UserJoined, login
});

const userLeaved: ActionCreator<Actions.UserLeavedAction> = (login: string) => ({
	type: Actions.ActionTypes.UserLeaved, login
});

const messageChanged: ActionCreator<Actions.MessageChangedAction> = (message: string) => ({
	type: Actions.ActionTypes.MessageChanged, message
});

const sendMessage: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () =>
	(dispatch: Dispatch<Actions.KnownAction>, getState: () => State, dataContext: DataContext) => {
		const state = getState();

		if (!dataContext.connection) {
			return;
		}

		const text = state.online.currentMessage.trim();
		if (text.length > 0) {
			dataContext.connection.invoke('Say', text);
		}

		dispatch(messageChanged(''));
	};

const windowWidthChanged: ActionCreator<Actions.WindowWidthChangedAction> = (width: number) => ({
	type: Actions.ActionTypes.WindowWidthChanged, width
});

const gameNameChanged: ActionCreator<Actions.GameNameChangedAction> = (gameName: string) => ({
	type: Actions.ActionTypes.GameNameChanged, gameName
});

const gameTypeChanged: ActionCreator<Actions.GameTypeChangedAction> = (gameType: GameType) => ({
	type: Actions.ActionTypes.GameTypeChanged, gameType
});

const gameRoleChanged: ActionCreator<Actions.GameRoleChangedAction> = (gameRole: Role) => ({
	type: Actions.ActionTypes.GameRoleChanged, gameRole
});

const playersCountChanged: ActionCreator<Actions.PlayersCountChangedAction> = (playersCount: number) => ({
	type: Actions.ActionTypes.PlayersCountChanged, playersCount
});

const gameCreationStart: ActionCreator<Actions.GameCreationStartAction> = () => ({
	type: Actions.ActionTypes.GameCreationStart
});

const gameCreationEnd: ActionCreator<Actions.GameCreationEndAction> = (error: string | null = null) => ({
	type: Actions.ActionTypes.GameCreationEnd, error
});

const createNewGame: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () =>
	async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		const state = getState();

		if (!dataContext.connection) {
			return;
		}

		if (state.game.name.length === 0 || state.common.computerAccounts === null) {
			return;
		}

		dispatch(gameCreationStart());

		let showman = { Name: localization.defaultShowman };
		const players = [];
		const viewers = [];

		const me = { Name: state.user.login, IsHuman: true, Sex: state.settings.sex === Sex.Male };

		const playersCount = state.game.playersCount;

		let compPlayers = playersCount - 1;
		const role = state.game.role;
		if (role === Role.Viewer) {
			compPlayers = playersCount;
			viewers.push(me);
		} else if (role === Role.Player) {
			players.push(me);
		} else {
			compPlayers = playersCount;
			showman = me;
		}

		const compIndicies = [];
		for (let i = 0; i < state.common.computerAccounts.length; i++) {
			compIndicies.push(i);
		}

		for (let i = 0; i < compPlayers; i++) {
			const ind = Math.floor((Math.random() * compIndicies.length));
			players.push({ Name: state.common.computerAccounts[compIndicies[ind]], IsHuman: false });
			compIndicies.splice(ind, 1);
		}

		const timeSettings = {
			TimeForChoosingQuestion: 30,
			TimeForThinkingOnQuestion: 5,
			TimeForPrintingAnswer: 25,
			TimeForGivingACat: 30,
			TimeForMakingStake: 30,
			TimeForThinkingOnSpecial: 25,
			TimeOfRound: 660,
			TimeForChoosingFinalTheme: 30,
			TimeForFinalThinking: 45,
			TimeForShowmanDecisions: 30,
			TimeForRightAnswer: 2,
			TimeForMediaDelay: 0
		};

		const gameMode = state.game.type;

		const appSettings = {
			TimeSettings: timeSettings,
			ReadingSpeed: 20,
			FalseStart: true,
			HintShowman: false,
			DefaultOral: false,
			IgnoreWrong: false,
			GameMode: gameMode.toString(),
			RandomQuestionsBasePrice: gameMode === GameType.Simple ? 10 : 100,
			RandomRoundsCount: gameMode === GameType.Simple ? 1 : 3,
			RandomThemesCount: gameMode === GameType.Simple ? 5 : 6,
			Culture: 'ru-RU'
		};

		const gameSettings = {
			HumanPlayerName: state.user.login,
			RandomSpecials: true,
			NetworkGameName: state.game.name,
			NetworkGamePassword: '',
			AllowViewers: true,
			Showman: showman,
			Players: players,
			Viewers: viewers,
			AppSettings: appSettings
		};

		const packageSettings = {
			Name: '',
			Hash: null,
			ID: null
		};

		try {
			const result = await dataContext.connection.invoke('CreateAndJoinGame', gameSettings, packageSettings, []);

			saveStateToStorage(state);

			dispatch(gameCreationEnd());
			if (result.code > 0) {
				dispatch(gameCreationEnd(GameErrorsHelper.getMessage(result.code) + (result.errorMessage || '')));
			} else {
				dispatch(newGameCancel());
				dispatch(gameSet(result.gameId, true, false, role));

				await gameInit(result.gameId, dataContext, role);
			}
		} catch (error) {
			dispatch(gameCreationEnd(error.message));
		}
	};

const createNewAutoGame: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () =>
	async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		const state = getState();

		if (!dataContext.connection) {
			return;
		}

		dispatch(gameCreationStart());

		try {
			const result = await dataContext.connection.invoke('CreateAutomaticGameNew', state.user.login, state.settings.sex === Sex.Male);

			saveStateToStorage(state);

			dispatch(gameCreationEnd());
			if (result.code > 0) {
				alert(GameErrorsHelper.getMessage(result.code) + (result.errorMessage || ''));
			} else {
				dispatch(gameSet(result.gameId, false, true, Role.Player));

				await gameInit(result.gameId, dataContext, Role.Player);
			}
		} catch (message) {
			dispatch(gameCreationEnd(message));
		}
	};

const gameSet: ActionCreator<Actions.GameSetAction> = (id: number, isHost: boolean, isAutomatic: boolean, role: Role) => ({
	type: Actions.ActionTypes.GameSet, id, isHost, isAutomatic, role
});

async function gameInit(gameId: number, dataContext: DataContext, role: Role) {
	if (!dataContext.connection) {
		return;
	}

	window.history.pushState({}, `${localization.game} ${gameId}`, `${dataContext.config.rootUri}/${gameId}`);

	await sendMessageToServer(dataContext.connection, 'INFO');

	if (role === Role.Player || role === Role.Showman) {
		await sendMessageToServer(dataContext.connection, 'READY');
	}
}

const actionCreators = {
	saveStateToStorage,
	onConnectionChanged,
	computerAccountsChanged,
	navigateToLogin,
	showSettings,
	navigateToHowToPlay,
	navigateBack,
	onLoginChanged,
	login,
	navigateToGamesList,
	onOnlineModeChanged,
	onExit,
	onGamesFilterToggle,
	selectGame,
	closeGameInfo,
	newAutoGame,
	newGame,
	newGameCancel,
	joinGame,
	passwordChanged,
	chatModeChanged,
	gameCreated,
	gameChanged,
	gameDeleted,
	userJoined,
	userLeaved,
	messageChanged,
	sendMessage,
	receiveMessage,
	windowWidthChanged,
	gameNameChanged,
	gameTypeChanged,
	gameRoleChanged,
	playersCountChanged,
	createNewGame,
	createNewAutoGame
};

export default actionCreators;
