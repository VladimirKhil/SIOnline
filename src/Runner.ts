import { Action, AnyAction, applyMiddleware, createStore } from 'redux';
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
import { navigate } from './utils/Navigator';
import onlineActionCreators from './state/online/onlineActionCreators';
import { changeLogin } from './state/userSlice';
import { setName, setPackageType, setRole, setPlayersCount, setType } from './state/gameSlice';
import PackageType from './model/enums/PackageType';
import Role from './model/Role';
import GameType from './model/GameType';
import { newGame } from './state/online2Slice';
import { randomBytes } from 'crypto';
import { selectQuestion } from './state/serverActions';
import ContentType from './model/enums/ContentType';
import ServerInfo from './model/server/ServerInfo';
import { DecisionType } from './state/room2Slice';

class ManagedHost implements IHost {
	private readonly isSimulation = true;

	getRandomValue: () => number;

	messageHandler?: (message: string) => void;

	constructor() {
		// Simulated environment, no real initialization needed
		console.log('ManagedHost initialized in simulation mode');

		this.getRandomValue = () => {
			const buffer = randomBytes(4);
			const array = new Uint32Array(buffer.buffer, buffer.byteOffset, buffer.length / 4);
			return array[0];
		};

		this.messageHandler = (message: string) => {
			console.log(`> ${message}`);
		};
	}

	isDesktop(): boolean {
		return this.isSimulation && false;
	}

	async initAsync(): Promise<void> {
		// No-op for simulation
		console.log(`ManagedHost initialized: ${this.isSimulation}`);
	}

	onReady(): void {
		// No-op for simulation
		console.log(`ManagedHost ready: ${this.isSimulation}`);
	}

	isLicenseAccepted(): boolean {
		return this.isSimulation; // Simulate license accepted
	}

	acceptLicense(): void {
		// No-op for simulation
		console.log(`License accepted: ${this.isSimulation}`);
	}

	loadNavigationState() {
		return this.isSimulation ? null : {};
	}

	saveNavigationState(): void {
		// No-op for simulation
		console.log(`Navigation state saved: ${this.isSimulation}`);
	}

	isFullScreenSupported(): boolean {
		return this.isSimulation && false;
	}

	detectFullScreen(): FullScreenMode {
		return this.isSimulation ? FullScreenMode.Undefined : FullScreenMode.No;
	}

	async setFullScreen(): Promise<boolean> {
		return Promise.resolve(this.isSimulation);
	}

	copyToClipboard(): void {
		// No-op for simulation
		console.log(`Clipboard copy: ${this.isSimulation}`);
	}

	copyUriToClipboard(): void {
		// No-op for simulation
		console.log(`URI clipboard copy: ${this.isSimulation}`);
	}

	openLink(): void {
		// No-op for simulation
		console.log(`Link opened: ${this.isSimulation}`);
	}

	getStorage(): { storageClient?: SIStorageClient; storageInfo?: SIStorageInfo; } {
		return this.isSimulation ? {} : { storageClient: undefined };
	}

	async getPackageData(): Promise<File | null> {
		return Promise.resolve(this.isSimulation ? null : null);
	}

	exitApp(): void {
		// No-op for simulation
		console.log(`App exit: ${this.isSimulation}`);
	}

	async clearGameLog(): Promise<boolean> {
		return Promise.resolve(this.isSimulation);
	}

	async addGameLog(): Promise<boolean> {
		return Promise.resolve(this.isSimulation);
	}

