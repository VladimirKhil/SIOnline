import { Action, Dispatch, ActionCreator } from 'redux';
import { ThunkAction } from 'redux-thunk';
import * as signalR from '@microsoft/signalr';
import * as signalRMsgPack from '@microsoft/signalr-protocol-msgpack';
import * as JSZip from 'jszip';
import * as Rusha from 'rusha';
import * as Actions from './Actions';
import State from './State';
import Sex from '../model/enums/Sex';
import Role from '../client/contracts/Role';
import DataContext from '../model/DataContext';

import 'es6-promise/auto';
import { saveState } from './SavedState';
import OnlineMode from '../model/enums/OnlineMode';
import GamesFilter from '../model/enums/GamesFilter';
import localization from '../model/resources/localization';
import ChatMode from '../model/enums/ChatMode';

import GameType from '../client/contracts/GameType';
import * as GameErrorsHelper from '../utils/GameErrorsHelper';
import GameInfo from '../client/contracts/GameInfo';
import { attachListeners, detachListeners, activeConnections, removeConnection } from '../utils/ConnectionHelpers';
import MainView from '../model/enums/MainView';
import roomActionCreators from './room/roomActionCreators';
import Slice from '../client/contracts/Slice';
import PackageType from '../model/enums/PackageType';
import PackageKey from '../client/contracts/PackageKey';
import Constants from '../model/enums/Constants';

import GameServerClient from '../client/GameServerClient';
import ServerAppSettings from '../client/contracts/ServerAppSettings';
import AccountSettings from '../client/contracts/AccountSettings';
import GameSettings from '../client/contracts/GameSettings';
import IGameServerClient from '../client/IGameServerClient';
import { PackageFilters } from '../model/PackageFilters';
import { SIPackageInfo } from '../model/SIPackageInfo';
import { SearchEntity } from '../model/SearchEntity';
import getErrorMessage from '../utils/ErrorHelpers';
import FileKey from '../client/contracts/FileKey';
import tableActionCreators from './table/tableActionCreators';
import { getFullCulture } from '../utils/StateHelpers';
import settingsActionCreators from './settings/settingsActionCreators';
import MessageLevel from '../model/enums/MessageLevel';
import GameClient from '../client/game/GameClient';
import userActionCreators from './user/userActionCreators';
import loginActionCreators from './login/loginActionCreators';
import commonActionCreators from './common/commonActionCreators';

const onConnectionChanged: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(isConnected: boolean, message: string) => async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		dispatch(commonActionCreators.isConnectedChanged(isConnected));

		const state = getState();

		if (state.ui.mainView === MainView.Game) {
			dispatch(roomActionCreators.chatMessageAdded({ sender: '', text: message, level: MessageLevel.System }));
		} else {
			dispatch(receiveMessage('', message));
		}

		if (!isConnected) {
			return;
		}

		// Need to restore lobby/game previous state
		if (state.ui.mainView === MainView.Game) {
			await dataContext.gameClient.sendMessageToServerAsync('INFO');
		} else if (state.ui.mainView === MainView.Lobby) {
			navigateToLobby(-1)(dispatch, getState, dataContext);
		}
	};

const navigateToLogin: ActionCreator<Actions.NavigateToLoginAction> = () => ({
	type: Actions.ActionTypes.NavigateToLogin
});

const showSettings: ActionCreator<Actions.ShowSettingsAction> = (show: boolean) => ({
	type: Actions.ActionTypes.ShowSettings,
	show
});

const navigateToHowToPlay: ActionCreator<Actions.NavigateToHowToPlayAction> = () => ({
	type: Actions.ActionTypes.NavigateToHowToPlay
});

const navigateBack: ActionCreator<Actions.NavigateBackAction> = () => ({
	type: Actions.ActionTypes.NavigateBack
});

const onAvatarSelectedLocal: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(avatar: File) => async (dispatch: Dispatch<Action>) => {
		try {
			const buffer = await avatar.arrayBuffer();
			const base64 = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));

			const key = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString();
			
			localStorage.setItem(Constants.AVATAR_KEY, base64);
			localStorage.setItem(Constants.AVATAR_NAME_KEY, avatar.name);

			dispatch(settingsActionCreators.onAvatarKeyChanged(key) as any);
		} catch (error) {
			dispatch(loginActionCreators.loginEnd(error));
		}
	};

