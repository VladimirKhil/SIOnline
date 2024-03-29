﻿import { Action, Dispatch, ActionCreator, AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import * as signalR from '@microsoft/signalr';
import * as signalRMsgPack from '@microsoft/signalr-protocol-msgpack';
import State from '../state/State';
import DataContext from '../model/DataContext';

import 'es6-promise/auto';
import { saveState } from '../state/SavedState';
import localization from '../model/resources/localization';

import { attachListeners, detachListeners, activeConnections, removeConnection } from '../utils/ConnectionHelpers';
import roomActionCreators from '../state/room/roomActionCreators';
import Constants from '../model/enums/Constants';

import GameServerClient from '../client/GameServerClient';
import getErrorMessage from '../utils/ErrorHelpers';
import { getFullCulture } from '../utils/StateHelpers';
import settingsActionCreators from '../state/settings/settingsActionCreators';
import GameClient from '../client/game/GameClient';
import userActionCreators from '../state/user/userActionCreators';
import commonActionCreators from '../state/common/commonActionCreators';

import SIContentClient from 'sicontent-client';
import SIStorageClient from 'sistorage-client';
import ClientController from './ClientController';
import uiActionCreators from '../state/ui/uiActionCreators';
import Path from '../model/enums/Path';
import { INavigationState } from '../state/ui/UIState';
import Sex from '../model/enums/Sex';
import onlineActionCreators from '../state/online/onlineActionCreators';
import { endLogin, startLogin } from '../state/new/loginSlice';
import { AppDispatch } from '../state/new/store';
import SIHostClient from '../client/SIHostClient';
import { activeSIHostConnections, attachSIHostListeners } from '../utils/SIHostConnectionHelpers';
import ISIHostClient from '../client/ISIHostClient';

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
			alert(getErrorMessage(error));
		}
	};

const onAvatarDeleted: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (dispatch: Dispatch<AnyAction>) => {
		localStorage.removeItem(Constants.AVATAR_KEY);
		localStorage.removeItem(Constants.AVATAR_NAME_KEY);

		dispatch(settingsActionCreators.onAvatarKeyChanged('') as any);
	};

async function uploadAvatarAsync(dispatch: Dispatch<Action>, dataContext: DataContext) {
	const base64 = localStorage.getItem(Constants.AVATAR_KEY);
	const fileName = localStorage.getItem(Constants.AVATAR_NAME_KEY);

	if (!base64 || !fileName) {
		return;
	}

	dispatch(commonActionCreators.avatarLoadStart(null));

	try {
		const data = Uint8Array.from(window.atob(base64), c => c.charCodeAt(0));

		const { buffer } = data;

		const { contentClient } = dataContext;

		const avatarUri2 = await contentClient.uploadAvatarIfNotExistAsync(fileName, new Blob([buffer]));

		const fullAvatarUri2 = avatarUri2.startsWith('/')
			? contentClient.options.serviceUri + avatarUri2.substring(1)
			: avatarUri2;

		dispatch(commonActionCreators.avatarLoadEnd(null));
		dispatch(userActionCreators.avatarChanged(fullAvatarUri2));
	} catch (err) {
		const errorMessage = getErrorMessage(err);
		alert(localization.avatarLoadError + ': ' + (errorMessage === '413 {"errorCode":3}' ? localization.avatarIsTooBig : errorMessage));
		dispatch(commonActionCreators.avatarLoadError(errorMessage));
	}
}

const sendAvatar: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (_dispatch: Dispatch<AnyAction>, getState: () => State, dataContext: DataContext) => {
	const { avatar } = getState().user;

	if (avatar) {
		await dataContext.game.sendAvatar(avatar);
	}
};

const reloadComputerAccounts: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (dispatch: Dispatch<Action>, getState: () => State, dataContext: DataContext) => {
	if (!dataContext.connection) {
		return;
	}

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
	dataContext.contentUris = hostInfo.ContentPublicBaseUrls;

	if (hostInfo.ContentInfos && hostInfo.ContentInfos.length > 0) {
		const contentIndex = Math.floor(Math.random() * hostInfo.ContentInfos.length);
		const { ServiceUri } = hostInfo.ContentInfos[contentIndex];

		dataContext.contentClient = new SIContentClient({
			serviceUri: ServiceUri
		});
	} else {
		throw new Error('No SIContent service found');
	}

	if (hostInfo.StorageInfos && hostInfo.StorageInfos.length > 0) {
		const { ServiceUri } = hostInfo.StorageInfos[0];

		dataContext.storageClient = new SIStorageClient({
			serviceUri: ServiceUri
		});
	}

	dispatch(commonActionCreators.serverInfoChanged(hostInfo.Name, hostInfo.License, hostInfo.MaxPackageSizeMb));
}

