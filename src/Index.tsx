import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as signalR from '@microsoft/signalr';
import { Action, AnyAction, applyMiddleware, createStore, Store } from 'redux';
import { Provider } from 'react-redux';
import reduxThunk from 'redux-thunk';
import App from './components/App';
import State, { initialState } from './state/State';
import reducer from './state/reducer';
import SavedState, { loadState } from './state/SavedState';
import actionCreators from './logic/actionCreators';
import DataContext from './model/DataContext';
import Config from './Config';
import roomActionCreators from './state/room/roomActionCreators';
import localization from './model/resources/localization';
import ServerInfo from './model/server/ServerInfo';
import GameClient from './client/game/GameClient';
import { FirebaseApp, FirebaseOptions, initializeApp } from 'firebase/app';
import { Analytics, getAnalytics } from 'firebase/analytics';
import { ErrorView } from './components/ErrorView';
import Constants from './model/enums/Constants';
import settingsActionCreators from './state/settings/settingsActionCreators';
import getErrorMessage from './utils/ErrorHelpers';
import commonActionCreators from './state/common/commonActionCreators';
import enableNoSleep from './utils/NoSleepHelper';
import uiActionCreators from './state/ui/uiActionCreators';
import getDeviceType from './utils/getDeviceType';
import isSafari from './utils/isSafari';
import GameServerClient from './client/GameServerClient';
import SIContentClient from 'sicontent-client';
import ButtonPressMode from './model/ButtonPressMode';
import Path from './model/enums/Path';
import { INavigationState } from './state/ui/UIState';
import StateManager from './utils/StateManager';

import './utils/polyfills';
import './style.css';

declare const config: Config | undefined;
declare const firebaseConfig: FirebaseOptions | undefined;

export let app: FirebaseApp | null = null;
export let analytics: Analytics | null = null;

function setState(state: State, savedState: SavedState | null): State {
	if (!savedState) {
		return state;
	}

	const { appSettings } = savedState.settings;

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
				falseStart: appSettings.falseStart ?? true,
				hintShowman: appSettings.hintShowman ?? false,
				partialText: appSettings.partialText ?? false,
				oral: appSettings.oral ?? false,
				ignoreWrong: appSettings.ignoreWrong ?? false,
				culture: appSettings.culture,
				managed: appSettings.managed ?? false,
				usePingPenalty: appSettings.usePingPenalty ?? false,
				buttonPressMode: appSettings.buttonPressMode ?? ButtonPressMode.RandomWithinInterval,
				timeSettings: appSettings.timeSettings || state.settings.appSettings.timeSettings,
				readingSpeed: appSettings.readingSpeed || state.settings.appSettings.readingSpeed,
				preloadRoundContent: appSettings.preloadRoundContent ?? true,
				useApellations: appSettings.useApellations ?? true,
				allowEveryoneToPlayHiddenStakes: appSettings.allowEveryoneToPlayHiddenStakes ?? true,
				oralPlayersActions: appSettings.oralPlayersActions ?? true,
				displaySources: appSettings.displaySources ?? false,
				playAllQuestionsInFinalRound: appSettings.playAllQuestionsInFinalRound ?? false,
			},
			gameButtonKey: savedState.settings.gameButtonKey || Constants.KEY_CTRL
		} : state.settings,
	};
}

