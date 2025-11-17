import * as React from 'react';
import * as ReactDOM from 'react-dom';
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
import GameClient from './client/game/GameClient';
import { FirebaseApp, FirebaseOptions, initializeApp } from 'firebase/app';
import { Analytics, getAnalytics } from 'firebase/analytics';
import { ErrorView } from './components/views/Error/ErrorView';
import Constants from './model/enums/Constants';
import getErrorMessage from './utils/ErrorHelpers';
import { setProxyAvailable } from './state/commonSlice';
import enableNoSleep from './utils/NoSleepHelper';
import getDeviceType from './utils/getDeviceType';
import isSafari from './utils/isSafari';
import GameServerClient from './client/GameServerClient';
import ButtonPressMode from './model/ButtonPressMode';
import PenaltyType from './model/enums/PenaltyType';
import Path from './model/enums/Path';
import BrowserHost from './host/BrowserHost';
import YandexHost from './host/YandexHost';
import IHost, { FullScreenMode } from './host/IHost';
import SIHostClient from './client/SIHostClient';
import { setFullScreen,
	setGameButtonKey,
	setNextButtonKey,
	setNoButtonKey,
	setPassButtonKey,
	setPauseButtonKey,
	setYesButtonKey } from './state/settingsSlice';
import { commonErrorChanged, setFontsReady } from './state/commonSlice';
import { saveStateToStorage } from './state/StateHelpers';
import { INavigationState, setFullScreenSupported, settingKeyChanged, visibilityChanged, windowSizeChanged } from './state/uiSlice';
import { navigate } from './utils/Navigator';
import TauriHost from './host/TauriHost';
import { approveAnswerDefault, pressGameButton, rejectAnswerDefault } from './state/room2Slice';
import { pauseGame } from './state/serverActions';
import getServerInfo from './client/GameServerLocator';

import './utils/polyfills';
import './scss/style.scss';

declare const config: Config | undefined;
declare const firebaseConfig: FirebaseOptions | undefined;

declare global {
	interface Window {
        __TAURI_INTERNALS__: any;
    }
}

export let app: FirebaseApp | null = null;
export let analytics: Analytics | null = null;

const OriginYandex = 'https://yandex.ru';
const OriginTauri = 'TAURI';

if (!config) {
	throw new Error('Config is undefined!');
}

function setState(state: State, savedState: SavedState | null, c: Config, isDesktop: boolean): State {
	if (!savedState) {
		return {
			...state,
			common: {
				...state.common,
				askForConsent: !!c.askForConsent,
				emojiCultures: c.emojiCultures,
			},
			settings: {
				...state.settings,
				appSound: isDesktop,
			},
		};
	}

	const { appSettings, theme } = savedState.settings;

	return {
		...state,
		common: {
			...state.common,
			askForConsent: !!c.askForConsent,
			emojiCultures: c.emojiCultures,
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
				questionWithButtonPenalty: appSettings.questionWithButtonPenalty ?? PenaltyType.SubtractPoints,
				questionForYourselfPenalty: appSettings.questionForYourselfPenalty ?? PenaltyType.None,
				questionForYourselfFactor: appSettings.questionForYourselfFactor ?? 2,
				questionForAllPenalty: appSettings.questionForAllPenalty ?? PenaltyType.SubtractPoints,
				culture: appSettings.culture,
				managed: appSettings.managed ?? false,
				buttonPressMode: appSettings.buttonPressMode ?? ButtonPressMode.RandomWithinInterval,
				timeSettings: appSettings.timeSettings ? {
					...appSettings.timeSettings,
					partialImageTime: appSettings.timeSettings.partialImageTime ?? 3,
					imageTime: appSettings.timeSettings.imageTime ?? 5,
				} : state.settings.appSettings.timeSettings,
				readingSpeed: appSettings.readingSpeed || state.settings.appSettings.readingSpeed,
				preloadRoundContent: appSettings.preloadRoundContent ?? true,
				useApellations: appSettings.useApellations ?? true,
				allowEveryoneToPlayHiddenStakes: appSettings.allowEveryoneToPlayHiddenStakes ?? true,
				oralPlayersActions: appSettings.oralPlayersActions ?? true,
				playAllQuestionsInFinalRound: appSettings.playAllQuestionsInFinalRound ?? false,
				displayAnswerOptionsLabels: appSettings.displayAnswerOptionsLabels ?? true,
				displayAnswerOptionsOneByOne: appSettings.displayAnswerOptionsOneByOne ?? true,
			},
			theme: {
				...state.settings.theme,
				...theme,
				room: {
					backgroundImageKey: theme?.room?.backgroundImageKey || null,
				},
			},
			gameButtonKey: savedState.settings.gameButtonKey || Constants.KEY_SPACE,
		} : state.settings,
	};
}