const onAvatarDeleted: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (dispatch: Dispatch<Actions.KnownAction>) => {
		localStorage.removeItem(Constants.AVATAR_KEY);
		localStorage.removeItem(Constants.AVATAR_NAME_KEY);

		dispatch(settingsActionCreators.onAvatarKeyChanged('') as any);
	};

async function hashData(data: ArrayBuffer): Promise<ArrayBuffer> {
	if (location.protocol === 'https:') {
		return crypto.subtle.digest('SHA-1', data); // It works only under HTTPS protocol
	}

	return Rusha.createHash().update(data).digest();
}

async function uploadAvatarAsync(dispatch: Dispatch<Action>, dataContext: DataContext) {
	dispatch(commonActionCreators.avatarLoadStart(null));

	try {
		const base64 = localStorage.getItem(Constants.AVATAR_KEY);
		const fileName = localStorage.getItem(Constants.AVATAR_NAME_KEY);

		if (!base64 || !fileName) {
			return;
		}

		const data = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

		const { buffer } = data;
		const hash = await hashData(buffer);

		const hashArray = new Uint8Array(hash);
		const hashArrayEncoded = btoa(String.fromCharCode.apply(null, hashArray as any));

		const imageKey: FileKey = {
			name: fileName,
			hash: hashArrayEncoded
		};
	
		const { gameClient, serverUri } = dataContext;
		
		let avatarUri = await gameClient.hasImageAsync(imageKey);

		if (!avatarUri) {
			const formData = new FormData();
			formData.append('file', new Blob([buffer]), fileName);

			const response = await fetch(`${serverUri}/api/upload/image`, {
				method: 'POST',
				credentials: 'include',
				body: formData,
				headers: {
					'Content-MD5': hashArrayEncoded
				}
			});

			if (!response.ok) {
				dispatch(commonActionCreators.avatarLoadError(`${localization.uploadingImageError}: ${response.status} ${await response.text()}`));
				return;
			}

			avatarUri = await response.text();
		}
		
		const fullAvatarUri = (dataContext.contentUris ? dataContext.contentUris[0] : '') + avatarUri;

		dispatch(commonActionCreators.avatarLoadEnd(null));
		dispatch(userActionCreators.avatarChanged(fullAvatarUri));
	} catch (err) {
		dispatch(commonActionCreators.avatarLoadError(getErrorMessage(err)));
	}
}

const sendAvatar: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (dispatch: Dispatch<Actions.KnownAction>, getState: () => State, dataContext: DataContext) => {
	await dataContext.gameClient.msgAsync('PICTURE', getState().user.avatar);
};

const reloadComputerAccounts: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (dispatch: Dispatch<Action>, getState: () => State, dataContext: DataContext) => {
		const state = getState();

		const requestCulture = getFullCulture(state);

		const computerAccounts = await dataContext.gameClient.getComputerAccountsAsync(requestCulture);
		dispatch(commonActionCreators.computerAccountsChanged(computerAccounts));
};

