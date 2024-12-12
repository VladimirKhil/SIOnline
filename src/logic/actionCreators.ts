import { Action, Dispatch, ActionCreator, AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import * as signalR from '@microsoft/signalr';
import * as signalRMsgPack from '@microsoft/signalr-protocol-msgpack';
import State from '../state/State';
import DataContext from '../model/DataContext';

import 'es6-promise/auto';
import localization from '../model/resources/localization';

import { attachListeners, detachListeners, activeConnections, removeConnection } from '../utils/ConnectionHelpers';
import roomActionCreators from '../state/room/roomActionCreators';
import Constants from '../model/enums/Constants';

import GameServerClient from '../client/GameServerClient';
import getErrorMessage from '../utils/ErrorHelpers';
import { getFullCulture } from '../utils/StateHelpers';
import GameClient from '../client/game/GameClient';

import SIContentClient, { SIContentServiceError } from 'sicontent-client';
import SIStorageClient from 'sistorage-client';
import ClientController from './ClientController';
import Path from '../model/enums/Path';
import Sex from '../model/enums/Sex';
import onlineActionCreators from '../state/online/onlineActionCreators';
import { endLogin, startLogin } from '../state/new/loginSlice';
import { AppDispatch } from '../state/new/store';
import SIHostClient from '../client/SIHostClient';
import { activeSIHostConnections, attachSIHostListeners, detachSIHostListeners, removeSIHostConnection } from '../utils/SIHostConnectionHelpers';
import ISIHostClient from '../client/ISIHostClient';
import Role from '../model/Role';
import ServerRole from '../client/contracts/ServerRole';
import ServerSex from '../client/contracts/ServerSex';
import WellKnownSIContentServiceErrorCode from 'sicontent-client/dist/models/WellKnownSIContentServiceErrorCode';
import { getJoinErrorMessage } from '../utils/GameErrorsHelper';
import { selectGame } from '../state/new/online2Slice';
import { setAvatarKey } from '../state/new/settingsSlice';

import {
	avatarLoadEnd,
	avatarLoadError,
	avatarLoadStart,
	commonErrorChanged,
	computerAccountsChanged,
	serverInfoChanged,
	userErrorChanged,
} from '../state/new/commonSlice';

import { changeAvatar, changeLogin } from '../state/new/userSlice';
import { saveStateToStorage } from '../state/new/StateHelpers';
import { INavigationState } from '../state/new/uiSlice';
import { navigate } from '../utils/Navigator';
import registerApp from '../utils/registerApp';

interface ConnectResult {
	success: boolean;
	error?: string;
	authenticationRequired: boolean;
}

const onAvatarSelectedLocal: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(avatar: File, appDispatch: AppDispatch) => async () => {
		try {
			const buffer = await avatar.arrayBuffer();
			const base64 = window.btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));

			const key = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString();

			localStorage.setItem(Constants.AVATAR_KEY, base64);
			localStorage.setItem(Constants.AVATAR_NAME_KEY, avatar.name);

			appDispatch(setAvatarKey(key));
		} catch (error) {
			appDispatch(userErrorChanged(getErrorMessage(error)) as any);
		}
	};

