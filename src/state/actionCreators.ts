import { Action, Dispatch, ActionCreator } from 'redux';
import { ThunkAction } from 'redux-thunk';
import * as signalR from '@microsoft/signalr';
import * as signalRMsgPack from '@microsoft/signalr-protocol-msgpack';
import * as JSZip from 'jszip';
import * as Rusha from 'rusha';
import * as Actions from './Actions';
import State from './State';
import Sex from '../model/enums/Sex';
import Role from '../model/enums/Role';
import DataContext from '../model/DataContext';

import 'es6-promise/auto';
import { saveState } from './SavedState';
import OnlineMode from '../model/enums/OnlineMode';
import GamesFilter from '../model/enums/GamesFilter';
import localization from '../model/resources/localization';
import ChatMode from '../model/enums/ChatMode';

import GameType from '../model/enums/GameType';
import * as GameErrorsHelper from '../utils/GameErrorsHelper';
import GameInfo from '../model/server/GameInfo';
import { attachListeners, detachListeners, activeConnections } from '../utils/ConnectionHelpers';
import MainView from '../model/enums/MainView';
import runActionCreators from './run/runActionCreators';
import Slice from '../model/server/Slice';
import PackageType from '../model/enums/PackageType';
import PackageKey from '../model/server/PackageKey';
import Constants from '../model/enums/Constants';

import GameServerClient from '../client/GameServerClient';
import TimeSettings from '../model/server/TimeSettings';
import ServerAppSettings from '../model/server/ServerAppSettings';
import AccountSettings from '../model/server/AccountSettings';
import GameSettings from '../model/server/GameSettings';
import IGameServerClient from '../client/IGameServerClient';
import { PackageFilters } from '../model/PackageFilters';
import { SIPackageInfo } from '../model/SIPackageInfo';
import { SearchEntity } from '../model/SearchEntity';

const isConnectedChanged: ActionCreator<Actions.IsConnectedChangedAction> = (isConnected: boolean) => ({
	type: Actions.ActionTypes.IsConnectedChanged,
	isConnected,
});

const onConnectionChanged: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(isConnected: boolean, message: string) =>
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
			await dataContext.gameClient.sendMessageToServerAsync('INFO');
		} else if (state.ui.mainView === MainView.Lobby) {
			navigateToLobby(-1)(dispatch, getState, dataContext);
		}
	};

const computerAccountsChanged: ActionCreator<Actions.ComputerAccountsChangedAction> = (computerAccounts: string[]) => ({
	type: Actions.ActionTypes.ComputerAccountsChanged,
	computerAccounts,
});

const navigateToLogin: ActionCreator<Actions.NavigateToLoginAction> = () => ({
	type: Actions.ActionTypes.NavigateToLogin,
});

const showSettings: ActionCreator<Actions.ShowSettingsAction> = (show: boolean) => ({
	type: Actions.ActionTypes.ShowSettings,
	show,
});

const navigateToHowToPlay: ActionCreator<Actions.NavigateToHowToPlayAction> = () => ({
	type: Actions.ActionTypes.NavigateToHowToPlay,
});

const navigateBack: ActionCreator<Actions.NavigateBackAction> = () => ({
	type: Actions.ActionTypes.NavigateBack,
});

const onLoginChanged: ActionCreator<Actions.LoginChangedAction> = (newLogin: string) => ({
	type: Actions.ActionTypes.LoginChanged,
	newLogin,
});

const loginStart: ActionCreator<Actions.LoginStartAction> = () => ({
	type: Actions.ActionTypes.LoginStart,
});

const loginEnd: ActionCreator<Actions.LoginEndAction> = (error: string | null = null) => ({
	type: Actions.ActionTypes.LoginEnd,
	error,
});

const saveStateToStorage = (state: State) => {
	saveState({
		login: state.user.login,
		game: {
			name: state.game.name,
			password: state.game.password,
			role: state.game.role,
			type: state.game.type,
			playersCount: state.game.playersCount,
		},
		settings: state.settings,
	});
};

function getLoginErrorByCode(response: Response): string {
	switch (response.status) {
		case 0:
			return localization.cannotConnectToServer;

		case 403:
			return localization.forbiddenNickname;

		case 409:
			return localization.duplicateUserName;

		default:
			return response.statusText;
	}
}

const navigateToWelcome: ActionCreator<Actions.NavigateToWelcomeAction> = () => ({
	type: Actions.ActionTypes.NavigateToWelcome,
});

