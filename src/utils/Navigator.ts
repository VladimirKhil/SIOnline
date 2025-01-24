import Config from '../Config';
import DataContext from '../model/DataContext';
import Path from '../model/enums/Path';
import { loadLobby } from '../state/online2Slice';
import { RootState } from '../state/store';
import { INavigationState, navigateCore } from '../state/uiSlice';
import { createAsyncThunk } from '@reduxjs/toolkit';

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

export const navigate = createAsyncThunk(
	'global/navigate',
	async (arg: { navigation: INavigationState, saveState: boolean, replaceState?: boolean }, thunkAPI) => {
		const { navigation } = arg;

		if (arg.saveState) {
			saveNavigationState(arg.navigation, thunkAPI.extra as DataContext, arg.replaceState ?? false);
		}

		let nav: INavigationState;

		if (navigation.path === Path.Room) {
			nav = { ...navigation, returnToLobby: (thunkAPI.getState() as RootState).ui.navigation.path === Path.Lobby };
		} else {
			nav = navigation;
		}

		thunkAPI.dispatch(navigateCore(nav));

		switch (nav.path) {
			case Path.Lobby:
				thunkAPI.dispatch(loadLobby());
				break;

			default:
				break;
		}
	}
);
