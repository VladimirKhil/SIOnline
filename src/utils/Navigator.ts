import IGameServerClient from '../client/IGameServerClient';
import Config from '../Config';
import DataContext from '../model/DataContext';
import Path from '../model/enums/Path';
import { loadLobby } from '../state/online2Slice';
import { AppDispatch, RootState } from '../state/store';
import { INavigationState, navigateCore } from '../state/uiSlice';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { activeConnections, attachListeners, detachListeners, removeConnection } from './ConnectionHelpers';
import { userErrorChanged } from '../state/commonSlice';
import localization from '../model/resources/localization';
import getErrorMessage from './ErrorHelpers';

declare const config: Config;

function saveNavigationState(navigation: INavigationState, dataContext: DataContext, replaceState: boolean) {
	if (window.history.length === 0 || !window.history.state || (window.history.state as INavigationState).path !== navigation.path) {
		if (navigation.path === Path.Room && navigation.gameId) {
			let gameLink = null;

			if (config.siHostsIdUriMap) {
				for (const [key, value] of Object.entries(config.siHostsIdUriMap)) {
					if (value === navigation.hostUri) {
						gameLink = '_' + key + navigation.gameId;
						break;
					}
				}
			}

			if (!gameLink) {
				gameLink = `gameId=${navigation.gameId}&host=${encodeURIComponent(navigation.hostUri ?? '')}`;
			}

			dataContext.state.saveNavigationState(
				navigation,
				dataContext.config.rewriteUrl ? `${dataContext.config.rootUri}?${gameLink}` : null,
				replaceState,
			);
		} else {
			dataContext.state.saveNavigationState(
				navigation,
				dataContext.config.rewriteUrl ? dataContext.config.rootUri : null,
				replaceState,
			);
		}
	}
}

const connectToSIGameServerAsync = async (gameServerClient: IGameServerClient, appDispatch: AppDispatch): Promise<boolean> => {
	if (gameServerClient.isConnected()) {
		return true;
	}

	try {
		await gameServerClient.connect();
	} catch (error: any) {
		return false;
	}

	try {
		if (gameServerClient.connection.connectionId) {
			activeConnections.push(gameServerClient.connection.connectionId);
		}

		// Listeners should be attached after first successfull request to be sure that connection is working
		attachListeners(gameServerClient, appDispatch);
		return true;
	} catch (error) {
		return false;
	}
};

const disconnectFromGameServerAsync = async (gameServerClient: IGameServerClient, appDispatch: AppDispatch) => {
	const { connection } = gameServerClient;

	if (!connection) {
		return;
	}

	try {
		if (connection.connectionId) {
			activeConnections.splice(activeConnections.indexOf(connection.connectionId), 1);
		}

		detachListeners(connection);
		await gameServerClient.disconnect();
		removeConnection(connection);
	} catch (error) {
		appDispatch(userErrorChanged(getErrorMessage(error)) as any);
	}
};

export const navigate = createAsyncThunk(
	'global/navigate',
	async (arg: { navigation: INavigationState, saveState: boolean, replaceState?: boolean }, thunkAPI) => {
		const { navigation } = arg;

		if (arg.saveState) {
			saveNavigationState(arg.navigation, thunkAPI.extra as DataContext, arg.replaceState ?? false);
		}

		let nav: INavigationState;

		const previousPath = (thunkAPI.getState() as RootState).ui.navigation.path;

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
					thunkAPI.dispatch as AppDispatch);

				if (!connectionResult) {
					thunkAPI.dispatch(userErrorChanged(localization.cannotConnectToServer));
				}

				thunkAPI.dispatch(loadLobby());
				break;

			default:
				if (previousPath === Path.Lobby) {
					await disconnectFromGameServerAsync((thunkAPI.extra as DataContext).gameClient, thunkAPI.dispatch as AppDispatch);
				}

				break;
		}
	}
);