const serverNameChanged: ActionCreator<Actions.ServerNameChangedAction> = (serverName: string) => ({
	type: Actions.ActionTypes.ServerNameChanged,
	serverName,
});

async function loadHostInfoAsync(dispatch: Dispatch<any>, dataContext: DataContext) {
	const hostInfo = await dataContext.gameClient.getGameHostInfoAsync();
	// eslint-disable-next-line no-param-reassign
	dataContext.contentUris = hostInfo.contentPublicBaseUrls;

	dispatch(serverNameChanged(hostInfo.name));
}

const login: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (dispatch: Dispatch<Actions.KnownAction>, getState: () => State, dataContext: DataContext) => {
		dispatch(loginStart());

		const state = getState();

		try {
			const response = await fetch(`${dataContext.serverUri}/api/Account/LogOn`, {
				method: 'POST',
				credentials: 'include',
				body: `login=${state.user.login}&password=`,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
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

				const connection = connectionBuilder.build();
				// eslint-disable-next-line no-param-reassign
				dataContext.connection = connection;
				// eslint-disable-next-line no-param-reassign
				dataContext.gameClient = new GameServerClient(connection);

				try {
					await dataContext.connection.start();

					if (dataContext.connection.connectionId) {
						activeConnections.push(dataContext.connection.connectionId);
					}

					attachListeners(dataContext.connection, dispatch);

					const computerAccounts = await dataContext.gameClient.getComputerAccountsAsync();
					dispatch(computerAccountsChanged(computerAccounts));

					dispatch(loginEnd());
					dispatch(onLoginChanged(state.user.login.trim())); // Normalize login

					await loadHostInfoAsync(dispatch, dataContext);
					dispatch(navigateToWelcome());
				} catch (error) {
					dispatch(loginEnd(`${localization.cannotConnectToServer}: ${error.message}`));
				}
			} else {
				const errorText = getLoginErrorByCode(response);
				dispatch(loginEnd(errorText));
			}
		} catch (err) {
			dispatch(loginEnd(`${localization.cannotConnectToServer}: ${err.message}`));
		}
	};

const singlePlay: ActionCreator<Actions.NavigateToNewGameAction> = () => ({
	type: Actions.ActionTypes.NavigateToNewGame,
});

const friendsPlayInternal: ActionCreator<Actions.NavigateToGamesAction> = () => ({
	type: Actions.ActionTypes.NavigateToGames,
});

const friendsPlay: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (dispatch: Dispatch<Actions.KnownAction>, getState: () => State, dataContext: DataContext) => {
		dispatch(friendsPlayInternal());
		try {
			await loadGamesAsync(dispatch, dataContext.gameClient);

			dispatch(onlineLoadFinish());
		} catch (error) {
			dispatch(onlineLoadError(error.message));
		}
	};

const navigateToLobbyInternal: ActionCreator<Actions.NavigateToLobbyAction> = () => ({
	type: Actions.ActionTypes.NavigateToLobby,
});

const navigateToLobby: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(gameId: number, showInfo?: boolean) =>
	async (dispatch: Dispatch<Actions.KnownAction>, getState: () => State, dataContext: DataContext) => {
		dispatch(navigateToLobbyInternal());

		if (gameId > -1) {
			dispatch(selectGame(gameId, showInfo));
		} else if (dataContext.config.rewriteUrl) {
			window.history.pushState({}, '', dataContext.config.rootUri);
		}

		// Games filtering is performed on client
		try {
			await loadGamesAsync(dispatch, dataContext.gameClient);

			const users = await dataContext.gameClient.getUsersAsync();
			const sortedUsers = users.sort((user1: string, user2: string) => user1.localeCompare(user2));

			dispatch(receiveUsers(sortedUsers));

			const news = await dataContext.gameClient.getNewsAsync();

			if (news !== null) {
				dispatch(receiveMessage(localization.news, news));
			}

			dispatch(onlineLoadFinish());
		} catch (error) {
			dispatch(onlineLoadError(error.message));
		}
	};

const clearGames: ActionCreator<Actions.ClearGamesAction> = () => ({
	type: Actions.ActionTypes.ClearGames,
});

const receiveGames: ActionCreator<Actions.ReceiveGamesAction> = (games: any[]) => ({
	type: Actions.ActionTypes.ReceiveGames,
	games,
});

const receiveUsers: ActionCreator<Actions.ReceiveUsersAction> = (users: string[]) => ({
	type: Actions.ActionTypes.ReceiveUsers,
	users,
});

const receiveMessage: ActionCreator<Actions.ReceiveMessageAction> = (sender: string, message: string) => ({
	type: Actions.ActionTypes.ReceiveMessage,
	sender,
	message,
});

const onlineLoadFinish: ActionCreator<Actions.OnlineLoadFinishedAction> = () => ({
	type: Actions.ActionTypes.OnlineLoadFinished,
});

const onlineLoadError: ActionCreator<Actions.OnlineLoadErrorAction> = (error: string) => ({
	type: Actions.ActionTypes.OnlineLoadError,
	error,
});

const onOnlineModeChanged: ActionCreator<Actions.OnlineModeChangedAction> = (mode: OnlineMode) => ({
	type: Actions.ActionTypes.OnlineModeChanged,
	mode,
});

const onExit: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (dispatch: Dispatch<Actions.KnownAction>, getState: () => State, dataContext: DataContext) => {
		const server = dataContext.connection;

		if (!server) {
			return;
		}

		try {
			await dataContext.gameClient.logOutAsync();
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
	type: Actions.ActionTypes.GamesFilterToggle,
	filter,
});

const onGamesSearchChanged: ActionCreator<Actions.GamesSearchChangedAction> = (search: string) => ({
	type: Actions.ActionTypes.GamesSearchChanged,
	search,
});

const selectGame: ActionCreator<Actions.SelectGameAction> = (gameId: number, showInfo: boolean) => ({
	type: Actions.ActionTypes.SelectGame,
	gameId,
	showInfo,
});

const closeGameInfo: ActionCreator<Actions.CloseGameInfoAction> = () => ({
	type: Actions.ActionTypes.CloseGameInfo,
});

const unselectGame: ActionCreator<Actions.UnselectGameAction> = () => ({
	type: Actions.ActionTypes.UnselectGame,
});

const newAutoGame: ActionCreator<Actions.NewAutoGameAction> = () => ({
	type: Actions.ActionTypes.NewAutoGame,
});

const newGame: ActionCreator<Actions.NewGameAction> = () => ({
	type: Actions.ActionTypes.NewGame,
});

const newGameCancel: ActionCreator<Actions.NewGameCancelAction> = () => ({
	type: Actions.ActionTypes.NewGameCancel,
});

const joinGameStarted: ActionCreator<Actions.JoinGameStartedAction> = () => ({
	type: Actions.ActionTypes.JoinGameStarted,
});

const joinGameFinished: ActionCreator<Actions.JoinGameFinishedAction> = (error: string | null) => ({
	type: Actions.ActionTypes.JoinGameFinished,
	error,
});

const joinGame: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(gameId: number, role: Role) => async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		dispatch(joinGameStarted());

		try {
			const state = getState();

			const result = await dataContext.gameClient.joinGameAsync(
				gameId,
				role,
				state.settings.sex === Sex.Male,
				state.online.password
			);

			if (result.errorMessage) {
				dispatch(joinGameFinished(`${localization.joinError}: ${result.errorMessage}`));
				return;
			}

			dispatch(gameSet(gameId, false, role));

			await gameInit(gameId, dataContext, role);

			saveStateToStorage(state);
			dispatch(joinGameFinished(null));
		} catch (error) {
			dispatch(joinGameFinished(error.message));
		}
	};

