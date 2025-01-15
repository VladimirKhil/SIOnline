import DataContext from '../model/DataContext';
import Path from '../model/enums/Path';
import { loadLobby } from '../state/online2Slice';
import { RootState } from '../state/store';
import { INavigationState, navigateCore } from '../state/uiSlice';
import onlineActionCreators from '../state/online/onlineActionCreators';
import { createAsyncThunk, UnknownAction } from '@reduxjs/toolkit';

function saveNavigationState(navigation: INavigationState, dataContext: DataContext) {
	if (window.history.length === 0 || !window.history.state || (window.history.state as INavigationState).path !== navigation.path) {
		if (navigation.path === Path.Room && navigation.gameId) {
			dataContext.state.saveNavigationState(
				navigation,
				dataContext.config.rewriteUrl
					? `${dataContext.config.rootUri}?gameId=${navigation.gameId}&host=${encodeURIComponent(navigation.hostUri ?? '')}`
					: null
			);
		} else {
			dataContext.state.saveNavigationState(navigation, dataContext.config.rewriteUrl ? dataContext.config.rootUri : null);
		}
	}
}

export const navigate = createAsyncThunk(
	'global/navigate',
	async (arg: { navigation: INavigationState, saveState: boolean }, thunkAPI) => {
		const { navigation } = arg;

		if (arg.saveState) {
			saveNavigationState(arg.navigation, thunkAPI.extra as DataContext);
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