const saveStateToStorage = (state: State) => {
	saveState({
		login: state.user.login,
		game: {
			name: state.game.name,
			password: state.game.password,
			role: state.game.role,
			type: state.game.type,
			playersCount: state.game.playersCount,
			humanPlayersCount: state.game.humanPlayersCount
		},
		settings: state.settings
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
	type: Actions.ActionTypes.NavigateToWelcome
});

async function loadHostInfoAsync(dispatch: Dispatch<any>, dataContext: DataContext, culture: string) {
	const hostInfo = await dataContext.gameClient.getGameHostInfoAsync(culture);
	// eslint-disable-next-line no-param-reassign
	dataContext.contentUris = hostInfo.contentPublicBaseUrls;

	dispatch(commonActionCreators.serverInfoChanged(hostInfo.name, hostInfo.license, hostInfo.maxPackageSizeMb));
}

const friendsPlayInternal: ActionCreator<Actions.NavigateToGamesAction> = () => ({
	type: Actions.ActionTypes.NavigateToGames
});

const selectGame: ActionCreator<Actions.SelectGameAction> = (gameId: number, showInfo: boolean) => ({
	type: Actions.ActionTypes.SelectGame,
	gameId,
	showInfo
});

const clearGames: ActionCreator<Actions.ClearGamesAction> = () => ({
	type: Actions.ActionTypes.ClearGames
});

const receiveGames: ActionCreator<Actions.ReceiveGamesAction> = (games: any[]) => ({
	type: Actions.ActionTypes.ReceiveGames,
	games
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

const onlineLoadFinish: ActionCreator<Actions.OnlineLoadFinishedAction> = () => ({
	type: Actions.ActionTypes.OnlineLoadFinished
});

const onlineLoadError: ActionCreator<Actions.OnlineLoadErrorAction> = (error: string) => ({
	type: Actions.ActionTypes.OnlineLoadError,
	error
});

const friendsPlay: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (dispatch: Dispatch<Actions.KnownAction>, getState: () => State, dataContext: DataContext) => {
		const state = getState();
		const { selectedGameId } = state.online;

		dispatch(friendsPlayInternal());
		try {
			await loadGamesAsync(dispatch, dataContext.gameClient);

			const state2 = getState();

			if (selectedGameId && state2.online.games[selectedGameId]) {
				dispatch(selectGame(selectedGameId, false));
			}

			dispatch(onlineLoadFinish());
		} catch (error) {
			dispatch(onlineLoadError(getErrorMessage(error)));
		}
	};

const login: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (dispatch: Dispatch<Action>, getState: () => State, dataContext: DataContext) => {
		dispatch(loginActionCreators.loginStart());

		const state = getState();

		try {
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
					.withAutomaticReconnect({
    					nextRetryDelayInMilliseconds: (retryContext: signalR.RetryContext) => 1000 * (retryContext.previousRetryCount + 1)
					})
					.withUrl(`${dataContext.serverUri}/sionline${queryString}`);

				if (dataContext.config.useMessagePackProtocol) {
					connectionBuilder = connectionBuilder.withHubProtocol(new signalRMsgPack.MessagePackHubProtocol());
				}

				const connection = connectionBuilder.build();
				// eslint-disable-next-line no-param-reassign
				dataContext.connection = connection;
				// eslint-disable-next-line no-param-reassign
				dataContext.gameClient = new GameServerClient(
					connection,
					e => dispatch(roomActionCreators.operationError(getErrorMessage(e)) as object as Actions.KnownAction)
				);

				dataContext.game = new GameClient(dataContext.gameClient);

				try {
					await dataContext.connection.start();

					if (dataContext.connection.connectionId) {
						activeConnections.push(dataContext.connection.connectionId);
					}

					attachListeners(dataContext.connection, dispatch);

					const requestCulture = getFullCulture(state);

					const computerAccounts = await dataContext.gameClient.getComputerAccountsAsync(requestCulture);
					dispatch(commonActionCreators.computerAccountsChanged(computerAccounts));

					await loadHostInfoAsync(dispatch, dataContext, requestCulture);
					await uploadAvatarAsync(dispatch, dataContext);

					dispatch(loginActionCreators.loginEnd());
					dispatch(userActionCreators.onLoginChanged(state.user.login.trim())); // Normalize login

					const urlParams = new URLSearchParams(window.location.search);
					const invite = urlParams.get('invite');

					if (state.online.selectedGameId && invite == 'true') {
						friendsPlay()(dispatch, getState, dataContext);
					} else {
						dispatch(navigateToWelcome());
					}
				} catch (error) {
					dispatch(loginActionCreators.loginEnd(`${localization.cannotConnectToServer}: ${getErrorMessage(error)}`));
				}
			} else {
				const errorText = getLoginErrorByCode(response);
				dispatch(loginActionCreators.loginEnd(errorText));
			}
		} catch (err) {
			dispatch(loginActionCreators.loginEnd(`${localization.cannotConnectToServer}: ${getErrorMessage(err)}`));
		}
	};

const singlePlay: ActionCreator<Actions.NavigateToNewGameAction> = () => ({
	type: Actions.ActionTypes.NavigateToNewGame
});

const navigateToLobbyInternal: ActionCreator<Actions.NavigateToLobbyAction> = () => ({
	type: Actions.ActionTypes.NavigateToLobby
});

const navigateToLobby: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(gameId: number, showInfo?: boolean) => async (dispatch: Dispatch<Actions.KnownAction>, _: () => State, dataContext: DataContext) => {
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
			dispatch(onlineLoadError(getErrorMessage(error)));
		}
	};

const navigateToError: ActionCreator<Actions.NavigateToErrorAction> = () => ({
	type: Actions.ActionTypes.NavigateToError
});

const receiveUsers: ActionCreator<Actions.ReceiveUsersAction> = (users: string[]) => ({
	type: Actions.ActionTypes.ReceiveUsers,
	users
});

const receiveMessage: ActionCreator<Actions.ReceiveMessageAction> = (sender: string, message: string) => ({
	type: Actions.ActionTypes.ReceiveMessage,
	sender,
	message
});

const onOnlineModeChanged: ActionCreator<Actions.OnlineModeChangedAction> = (mode: OnlineMode) => ({
	type: Actions.ActionTypes.OnlineModeChanged,
	mode
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
			removeConnection(server);

			dispatch(navigateToLogin());
		} catch (error) {
			alert(getErrorMessage(error)); // TODO: normal error message
		}
	};

const onGamesFilterToggle: ActionCreator<Actions.GamesFilterToggleAction> = (filter: GamesFilter) => ({
	type: Actions.ActionTypes.GamesFilterToggle,
	filter
});

const onGamesSearchChanged: ActionCreator<Actions.GamesSearchChangedAction> = (search: string) => ({
	type: Actions.ActionTypes.GamesSearchChanged,
	search
});

const closeGameInfo: ActionCreator<Actions.CloseGameInfoAction> = () => ({
	type: Actions.ActionTypes.CloseGameInfo
});

const unselectGame: ActionCreator<Actions.UnselectGameAction> = () => ({
	type: Actions.ActionTypes.UnselectGame
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
	type: Actions.ActionTypes.JoinGameFinished,
	error
});

const gameSet: ActionCreator<Actions.GameSetAction> = (id: number, isAutomatic: boolean) => ({
	type: Actions.ActionTypes.GameSet,
	id,
	isAutomatic,
});

const initGameAsync = async (dispatch: Dispatch<any>, dataContext: DataContext, gameId: number, role: Role, isAutomatic: boolean) => {
	dispatch(gameSet(gameId, isAutomatic));
	dispatch(tableActionCreators.tableReset());
	dispatch(tableActionCreators.showText(localization.tableHint, false));
	dispatch(roomActionCreators.roleChanged(role));
	dispatch(roomActionCreators.stopTimer(0));
	dispatch(roomActionCreators.stopTimer(1));
	dispatch(roomActionCreators.stopTimer(2));

	await gameInit(gameId, dataContext, role);
};

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

			await initGameAsync(dispatch, dataContext, gameId, role, false);

			saveStateToStorage(state);
			dispatch(joinGameFinished(null));
		} catch (error) {
			dispatch(joinGameFinished(getErrorMessage(error)));
		}
	};

