import { configureStore } from '@reduxjs/toolkit';
import * as signalR from '@microsoft/signalr';
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
import Config from '../Config';
import GameClient from '../../client/game/GameClient';
import GameServerClient from '../../client/GameServerClient';
import SIContentClient from 'sicontent-client';

/* New version of store. Not used yet */

declare const config: Config;

let { serverUri } = config;

if (!serverUri) {
	serverUri = '';
}

const noOpHubConnection = new signalR.HubConnectionBuilder().withUrl('http://fake').build();

const gameClient = new GameServerClient(noOpHubConnection, () => { });

const dataContext : DataContext = {
	config,
	serverUri,
	connection: null,
	gameClient,
	game: new GameClient(gameClient),
	contentUris: null,
	contentClient: new SIContentClient({ serviceUri: 'http://fake' }),
	storageClient: null,
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