const passwordChanged: ActionCreator<Actions.PasswordChangedAction> = (newPassword: string) => ({
	type: Actions.ActionTypes.PasswordChanged,
	newPassword,
});

const chatModeChanged: ActionCreator<Actions.ChatModeChangedAction> = (chatMode: ChatMode) => ({
	type: Actions.ActionTypes.ChatModeChanged,
	chatMode,
});

const gameCreated: ActionCreator<Actions.GameCreatedAction> = (game: GameInfo) => ({
	type: Actions.ActionTypes.GameCreated,
	game,
});

const gameChanged: ActionCreator<Actions.GameChangedAction> = (game: GameInfo) => ({
	type: Actions.ActionTypes.GameChanged,
	game,
});

const gameDeleted: ActionCreator<Actions.GameDeletedAction> = (gameId: number) => ({
	type: Actions.ActionTypes.GameDeleted,
	gameId,
});

const userJoined: ActionCreator<Actions.UserJoinedAction> = (login: string) => ({
	type: Actions.ActionTypes.UserJoined,
	login,
});

const userLeaved: ActionCreator<Actions.UserLeavedAction> = (login: string) => ({
	type: Actions.ActionTypes.UserLeaved,
	login,
});

const messageChanged: ActionCreator<Actions.MessageChangedAction> = (message: string) => ({
	type: Actions.ActionTypes.MessageChanged,
	message,
});

