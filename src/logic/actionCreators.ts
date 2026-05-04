import { Action, Dispatch, ActionCreator, AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import State from '../state/State';
import DataContext from '../model/DataContext';

import 'es6-promise/auto';
import localization from '../model/resources/localization';

import Constants from '../model/enums/Constants';

import getErrorMessage from '../utils/ErrorHelpers';
import { getFullCulture } from '../utils/StateHelpers';
import GameClient from '../client/game/GameClient';

import { SIContentServiceError } from 'sicontent-client';
import ClientController from './ClientController';
import Path from '../model/enums/Path';
import Sex from '../model/enums/Sex';
import onlineActionCreators from '../state/online/onlineActionCreators';
import { AppDispatch } from '../state/store';
import SIHostClient from '../client/SIHostClient';
import ISIHostClient from '../client/ISIHostClient';
import Role from '../model/Role';
import ServerRole from '../client/contracts/ServerRole';
import ServerSex from '../client/contracts/ServerSex';
import WellKnownSIContentServiceErrorCode from 'sicontent-client/dist/models/WellKnownSIContentServiceErrorCode';
import { getJoinErrorMessage } from '../utils/GameErrorsHelper';
import { selectGame } from '../state/online2Slice';
import { setAvatarKey } from '../state/settingsSlice';

import {
	avatarLoadEnd,
	avatarLoadError,
	avatarLoadStart,
	commonErrorChanged,
	computerAccountsChanged,
	userErrorChanged,
	isSIHostConnectedChanged,
} from '../state/commonSlice';

import { changeAvatar, changeLogin } from '../state/userSlice';
import { saveStateToStorage } from '../state/StateHelpers';
import { INavigationState } from '../state/uiSlice';
import { navigate } from '../utils/Navigator';
import SIHostListener from '../utils/SIHostListener';
import { ensureServerInfoLoadedAsync } from './ServerInitializer';

async function uploadAvatarAsync(appDispatch: AppDispatch, dataContext: DataContext) {
	if (typeof localStorage === 'undefined') {
		return;
	}

	const base64 = localStorage.getItem(Constants.AVATAR_KEY);
	const fileName = localStorage.getItem(Constants.AVATAR_NAME_KEY);

	if (!base64 || !fileName) {
		return;
	}

	appDispatch(avatarLoadStart());

	try {
		const data = Uint8Array.from(window.atob(base64), c => c.charCodeAt(0));

		const { buffer } = data;

		const { contentClients } = dataContext;

		if (!contentClients || contentClients.length === 0) {
			console.log('No SIContent service available for avatar upload');
			appDispatch(avatarLoadEnd());
			return;
		}

		const contentIndex = Math.floor(Math.random() * contentClients.length);
		const contentClient = contentClients[contentIndex];

		const avatarUri2 = await contentClient.uploadAvatarIfNotExistAsync(fileName, new Blob([buffer]));

		const fullAvatarUri2 = avatarUri2.startsWith('/')
			? contentClient.options.serviceUri + avatarUri2.substring(1)
			: avatarUri2;

		appDispatch(avatarLoadEnd());
		appDispatch(changeAvatar(fullAvatarUri2));
	} catch (err) {
		const errorMessage = getErrorMessage(err);

		const userError = (err as SIContentServiceError).errorCode === WellKnownSIContentServiceErrorCode.FileTooLarge
			? localization.fileIsTooBig
			: errorMessage;

		appDispatch(userErrorChanged(localization.avatarLoadError + ': ' + userError) as any);
		appDispatch(avatarLoadError(errorMessage));
	}
}

const onAvatarSelectedLocal: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(avatar: File, appDispatch: AppDispatch) => async (_dispatch: Dispatch<AnyAction>, getState: () => State, dataContext: DataContext) => {
		try {
			const buffer = await avatar.arrayBuffer();
			const base64 = window.btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));

			const key = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString();

			localStorage.setItem(Constants.AVATAR_KEY, base64);
			localStorage.setItem(Constants.AVATAR_NAME_KEY, avatar.name);

			appDispatch(setAvatarKey(key));
			await uploadAvatarAsync(appDispatch, dataContext);

			const state = getState();

			if (state.ui.navigation.path === Path.Room && state.user.avatar) {
				await dataContext.game.sendImageAvatar(state.user.avatar);
			}
		} catch (error) {
			appDispatch(userErrorChanged(getErrorMessage(error)) as any);
		}
	};

