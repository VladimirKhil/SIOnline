import IGameServerClient from '../client/IGameServerClient';
import DataContext from '../model/DataContext';
import Path from '../model/enums/Path';
import { loadLobby } from '../state/online2Slice';
import { AppDispatch, RootState } from '../state/store';
import { INavigationState, navigateCore } from '../state/uiSlice';
import { createAsyncThunk } from '@reduxjs/toolkit';
import GameServerListener from './GameServerListener';
import { userErrorChanged } from '../state/commonSlice';
import localization from '../model/resources/localization';
import getErrorMessage from './ErrorHelpers';
import onlineActionCreators from '../state/online/onlineActionCreators';
import Role from '../model/Role';
import DemoGameClient from './DemoGameClient';
import ClientController from '../logic/ClientController';
import State from '../state/State';
import { showText } from '../state/tableSlice';

function saveNavigationState(navigation: INavigationState, dataContext: DataContext, siHosts: Record<string, string>, replaceState: boolean) {
	if (typeof window === 'undefined') {
		return;
	}

	if (window.history.length === 0 || !window.history.state || (window.history.state as INavigationState).path !== navigation.path) {
		if (navigation.path === Path.Room && navigation.gameId) {
			let gameLink = null;

			for (const [key, value] of Object.entries(siHosts)) {
				if (value === navigation.hostUri) {
					gameLink = '_' + key + navigation.gameId;
					break;
				}
			}

			if (!gameLink) {
				gameLink = `gameId=${navigation.gameId}&host=${encodeURIComponent(navigation.hostUri ?? '')}`;
			}

			dataContext.host.saveNavigationState(
				navigation,
				dataContext.config.rewriteUrl ? `${dataContext.config.rootUri}?${gameLink}` : null,
				replaceState,
			);
		} else {
			dataContext.host.saveNavigationState(
				navigation,
				dataContext.config.rewriteUrl ? dataContext.config.rootUri : null,
				replaceState,
			);
		}
	}
}

const connectToSIGameServerAsync = async (
	gameServerClient: IGameServerClient,
	appDispatch: AppDispatch,
	state: RootState,
	dataContext: DataContext
): Promise<boolean> => {
	if (gameServerClient.isConnected()) {
		return true;
	}

	const { useProxy } = state.settings;
	const runtimeUri = useProxy && dataContext.proxyUri ? dataContext.proxyUri : dataContext.serverUri;
	const listener = new GameServerListener(appDispatch);

	try {
		await gameServerClient.connect(runtimeUri, listener);
		return true;
	} catch (error: unknown) {
		console.log('Cannot connect to SIGame Server: ' + getErrorMessage(error));
		return false;
	}
};

const disconnectFromGameServerAsync = async (gameServerClient: IGameServerClient, appDispatch: AppDispatch) => {
	try {
		await gameServerClient.disconnect();
	} catch (error) {
		appDispatch(userErrorChanged(getErrorMessage(error)) as any);
	}
};

export const navigate = createAsyncThunk(
	'global/navigate',
	async (arg: { navigation: INavigationState, saveState: boolean, replaceState?: boolean }, thunkAPI) => {
		const { navigation } = arg;
		const state = thunkAPI.getState() as RootState;

		if (arg.saveState) {
			saveNavigationState(
				arg.navigation,
				thunkAPI.extra as DataContext,
				state.common.siHosts,
				arg.replaceState ?? false);
		}

		let nav: INavigationState;

		const previousPath = state.ui.navigation.path;

		if (navigation.path === Path.Room) {
			nav = { ...navigation, returnToLobby: previousPath === Path.Lobby };
		} else {
			nav = navigation;
		}

		thunkAPI.dispatch(navigateCore(nav));

		switch (nav.path) {
			case Path.Lobby:
				const connectionResult = await connectToSIGameServerAsync(
					(thunkAPI.extra as DataContext).gameClient,
					thunkAPI.dispatch as AppDispatch,
					thunkAPI.getState() as RootState,
					thunkAPI.extra as DataContext,
				);

				if (!connectionResult) {
					thunkAPI.dispatch(userErrorChanged(localization.cannotConnectToServer));
				}

				thunkAPI.dispatch(loadLobby());
				break;

			case Path.Demo:
				const controller = new ClientController(
					thunkAPI.dispatch,
					thunkAPI.dispatch as AppDispatch,
					() => thunkAPI.getState() as State,
					thunkAPI.extra as DataContext,
				);

				const gameClient = new DemoGameClient(controller, () => thunkAPI.getState() as State);
				(thunkAPI.extra as DataContext).game = gameClient;

				await onlineActionCreators.initGameAsync(
					thunkAPI.dispatch,
					thunkAPI.dispatch as AppDispatch,
					gameClient,
					-1,
					state.user.login,
					Role.Player,
					false,
					false,
				);

				thunkAPI.dispatch(showText(localization.demoWelcome));
				break;

			default:
				if (previousPath === Path.Lobby) {
					await disconnectFromGameServerAsync((thunkAPI.extra as DataContext).gameClient, thunkAPI.dispatch as AppDispatch);
				}

				break;
		}
	}
);