	async openGameLog(): Promise<boolean> {
		return Promise.resolve(this.isSimulation);
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

async function initializeApp() {
	const serverUri = await getServerUri('https://vladimirkhil.com/api/si/servers');

	const noOpHubConnection = new signalR.HubConnectionBuilder().withUrl('http://fake').build();
	const gameClient = new GameServerClient();

	const dataContext: DataContext = {
		config: {
			siStatisticsServiceUri: '',
			appRegistryServiceUri: '',
		},
		serverUri: serverUri,
		gameClient,
		game: new GameClient(new SIHostClient(noOpHubConnection, () => { }), false),
		contentUris: null,
		contentClients: [],
		storageClients: [],
		host: new ManagedHost(),
	};

	const store = createStore<State, AnyAction, Record<string, unknown>, Record<string, unknown>>(
		reducer,
		{
			...initialState,
		},
		applyMiddleware(reduxThunk.withExtraArgument(dataContext))
	);

	let oldState = store.getState();

	store.subscribe(() => {
		//console.log('State updated:', store.getState());
		const state = store.getState();

		if (state.room2.stage.decisionType !== oldState.room2.stage.decisionType &&
			state.room2.stage.decisionType === DecisionType.Choose) {
			// Selecting question
			// Select a random available question
			const { table } = state;
			const availableQuestions: { themeIndex: number; questionIndex: number }[] = [];

			// Find all available questions
			table.roundInfo.forEach((theme, themeIndex) => {
				theme.questions.forEach((question, questionIndex) => {
					if (question > -1) { // Question is available
						availableQuestions.push({ themeIndex, questionIndex });
					}
				});
			});

			if (availableQuestions.length > 0) {
				// Select a random question
				const randomIndex = Math.floor(Math.random() * availableQuestions.length);
				const selectedQuestion = availableQuestions[randomIndex];

				console.log(`Selecting question: Theme ${selectedQuestion.themeIndex}, Question ${selectedQuestion.questionIndex}`);

				// Dispatch the selection action
				store.dispatch(selectQuestion(selectedQuestion) as unknown as Action);
			}
		} else if (state.table.content.length > 0 &&
			oldState.table.content.length === 0 &&
			state.table.content[0].content.length > 0 &&
			state.table.content[0].content[0].type === ContentType.Text) {
			const questionText = state.table.content[0].content[0].value;
			console.log(`Question: ${questionText}`);

			const prompt = `Answer trivia question. Return only answer, nothing else.
				Think no more than 5 seconds. If you are not 90 percent sure, return "-".
				${questionText}`;

			// TODO: Replace with actual AI call
		}

		oldState = state;
	});

	async function playGame() {
		await new Promise(resolve => setTimeout(resolve, 200000));
	}

	// Simulate game process without UI
	async function simulateGameProcess() {
		// Initialize and set up user
		const initialView: INavigationState = { path: Path.Root };
		store.dispatch(actionCreators.initStageSkipLoginLicenseAsync(initialView, store.dispatch) as unknown as Action);

		// Set a user login
		store.dispatch(changeLogin('BotPlayer'));
		console.log('User login set to: BotPlayer');

		// Navigate to lobby
		store.dispatch(navigate({ navigation: { path: Path.Lobby }, saveState: true }) as unknown as Action);

		// Wait a bit for lobby to load
		await new Promise(resolve => setTimeout(resolve, 2000));

		// Create a new game
		store.dispatch(newGame());

		// Configure game settings
		store.dispatch(setName('Simulated Game'));
		store.dispatch(setRole(Role.Player));
		store.dispatch(setPlayersCount(3));
		store.dispatch(setType(GameType.Classic));
		store.dispatch(setPackageType(PackageType.Random));
		console.log('Game configured as: Classic game with 3 players');

		// Step 4: Create a new game (single player vs bots)
		store.dispatch(onlineActionCreators.createNewGame(true, store.dispatch) as unknown as Action);

		// Wait for game creation
		await new Promise(resolve => setTimeout(resolve, 5000));

		// Start playing the game
		const currentState = store.getState();

		if (currentState.ui.navigation.path === Path.Room) {
			await playGame();
		} else {
			console.log('Game creation failed or still in progress. Current path:', currentState.ui.navigation.path);
		}

		console.log('=== Game Finished ===');
	}

	// Start the simulation
	simulateGameProcess().catch(error => {
		console.error('Simulation error:', error);
	});

	console.log('Store initialized with initial state:', store.getState());
}

// Initialize the application
initializeApp().catch(error => {
	console.error('App initialization error:', error);
});