const passwordChanged: ActionCreator<Actions.PasswordChangedAction> = (newPassword: string) => ({
	type: Actions.ActionTypes.PasswordChanged,
	newPassword
});

const chatModeChanged: ActionCreator<Actions.ChatModeChangedAction> = (chatMode: ChatMode) => ({
	type: Actions.ActionTypes.ChatModeChanged,
	chatMode
});

const gameCreated: ActionCreator<Actions.GameCreatedAction> = (game: GameInfo) => ({
	type: Actions.ActionTypes.GameCreated,
	game
});

const gameChanged: ActionCreator<Actions.GameChangedAction> = (game: GameInfo) => ({
	type: Actions.ActionTypes.GameChanged,
	game
});

const gameDeleted: ActionCreator<Actions.GameDeletedAction> = (gameId: number) => ({
	type: Actions.ActionTypes.GameDeleted,
	gameId
});

const userJoined: ActionCreator<Actions.UserJoinedAction> = (login: string) => ({
	type: Actions.ActionTypes.UserJoined,
	login
});

const userLeaved: ActionCreator<Actions.UserLeavedAction> = (login: string) => ({
	type: Actions.ActionTypes.UserLeaved,
	login
});

const messageChanged: ActionCreator<Actions.MessageChangedAction> = (message: string) => ({
	type: Actions.ActionTypes.MessageChanged,
	message
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

const windowSizeChanged: ActionCreator<Actions.WindowSizeChangedAction> = (width: number, height: number) => ({
	type: Actions.ActionTypes.WindowSizeChanged,
	width,
	height
});

const gameNameChanged: ActionCreator<Actions.GameNameChangedAction> = (gameName: string) => ({
	type: Actions.ActionTypes.GameNameChanged,
	gameName
});

const gamePasswordChanged: ActionCreator<Actions.GamePasswordChangedAction> = (gamePassword: string) => ({
	type: Actions.ActionTypes.GamePasswordChanged,
	gamePassword
});

const gamePackageTypeChanged: ActionCreator<Actions.GamePackageTypeChangedAction> = (packageType: PackageType) => ({
	type: Actions.ActionTypes.GamePackageTypeChanged,
	packageType
});

const gamePackageDataChanged: ActionCreator<Actions.GamePackageDataChangedAction> = (
	packageName: string,
	packageData: File | null
) => ({
	type: Actions.ActionTypes.GamePackageDataChanged,
	packageName,
	packageData
});

const gamePackageDataChangedRequest: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (
	packageName: string,
	packageData: File | null) => (dispatch: Dispatch<Actions.KnownAction>, getState: () => State, dataContext: DataContext) => {
		const state = getState();
		const { maxPackageSizeMb } = state.common;

		if (packageData && packageData.size > maxPackageSizeMb * 1024 * 1024) {
			alert(`${localization.packageIsTooBig} (${maxPackageSizeMb} MB)`);
			return;
		}

		dispatch(gamePackageDataChanged(packageName, packageData));
	};

const gamePackageLibraryChanged: ActionCreator<Actions.GamePackageLibraryChangedAction> = (
	id: string,
	name: string
) => ({
	type: Actions.ActionTypes.GamePackageLibraryChanged,
	name,
	id
});

const gameTypeChanged: ActionCreator<Actions.GameTypeChangedAction> = (gameType: GameType) => ({
	type: Actions.ActionTypes.GameTypeChanged,
	gameType
});

const gameRoleChanged: ActionCreator<Actions.GameRoleChangedAction> = (gameRole: Role) => ({
	type: Actions.ActionTypes.GameRoleChanged,
	gameRole
});

const showmanTypeChanged: ActionCreator<Actions.ShowmanTypeChangedAction> = (isHuman: boolean) => ({
	type: Actions.ActionTypes.ShowmanTypeChanged,
	isHuman
});

const playersCountChanged: ActionCreator<Actions.PlayersCountChangedAction> = (playersCount: number) => ({
	type: Actions.ActionTypes.PlayersCountChanged,
	playersCount
});

const humanPlayersCountChanged: ActionCreator<Actions.HumanPlayersCountChangedAction> = (
	humanPlayersCount: number
) => ({
	type: Actions.ActionTypes.HumanPlayersCountChanged,
	humanPlayersCount
});

const gameCreationStart: ActionCreator<Actions.GameCreationStartAction> = () => ({
	type: Actions.ActionTypes.GameCreationStart
});

const gameCreationEnd: ActionCreator<Actions.GameCreationEndAction> = (error: string | null = null) => ({
	type: Actions.ActionTypes.GameCreationEnd,
	error
});

const uploadPackageStarted: ActionCreator<Actions.UploadPackageStartedAction> = () => ({
	type: Actions.ActionTypes.UploadPackageStarted
});

const uploadPackageFinished: ActionCreator<Actions.UploadPackageFinishedAction> = () => ({
	type: Actions.ActionTypes.UploadPackageFinished
});

const uploadPackageProgress: ActionCreator<Actions.UploadPackageProgressAction> = (progress: number) => ({
	type: Actions.ActionTypes.UploadPackageProgress,
	progress
});

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
			reject(new Error(xhr.statusText || xhr.responseText || `${localization.unknownError}: ${xhr.status}`));
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
		throw new Error(localization.corruptedPackage + ' (!contentFile)');
	}

	const content = await contentFile.async('text');

	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(content.substring(39), 'application/xml');

	const packageElements = xmlDoc.getElementsByTagName('package');

	if (packageElements.length === 0) {
		throw new Error(localization.corruptedPackage + ' (packageElements.length === 0)');
	}

	const id = packageElements[0].getAttribute('id');

	const hash = await hashData(await packageData.arrayBuffer());

	const hashArray = new Uint8Array(hash);
	const hashArrayEncoded = btoa(String.fromCharCode.apply(null, hashArray as any));

	const packageKey: PackageKey = {
		name: packageData.name,
		hash: hashArrayEncoded,
		id
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

		if (!isSingleGame && state.game.name.length === 0) {
			dispatch(gameCreationEnd(localization.gameNameMustBeSpecified));
			return;
		}

		if (state.common.computerAccounts === null) {
			dispatch(gameCreationEnd(localization.computerAccountsMissing));
			return;
		}

		dispatch(gameCreationStart());

		const game = isSingleGame
			? {
				...state.game,
				name: getRandomValue().toString(),
				password: getRandomValue().toString(), // protecting from anyone to join
				isShowmanHuman: false,
				humanPlayersCount: 0
			} : state.game;

		const { playersCount, humanPlayersCount, role } = game;
		const me: AccountSettings = { name: state.user.login, isHuman: true, isMale: state.settings.sex === Sex.Male };

		const showman: AccountSettings = role === Role.Showman
			? me
			: game.isShowmanHuman
				? { name: Constants.ANY_NAME, isHuman: true }
				: { name: localization.defaultShowman };
		
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
			players.push({ name: Constants.ANY_NAME, isHuman: true });
		}

		for (let i = 0; i < compPlayersCount; i++) {
			const ind = Math.floor(Math.random() * compIndicies.length);
			players.push({ name: state.common.computerAccounts[compIndicies[ind]], isHuman: false });
			compIndicies.splice(ind, 1);
		}

		const gameMode = game.type;

		const appSettings: ServerAppSettings = {
			timeSettings: state.settings.appSettings.timeSettings,
			readingSpeed: state.settings.appSettings.readingSpeed,
			falseStart: state.settings.appSettings.falseStart,
			hintShowman: state.settings.appSettings.hintShowman,
			oral: state.settings.appSettings.oral,
			ignoreWrong: state.settings.appSettings.ignoreWrong,
			managed: state.settings.appSettings.managed,
			gameMode: gameMode.toString(),
			partialText: state.settings.appSettings.partialText,
			randomQuestionsBasePrice: gameMode === GameType.Simple ? 10 : 100,
			randomRoundsCount: gameMode === GameType.Simple ? 1 : 3,
			randomThemesCount: gameMode === GameType.Simple ? 5 : 6,
			culture: getFullCulture(state),
			usePingPenalty: state.settings.appSettings.usePingPenalty,
			preloadRoundContent: state.settings.appSettings.preloadRoundContent,
			useApellations: state.settings.appSettings.useApellations,
		};

		const gameSettings: GameSettings = {
			humanPlayerName: state.user.login,
			randomSpecials: game.package.type === PackageType.Random,
			networkGameName: game.name.trim(),
			networkGamePassword: game.password,
			isPrivate: isSingleGame,
			allowViewers: true,
			showman: showman,
			players: players,
			viewers: viewers,
			appSettings: appSettings
		};

		try {
			const packageKey: PackageKey | null = await (async (): Promise<PackageKey | null> => {
				switch (game.package.type) {
					case PackageType.Random:
						return {
							name: '',
							hash: null,
							id: null
						};

					case PackageType.File:
						return game.package.data
							? checkAndUploadPackageAsync(dataContext.gameClient, dataContext.serverUri, game.package.data, dispatch)
							: null;

					case PackageType.SIStorage:
						return {
							name: null,
							hash: null,
							id: game.package.id
						};

					default:
						return null;
				}
			})();

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
				await initGameAsync(dispatch, dataContext, result.gameId, role, false);
			}
		} catch (error) {
			dispatch(gameCreationEnd(getErrorMessage(error)));
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
				await initGameAsync(dispatch, dataContext, result.gameId, Role.Player, true);
			}
		} catch (message) {
			dispatch(gameCreationEnd(message));
		}
	};

