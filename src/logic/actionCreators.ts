import { Action, Dispatch, ActionCreator, AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import State from '../state/State';
import DataContext from '../model/DataContext';

import 'es6-promise/auto';
import localization from '../model/resources/localization';

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
	serverInfoChanged,
	userErrorChanged,
} from '../state/commonSlice';

import { changeAvatar, changeLogin } from '../state/userSlice';
import { saveStateToStorage } from '../state/StateHelpers';
import { INavigationState } from '../state/uiSlice';
import { navigate } from '../utils/Navigator';
import registerApp from '../utils/registerApp';
import { setStorages } from '../state/siPackagesSlice';
import SIStorageInfo from '../client/contracts/SIStorageInfo';
import SIHostListener from '../utils/SIHostListener';

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

const sendAvatar: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (_dispatch: Dispatch<AnyAction>, getState: () => State, dataContext: DataContext) => {
	const { avatar } = getState().user;

	if (avatar) {
		await dataContext.game.sendAvatar(avatar);
	}
};

const reloadComputerAccounts: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(appDispatch: AppDispatch) => async (_dispatch: Dispatch<Action>, getState: () => State, dataContext: DataContext) => {
	const state = getState();
	const requestCulture = getFullCulture(state);

	const computerAccounts = await dataContext.gameClient.getComputerAccountsAsync(requestCulture);
	appDispatch(computerAccountsChanged(computerAccounts));
};

function createStorageClientFromInfo(storageInfo: SIStorageInfo): SIStorageClient {
	return new SIStorageClient({
		serviceUri: storageInfo.serviceUri,
	});
}

async function loadHostInfoAsync(appDispatch: AppDispatch, dataContext: DataContext, culture: string) {
	const hostInfo = await dataContext.gameClient.getGameHostInfoAsync(culture);
	// eslint-disable-next-line no-param-reassign
	dataContext.contentUris = hostInfo.contentPublicBaseUrls;

	const { contentInfos, storageInfos } = hostInfo;

	if (contentInfos && contentInfos.length > 0) {
		dataContext.contentClients = contentInfos.map(info => new SIContentClient({
			serviceUri: info.serviceUri,
		}));
	} else {
		throw new Error('No SIContent service found');
	}

	dataContext.storageClients = storageInfos.map(createStorageClientFromInfo);
	const { storageClient, storageInfo } = dataContext.host.getStorage();

	if (storageClient && storageInfo) {
		dataContext.storageClients.push(storageClient);
		storageInfos.push(storageInfo);
	}

	appDispatch(setStorages(storageInfos));

	appDispatch(serverInfoChanged({
		serverName: hostInfo.name,
		serverLicense: hostInfo.license,
		maxPackageSizeMb: hostInfo.maxPackageSizeMb,
		siHosts: hostInfo.siHosts,
	}));
}

const connectToSIHostAsync = async (
	siHostUri: string,
	dispatch: Dispatch<Action>,
	appDispatch: AppDispatch,
	getState: () => State,
	dataContext: DataContext
): Promise<ISIHostClient> => {
	const state = getState();
	const { useProxy } = state.settings;

	// Use proxy if enabled and proxy URI is available
	const effectiveUri = useProxy && dataContext.proxyUri && siHostUri === dataContext.serverUri ? dataContext.proxyUri : siHostUri;
	const uriChecked = effectiveUri.endsWith('/') ? effectiveUri : effectiveUri + '/';

	const controller = new ClientController(dispatch, appDispatch, getState, dataContext);
	const listener = new SIHostListener(controller, dispatch, appDispatch);

	const siHostClient = new SIHostClient();
	await siHostClient.connectAsync(uriChecked, listener);

	dataContext.game = new GameClient(siHostClient);

	return siHostClient;
};

function getServerRole(role: Role) {
	if (role === Role.Viewer) {
		return ServerRole.Viewer;
	}

	return role === Role.Player ? ServerRole.Player : ServerRole.Showman;
}

const initStage3NavigateAsync = async (
	view: INavigationState,
	dispatch: Dispatch<Action>,
	appDispatch: AppDispatch,
	getState: () => State,
	dataContext: DataContext,
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
		} else {
			appDispatch(navigate({ navigation: { path: Path.Root }, saveState: true }));
			return;
		}
	}

	if (view.path === Path.Root || view.path === Path.Menu) {
		await registerApp(dataContext.config.appRegistryServiceUri);
	}

	if (view.path === Path.SIQuesterPackage && !getState().siquester.zip) {
		appDispatch(navigate({ navigation: { path: Path.SIQuester }, saveState: true }));
		return;
	}

	appDispatch(navigate({ navigation: view, saveState: true, replaceState: true }));
};