const reloadComputerAccounts: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(appDispatch: AppDispatch) => async (_dispatch: Dispatch<Action>, getState: () => State, dataContext: DataContext) => {
		const state = getState();
		const requestCulture = getFullCulture(state);

		const computerAccounts = await dataContext.gameClient.getComputerAccountsAsync(requestCulture);
		appDispatch(computerAccountsChanged(computerAccounts));
	};

const connectToSIHostAsync = async (
	siHostUri: string,
	dispatch: Dispatch<Action>,
	appDispatch: AppDispatch,
	getState: () => State,
	dataContext: DataContext
): Promise<ISIHostClient> => {
	await dataContext.game.leaveGame();
	const state = getState();
	const { useProxy2 } = state.settings;

	// Use proxy if enabled and proxy URI is available
	const useProxy = useProxy2 && !!dataContext.proxyUri && siHostUri === dataContext.serverUri;
	const effectiveUri = useProxy ? dataContext.proxyUri! : siHostUri;
	const uriChecked = effectiveUri.endsWith('/') ? effectiveUri : effectiveUri + '/';

	const controller = new ClientController(dispatch, appDispatch, getState, dataContext);
	const listener = new SIHostListener(controller, dispatch, appDispatch);

	let siHostClient = new SIHostClient();
	try {
		await siHostClient.connectAsync(uriChecked, listener);
		appDispatch(isSIHostConnectedChanged({ isConnected: true, reason: '' }));
	} catch (e) {
		if (useProxy) {
			console.log('Cannot connect to SIHost via proxy, falling back to original: ' + getErrorMessage(e));
			const fallbackUri = siHostUri.endsWith('/') ? siHostUri : siHostUri + '/';
			await siHostClient.disconnectAsync(); // ensure old loops are dead

			siHostClient = new SIHostClient();
			await siHostClient.connectAsync(fallbackUri, listener);
			appDispatch(isSIHostConnectedChanged({ isConnected: true, reason: '' }));
		} else if (siHostUri === dataContext.proxyUri) {
			console.log('Cannot connect to SIHost (proxy server), falling back to original: ' + getErrorMessage(e));
			const fallbackUri = dataContext.serverUri;
			await siHostClient.disconnectAsync();

			siHostClient = new SIHostClient();
			await siHostClient.connectAsync(fallbackUri, listener);
			appDispatch(isSIHostConnectedChanged({ isConnected: true, reason: '' }));
		} else {
			throw e;
		}
	}

	dataContext.game = new GameClient(siHostClient);

	return siHostClient;
};

function getServerRole(role: Role) {
	if (role === Role.Viewer) {
		return ServerRole.Viewer;
	}

	return role === Role.Player ? ServerRole.Player : ServerRole.Showman;
}