function subscribeToExternalEvents(store: Store<State, any>, stateManager: IHost) {
	// TODO use ResizeObserver for body element instead of this as app could be hosted inside iframe
	// and window dimensions will be irrelevant
	window.onresize = () => {
		store.dispatch(windowSizeChanged({ width: window.innerWidth, height: window.innerHeight }));

		const fullScreenMode = stateManager.detectFullScreen();

		if (fullScreenMode === FullScreenMode.Yes) {
			store.dispatch(setFullScreen(true));
		} else if (fullScreenMode === FullScreenMode.No) {
			store.dispatch(setFullScreen(false));
		}
	};

	window.onpopstate = (e) => {
		if (e.state) {
			store.dispatch(navigate({ navigation: e.state, saveState: false }));
		}
	};

	window.onkeydown = (e: KeyboardEvent) => {
		// Skip if the focus is inside a textbox or similar input element
		const target = e.target as HTMLElement;

		if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
			return true;
		}

		const state = store.getState();

		if (state.ui.settingKey) {
			switch (state.ui.settingKey) {
				case 'answer':
					store.dispatch(setGameButtonKey(e.key));
					break;

				case 'pass':
					store.dispatch(setPassButtonKey(e.key));
					break;

				case 'next':
					store.dispatch(setNextButtonKey(e.key));
					break;

				case 'yes':
					store.dispatch(setYesButtonKey(e.key));
					break;

				case 'no':
					store.dispatch(setNoButtonKey(e.key));
					break;

				case 'pause':
					store.dispatch(setPauseButtonKey(e.key));
					break;

				default:
					break;
			}

			store.dispatch(settingKeyChanged(null));
		} else if (e.key === state.settings.gameButtonKey) {
			store.dispatch(pressGameButton());
		} else if (e.key === state.settings.passButtonKey) {
			store.dispatch(roomActionCreators.onPass());
		} else if (e.key === state.settings.nextButtonKey) {
			store.dispatch(roomActionCreators.moveNext());
		} else if (e.key === state.settings.yesButtonKey) {
			store.dispatch(approveAnswerDefault());
		} else if (e.key === state.settings.noButtonKey) {
			store.dispatch(rejectAnswerDefault());
		} else if (e.key === state.settings.pauseButtonKey) {
			store.dispatch(pauseGame());
		}

		return true;
	};

	window.oncontextmenu = (e: MouseEvent) => {
		store.dispatch(pressGameButton());
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

	if (!host.isDesktop()) {
		window.addEventListener('visibilitychange', () => {
			store.dispatch(visibilityChanged(document.visibilityState === 'visible'));
			return false;
		});
	}

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

function getInitialView(historyState: INavigationState): INavigationState {
	if (historyState && historyState.path) {
		return historyState;
	}

	const { search } = window.location;

	if (search.startsWith('?_') && search.length > 3) {
		const [,,siHostKey] = search;
		const gameId = parseInt(search.substring(3), 10);

		if (siHostKey) {
			return { path: Path.JoinRoom, gameId, siHostKey };
		}
	}

	const urlParams = new URLSearchParams(search);
	const gameId = urlParams.get('gameId');
	const hostUri = urlParams.get('host');
	const packageUri = urlParams.get('packageUri');
	const packageName = urlParams.get('packageName');

	if (gameId && hostUri) {
		return { path: Path.JoinRoom, gameId: parseInt(gameId, 10), hostUri };
	}

	if (packageUri) {
		return { path: Path.NewRoom, newGameMode: null, packageUri: packageUri, packageName: packageName ?? undefined };
	}

	return { path: Path.Root };
}

async function run(host: IHost) {
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
		let proxyUri: string | undefined;

		if (!serverUri) {
			const { serverDiscoveryUri } = config;

			if (!serverDiscoveryUri) {
				throw new Error('Server uri is undefined');
			}

			const { uri, proxyUri: serverProxyUri } = await getServerInfo(serverDiscoveryUri);
			serverUri = uri;
			proxyUri = serverProxyUri;
		}

		const savedState = loadState();
		const state = setState(initialState, savedState, config, host.isDesktop());

		const gameClient = new GameServerClient(serverUri);

		const dataContext: DataContext = {
			config,
			serverUri,
			proxyUri,
			gameClient,
			game: new GameClient(new SIHostClient()),
			contentUris: null,
			contentClients: [],
			storageClients: [],
			host,
		};

		const store = createStore<State, AnyAction, {}, {}>(
			reducer,
			state,
			applyMiddleware(reduxThunk.withExtraArgument(dataContext))
		);

		// Set proxy availability based on whether proxy URI is provided
		store.dispatch(setProxyAvailable(!!proxyUri));

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
					host.setFullScreen(newSettings.fullScreen);
				}

				currentSettings = newSettings;
				saveStateToStorage(newState);
			}
		});

		subscribeToExternalEvents(store, host);

		store.dispatch(windowSizeChanged({ width: window.innerWidth, height: window.innerHeight }));
		store.dispatch(setFullScreenSupported(host.isFullScreenSupported()));

		if (state.settings.appSettings.culture) {
			localization.setLanguage(state.settings.appSettings.culture);
		}

		if (state.settings.fullScreen) {
			const result = await host.setFullScreen(true);

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

		await dataContext.host.initAsync(store);

		const initialView = getInitialView(dataContext.host.loadNavigationState() as INavigationState);
		store.dispatch(actionCreators.initStage0(initialView, store.dispatch) as unknown as Action);
	} catch (e: any) {
		ReactDOM.render(
			<ErrorView error={getErrorMessage(e)} />,
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
	config.ads = '';
} else if (origin === OriginTauri || window.__TAURI__) {
	console.log('Loading from Tauri');
	config.askForConsent = false;
	config.enableNoSleep = false;
	config.registerServiceWorker = false;
}

const host = origin === OriginYandex
	? new YandexHost()
	: (origin === OriginTauri || window.__TAURI_INTERNALS__ ? new TauriHost(origin !== OriginTauri) : new BrowserHost());

run(host);

if ('serviceWorker' in navigator && config && config.registerServiceWorker) {
	window.addEventListener('load', registerServiceWorker2);
}

const deviceType = getDeviceType();

if (config.enableNoSleep && deviceType == 'mobile' && !isSafari()) {
	enableNoSleep();
}

