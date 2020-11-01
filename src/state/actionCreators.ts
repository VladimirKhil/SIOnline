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
import { sendMessageToServer, attachListeners, detachListeners, activeConnections } from '../utils/ConnectionHelpers';
import MainView from '../model/enums/MainView';
import runActionCreators from './run/runActionCreators';
import Slice from '../model/server/Slice';
import PackageType from '../model/enums/PackageType';
import PackageKey from '../model/server/PackageKey';
import Constants from '../model/enums/Constants';
import HostInfo from '../model/server/HostInfo';
import GameCreationResult from '../model/server/GameCreationResult';

import * as JSZip from 'jszip';
import * as Rusha from 'rusha';

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
			password: state.game.password,
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

				if (dataContext.connection.connectionId) {
					activeConnections.push(dataContext.connection.connectionId);
				}

				attachListeners(dataContext.connection, dispatch);

				const computerAccounts = await dataContext.connection.invoke<string[]>('GetComputerAccounts');

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
			const hostInfo = await server.invoke<HostInfo>('GetGamesHostInfo');

			dataContext.contentUris = hostInfo.contentPublicBaseUrls;

			dispatch(clearGames());

			let gamesSlice: Slice<GameInfo> = { data: [], isLastSlice: false };
			let whileGuard = 100;
			do {
				const fromId = gamesSlice.data.length > 0 ? gamesSlice.data[gamesSlice.data.length - 1].gameID + 1 : 0;

				gamesSlice = await server.invoke('GetGamesSlice', fromId);

				dispatch(receiveGames(gamesSlice.data));

				whileGuard--;
			} while (!gamesSlice.isLastSlice && whileGuard > 0);

			const users = await server.invoke<string[]>('GetUsers');

			const sortedUsers = users.sort((user1: string, user2: string) => { return user1.localeCompare(user2); });

			dispatch(receiveUsers(sortedUsers));

			const news = await server.invoke<string | null>('GetNews');

			if (news !== null) {
				dispatch(receiveMessage(localization.news, news));
			}

			dispatch(onlineLoadFinish());
		} catch (error) {
			dispatch(onlineLoadError(error.message));
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

const onlineLoadError: ActionCreator<Actions.OnlineLoadErrorAction> = (error: string) => ({
	type: Actions.ActionTypes.OnlineLoadError, error
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

		try	{
			await server.invoke('LogOut');
			if (server.connectionId) {
				activeConnections.splice(activeConnections.indexOf(server.connectionId), 1);
			}

			detachListeners(server);
			await server.stop();

			dispatch(navigateToLogin());
		} catch (error) {
			alert(error.message); // TODO: normal error message
		}
	};

const onGamesFilterToggle: ActionCreator<Actions.GamesFilterToggleAction> = (filter: GamesFilter) => ({
	type: Actions.ActionTypes.GamesFilterToggle, filter
});

const onGamesSearchChanged: ActionCreator<Actions.GamesSearchChangedAction> = (search: string) => ({
	type: Actions.ActionTypes.GamesSearchChanged, search
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

const joinGameStarted: ActionCreator<Actions.JoinGameStartedAction> = () => ({
	type: Actions.ActionTypes.JoinGameStarted
});

const joinGameFinished: ActionCreator<Actions.JoinGameFinishedAction> = (error: string | null) => ({
	type: Actions.ActionTypes.JoinGameFinished, error
});

const joinGame: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (gameId: number, role: Role) =>
	async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		dispatch(joinGameStarted());

		try {
			const state = getState();

			if (!dataContext.connection) {
				return;
			}

			const result = await dataContext.connection.invoke<GameCreationResult>(
				'JoinGameNew',
				gameId,
				role,
				state.settings.sex === Sex.Male,
				state.online.password
			);

			if (result.errorMessage) {
				dispatch(joinGameFinished(`${localization.joinError}: ${result.errorMessage}`));
				return;
			}

			dispatch(gameSet(gameId, false, false, role));

			await gameInit(gameId, dataContext, role);

			saveStateToStorage(state);
			dispatch(joinGameFinished(null));
		} catch (error) {
			dispatch(joinGameFinished(error.message));
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

const gamePasswordChanged: ActionCreator<Actions.GamePasswordChangedAction> = (gamePassword: string) => ({
	type: Actions.ActionTypes.GamePasswordChanged, gamePassword
});

const gamePackageTypeChanged: ActionCreator<Actions.GamePackageTypeChangedAction> = (packageType: PackageType) => ({
	type: Actions.ActionTypes.GamePackageTypeChanged, packageType
});

const gamePackageDataChanged: ActionCreator<Actions.GamePackageDataChangedAction> = (packageName: string, packageData: File | null) => ({
	type: Actions.ActionTypes.GamePackageDataChanged, packageName, packageData
});

const gameTypeChanged: ActionCreator<Actions.GameTypeChangedAction> = (gameType: GameType) => ({
	type: Actions.ActionTypes.GameTypeChanged, gameType
});

const gameRoleChanged: ActionCreator<Actions.GameRoleChangedAction> = (gameRole: Role) => ({
	type: Actions.ActionTypes.GameRoleChanged, gameRole
});

const showmanTypeChanged: ActionCreator<Actions.ShowmanTypeChangedAction> = (isHuman: boolean) => ({
	type: Actions.ActionTypes.ShowmanTypeChanged, isHuman
});

const playersCountChanged: ActionCreator<Actions.PlayersCountChangedAction> = (playersCount: number) => ({
	type: Actions.ActionTypes.PlayersCountChanged, playersCount
});

const humanPlayersCountChanged: ActionCreator<Actions.HumanPlayersCountChangedAction> = (humanPlayersCount: number) => ({
	type: Actions.ActionTypes.HumanPlayersCountChanged, humanPlayersCount
});

const gameCreationStart: ActionCreator<Actions.GameCreationStartAction> = () => ({
	type: Actions.ActionTypes.GameCreationStart
});

const gameCreationEnd: ActionCreator<Actions.GameCreationEndAction> = (error: string | null = null) => ({
	type: Actions.ActionTypes.GameCreationEnd, error
});

const uploadPackageStarted: ActionCreator<Actions.UploadPackageStartedAction> = () => ({
	type: Actions.ActionTypes.UploadPackageStarted
});

const uploadPackageFinished: ActionCreator<Actions.UploadPackageFinishedAction> = () => ({
	type: Actions.ActionTypes.UploadPackageFinished
});

const uploadPackageProgress: ActionCreator<Actions.UploadPackageProgressAction> = (progress: number) => ({
	type: Actions.ActionTypes.UploadPackageProgress, progress
});

function uploadPackageAsync(packageHash: string, packageData: File, serverUri: string, dispatch: Dispatch<any>): Promise<boolean> {
	dispatch(uploadPackageStarted());

	const formData = new FormData();
	formData.append('file', packageData, packageData.name);

	// fetch() does not support reporting progress right now
	// Switch to fetch() when progress support would be implemented
	// const response = await fetch(`${serverUri}/api/upload/package`, {
	// 	method: 'POST',
	// 	credentials: 'include',
	// 	body: formData,
	// 	headers: {
	// 		'Content-MD5': hashArrayEncoded
	// 	}
	// });

	// if (!response.ok) {
	// 	throw new Error(`${localization.uploadingPackageError}: ${response.status} ${await response.text()}`);
	// }

	return new Promise<boolean>((resolve, reject) => {
		const xhr = new XMLHttpRequest();

		xhr.onload = () => {
			dispatch(uploadPackageFinished());
			if (xhr.status >= 200 && xhr.status < 300) {
				resolve(true);
			} else {
				reject(new Error(xhr.response));
			}
		};
		xhr.onerror = () => {
			dispatch(uploadPackageFinished());
			reject(new Error(xhr.statusText || localization.unknownError));
		};
		xhr.upload.onprogress = (e) => {
			dispatch(uploadPackageProgress(e.loaded / e.total));
		};

		xhr.open('post', `${serverUri}/api/upload/package`, true);
		xhr.setRequestHeader('Content-MD5', packageHash);
		xhr.withCredentials = true;
		xhr.send(formData);
	});
}

async function hashData(data: ArrayBuffer): Promise<ArrayBuffer> {
	if (location.protocol === 'https:') {
		await crypto.subtle.digest('SHA-1', data);
	}

	return Rusha.createHash().update(data).digest();
}

async function checkAndUploadPackageAsync(
	connection: signalR.HubConnection,
	serverUri: string,
	packageData: File,
	dispatch: Dispatch<any>
	): Promise<PackageKey> {
	const zip = new JSZip();
	await zip.loadAsync(packageData);
	const contentFile = zip.file('content.xml');

	if (!contentFile) {
		throw new Error(localization.corruptedPackage);
	}

	const content = await contentFile.async('text');

	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(content.substring(39), 'application/xml');

	const id = xmlDoc.getElementsByTagName('package')[0].getAttribute('id');

	const hash = await hashData(await packageData.arrayBuffer());

	const hashArray = new Uint8Array(hash);
	const hashArrayEncoded = btoa(String.fromCharCode.apply(null, hashArray as any));

	const packageKey: PackageKey = {
		name: packageData.name,
		hash: hashArrayEncoded,
		id
	};

	const hasPackage = await connection.invoke<boolean>('HasPackage', packageKey);
	if (!hasPackage) {
		await uploadPackageAsync(hashArrayEncoded, packageData, serverUri, dispatch);
	}

	return packageKey;
}

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

		const role = state.game.role;
		const me = { Name: state.user.login, IsHuman: true, IsMale: state.settings.sex === Sex.Male };

		const showman = role === Role.Showman ? me :
			(state.game.isShowmanHuman ? { Name: Constants.ANY_NAME, IsHuman: true } : { Name: localization.defaultShowman });
		const players = [];
		const viewers = [];

		const playersCount = state.game.playersCount;
		const humanPlayersCount = state.game.humanPlayersCount;
		if (role === Role.Viewer) {
			viewers.push(me);
		} else if (role === Role.Player) {
			players.push(me);
		}

		const compPlayersCount = playersCount - humanPlayersCount - (role === Role.Player ? 1 : 0);

		const compIndicies = [];
		for (let i = 0; i < state.common.computerAccounts.length; i++) {
			compIndicies.push(i);
		}

		for (let i = 0; i < humanPlayersCount; i++) {
			players.push({ Name: Constants.ANY_NAME, IsHuman: true });
		}

		for (let i = 0; i < compPlayersCount; i++) {
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
			HintShowman: state.settings.appSettings.hintShowman,
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
			RandomSpecials: state.game.package.type === PackageType.Random,
			NetworkGameName: state.game.name,
			NetworkGamePassword: state.game.password,
			AllowViewers: true,
			Showman: showman,
			Players: players,
			Viewers: viewers,
			AppSettings: appSettings
		};

		try {
			const packageKey: PackageKey | null = state.game.package.type === PackageType.Random || !state.game.package.data ? {
				name: '',
				hash: null,
				id: null
			} : await checkAndUploadPackageAsync(dataContext.connection, dataContext.serverUri, state.game.package.data, dispatch);

			if (!packageKey) {
				dispatch(gameCreationEnd(localization.badPackage));
				return;
			}

			const result = await dataContext.connection.invoke<GameCreationResult>(
				'CreateAndJoinGameNew',
				gameSettings,
				packageKey,
				[],
				state.settings.sex === Sex.Male
			);

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
			const result = await dataContext.connection.invoke<GameCreationResult>(
				'CreateAutomaticGameNew',
				state.user.login,
				state.settings.sex === Sex.Male
			);

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

	window.history.pushState({}, `${localization.game} ${gameId}`, `${dataContext.config.rootUri}?gameId=${gameId}`);

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
	onGamesSearchChanged,
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
	gamePasswordChanged,
	gamePackageTypeChanged,
	gamePackageDataChanged,
	gameTypeChanged,
	gameRoleChanged,
	showmanTypeChanged,
	playersCountChanged,
	humanPlayersCountChanged,
	createNewGame,
	createNewAutoGame
};

export default actionCreators;
