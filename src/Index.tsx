import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as signalR from '@microsoft/signalr';
import { Action, AnyAction, applyMiddleware, createStore, Store } from 'redux';
import { Provider } from 'react-redux';
import reduxThunk from 'redux-thunk';
import App from './components/App/App';
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
import { ErrorView } from './components/views/Error/ErrorView';
import Constants from './model/enums/Constants';
import getErrorMessage from './utils/ErrorHelpers';
import enableNoSleep from './utils/NoSleepHelper';
import getDeviceType from './utils/getDeviceType';
import isSafari from './utils/isSafari';
import GameServerClient from './client/GameServerClient';
import SIContentClient from 'sicontent-client';
import ButtonPressMode from './model/ButtonPressMode';
import Path from './model/enums/Path';
import StateManager from './utils/StateManager';
import YAStateManager from './utils/YAStateManager';
import IStateManager from './utils/IStateManager';
import SIHostClient from './client/SIHostClient';
import { setFullScreen, setGameButtonKey } from './state/settingsSlice';
import { commonErrorChanged, setFontsReady } from './state/commonSlice';
import { saveStateToStorage } from './state/StateHelpers';
import { INavigationState, isSettingGameButtonKeyChanged, setFullScreenSupported, visibilityChanged, windowSizeChanged } from './state/uiSlice';
import { navigate } from './utils/Navigator';

import './utils/polyfills';
import './scss/style.scss';

declare const config: Config | undefined;
declare const firebaseConfig: FirebaseOptions | undefined;

export let app: FirebaseApp | null = null;
export let analytics: Analytics | null = null;

const OriginYandex = 'https://yandex.ru';

if (!config) {
	throw new Error('Config is undefined!');
}

function setState(state: State, savedState: SavedState | null, c: Config): State {
	if (!savedState) {
		return {
			...state,
			common: {
				...state.common,
				askForConsent: !!c.askForConsent,
				emojiCultures: c.emojiCultures,
				clearUrls: c.clearUrls,
			},
		};
	}

	const { appSettings } = savedState.settings;

	return {
		...state,
		common: {
			...state.common,
			askForConsent: !!c.askForConsent,
			emojiCultures: c.emojiCultures,
			clearUrls: c.clearUrls,
		},
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
				partialImages: appSettings.partialImages ?? false,
				oral: appSettings.oral ?? false,
				ignoreWrong: appSettings.ignoreWrong ?? false,
				culture: appSettings.culture,
				managed: appSettings.managed ?? false,
				usePingPenalty: appSettings.usePingPenalty ?? false,
				buttonPressMode: appSettings.buttonPressMode ?? ButtonPressMode.RandomWithinInterval,
				timeSettings: appSettings.timeSettings ? {
					...appSettings.timeSettings,
					partialImageTime: appSettings.timeSettings.partialImageTime ?? 3,
				} : state.settings.appSettings.timeSettings,
				readingSpeed: appSettings.readingSpeed || state.settings.appSettings.readingSpeed,
				preloadRoundContent: appSettings.preloadRoundContent ?? true,
				useApellations: appSettings.useApellations ?? true,
				allowEveryoneToPlayHiddenStakes: appSettings.allowEveryoneToPlayHiddenStakes ?? true,
				oralPlayersActions: appSettings.oralPlayersActions ?? true,
				displaySources: appSettings.displaySources ?? false,
				playAllQuestionsInFinalRound: appSettings.playAllQuestionsInFinalRound ?? false,
				displayAnswerOptionsLabels: appSettings.displayAnswerOptionsLabels ?? true,
				displayAnswerOptionsOneByOne: appSettings.displayAnswerOptionsOneByOne ?? true,
			},
			gameButtonKey: savedState.settings.gameButtonKey || Constants.KEY_CTRL
		} : state.settings,
	};
}

function subscribeToExternalEvents(store: Store<State, any>) {
	// TODO use ResizeObserver for body element instead of this as app could be hosted inside iframe
	// and window dimensions will be irrelevant
	window.onresize = () => {
		store.dispatch(windowSizeChanged({ width: window.innerWidth, height: window.innerHeight }));

		if (window.innerHeight == screen.height && window.innerWidth == screen.width) {
			store.dispatch(setFullScreen(true));
		} else {
			store.dispatch(setFullScreen(false));
		}
	};

	window.onpopstate = (e) => { if (e.state) { store.dispatch(navigate({ navigation: e.state, saveState: false })); } };

	window.onkeydown = (e: KeyboardEvent) => {
		const state = store.getState();

		if (state.ui.isSettingGameButtonKey) {
			store.dispatch(setGameButtonKey(e.key));
			store.dispatch(isSettingGameButtonKeyChanged(false));
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
		store.dispatch(commonErrorChanged(`${e.type} ${e.message} ${e.filename} ${e.lineno}:${e.colno}`));
		return false;
	});

	window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
		store.dispatch(commonErrorChanged(`${e.reason.message}: ${e.reason.stack}`));
		return false;
	});

	window.addEventListener('visibilitychange', () => {
		store.dispatch(visibilityChanged(document.visibilityState === 'visible'));
		return false;
	});

	document.fonts.ready.then(() => {
		window.setTimeout(() => store.dispatch(setFontsReady(true)), 1000);
	});
}

