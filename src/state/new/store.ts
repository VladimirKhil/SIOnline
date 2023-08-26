import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import loginReducer from './loginSlice';
import uiReducer from './uiSlice';
import onlineReducer from './onlineSlice';
import gameReducer from './gameSlice';
import runReducer from './runSlice';
import commonReducer from './commonSlice';
import siPackagesReducer from './siPackagesSlice';
import settingsReducer from './settingsSlice';
import DataContext from '../../model/DataContext';
import DummyGameServerClient from '../../client/DummyGameServerClient';
import Config from '../Config';
import GameClient from '../../client/game/GameClient';

/* New version of store. Not used yet */

declare const config: Config;

let { serverUri } = config;

if (!serverUri) {
	serverUri = '';
}

const gameClient = new DummyGameServerClient();

const dataContext : DataContext = {
	config,
	serverUri,
	connection: null,
	gameClient,
	game: new GameClient(gameClient),
	contentUris: null,
	contentClient: null,
};

const store = configureStore({
	reducer: {
		user: userReducer,
		login: loginReducer,
		ui: uiReducer,
		online: onlineReducer,
		game: gameReducer,
		run: runReducer,
		common: commonReducer,
		siPackages: siPackagesReducer,
		settings: settingsReducer
	},
	middleware: (getDefaultMiddleware) => getDefaultMiddleware({
		thunk: {
			extraArgument: dataContext
		}
	})
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;