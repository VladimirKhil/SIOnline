import { configureStore } from '@reduxjs/toolkit';
import * as signalR from '@microsoft/signalr';
import userReducer from './userSlice';
import loginReducer from './loginSlice';
import uiReducer from './uiSlice';
import online2Reducer from './online2Slice';
import gameReducer from './gameSlice';
import room2Reducer from './room2Slice';
import commonReducer from './commonSlice';
import tableReducer from './tableSlice';
import siPackagesReducer from './siPackagesSlice';
import settingsReducer from './settingsSlice';
import DataContext from '../model/DataContext';
import Config from '../Config';
import GameClient from '../client/game/GameClient';
import GameServerClient from '../client/GameServerClient';
import SIContentClient from 'sicontent-client';
import StateManager from '../utils/StateManager';
import SIHostClient from '../client/SIHostClient';

/* New version of store. Not used yet */

declare const config: Config;

let { serverUri } = config;

if (!serverUri) {
	serverUri = '';
}

const noOpHubConnection = new signalR.HubConnectionBuilder().withUrl('http://fake').build();
const gameClient = new GameServerClient();

const dataContext: DataContext = {
	config,
	serverUri,
	gameClient,
	game: new GameClient(new SIHostClient(noOpHubConnection, () => { }), false),
	contentUris: null,
	contentClient: new SIContentClient({ serviceUri: 'http://fake' }),
	storageClients: [],
	state: new StateManager(),
};

const store = configureStore({
	reducer: {
		user: userReducer,
		login: loginReducer,
		ui: uiReducer,
		online2: online2Reducer,
		game: gameReducer,
		room2: room2Reducer,
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