const connectToServerAsync = async (
	appDispatch: AppDispatch,
	getState: () => State,
	dataContext: DataContext
) => {
	const state = getState();

	const requestCulture = getFullCulture(state);

	const computerAccounts = await dataContext.gameClient.getComputerAccountsAsync(requestCulture);
	appDispatch(computerAccountsChanged(computerAccounts));

	await loadHostInfoAsync(appDispatch, dataContext, requestCulture);
	await uploadAvatarAsync(appDispatch, dataContext);

	dataContext.host.onReady();
};

const initStage2CompleteInitializaionAsync = async (
	initialView: INavigationState,
	dispatch: Dispatch<Action>,
	appDispatch: AppDispatch,
	getState: () => State,
	dataContext: DataContext,
) => {
	let { hostUri } = initialView;

	if (initialView.path == Path.JoinRoom && initialView.gameId && initialView.siHostKey) {
		hostUri = getState().common.siHosts[initialView.siHostKey];
	}

	if (initialView.path == Path.JoinRoom && initialView.gameId && hostUri) {
		try {
			const siHostClient = await connectToSIHostAsync(hostUri, dispatch, appDispatch, getState, dataContext);
			const gameInfo = await siHostClient.tryGetGameInfoAsync(initialView.gameId);

			if (gameInfo) {
				if (!gameInfo.HostUri) {
					gameInfo.HostUri = hostUri;
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

	await initStage3NavigateAsync(initialView, dispatch, appDispatch, getState, dataContext);
};

const initStage1CheckLicenseAsync = async (
	view: INavigationState,
	dispatch: Dispatch<Action>,
	appDispatch: AppDispatch,
	getState: () => State,
	dataContext: DataContext
) => {
	await connectToServerAsync(appDispatch, getState, dataContext);
	const licenseAccepted = dataContext.host.isLicenseAccepted();

	if (!licenseAccepted) {
		appDispatch(navigate({ navigation: { path: Path.AcceptLicense, callbackState: view }, saveState: true }));
		return;
	}

	await initStage2CompleteInitializaionAsync(view, dispatch, appDispatch, getState, dataContext);
};

const initStageSkipLoginLicenseAsync: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(view: INavigationState, appDispatch: AppDispatch) => async (
		dispatch: Dispatch<Action>,
		getState: () => State,
		dataContext: DataContext
	) => {
		await connectToServerAsync(appDispatch, getState, dataContext);
		await initStage2CompleteInitializaionAsync(view, dispatch, appDispatch, getState, dataContext);
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

		const state = getState();
		const { login } = state.user;

		if (login === null || login === '') {
			appDispatch(navigate({
				navigation: {
					path: Path.Login,
					callbackState: initialView.path === Path.About || initialView.path === Path.JoinByPin ? { path: Path.Menu } : initialView
				},
				saveState: true,
			}));

			return;
		}

		await initStage1CheckLicenseAsync(initialView, dispatch, appDispatch, getState, dataContext);
	};

const login: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(appDispatch: AppDispatch) => async (dispatch: Dispatch<Action>, getState: () => State, dataContext: DataContext) => {
		const state = getState();

		saveStateToStorage(state);
		appDispatch(changeLogin(state.user.login.trim())); // Normalize login

		await initStage1CheckLicenseAsync(state.ui.navigation.callbackState ?? { path: Path.Root }, dispatch, appDispatch, getState, dataContext);
	};

const acceptLicense: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(appDispatch: AppDispatch) => async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		dataContext.host.acceptLicense();

		await initStage2CompleteInitializaionAsync(
			getState().ui.navigation.callbackState ?? { path: Path.Root },
			dispatch,
			appDispatch,
			getState,
			dataContext,
		);
	};

const actionCreators = {
	initStage0,
	initStageSkipLoginLicenseAsync,
	reloadComputerAccounts,
	onAvatarSelectedLocal,
	sendAvatar,
	login,
	connectToSIHostAsync,
	acceptLicense,
};

export default actionCreators;