const sendMessage: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => (dispatch: Dispatch<Actions.KnownAction>, getState: () => State, dataContext: DataContext) => {
		const state = getState();

		const text = state.online.currentMessage.trim();
		if (text.length > 0) {
			dataContext.gameClient.sayInLobbyAsync(text);
		}

		dispatch(messageChanged(''));
	};

const windowWidthChanged: ActionCreator<Actions.WindowWidthChangedAction> = (width: number) => ({
	type: Actions.ActionTypes.WindowWidthChanged,
	width,
});

const gameNameChanged: ActionCreator<Actions.GameNameChangedAction> = (gameName: string) => ({
	type: Actions.ActionTypes.GameNameChanged,
	gameName,
});

const gamePasswordChanged: ActionCreator<Actions.GamePasswordChangedAction> = (gamePassword: string) => ({
	type: Actions.ActionTypes.GamePasswordChanged,
	gamePassword,
});

const gamePackageTypeChanged: ActionCreator<Actions.GamePackageTypeChangedAction> = (packageType: PackageType) => ({
	type: Actions.ActionTypes.GamePackageTypeChanged,
	packageType,
});

const gamePackageDataChanged: ActionCreator<Actions.GamePackageDataChangedAction> = (
	packageName: string,
	packageData: File | null
) => ({
	type: Actions.ActionTypes.GamePackageDataChanged,
	packageName,
	packageData,
});

const gameTypeChanged: ActionCreator<Actions.GameTypeChangedAction> = (gameType: GameType) => ({
	type: Actions.ActionTypes.GameTypeChanged,
	gameType,
});

const gameRoleChanged: ActionCreator<Actions.GameRoleChangedAction> = (gameRole: Role) => ({
	type: Actions.ActionTypes.GameRoleChanged,
	gameRole,
});

const showmanTypeChanged: ActionCreator<Actions.ShowmanTypeChangedAction> = (isHuman: boolean) => ({
	type: Actions.ActionTypes.ShowmanTypeChanged,
	isHuman,
});

const playersCountChanged: ActionCreator<Actions.PlayersCountChangedAction> = (playersCount: number) => ({
	type: Actions.ActionTypes.PlayersCountChanged,
	playersCount,
});

const humanPlayersCountChanged: ActionCreator<Actions.HumanPlayersCountChangedAction> = (
	humanPlayersCount: number
) => ({
	type: Actions.ActionTypes.HumanPlayersCountChanged,
	humanPlayersCount,
});

const gameCreationStart: ActionCreator<Actions.GameCreationStartAction> = () => ({
	type: Actions.ActionTypes.GameCreationStart,
});

const gameCreationEnd: ActionCreator<Actions.GameCreationEndAction> = (error: string | null = null) => ({
	type: Actions.ActionTypes.GameCreationEnd,
	error,
});

const uploadPackageStarted: ActionCreator<Actions.UploadPackageStartedAction> = () => ({
	type: Actions.ActionTypes.UploadPackageStarted,
});

const uploadPackageFinished: ActionCreator<Actions.UploadPackageFinishedAction> = () => ({
	type: Actions.ActionTypes.UploadPackageFinished,
});

const uploadPackageProgress: ActionCreator<Actions.UploadPackageProgressAction> = (progress: number) => ({
	type: Actions.ActionTypes.UploadPackageProgress,
	progress,
});

async function loadGamesAsync(dispatch: Dispatch<Actions.KnownAction>, gameClient: IGameServerClient) {
	dispatch(clearGames());

	let gamesSlice: Slice<GameInfo> = { data: [], isLastSlice: false };
	let whileGuard = 100;
	do {
		const fromId = gamesSlice.data.length > 0 ? gamesSlice.data[gamesSlice.data.length - 1].gameID + 1 : 0;

		gamesSlice = await gameClient.getGamesSliceAsync(fromId);

		dispatch(receiveGames(gamesSlice.data));

		whileGuard--;
	} while (!gamesSlice.isLastSlice && whileGuard > 0);
}

function uploadPackageAsync(
	packageHash: string,
	packageData: File,
	serverUri: string,
	dispatch: Dispatch<any>
): Promise<boolean> {
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
			reject(new Error(xhr.statusText || xhr.responseText || localization.unknownError));
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
		await crypto.subtle.digest('SHA-1', data); // It works only under HTTPS protocol
	}

	return Rusha.createHash().update(data).digest();
}

