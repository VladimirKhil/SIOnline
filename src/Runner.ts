import { Action, AnyAction, Store, applyMiddleware, createStore } from 'redux';
import State, { initialState } from './state/State';
import reducer from './state/reducer';
import DataContext from './model/DataContext';
import IHost, { FullScreenMode } from './host/IHost';
import SIStorageClient from 'sistorage-client';
import SIStorageInfo from './client/contracts/SIStorageInfo';
import GameServerClient from './client/GameServerClient';
import SIHostClient from './client/SIHostClient';
import GameClient from './client/game/GameClient';
import * as signalR from '@microsoft/signalr';
import reduxThunk from 'redux-thunk';
import actionCreators from './logic/actionCreators';
import { INavigationState } from './state/uiSlice';
import Path from './model/enums/Path';

class ManagedHost implements IHost {
	isDesktop(): boolean {
		throw new Error('Method not implemented.');
	}
	initAsync(store: Store): Promise<void> {
		throw new Error('Method not implemented.');
	}
	onReady(): void {

	}
	isLicenseAccepted(): boolean {
		throw new Error('Method not implemented.');
	}
	acceptLicense(): void {
		throw new Error('Method not implemented.');
	}
	loadNavigationState() {
		throw new Error('Method not implemented.');
	}
	saveNavigationState(state: any, url: string | null | undefined, popCurrentState: boolean): void {
		throw new Error('Method not implemented.');
	}
	isFullScreenSupported(): boolean {
		throw new Error('Method not implemented.');
	}
	detectFullScreen(): FullScreenMode {
		throw new Error('Method not implemented.');
	}
	setFullScreen(fullScreen: boolean): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
	copyToClipboard(text: string): void {
		throw new Error('Method not implemented.');
	}
	copyUriToClipboard(): void {
		throw new Error('Method not implemented.');
	}
	openLink(url: string): void {
		throw new Error('Method not implemented.');
	}
	getStorage(): { storageClient?: SIStorageClient; storageInfo?: SIStorageInfo; } {
		return { };
	}
	getPackageData(id: string): Promise<File | null> {
		throw new Error('Method not implemented.');
	}
	exitApp(): void {
		throw new Error('Method not implemented.');
	}
	clearGameLog(): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
	addGameLog(content: string, newLine: boolean): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
	openGameLog(): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
}

const noOpHubConnection = new signalR.HubConnectionBuilder().withUrl('http://fake').build();
const gameClient = new GameServerClient();

const dataContext: DataContext = {
	config: {
		siStatisticsServiceUri: '',
		appRegistryServiceUri: '',
	},
	serverUri: 'https://vladimirkhil.com/sigameserver-0/api/v1',
	gameClient,
	game: new GameClient(new SIHostClient(noOpHubConnection, () => { }), false),
	contentUris: null,
	contentClients: [],
	storageClients: [],
	host: new ManagedHost(),
};

const store = createStore<State, AnyAction, {}, {}>(
	reducer,
	{
		...initialState,
	},
	applyMiddleware(reduxThunk.withExtraArgument(dataContext))
);

store.subscribe(() => {
	console.log('State updated:', store.getState());
});

const initialView : INavigationState = { path: Path.Root };
store.dispatch(actionCreators.initStageSkipLoginLicenseAsync(initialView, store.dispatch) as unknown as Action);



console.log('Store initialized with initial state:', store.getState());