function validateBrowser() {
	if (!navigator.clipboard && window.isSecureContext) {
		throw new Error(localization.unsupportedBrowser);
	}
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
	const { search } = window.location;

	if (search.startsWith('?_') && search.length > 3 && config?.siHostsIdUriMap) {
		const [,,siHostKey] = search;
		const gameId = parseInt(search.substring(3), 10);
		const hostUri = config.siHostsIdUriMap[siHostKey];

		if (hostUri) {
			return { path: Path.JoinRoom, gameId, hostUri };
		}
	}

	const urlParams = new URLSearchParams(search);
	const gameId = urlParams.get('gameId');
	const hostUri = urlParams.get('host');
	const packageUri = urlParams.get('packageUri');
	const packageName = urlParams.get('packageName');

	if (historyState && historyState.path) {
		return historyState;
	}

	if (gameId && hostUri) {
		return { path: Path.JoinRoom, gameId: parseInt(gameId, 10), hostUri };
	}

	if (packageUri) {
		return { path: Path.NewRoom, newGameMode: 'multi', packageUri: packageUri, packageName: packageName ?? undefined };
	}

	return { path: Path.Root };
}

async function run(stateManager: IStateManager) {
	try {
		if (!config) {
			throw new Error('Config is undefined!');
		}

		validateBrowser();

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
		const state = setState(initialState, savedState, config);

		const noOpHubConnection = new signalR.HubConnectionBuilder().withUrl('http://fake').build();
		const gameClient = new GameServerClient();

		const dataContext: DataContext = {
			config,
			serverUri,
			gameClient,
			game: new GameClient(new SIHostClient(noOpHubConnection, () => { }), false),
			contentUris: null,
			contentClient: new SIContentClient({ serviceUri: 'http://fake' }),
			storageClient: null,
			state: stateManager,
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
					store.dispatch(actionCreators.reloadComputerAccounts(store.dispatch) as any);
				} else if (newSettings.fullScreen !== currentSettings.fullScreen) {
					stateManager.setFullScreen(newSettings.fullScreen);
				}

				currentSettings = newSettings;
				saveStateToStorage(newState);
			}
		});

		subscribeToExternalEvents(store);

		store.dispatch(windowSizeChanged({ width: window.innerWidth, height: window.innerHeight }));
		store.dispatch(setFullScreenSupported(stateManager.isFullScreenSupported()));

		if (state.settings.appSettings.culture) {
			localization.setLanguage(state.settings.appSettings.culture);
		}

		if (state.settings.fullScreen) {
			const result = await stateManager.setFullScreen(true);

			if (!result) {
				store.dispatch(setFullScreen(false));
			}
		}

		document.title = localization.appName;

		ReactDOM.render(
			<React.StrictMode>
				<Provider store={store}>
					<App />
				</Provider>
			</React.StrictMode>,
			document.getElementById('reactHost')
		);

		await dataContext.state.initAsync(store);

		const initialView = getInitialView(dataContext.state.loadNavigationState() as INavigationState);
		store.dispatch(actionCreators.init(initialView, store.dispatch) as unknown as Action);
	} catch (e: any) {
		ReactDOM.render(
			<ErrorView error={e.message} />,
			document.getElementById('reactHost')
		);
	}
}

const urlParams = new URLSearchParams(window.location.hash.substring(1));
const origin = urlParams.get('origin');

if (origin === OriginYandex) {
	console.log('Loading from Yandex');
	config.askForConsent = false;
	config.enableNoSleep = false;
	config.registerServiceWorker = false;
	config.emojiCultures = ['en'];
	config.rewriteUrl = false;
	config.clearUrls = true;
	config.ads = '';
}

run(origin === OriginYandex ? new YAStateManager() : new StateManager());

if ('serviceWorker' in navigator && config && config.registerServiceWorker) {
	window.addEventListener('load', registerServiceWorker2);
}

const deviceType = getDeviceType();

if (config.enableNoSleep && deviceType == 'mobile' && !isSafari()) {
	enableNoSleep();
}
