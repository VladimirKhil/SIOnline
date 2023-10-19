import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AnyAction, applyMiddleware, createStore, Store } from 'redux';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import reduxThunk from 'redux-thunk';
import App from './components/App';
import State, { initialState } from './state/State';
import reducer from './state/reducer';
import SavedState, { loadState } from './state/SavedState';
import actionCreators from './state/actionCreators';
import DataContext from './model/DataContext';
import Config from './state/Config';
import roomActionCreators from './state/room/roomActionCreators';
import localization from './model/resources/localization';
import ServerInfo from './model/server/ServerInfo';
import DummyGameServerClient from './client/DummyGameServerClient';
import GameClient from './client/game/GameClient';
import { FirebaseApp, FirebaseOptions, initializeApp } from 'firebase/app';
import { Analytics, getAnalytics } from 'firebase/analytics';
import { ErrorView } from './components/ErrorView';
import Constants from './model/enums/Constants';
import settingsActionCreators from './state/settings/settingsActionCreators';
import MainView from './model/enums/MainView';
import getErrorMessage from './utils/ErrorHelpers';
import commonActionCreators from './state/common/commonActionCreators';
import enableNoSleep from './utils/NoSleepHelper';
import uiActionCreators from './state/ui/uiActionCreators';
import getDeviceType from './utils/getDeviceType';
import isSafari from './utils/isSafari';

import './utils/polyfills';
import './style.css';

declare const config: Config | undefined;
declare const firebaseConfig: FirebaseOptions | undefined;

export let app: FirebaseApp | null = null;
export let analytics: Analytics | null = null;

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
			playersCount: savedState.game.playersCount,
			humanPlayersCount: savedState.game.humanPlayersCount || 0
		} : state.game,
		settings: savedState.settings ? {
			...state.settings,
			...savedState.settings,
			appSettings: {
				...savedState.settings.appSettings,
				timeSettings: savedState.settings.appSettings.timeSettings || state.settings.appSettings.timeSettings,
				readingSpeed: savedState.settings.appSettings.readingSpeed || state.settings.appSettings.readingSpeed,
				preloadRoundContent: savedState.settings.appSettings.preloadRoundContent ?? true,
				useApellations: savedState.settings.appSettings.useApellations ?? true,
				allowEveryoneToPlayHiddenStakes: savedState.settings.appSettings.allowEveryoneToPlayHiddenStakes ?? true,
				oralPlayersActions: savedState.settings.appSettings.oralPlayersActions ?? true,
			},
			gameButtonKey: savedState.settings.gameButtonKey || Constants.KEY_CTRL
		} : state.settings,
		online: {
			...state.online,
			selectedGameId: gameId ? parseInt(gameId, 10) : -1
		}
	};
}

function subscribeToExternalEvents(store: Store<State, any>) {
	window.onresize = () => store.dispatch(uiActionCreators.windowSizeChanged(window.innerWidth, window.innerHeight));
	window.onpopstate = () => true;

	window.onkeydown = (e: KeyboardEvent) => {
		const state = store.getState();

		if (state.ui.isSettingGameButtonKey) {
			store.dispatch(settingsActionCreators.gameButtonKeyChanged(e.key));
			store.dispatch(uiActionCreators.isSettingGameButtonKeyChanged(false));
		} else if (e.key === state.settings.gameButtonKey) {
			store.dispatch(roomActionCreators.pressGameButton());
		}

		return true;
	};

	window.oncontextmenu = (e: MouseEvent) => {
		store.dispatch(roomActionCreators.pressGameButton());
		e.preventDefault();
		return true;
	};

	window.addEventListener('error', (e: ErrorEvent) => {
		store.dispatch(commonActionCreators.commonErrorChanged(`${e.type} ${e.message} ${e.filename} ${e.lineno}:${e.colno}`));
		store.dispatch(uiActionCreators.navigateToError());
		return false;
	});

	window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
		store.dispatch(commonActionCreators.commonErrorChanged(`${e.reason.message}: ${e.reason.stack}`));
		store.dispatch(uiActionCreators.navigateToError());
		return false;
	});
}

function validateBrowser() : boolean {
	if (!navigator.clipboard && window.isSecureContext) {
		ReactDOM.render(
			<ErrorView error={localization.unsupportedBrowser} />,
			document.getElementById('reactHost')
		);

		return false;
	}

	return true;
}

async function registerServiceWorker2() {
	try {
		const registration = await navigator.serviceWorker.register(config?.rootUri + 'service-worker.js');
		console.log('Service worker registered: ', registration);
	} catch (error) {
		console.log('Service worker Registration Failed: ' + getErrorMessage(error));
	}
}

async function run() {
	if (!config) {
		throw new Error('Config is undefined!');
	}

	if (!validateBrowser()) {
		return;
	}

	document.title = localization.appName;

	try {
		if (firebaseConfig) {
			// Initialize Firebase
			app = initializeApp(firebaseConfig);
			analytics = getAnalytics(app);
		}
	} catch (e) {
		console.error(e);
	}

	let { serverUri } = config;

	if (!serverUri) {
		const { serverDiscoveryUri } = config;

		if (!serverDiscoveryUri) {
			throw new Error('Server uri is undefined!');
		}

		// Using random number to prevent serverUri caching
		const serverUrisResponse = await fetch(`${serverDiscoveryUri}?r=${Math.random()}`); // throwing TypeError here is ok

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

	state.common.askForConsent = !!config.askForConsent;

	const gameClient = new DummyGameServerClient();

	const dataContext: DataContext = {
		config,
		serverUri,
		connection: null,
		gameClient,
		game: new GameClient(gameClient),
		contentUris: null,
		contentClient: null,
	};

	const store = createStore<State, AnyAction, {}, {}>(
		reducer,
		state,
		applyMiddleware(reduxThunk.withExtraArgument(dataContext))
	);

	let currentSettings = state.settings;

	store.subscribe(() => {
		const newState = store.getState();
		const newSettings = newState.settings;

		if (newSettings !== currentSettings) {
			if (newSettings.appSettings.culture !== currentSettings.appSettings.culture) {
				localization.setLanguage(newSettings.appSettings.culture || localization.getInterfaceLanguage());
				document.title = localization.appName;

				if (newState.ui.mainView === MainView.Login) {
					window.location.reload();
				} else {
					store.dispatch(actionCreators.reloadComputerAccounts() as any);
				}
			}

			currentSettings = newSettings;
			actionCreators.saveStateToStorage(newState);
		}
	});

	subscribeToExternalEvents(store);

	if (state.settings.appSettings.culture) {
		localization.setLanguage(state.settings.appSettings.culture);
		document.title = localization.appName;
	}

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

	store.dispatch(uiActionCreators.navigateToLogin() as any);

	const deviceType = getDeviceType();

	console.log('Device type: ' + deviceType);

	if (config.enableNoSleep && deviceType == 'mobile' && !isSafari()) {
		enableNoSleep();
	}
}

run();

if ('serviceWorker' in navigator && config && config.registerServiceWorker) {
	window.addEventListener('load', registerServiceWorker2);
}