async function checkAndUploadPackageAsync(
	gameClient: IGameServerClient,
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
		id,
	};

	const hasPackage = await gameClient.hasPackageAsync(packageKey);
	if (!hasPackage) {
		await uploadPackageAsync(hashArrayEncoded, packageData, serverUri, dispatch);
	}

	return packageKey;
}

function getRandomValue(): number {
	const array = new Uint32Array(1);
	crypto.getRandomValues(array);

	return array[0];
}

const createNewGame: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(isSingleGame: boolean) => async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		const state = getState();

		if (state.game.name.length === 0 || state.common.computerAccounts === null) {
			dispatch(gameCreationEnd(localization.gameNameMustBeSpecified));
			return;
		}

		dispatch(gameCreationStart());

		// TODO: single game requires `isPrivate` flag, not random password to be closed for everyone
		// With `isRandom` flag game name could also be omitted

		const game = isSingleGame
			? {
					...state.game,
					password: getRandomValue().toString(), // protecting from anyone to join
					isShowmanHuman: false,
					humanPlayersCount: 0,
			  }
			: state.game;

		const { playersCount, humanPlayersCount, role } = game;
		const me = { Name: state.user.login, IsHuman: true, IsMale: state.settings.sex === Sex.Male };

		const showman: AccountSettings =
			role === Role.Showman
				? me
				: game.isShowmanHuman
				? { Name: Constants.ANY_NAME, IsHuman: true }
				: { Name: localization.defaultShowman };
		const players: AccountSettings[] = [];
		const viewers: AccountSettings[] = [];

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
			const ind = Math.floor(Math.random() * compIndicies.length);
			players.push({ Name: state.common.computerAccounts[compIndicies[ind]], IsHuman: false });
			compIndicies.splice(ind, 1);
		}

		const timeSettings: TimeSettings = {
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
			TimeForMediaDelay: 0,
		};

		const gameMode = game.type;

		const appSettings: ServerAppSettings = {
			TimeSettings: timeSettings,
			ReadingSpeed: 20,
			FalseStart: state.settings.appSettings.falseStart,
			HintShowman: state.settings.appSettings.hintShowman,
			Oral: state.settings.appSettings.oral,
			IgnoreWrong: false,
			GameMode: gameMode.toString(),
			RandomQuestionsBasePrice: gameMode === GameType.Simple ? 10 : 100,
			RandomRoundsCount: gameMode === GameType.Simple ? 1 : 3,
			RandomThemesCount: gameMode === GameType.Simple ? 5 : 6,
			Culture: 'ru-RU',
		};

		const gameSettings: GameSettings = {
			HumanPlayerName: state.user.login,
			RandomSpecials: game.package.type === PackageType.Random,
			NetworkGameName: game.name,
			NetworkGamePassword: game.password,
			AllowViewers: true,
			Showman: showman,
			Players: players,
			Viewers: viewers,
			AppSettings: appSettings,
		};

		try {
			const packageKey: PackageKey | null =
				game.package.type === PackageType.Random || !game.package.data
					? {
							name: '',
							hash: null,
							id: null,
					  }
					: await checkAndUploadPackageAsync(
							dataContext.gameClient,
							dataContext.serverUri,
							game.package.data,
							dispatch
					  );

			if (!packageKey) {
				dispatch(gameCreationEnd(localization.badPackage));
				return;
			}

			const result = await dataContext.gameClient.createAndJoinGameAsync(
				gameSettings,
				packageKey,
				state.settings.sex === Sex.Male
			);

			saveStateToStorage(state);

			dispatch(gameCreationEnd());
			if (result.code > 0) {
				dispatch(gameCreationEnd(GameErrorsHelper.getMessage(result.code) + (result.errorMessage || '')));
			} else {
				dispatch(newGameCancel());
				dispatch(gameSet(result.gameId, false, role));

				await gameInit(result.gameId, dataContext, role);
			}
		} catch (error) {
			dispatch(gameCreationEnd(error.message));
		}
	};

const createNewAutoGame: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		const state = getState();

		dispatch(gameCreationStart());

		try {
			const result = await dataContext.gameClient.createAutomaticGameAsync(
				state.user.login,
				state.settings.sex === Sex.Male
			);

			saveStateToStorage(state);

			dispatch(gameCreationEnd());
			if (result.code > 0) {
				alert(GameErrorsHelper.getMessage(result.code) + (result.errorMessage || ''));
			} else {
				dispatch(gameSet(result.gameId, true, Role.Player));

				await gameInit(result.gameId, dataContext, Role.Player);
			}
		} catch (message) {
			dispatch(gameCreationEnd(message));
		}
	};