async function gameInit(gameId: number, dataContext: DataContext, role: Role) {
	if (dataContext.config.rewriteUrl) {
		window.history.pushState({}, `${localization.game} ${gameId}`, `${dataContext.config.rootUri}?gameId=${gameId}`);
	}

	await dataContext.gameClient.sendMessageToServerAsync('INFO');

	if (role === Role.Player || role === Role.Showman) {
		await dataContext.gameClient.sendMessageToServerAsync('READY');
	}
}

const searchPackages: ActionCreator<Actions.SearchPackagesAction> = () => ({
	type: Actions.ActionTypes.SearchPackages
});

const searchPackagesFinished: ActionCreator<Actions.SearchPackagesFinishedAction> = (packages: SIPackageInfo[]) => ({
	type: Actions.ActionTypes.SearchPackagesFinished,
	packages
});

const searchPackagesError: ActionCreator<Actions.SearchPackagesErrorAction> = (error: string | null) => ({
	type: Actions.ActionTypes.SearchPackagesError,
	error
});

const receiveAuthors: ActionCreator<Actions.ReceiveAuthorsAction> = () => ({
	type: Actions.ActionTypes.ReceiveAuthors
});

const receiveAuthorsFinished: ActionCreator<Actions.ReceiveAuthorsFinishedAction> = (authors: SearchEntity[]) => ({
	type: Actions.ActionTypes.ReceiveAuthorsFinished,
	authors
});