async function uploadAvatarAsync(appDispatch: AppDispatch, dataContext: DataContext) {
	const base64 = localStorage.getItem(Constants.AVATAR_KEY);
	const fileName = localStorage.getItem(Constants.AVATAR_NAME_KEY);

	if (!base64 || !fileName) {
		return;
	}

	appDispatch(avatarLoadStart());

	try {
		const data = Uint8Array.from(window.atob(base64), c => c.charCodeAt(0));

		const { buffer } = data;

		const { contentClient } = dataContext;

		const avatarUri2 = await contentClient.uploadAvatarIfNotExistAsync(fileName, new Blob([buffer]));

		const fullAvatarUri2 = avatarUri2.startsWith('/')
			? contentClient.options.serviceUri + avatarUri2.substring(1)
			: avatarUri2;

		appDispatch(avatarLoadEnd());
		appDispatch(changeAvatar(fullAvatarUri2));
	} catch (err) {
		const errorMessage = getErrorMessage(err);

		const userError = (err as SIContentServiceError).errorCode === WellKnownSIContentServiceErrorCode.FileTooLarge
			? localization.avatarIsTooBig
			: errorMessage;

		appDispatch(userErrorChanged(localization.avatarLoadError + ': ' + userError) as any);
		appDispatch(avatarLoadError(errorMessage));
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
	(appDispatch: AppDispatch) => async (_dispatch: Dispatch<Action>, getState: () => State, dataContext: DataContext) => {
	if (!dataContext.connection) {
		return;
	}

	const state = getState();
	const requestCulture = getFullCulture(state);

	const computerAccounts = await dataContext.gameClient.getComputerAccountsAsync(requestCulture);
	appDispatch(computerAccountsChanged(computerAccounts));
};

function getLoginErrorByCode(response: Response): string {
	switch (response.status) {
		case 0:
			return localization.cannotConnectToServer;

		case 403:
			return localization.forbiddenNickname;

		case 405:
			return localization.methodNotAllowed;

		case 409:
			return localization.duplicateUserName;

		case 429:
			return localization.tooManyRequests;

		default:
			return response.statusText;
	}
}

async function loadHostInfoAsync(appDispatch: AppDispatch, dataContext: DataContext, culture: string) {
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

	appDispatch(serverInfoChanged({
		serverName: hostInfo.Name,
		serverLicense: hostInfo.License,
		maxPackageSizeMb: hostInfo.MaxPackageSizeMb,
	}));
}

const tryConnectAsync = async (
	dispatch: Dispatch<Action>,
	appDispatch: AppDispatch,
	getState: () => State,
	dataContext: DataContext
): Promise<ConnectResult> => {
	if (dataContext.connection && dataContext.connection.state === signalR.HubConnectionState.Connected) {
		await uploadAvatarAsync(appDispatch, dataContext);
		return { success: true, authenticationRequired: false };
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

	try {
		await dataContext.connection.start();
	} catch (error: any) {
		dataContext.connection = null;

		return {
			success: false,
			error: getErrorMessage(error),
			authenticationRequired: !error.errorCode || (error.errorType === 'FailedToNegotiateWithServerError' && error.message?.includes('401'))
		};
	}

	try {
		if (dataContext.connection.connectionId) {
			activeConnections.push(dataContext.connection.connectionId);
		}

		const state = getState();
		const requestCulture = getFullCulture(state);

		const login = await dataContext.gameClient.getLoginAsync();
		const localLogin = state.user.login;

		const computerAccounts = await dataContext.gameClient.getComputerAccountsAsync(requestCulture);
		appDispatch(computerAccountsChanged(computerAccounts));

		// Listeners should be attached after first successfull request to be sure that connection is working
		attachListeners(dataContext.gameClient, dataContext.connection, dispatch, appDispatch);

		await loadHostInfoAsync(appDispatch, dataContext, requestCulture);
		await uploadAvatarAsync(appDispatch, dataContext);

		if ((login === null || login === '') && (localLogin === null || localLogin === '')) {
			// Login is required to continue
			return { success: false, authenticationRequired: true };
		}

		return { success: true, authenticationRequired: false };
	} catch (error) {
		const authenticationRequired = dataContext.connection.state === signalR.HubConnectionState.Disconnected;
		dataContext.connection = null;
		return { success: false, error: getErrorMessage(error), authenticationRequired: authenticationRequired };
	}
};

const connectToSIHostAsync = async (
	siHostUri: string,
	dispatch: Dispatch<Action>,
	appDispatch: AppDispatch,
	getState: () => State,
	dataContext: DataContext
): Promise<ISIHostClient> => {
	const siHostUriChecked = siHostUri.endsWith('/') ? siHostUri : siHostUri + '/';

	const connectionBuilder = new signalR.HubConnectionBuilder()
		.withAutomaticReconnect({
			nextRetryDelayInMilliseconds: (retryContext: signalR.RetryContext) => 1000 * (retryContext.previousRetryCount + 1)
		})
		.withUrl(siHostUriChecked + 'sihost')
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

	const controller = new ClientController(dispatch, appDispatch, getState, dataContext);

	attachSIHostListeners(siHostClient, connection, dispatch, appDispatch, controller);

	dataContext.game = new GameClient(siHostClient, true);

	return siHostClient;
};

const closeSIHostClientAsync = async (appDispatch: AppDispatch, dataContext: DataContext) => {
	const { connection } = dataContext.game.gameServerClient;

	if (!connection) {
		return;
	}

	try {
		await dataContext.game.gameServerClient.leaveGameAsync();

		if (connection.connectionId) {
			activeSIHostConnections.splice(activeSIHostConnections.indexOf(connection.connectionId), 1);
		}

		detachSIHostListeners(connection);
		await connection.stop();
		removeSIHostConnection(connection);
	} catch (error) {
		appDispatch(userErrorChanged(getErrorMessage(error)) as any);
	}
};

const disconnectAsync = async (appDispatch: AppDispatch, dataContext: DataContext) => {
	const { connection } = dataContext;

	if (!connection) {
		return;
	}

	try {
		await dataContext.gameClient.logOutAsync();

		if (connection.connectionId) {
			activeConnections.splice(activeConnections.indexOf(connection.connectionId), 1);
		}

		detachListeners(connection);
		await connection.stop();
		removeConnection(connection);

		dataContext.connection = null;
	} catch (error) {
		appDispatch(userErrorChanged(getErrorMessage(error)) as any); // TODO: normal error message
	}
};

function getServerRole(role: Role) {
	if (role === Role.Viewer) {
		return ServerRole.Viewer;
	}

	return role === Role.Player ? ServerRole.Player : ServerRole.Showman;
}

const navigateAsync = async (
	view: INavigationState,
	dispatch: Dispatch<Action>,
	appDispatch: AppDispatch,
	getState: () => State,
	dataContext: DataContext
) => {
	if (view.path === Path.Room) {
		if (view.gameId && view.role && view.hostUri) {
			// TODO: merge with onlineActionCreators.joinGame()
			const siHostClient = await connectToSIHostAsync(view.hostUri, dispatch, appDispatch, getState, dataContext);

			const state = getState();
			const serverRole = getServerRole(view.role);

			const result = await siHostClient.joinGameAsync({
				GameId: view.gameId,
				UserName: state.user.login,
				Role: serverRole,
				Sex: view.sex === Sex.Male ? ServerSex.Male : ServerSex.Female,
				Password: view.password ?? '',
				Pin: null,
			});

			if (!result.IsSuccess) {
				const userError = `${localization.joinError}: ${getJoinErrorMessage(result.ErrorType)} ${result.Message ?? ''}`;
				appDispatch(userErrorChanged(userError));
				appDispatch(navigate({ navigation: { path: Path.Root }, saveState: true }));
				return;
			}

			await onlineActionCreators.initGameAsync(
				dispatch,
				appDispatch,
				dataContext.game,
				view.gameId,
				state.user.login,
				view.role,
				view.isAutomatic ?? false,
			);

			await disconnectAsync(appDispatch, dataContext);
		} else {
			appDispatch(navigate({ navigation: { path: Path.Root }, saveState: true }));
			return;
		}
	}

	if (view.path === Path.Root || view.path === Path.Menu) {
		await registerApp(dataContext.config.appRegistryServiceUri);
	}

	appDispatch(navigate({ navigation: view, saveState: true }));
};

const checkLicenseAsync = async (
	view: INavigationState,
	dispatch: Dispatch<Action>,
	appDispatch: AppDispatch,
	getState: () => State,
	dataContext: DataContext
) => {
	const licenseAccepted = dataContext.state.isLicenseAccepted();
	const defaultView = view.path === Path.About || view.path === Path.JoinByPin ? { path: Path.Menu } : view;

	await navigateAsync(
		licenseAccepted ? defaultView : { path: Path.AcceptLicense, callbackState: view },
		dispatch,
		appDispatch,
		getState,
		dataContext
	);
};

const init: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(initialView: INavigationState, appDispatch: AppDispatch) => async (
		dispatch: Dispatch<Action>,
		getState: () => State,
		dataContext: DataContext
	) => {
		try {
			if (initialView.path === Path.Login) {
				appDispatch(navigate({ navigation: { path: Path.Login, callbackState: { path: Path.Root } }, saveState: true }));
				return;
			} else if (initialView.path == Path.JoinRoom && initialView.gameId && initialView.hostUri) {
				try {
					const siHostClient = await connectToSIHostAsync(initialView.hostUri, dispatch, appDispatch, getState, dataContext);
					const gameInfo = await siHostClient.tryGetGameInfoAsync(initialView.gameId);

					if (gameInfo) {
						if (!gameInfo.HostUri) {
							gameInfo.HostUri = initialView.hostUri;
						}

						appDispatch(selectGame(gameInfo));
						appDispatch(navigate({ navigation: initialView, saveState: true }));
						return;
					} else {
						appDispatch(commonErrorChanged(`${localization.joinError}: ${localization.gameNotFound}`));
					}
				} catch (e) {
					appDispatch(commonErrorChanged(getErrorMessage(e)));
				}
			}

			const connectResult = await tryConnectAsync(dispatch, appDispatch, getState, dataContext);

			if (connectResult.success) {
				await checkLicenseAsync(initialView, dispatch, appDispatch, getState, dataContext);
			} else if (connectResult.authenticationRequired) {
				appDispatch(navigate({
					navigation: {
						path: Path.Login,
						callbackState: initialView.path === Path.About || initialView.path === Path.JoinByPin ? { path: Path.Menu } : initialView
					},
					saveState: true,
				}));
			} else {
				appDispatch(commonErrorChanged(connectResult.error ?? localization.errorHappened));
			}
		} finally {
			dataContext.state.onReady();
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
				appDispatch(endLogin());
				appDispatch(userErrorChanged(errorText));
				return;
			}

			saveStateToStorage(state);
			const connectResult = await tryConnectAsync(dispatch, appDispatch, getState, dataContext);

			if (connectResult.success) {
				appDispatch(changeLogin(state.user.login.trim())); // Normalize login
				appDispatch(endLogin());
				await checkLicenseAsync(state.ui.navigation.callbackState ?? { path: Path.Root }, dispatch, appDispatch, getState, dataContext);
			} else if (connectResult.authenticationRequired) {
				appDispatch(endLogin());
				appDispatch(userErrorChanged(connectResult.error ?? localization.errorHappened));
			} else {
				appDispatch(commonErrorChanged(connectResult.error ?? localization.errorHappened));
			}
		} catch (err) {
			appDispatch(endLogin());
			appDispatch(userErrorChanged(`${localization.cannotConnectToServer}: ${getErrorMessage(err)}`));
		}
	};

const onExit: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(appDispatch: AppDispatch) => async (dispatch: Dispatch<Action>, _getState: () => State, dataContext: DataContext) => {
	await disconnectAsync(appDispatch, dataContext);
	appDispatch(navigate({ navigation: { path: Path.Login }, saveState: true }));
};

const acceptLicense: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(appDispatch: AppDispatch) => async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		dataContext.state.acceptLicense();
		appDispatch(navigate({ navigation: getState().ui.navigation.callbackState ?? { path: Path.Root }, saveState: true }));
	};

const actionCreators = {
	init,
	reloadComputerAccounts,
	onAvatarSelectedLocal,
	sendAvatar,
	login,
	connectToSIHostAsync,
	closeSIHostClientAsync,
	disconnectAsync,
	onExit,
	acceptLicense,
};

export default actionCreators;
