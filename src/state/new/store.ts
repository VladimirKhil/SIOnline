import { configureStore } from '@reduxjs/toolkit';
import * as signalR from '@microsoft/signalr';
import userReducer from './userSlice';
import loginReducer from './loginSlice';
import uiReducer from './uiSlice';
import onlineReducer from './onlineSlice';
import gameReducer from './gameSlice';
import roomReducer from './roomSlice';
import commonReducer from './commonSlice';
import tableReducer from './tableSlice';
import siPackagesReducer from './siPackagesSlice';
import settingsReducer from './settingsSlice';
import DataContext from '../../model/DataContext';
import Config from '../Config';
import GameClient from '../../client/game/GameClient';
import GameServerClient from '../../client/GameServerClient';
import SIContentClient from 'sicontent-client';
import { gameSoundPlayer } from '../../utils/GameSoundPlayer';

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
	soundPlayer: gameSoundPlayer,
};

const store = configureStore({
	reducer: {
		user: userReducer,
		login: loginReducer,
		ui: uiReducer,
		online: onlineReducer,
		game: gameReducer,
		room: roomReducer,
		common: commonReducer,
		siPackages: siPackagesReducer,
		settings: settingsReducer,
		table: tableReducer,
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