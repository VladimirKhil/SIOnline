import { Action, Dispatch, ActionCreator } from 'redux';
import { ThunkAction } from 'redux-thunk';
import * as signalR from '@microsoft/signalr';
import * as signalRMsgPack from '@microsoft/signalr-protocol-msgpack';
import * as Actions from './Actions';
import State from './State';
import Role from '../client/contracts/Role';
import DataContext from '../model/DataContext';

import 'es6-promise/auto';
import { saveState } from './SavedState';
import localization from '../model/resources/localization';

import GameType from '../client/contracts/GameType';
import { attachListeners, detachListeners, activeConnections, removeConnection } from '../utils/ConnectionHelpers';
import MainView from '../model/enums/MainView';
import roomActionCreators from './room/roomActionCreators';
import PackageType from '../model/enums/PackageType';
import Constants from '../model/enums/Constants';

import GameServerClient from '../client/GameServerClient';
import getErrorMessage from '../utils/ErrorHelpers';
import FileKey from '../client/contracts/FileKey';
import { getFullCulture } from '../utils/StateHelpers';
import settingsActionCreators from './settings/settingsActionCreators';
import MessageLevel from '../model/enums/MessageLevel';
import GameClient from '../client/game/GameClient';
import userActionCreators from './user/userActionCreators';
import loginActionCreators from './login/loginActionCreators';
import commonActionCreators from './common/commonActionCreators';
import onlineActionCreators from './online/onlineActionCreators';

import SIContentClient from 'sicontent-client';
import uiActionCreators from './ui/uiActionCreators';
import hashData from '../utils/hashData';

const onConnectionChanged: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(isConnected: boolean, message: string) => async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		dispatch(commonActionCreators.isConnectedChanged(isConnected));

		const state = getState();

		if (state.ui.mainView === MainView.Game) {
			dispatch(roomActionCreators.chatMessageAdded({ sender: '', text: message, level: MessageLevel.System }));
		} else {
			dispatch(onlineActionCreators.receiveMessage('', message));
		}

		if (!isConnected) {
			return;
		}

		// Need to restore lobby/game previous state
		if (state.ui.mainView === MainView.Game) {
			await dataContext.gameClient.sendMessageToServerAsync('INFO');
		} else if (state.ui.mainView === MainView.Lobby) {
			onlineActionCreators.navigateToLobby(-1)(dispatch, getState, dataContext);
		}
	};

const onAvatarSelectedLocal: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(avatar: File) => async (dispatch: Dispatch<Action>) => {
		try {
			const buffer = await avatar.arrayBuffer();
			const base64 = window.btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));

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

async function uploadAvatarAsync(dispatch: Dispatch<Action>, dataContext: DataContext) {
	dispatch(commonActionCreators.avatarLoadStart(null));

	try {
		const base64 = localStorage.getItem(Constants.AVATAR_KEY);
		const fileName = localStorage.getItem(Constants.AVATAR_NAME_KEY);

		if (!base64 || !fileName) {
			return;
		}

		const data = Uint8Array.from(window.atob(base64), c => c.charCodeAt(0));

		const { buffer } = data;

		const { gameClient, serverUri, contentClient } = dataContext;

		if (contentClient) {
			const avatarUri2 = await contentClient.uploadAvatarIfNotExistAsync(fileName, new Blob([buffer]));

			const fullAvatarUri2 = avatarUri2.startsWith('/')
				? contentClient.options.serviceUri + avatarUri2.substring(1)
				: avatarUri2;

			dispatch(commonActionCreators.avatarLoadEnd(null));
			dispatch(userActionCreators.avatarChanged(fullAvatarUri2));
			return;
		}

		const hash = await hashData(buffer);

		const hashArray = new Uint8Array(hash);
		const hashArrayEncoded = window.btoa(String.fromCharCode.apply(null, hashArray as any));

		const imageKey: FileKey = {
			name: fileName,
			hash: hashArrayEncoded
		};

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
		const errorMessage = getErrorMessage(err);
		console.log(errorMessage);
		dispatch(commonActionCreators.avatarLoadError(errorMessage));
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

async function loadHostInfoAsync(dispatch: Dispatch<any>, dataContext: DataContext, culture: string) {
	const hostInfo = await dataContext.gameClient.getGameHostInfoAsync(culture);
	// eslint-disable-next-line no-param-reassign
	dataContext.contentUris = hostInfo.contentPublicBaseUrls;

	if (hostInfo.contentInfos && hostInfo.contentInfos.length > 0) {
		const contentIndex = Math.floor(Math.random() * hostInfo.contentInfos.length);
		const { serviceUri } = hostInfo.contentInfos[contentIndex];

		dataContext.contentClient = new SIContentClient({
			serviceUri
		});
	}

	dispatch(commonActionCreators.serverInfoChanged(hostInfo.name, hostInfo.license, hostInfo.maxPackageSizeMb));
}

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
						onlineActionCreators.friendsPlay()(dispatch, getState, dataContext);
					} else {
						dispatch(uiActionCreators.navigateToWelcome());
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


const onExit: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (dispatch: Dispatch<Action>, getState: () => State, dataContext: DataContext) => {
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

			dispatch(uiActionCreators.navigateToLogin());
		} catch (error) {
			alert(getErrorMessage(error)); // TODO: normal error message
		}
	};

const gameSet: ActionCreator<Actions.GameSetAction> = (id: number, isAutomatic: boolean) => ({
	type: Actions.ActionTypes.GameSet,
	id,
	isAutomatic,
});

const gameNameChanged: ActionCreator<Actions.GameNameChangedAction> = (gameName: string) => ({
	type: Actions.ActionTypes.GameNameChanged,
	gameName
});

const gamePasswordChanged: ActionCreator<Actions.GamePasswordChangedAction> = (gamePassword: string) => ({
	type: Actions.ActionTypes.GamePasswordChanged,
	gamePassword
});

const gameVoiceChatChanged: ActionCreator<Actions.GameVoiceChatChangedAction> = (gameVoiceChat: string) => ({
	type: Actions.ActionTypes.GameVoiceChatChanged,
	gameVoiceChat
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

const newGame2: ActionCreator<Actions.NewGame2Action> = () => ({
	type: Actions.ActionTypes.NewGame2
});

const actionCreators = {
	reloadComputerAccounts,
	saveStateToStorage,
	onConnectionChanged,
	onAvatarSelectedLocal,
	onAvatarDeleted,
	sendAvatar,
	login,
	onExit,
	gameNameChanged,
	gamePasswordChanged,
	gameVoiceChatChanged,
	gamePackageTypeChanged,
	gamePackageDataChangedRequest,
	gameTypeChanged,
	gameRoleChanged,
	showmanTypeChanged,
	playersCountChanged,
	humanPlayersCountChanged,
	gamePackageLibraryChanged,
	gameSet,
	newGame2,
};

export default actionCreators;