const receiveTags: ActionCreator<Actions.ReceiveTagsAction> = () => ({ type: Actions.ActionTypes.ReceiveTags });

const receiveTagsFinished: ActionCreator<Actions.ReceiveTagsFinishedAction> = (tags: SearchEntity[]) => ({
	type: Actions.ActionTypes.ReceiveTagsFinished,
	tags
});

const receivePublishers: ActionCreator<Actions.ReceivePublishersAction> = () => ({
	type: Actions.ActionTypes.ReceivePublishers
});

const receivePublishersFinished: ActionCreator<Actions.ReceivePublishersFinishedAction> = (
	publishers: SearchEntity[]
) => ({
	type: Actions.ActionTypes.ReceivePublishersFinished,
	publishers
});

const receiveAuthorsThunk: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		try {
			dispatch(receiveAuthors());
			const { apiUri } = dataContext.config;
			const response = await fetch(`${apiUri}/Authors`);

			if (!response.ok) {
				console.error(response.statusText);
				return;
			}

			const data = await response.json();
			dispatch(receiveAuthorsFinished(data));
		} catch (error) {
			dispatch(searchPackagesError(getErrorMessage(error)));
		}
	};

const receiveTagsThunk: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		try {
			dispatch(receiveTags());
			const { apiUri } = dataContext.config;
			const response = await fetch(`${apiUri}/Tags`);

			if (!response.ok) {
				console.error(response.statusText);
				return;
			}

			const data = await response.json();
			dispatch(receiveTagsFinished(data));
		} catch (error) {
			dispatch(searchPackagesError(getErrorMessage(error)));
		}
	};

