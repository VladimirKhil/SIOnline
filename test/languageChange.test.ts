import { AnyAction, applyMiddleware, createStore } from 'redux';
import State, { initialState } from '../src/state/State';
import reducer from '../src/state/reducer';
import DataContext from '../src/model/DataContext';
import GameServerClient from '../src/client/GameServerClient';
import SIHostClient from '../src/client/SIHostClient';
import GameClient from '../src/client/game/GameClient';
import reduxThunk from 'redux-thunk';
import { languageChanged } from '../src/state/settingsSlice';
import actionCreators from '../src/logic/actionCreators';
import { serverInfoChanged } from '../src/state/commonSlice';
import IHost, { FullScreenMode } from '../src/host/IHost';
import SIStorageClient from 'sistorage-client';
import SIStorageInfo from '../src/client/contracts/SIStorageInfo';

class TestHost implements IHost {
	isDesktop(): boolean { return false; }
	async initAsync(): Promise<void> { }
	onReady(): void { }
	isLicenseAccepted(): boolean { return true; }
	acceptLicense(): void { }
	loadNavigationState() { return null; }
	saveNavigationState(): void { }
	isFullScreenSupported(): boolean { return false; }
	detectFullScreen(): FullScreenMode { return FullScreenMode.Undefined; }
	async setFullScreen(): Promise<boolean> { return false; }
	copyToClipboard(): void { }
	copyUriToClipboard(): void { }
	openLink(): void { }
	getStorage(): { storageClient?: SIStorageClient; storageInfo?: SIStorageInfo; } { return {}; }
	async getPackageData(): Promise<[File, string] | null> { return null; }
	exitApp(): void { }
	async clearGameLog(): Promise<boolean> { return true; }
	async addGameLog(): Promise<boolean> { return true; }
	async openGameLog(): Promise<boolean> { return true; }
	getPackageSource(): string | undefined { return undefined; }
	getFallbackPackageSource(): string | undefined { return undefined; }
}

describe('Language change on initial load', () => {
	let store: any;
	let dataContext: DataContext;
	let mockGetComputerAccounts: jest.SpyInstance;

	beforeEach(() => {
		const gameClient = new GameServerClient('');

		mockGetComputerAccounts = jest.spyOn(gameClient, 'getComputerAccountsAsync')
			.mockResolvedValue(['Bot1', 'Bot2']);

		dataContext = {
			config: {
				siStatisticsServiceUri: '',
				appRegistryServiceUri: '',
			},
			serverUri: '',
			gameClient,
			game: new GameClient(new SIHostClient()),
			contentUris: null,
			contentClients: [],
			storageClients: [],
			host: new TestHost(),
		};

		store = createStore<State, AnyAction, Record<string, unknown>, Record<string, unknown>>(
			reducer,
			{ ...initialState },
			applyMiddleware(reduxThunk.withExtraArgument(dataContext))
		);
	});

	afterEach(() => {
		mockGetComputerAccounts.mockRestore();
	});

	it('should not call getComputerAccountsAsync when server info is not loaded', async () => {
		// Simulate language change subscriber logic from Index.tsx
		const state = store.getState() as State;

		// Verify server info is not loaded (serverName is null)
		expect(state.common.serverName).toBeNull();

		// Dispatch language change
		store.dispatch(languageChanged('en'));

		// Simulate the subscriber check from Index.tsx:
		// if (newState.common.serverName !== null) { reloadComputerAccounts... }
		const newState = store.getState() as State;
		if (newState.common.serverName !== null) {
			store.dispatch(actionCreators.reloadComputerAccounts(store.dispatch) as any);
		}

		// Wait for any async operations
		await new Promise(resolve => setTimeout(resolve, 100));

		// Computer accounts should NOT have been fetched
		expect(mockGetComputerAccounts).not.toHaveBeenCalled();
	});

	it('should call getComputerAccountsAsync when server info is loaded', async () => {
		// First, simulate server info being loaded
		store.dispatch(serverInfoChanged({
			serverName: 'Test Server',
			serverLicense: 'MIT',
			maxPackageSizeMb: 100,
			siHosts: {},
		}));

		// Set a valid server URI so the fetch doesn't fail
		dataContext.serverUri = 'https://test-server.example.com';
		dataContext.gameClient.setServerUri('https://test-server.example.com');

		// Verify server info IS loaded
		const state = store.getState() as State;
		expect(state.common.serverName).toBe('Test Server');

		// Dispatch language change
		store.dispatch(languageChanged('en'));

		// Simulate the subscriber check from Index.tsx:
		// if (newState.common.serverName !== null) { reloadComputerAccounts... }
		const newState = store.getState() as State;
		if (newState.common.serverName !== null) {
			store.dispatch(actionCreators.reloadComputerAccounts(store.dispatch) as any);
		}

		// Wait for async operations
		await new Promise(resolve => setTimeout(resolve, 100));

		// Computer accounts SHOULD have been fetched
		expect(mockGetComputerAccounts).toHaveBeenCalled();
	});

	it('should update language in settings without errors when server info is not loaded', () => {
		const stateBefore = store.getState() as State;
		expect(stateBefore.settings.appSettings.culture).toBeNull();

		// Dispatch language change - this should NOT throw
		store.dispatch(languageChanged('en'));

		const stateAfter = store.getState() as State;
		expect(stateAfter.settings.appSettings.culture).toBe('en');
	});
});