const finishInitializationAsync = (
	targetView: INavigationState,
) => async (
	dispatch: Dispatch<Action>,
	appDispatch: AppDispatch,
	getState: () => State,
	dataContext: DataContext
) => {
		const state = getState();
		const { login } = state.user;

		// 1. Guard: Login
		if (login === null || login === '') {
			appDispatch(navigate({
				navigation: {
					path: Path.Login,
					callbackState: targetView.path === Path.About || targetView.path === Path.JoinByPin ? { path: Path.Menu } : targetView
				},
				saveState: true,
			}));
			return;
		}

		// 2. Guard: License
		const licenseAccepted = dataContext.host.isLicenseAccepted();
		if (targetView.path === Path.Room && !licenseAccepted) {
			appDispatch(navigate({ navigation: { path: Path.AcceptLicense, callbackState: targetView }, saveState: true }));
			return;
		}

		// 3. Setup: Server Info (for deep links)
		let { hostUri } = targetView;
		if (targetView.path === Path.JoinRoom || targetView.path === Path.Room) {
			await ensureServerInfoLoadedAsync(appDispatch, getState, dataContext);

			if (targetView.path === Path.JoinRoom && targetView.gameId && targetView.siHostKey) {
				hostUri = (getState() as State).common.siHosts[targetView.siHostKey];
			}
		}

		// 4. Execution: Navigation or Joining
		if (targetView.path === Path.Room) {
			if (targetView.gameId && targetView.role !== undefined && hostUri) {
				const siHostClient = await connectToSIHostAsync(hostUri, dispatch, appDispatch, getState, dataContext);
				const result = await siHostClient.joinGameAsync({
					GameId: targetView.gameId,
					UserName: (getState() as State).user.login,
					Role: getServerRole(targetView.role),
					Sex: targetView.sex === Sex.Male ? ServerSex.Male : ServerSex.Female,
					Password: targetView.password ?? '',
					Pin: targetView.pin ?? null,
				});

				if (!result.IsSuccess) {
					const userError = `${localization.joinError}: ${getJoinErrorMessage(result.ErrorType)} ${result.Message ?? ''}`;
					appDispatch(userErrorChanged(userError));
					await dataContext.game.leaveGame();
					appDispatch(navigate({ navigation: { path: Path.Root }, saveState: true }));
					return;
				}

				await onlineActionCreators.initGameAsync(
					dispatch,
					appDispatch,
					dataContext.game,
					targetView.gameId,
					(getState() as State).user.login,
					targetView.role,
					targetView.isAutomatic ?? false,
				);
			} else {
				appDispatch(navigate({ navigation: { path: Path.Root }, saveState: true }));
				return;
			}
		} else if (targetView.path === Path.JoinRoom && targetView.gameId && hostUri) {
			try {
				const siHostClient = await connectToSIHostAsync(hostUri, dispatch, appDispatch, getState, dataContext);
				const gameInfo = await siHostClient.tryGetGameInfoAsync(targetView.gameId);

				if (gameInfo) {
					if (!gameInfo.HostUri) {
						gameInfo.HostUri = hostUri;
					}

					appDispatch(selectGame(gameInfo));
					appDispatch(navigate({ navigation: targetView, saveState: true }));
					return;
				} else {
					appDispatch(commonErrorChanged(`${localization.joinError}: ${localization.gameNotFound}`));
				}
			} catch (e) {
				appDispatch(commonErrorChanged(getErrorMessage(e)));
			}
		}

		if (targetView.path === Path.SIQuesterPackage && !(getState() as State).siquester.zip) {
			appDispatch(navigate({ navigation: { path: Path.SIQuester }, saveState: true }));
			return;
		}

		appDispatch(navigate({ navigation: targetView, saveState: true, replaceState: true }));
	};

const initStageSkipLoginLicenseAsync: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(view: INavigationState, appDispatch: AppDispatch) => async (
		dispatch: Dispatch<Action>,
		getState: () => State,
		dataContext: DataContext
	) => {
		await finishInitializationAsync(view)(dispatch, appDispatch, getState, dataContext);
	};

const initStage0: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(initialView: INavigationState, appDispatch: AppDispatch) => async (
		dispatch: Dispatch<Action>,
		getState: () => State,
		dataContext: DataContext
	) => {
		if (initialView.path === Path.Login) {
			appDispatch(navigate({ navigation: { path: Path.Login, callbackState: { path: Path.Root } }, saveState: true }));
			return;
		}

		await finishInitializationAsync(initialView)(dispatch, appDispatch, getState, dataContext);
	};

const login: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(appDispatch: AppDispatch) => async (dispatch: Dispatch<Action>, getState: () => State, dataContext: DataContext) => {
		const state = getState();

		saveStateToStorage(state);
		appDispatch(changeLogin(state.user.login.trim())); // Normalize login

		await finishInitializationAsync(state.ui.navigation.callbackState ?? { path: Path.Root })(dispatch, appDispatch, getState, dataContext);
	};

const acceptLicense: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(appDispatch: AppDispatch) => async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		dataContext.host.acceptLicense();

		await finishInitializationAsync(
			getState().ui.navigation.callbackState ?? { path: Path.Root }
		)(dispatch, appDispatch, getState, dataContext);
	};

const actionCreators = {
	initStage0,
	initStageSkipLoginLicenseAsync,
	reloadComputerAccounts,
	onAvatarSelectedLocal,
	login,
	connectToSIHostAsync,
	acceptLicense,
};

export default actionCreators;