const connectAsync = async (dispatch: Dispatch<Action>, getState: () => State, dataContext: DataContext): Promise<boolean> => {
	if (dataContext.connection) {
		return true;
	}

	const connectionBuilder = new signalR.HubConnectionBuilder()
		.withAutomaticReconnect({
			nextRetryDelayInMilliseconds: (retryContext: signalR.RetryContext) => 1000 * (retryContext.previousRetryCount + 1)
		})
		.withUrl(`${dataContext.serverUri}/sionline`)
		.withHubProtocol(new signalRMsgPack.MessagePackHubProtocol());

	const connection = connectionBuilder.build();

	// eslint-disable-next-line no-param-reassign
	dataContext.connection = connection;

	// eslint-disable-next-line no-param-reassign
	const gameServerClient = new GameServerClient(
		connection,
		e => dispatch(roomActionCreators.operationError(getErrorMessage(e)) as object as AnyAction)
	);

	dataContext.gameClient = gameServerClient;
	dataContext.game = new GameClient(gameServerClient);

	try {
		await dataContext.connection.start();

		if (dataContext.connection.connectionId) {
			activeConnections.push(dataContext.connection.connectionId);
		}

		const controller = new ClientController(dispatch, getState, dataContext);

		const state = getState();
		const requestCulture = getFullCulture(state);

		const computerAccounts = await dataContext.gameClient.getComputerAccountsAsync(requestCulture);
		dispatch(commonActionCreators.computerAccountsChanged(computerAccounts));

		attachListeners(dataContext.gameClient, dataContext.connection, dispatch, controller);

		await loadHostInfoAsync(dispatch, dataContext, requestCulture);
		await uploadAvatarAsync(dispatch, dataContext);

		return true;
	} catch (error) {
		dataContext.connection = null;

		if (error) {
			return false;
		}

		throw error;
	}
};

const connectToSIHostAsync = async (
	siHostUri: string,
	dispatch: Dispatch<Action>,
	getState: () => State,
	dataContext: DataContext
): Promise<ISIHostClient> => {
	const connectionBuilder = new signalR.HubConnectionBuilder()
		.withAutomaticReconnect({
			nextRetryDelayInMilliseconds: (retryContext: signalR.RetryContext) => 1000 * (retryContext.previousRetryCount + 1)
		})
		.withUrl(siHostUri)
		.withHubProtocol(new signalRMsgPack.MessagePackHubProtocol());

	const connection = connectionBuilder.build();

	const siHostClient = new SIHostClient(
		connection,
		e => dispatch(roomActionCreators.operationError(getErrorMessage(e)) as object as AnyAction)
	);

	await connection.start();

	if (connection.connectionId) {
		activeSIHostConnections.push(connection.connectionId);
	}

	const controller = new ClientController(dispatch, getState, dataContext);

	attachSIHostListeners(siHostClient, connection, dispatch, controller);

	dataContext.game = new GameClient(siHostClient);

	return siHostClient;
};

const navigate = async (view: INavigationState, dispatch: Dispatch<Action>, dataContext: DataContext) => {
	if (view.path === Path.Room) {
		if (view.gameId && view.role) {
			const result = await dataContext.gameClient.joinGameAsync(
				view.gameId,
				view.role,
				view.sex === Sex.Male,
				view.password ?? ''
			);

			if (result.ErrorMessage) {
				alert(`${localization.joinError}: ${result.ErrorMessage}`);
				dispatch(uiActionCreators.navigate({ path: Path.Root }) as unknown as Action);
				return;
			}

			await onlineActionCreators.initGameAsync(
				dispatch,
				dataContext.game,
				view.hostUri ?? '',
				result.GameId,
				view.role,
				view.sex ?? Sex.Female,
				view.password ?? '',
				view.isAutomatic ?? false,
				false
			);
		}
	}

	dispatch(uiActionCreators.navigate(view) as unknown as Action);
};

const checkLicense = async (view: INavigationState, dispatch: Dispatch<Action>, dataContext: DataContext) => {
	const licenseAccepted = dataContext.state.isLicenseAccepted();
	navigate(licenseAccepted ? view : { path: Path.AcceptLicense, callbackState: view }, dispatch, dataContext);
};

const init: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(initialView: INavigationState) => async (dispatch: Dispatch<Action>, getState: () => State, dataContext: DataContext) => {
		if (initialView.path === Path.Login) {
			dispatch(uiActionCreators.navigate({ path: Path.Login, callbackState: { path: Path.Root } }) as unknown as Action);
		} else if (await connectAsync(dispatch, getState, dataContext)) {
			await checkLicense(initialView, dispatch, dataContext);
		} else {
			dispatch(uiActionCreators.navigate({ path: Path.Login, callbackState: initialView }) as unknown as Action);
		}
	};

const login: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(appDispatch: AppDispatch) => async (dispatch: Dispatch<Action>, getState: () => State, dataContext: DataContext) => {
		appDispatch(startLogin());
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

			if (!response.ok){
				const errorText = getLoginErrorByCode(response);
				appDispatch(endLogin(errorText));
				return;
			}

			saveStateToStorage(state);

			if (await connectAsync(dispatch, getState, dataContext)) {
				dispatch(userActionCreators.onLoginChanged(state.user.login.trim())); // Normalize login
				appDispatch(endLogin(null));
				await checkLicense(state.ui.navigation.callbackState ?? { path: Path.Root }, dispatch, dataContext);
			} else {
				appDispatch(endLogin(localization.errorHappened));
			}
		} catch (err) {
			appDispatch(endLogin(`${localization.cannotConnectToServer}: ${getErrorMessage(err)}`));
		}
	};

const onExit: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (dispatch: Dispatch<Action>, _getState: () => State, dataContext: DataContext) => {
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

			dataContext.connection = null;

			dispatch(uiActionCreators.navigate({ path: Path.Login }) as unknown as Action);
		} catch (error) {
			alert(getErrorMessage(error)); // TODO: normal error message
		}
	};

const actionCreators = {
	init,
	reloadComputerAccounts,
	saveStateToStorage,
	onAvatarSelectedLocal,
	onAvatarDeleted,
	sendAvatar,
	login,
	connectToSIHostAsync,
	onExit,
};

export default actionCreators;