const gameSet: ActionCreator<Actions.GameSetAction> = (id: number, isAutomatic: boolean, role: Role) => ({
	type: Actions.ActionTypes.GameSet,
	id,
	isAutomatic,
	role,
});

async function gameInit(gameId: number, dataContext: DataContext, role: Role) {
	if (dataContext.config.rewriteUrl) {
		window.history.pushState({}, `${localization.game} ${gameId}`, `${dataContext.config.rootUri}?gameId=${gameId}`);
	}

	await dataContext.gameClient.sendMessageToServerAsync('INFO');

	if (role === Role.Player || role === Role.Showman) {
		await dataContext.gameClient.sendMessageToServerAsync('READY');
	}
}

const searchPackages: ActionCreator<Actions.SearchPackages> = () => ({ type: Actions.ActionTypes.SearchPackages });
const searchPackagesFinished: ActionCreator<Actions.SearchPackagesFinished> = (packages: SIPackageInfo[]) => ({
	type: Actions.ActionTypes.SearchPackagesFinished,
	packages,
});

const receiveAuthors: ActionCreator<Actions.ReceiveAuthors> = () => ({ type: Actions.ActionTypes.ReceiveAuthors });
const receiveAuthorsFinished: ActionCreator<Actions.ReceiveAuthorsFinished> = (authors: SearchEntity[]) => ({
	type: Actions.ActionTypes.ReceiveAuthorsFinished,
	authors,
});

const receiveTags: ActionCreator<Actions.ReceiveTags> = () => ({ type: Actions.ActionTypes.ReceiveTags });
const receiveTagsFinished: ActionCreator<Actions.ReceiveTagsFinished> = (tags: SearchEntity[]) => ({
	type: Actions.ActionTypes.ReceiveTagsFinished,
	tags,
});

const receivePublishers: ActionCreator<Actions.ReceivePublishers> = () => ({
	type: Actions.ActionTypes.ReceivePublishers,
});
const receivePublishersFinished: ActionCreator<Actions.ReceivePublishersFinished> = (publishers: SearchEntity[]) => ({
	type: Actions.ActionTypes.ReceivePublishersFinished,
	publishers,
});

const receiveAuthorsThunk: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		try {
			dispatch(receiveAuthors());
			const { apiUri } = dataContext.config;
			const response = await fetch(`${apiUri}/Authors`);
			const data = await response.json();
			dispatch(receiveAuthorsFinished(data));
		} catch (error) {
			console.error(error);
		}
	};

const receiveTagsThunk: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		try {
			dispatch(receiveTags());
			const { apiUri } = dataContext.config;
			const response = await fetch(`${apiUri}/Tags`);
			const data = await response.json();
			dispatch(receiveTagsFinished(data));
		} catch (error) {
			console.error(error);
		}
	};

const receivePublishersThunk: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		try {
			dispatch(receivePublishers());
			const { apiUri } = dataContext.config;
			const response = await fetch(`${apiUri}/Publishers`);
			const data = await response.json();
			dispatch(receivePublishersFinished(data));
		} catch (error) {
			console.error(error);
		}
	};

const searchPackagesThunk: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(
		filters: PackageFilters = {
			difficultyRelation: 0,
			difficulty: 1,
			sortMode: 0,
			sortAscending: true,
			authorId: null,
			publisherId: null,
			tagId: null,
			restriction: null,
		}
	) =>
	async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		try {
			dispatch(searchPackages());
			const { apiUri } = dataContext.config;
			const response = await fetch(
				`${apiUri}/FilteredPackages?${new URLSearchParams(
					Object.entries(filters)
						.filter(([, value]: [string, PackageFilters[keyof PackageFilters]]) => value ?? false)
						.reduce(
							(acc, [key, value]) => ({
								...acc,
								[key]: value,
							}),
							{}
						)
				)}`
			);
			const data = await response.json();
			dispatch(searchPackagesFinished(data));
		} catch (error) {
			console.error(error);
		}
	};

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
	navigateToWelcome,
	singlePlay,
	friendsPlay,
	navigateToLobby,
	onOnlineModeChanged,
	onExit,
	onGamesFilterToggle,
	onGamesSearchChanged,
	selectGame,
	closeGameInfo,
	unselectGame,
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
	createNewAutoGame,
	searchPackagesThunk,
	receiveAuthorsThunk,
	receiveTagsThunk,
	receivePublishersThunk
};

export default actionCreators;