const receivePublishersThunk: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		try {
			dispatch(receivePublishers());
			const { apiUri } = dataContext.config;
			const response = await fetch(`${apiUri}/Publishers`);

			if (!response.ok) {
				console.error(response.statusText);
				return;
			}

			const data = await response.json();
			dispatch(receivePublishersFinished(data));
		} catch (error) {
			dispatch(searchPackagesError(getErrorMessage(error)));
		}
	};

const searchPackagesThunk: ActionCreator<ThunkAction<void, State, DataContext, Action>> = 
	(filters: PackageFilters = {
		difficultyRelation: 0,
		difficulty: 1,
		sortMode: 0,
		sortAscending: true,
		authorId: null,
		publisherId: null,
		tagId: null,
		restriction: null
	}) => async (dispatch: Dispatch<any>, _: () => State, dataContext: DataContext) => {
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
							[key]: value
						}),
						{}
					))}`);

		if (!response.ok) {
			console.error(response.statusText);
			return;
		}

		const data = await response.json();
		dispatch(searchPackagesFinished(data));
	} catch (error) {
		dispatch(searchPackagesError(getErrorMessage(error)));
	}
};

const isSettingGameButtonKeyChanged: ActionCreator<Actions.IsSettingGameButtonKeyChangedAction> = (isSettingGameButtonKey: boolean) => ({
	type: Actions.ActionTypes.IsSettingGameButtonKeyChanged, isSettingGameButtonKey
});

const actionCreators = {
	reloadComputerAccounts,
	saveStateToStorage,
	onConnectionChanged,
	navigateToLogin,
	showSettings,
	navigateToHowToPlay,
	navigateBack,
	onAvatarSelectedLocal,
	onAvatarDeleted,
	sendAvatar,
	login,
	navigateToWelcome,
	singlePlay,
	friendsPlay,
	navigateToLobby,
	navigateToError,
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
	windowSizeChanged,
	gameNameChanged,
	gamePasswordChanged,
	gamePackageTypeChanged,
	gamePackageDataChangedRequest,
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
	receivePublishersThunk,
	gamePackageLibraryChanged,
	isSettingGameButtonKeyChanged,
};

export default actionCreators;