function subscribeToExternalEvents(store: Store<State, any>) {
	// TODO use ResizeObserver for body element instead of this as app could be hosted inside iframe
	// and window dimensions will be irrelevant
	window.onresize = () => store.dispatch(uiActionCreators.windowSizeChanged(window.innerWidth, window.innerHeight));
	window.onpopstate = (e) => { if (e.state) { store.dispatch(uiActionCreators.onNavigated(e.state)); } };

	window.onkeydown = (e: KeyboardEvent) => {
		const state = store.getState();

		if (state.ui.isSettingGameButtonKey) {
			store.dispatch(settingsActionCreators.gameButtonKeyChanged(e.key));
			store.dispatch(uiActionCreators.isSettingGameButtonKeyChanged(false));
		} else if (e.key === state.settings.gameButtonKey) {
			store.dispatch(roomActionCreators.pressGameButton());
		} else if (e.key === state.settings.nextButtonKey && state.settings.bindNextButton) {
			store.dispatch(roomActionCreators.moveNext());
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
		return false;
	});

	window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
		store.dispatch(commonActionCreators.commonErrorChanged(`${e.reason.message}: ${e.reason.stack}`));
		return false;
	});

	window.addEventListener('visibilitychange', () => {
		store.dispatch(uiActionCreators.visibilityChanged(document.visibilityState === 'visible'));
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

async function getServerUri(serverDiscoveryUri: string) {
	// Using random number to prevent serverUri caching
	const serverUrisResponse = await fetch(`${serverDiscoveryUri}?r=${Math.random()}`); // throwing TypeError here is ok

	if (!serverUrisResponse.ok) {
		throw new Error(`Server discovery is broken: ${serverUrisResponse.status} ${await serverUrisResponse.text()}`);
	}

	const serverUris = (await serverUrisResponse.json()) as ServerInfo[];

	if (!serverUris || serverUris.length === 0) {
		throw new Error('Server uris object is broken');
	}

	return serverUris[0].uri;
}

function getInitialView(historyState: INavigationState): INavigationState {
	const urlParams = new URLSearchParams(window.location.search);
	const gameId = urlParams.get('gameId');
	const invite = urlParams.get('invite');
	const packageUri = urlParams.get('packageUri');
	const packageName = urlParams.get('packageName');

	if (historyState && historyState.path) {
		return historyState;
	}

	if (gameId && invite) {
		return { path: Path.RoomJoin, gameId: parseInt(gameId, 10) };
	}

	if (packageUri) {
		return { path: Path.NewRoom, newGameMode: 'multi', packageUri: packageUri, packageName: packageName ?? undefined };
	}

	return { path: Path.Root };
}

async function run() {
	if (!config) {
		throw new Error('Config is undefined!');
	}

	if (!validateBrowser()) {
		return;
	}

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
			throw new Error('Server uri is undefined');
		}

		serverUri = await getServerUri(serverDiscoveryUri);
	}

	const savedState = loadState();
	const state = setState(initialState, savedState);

	state.common.askForConsent = !!config.askForConsent;
	state.common.emojiCultures = config.emojiCultures;

	const noOpHubConnection = new signalR.HubConnectionBuilder().withUrl('http://fake').build();

	const gameClient = new GameServerClient(noOpHubConnection, () => { });

	const dataContext: DataContext = {
		config,
		serverUri,
		connection: null,
		gameClient,
		game: new GameClient(gameClient),
		contentUris: null,
		contentClient: new SIContentClient({ serviceUri: 'http://fake' }),
		storageClient: null,
		state: new StateManager(),
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
				store.dispatch(actionCreators.reloadComputerAccounts() as any);
			}

			currentSettings = newSettings;
			actionCreators.saveStateToStorage(newState);
		}
	});

	subscribeToExternalEvents(store);

	if (state.settings.appSettings.culture) {
		localization.setLanguage(state.settings.appSettings.culture);
	}

	document.title = localization.appName;

	ReactDOM.render(
		<React.StrictMode>
			<Provider store={store}>
				<App ads={config.ads} />
			</Provider>
		</React.StrictMode>,
		document.getElementById('reactHost')
	);

	const initialView = getInitialView(dataContext.state.loadNavigationState() as INavigationState);
	store.dispatch(actionCreators.init(initialView) as unknown as Action);

	const deviceType = getDeviceType();

	if (config.enableNoSleep && deviceType == 'mobile' && !isSafari()) {
		enableNoSleep();
	}
}

run();

if ('serviceWorker' in navigator && config && config.registerServiceWorker) {
	window.addEventListener('load', registerServiceWorker2);
}
