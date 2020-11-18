import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { applyMiddleware, createStore, Store } from 'redux';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import reduxThunk from 'redux-thunk';
import App from './components/App';
import State, { initialState } from './state/State';
import reducer from './state/reducer';
import SavedState, { loadState } from './state/SavedState';
import { KnownAction } from './state/Actions';
import actionCreators from './state/actionCreators';
import DataContext from './model/DataContext';
import Config from './state/Config';
import Constants from './model/enums/Constants';
import runActionCreators from './state/run/runActionCreators';
import localization from './model/resources/localization';
import ServerInfo from './model/server/ServerInfo';
import './utils/polyfills';

import './style.css';

declare const config: Config;

function setState(state: State, savedState: SavedState | null, gameId: string | null): State {
	if (!savedState) {
		return state;
	}

	return {
		...state,
		user: {
			...state.user,
			login: savedState.login
		},
		game: savedState.game ? {
			...state.game,
			name: savedState.game.name,
			password: savedState.game.password,
			role: savedState.game.role,
			type: savedState.game.type,
			playersCount: savedState.game.playersCount
		} : state.game,
		settings: savedState.settings ? {
			...state.settings,
			...savedState.settings
		} : state.settings,
		online: {
			...state.online,
			selectedGameId: gameId ? parseInt(gameId, 10) : -1
		}
	};
}

async function run() {
	document.title = localization.appTitle;

	if (!config) {
		throw new Error('Config is undefined!');
	}

	// Временно до перехода на HTTPS
	if (config.disableHttps && location.protocol !== 'http:') {
		location.replace(`http:${location.href.substring(location.protocol.length)}`);
	}

	let serverUri = config.serverUri;
	if (!serverUri) {
		const serverDiscoveryUri = config.serverDiscoveryUri;
		if (!serverDiscoveryUri) {
			throw new Error('Server uri is undefined!');
		}

		const serverUrisResponse = await fetch(serverDiscoveryUri);
		if (!serverUrisResponse.ok) {
			throw new Error(`Server discovery is broken! ${serverUrisResponse.status} ${await serverUrisResponse.text()}`);
		}

		const serverUris = (await serverUrisResponse.json()) as ServerInfo[];
		if (!serverUris || serverUris.length === 0) {
			throw new Error('Server uris object is broken!');
		}

		serverUri = serverUris[0].uri;
	}

	const urlParams = new URLSearchParams(window.location.search);
	const gameId = urlParams.get('gameId');

	const savedState = loadState();
	const state = setState(initialState, savedState, gameId);

	const dataContext: DataContext = {
		config,
		serverUri,
		connection: null,
		contentUris: null
	};

	const store = createStore<State, KnownAction, {}, {}>(
		reducer,
		state,
		applyMiddleware(reduxThunk.withExtraArgument(dataContext))
	);

	let currentSettings = state.settings;
	store.subscribe(() => {
		const newState = store.getState();
		const newSettings = newState.settings;
		if (newSettings !== currentSettings) {
			currentSettings = newSettings;
			actionCreators.saveStateToStorage(newState);
		}
	});

	subscribeToExternalEvents(store);

	ReactDOM.render(
		(
			<BrowserRouter>
				<Provider store={store}>
					<App ads={config.ads} />
				</Provider>
			</BrowserRouter>
		),
		document.getElementById('reactHost')
	);

	store.dispatch(actionCreators.navigateToLogin());
}

function subscribeToExternalEvents(store: Store<State, any>) {
	window.onresize = () => store.dispatch(actionCreators.windowWidthChanged(window.innerWidth));
	window.onpopstate = () => true;

	window.onkeydown = (e: KeyboardEvent) => {
		if (e.key === Constants.KEY_CTRL) {
			store.dispatch(runActionCreators.pressGameButton());
		}

		return true;
	};

	window.oncontextmenu = (e: MouseEvent) => {
		store.dispatch(runActionCreators.pressGameButton());
		e.preventDefault();
		return true;
	};
}

run();
