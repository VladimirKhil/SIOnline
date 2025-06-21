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
import { selectAnswerOption, selectQuestion, selectTheme } from './state/serverActions';
import ContentType from './model/enums/ContentType';
import ServerInfo from './model/server/ServerInfo';
import { DecisionType, playerSelected, sendAllIn, sendAnswer, sendPass, sendStake } from './state/room2Slice';
import TableMode from './model/enums/TableMode';
import StakeModes from './client/game/StakeModes';
import GameStage from './model/enums/GameStage';
import ItemState from './model/enums/ItemState';
import LayoutMode from './model/enums/LayoutMode';

class ManagedHost implements IHost {
	private readonly isSimulation = true;

	getRandomValue: () => number;

	constructor() {
		// Simulated environment, no real initialization needed
		console.log('ManagedHost initialized in simulation mode');

		this.getRandomValue = () => {
			const buffer = randomBytes(4);
			const array = new Uint32Array(buffer.buffer, buffer.byteOffset, buffer.length / 4);
			return array[0];
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

	function onSelectQuestion(state: State) {
		// Select a random available question
		const { table } = state;
		const availableQuestions: { themeIndex: number; questionIndex: number; }[] = [];

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
	}

	function onSelectTheme(state: State) {
		// Select a random available theme
		const { table } = state;
		const availableThemes: number[] = [];

		// Find all available themes
		table.roundInfo.forEach((theme, themeIndex) => {
			if (theme.name.length > 0) { // Theme is available if it has a name
				availableThemes.push(themeIndex);
			}
		});

		if (availableThemes.length > 0) {
			// Select a random theme
			const randomIndex = Math.floor(Math.random() * availableThemes.length);
			const selectedThemeIndex = availableThemes[randomIndex];

			console.log(`Selecting theme: ${selectedThemeIndex}`);

			// Dispatch the selection action
			store.dispatch(selectTheme(selectedThemeIndex) as unknown as Action);
		}
	}

	function onAnswer(state: State) {
		store.dispatch(sendAnswer('-') as unknown as Action);
	}

	function onSelectAnswerOption(state: State) {
		// Select a random answer option
		const availableOptions = state.table.answerOptions.filter(option => option.state === ItemState.Normal);

		if (availableOptions.length === 0) {
			console.log('No answer options available');
			return;
		}

		const randomIndex = Math.floor(Math.random() * availableOptions.length);
		const { label } = availableOptions[randomIndex];
		store.dispatch(selectAnswerOption(label) as unknown as Action);
	}

	function onSelectPlayer(state: State) {
		// Select a random player
		const { players } = state.room2.persons;

		if (players.length > 0) {
			const availablePlayers: number[] = [];

			players.forEach((player, index) => {
				if (player.canBeSelected) {
					availablePlayers.push(index);
				}
			});

			if (availablePlayers.length > 0) {
				// Select a random player
				const randomIndex = Math.floor(Math.random() * availablePlayers.length);
				const selectedPlayerIndex = availablePlayers[randomIndex];
				const selectedPlayer = players[selectedPlayerIndex];

				console.log(`Selecting player: ${selectedPlayer.name}`);

				// Dispatch the selection action
				store.dispatch(playerSelected(selectedPlayerIndex) as unknown as Action);
			}
		}
	}

	function onStake(state: State) {
		const { stakes } = state.room;

		if ((stakes.stakeModes & StakeModes.Pass) > 0) {
			// If Pass stake is available, select it
			console.log('Selecting Pass stake');
			store.dispatch(sendPass() as unknown as Action);
			return;
		}

		if ((stakes.stakeModes & StakeModes.Stake) > 0) {
			const stakeRange = (stakes.maximum - stakes.minimum) / stakes.step;
			const randomStake = (Math.floor(Math.random() * stakeRange) * stakes.step) + stakes.minimum;
			store.dispatch(sendStake(randomStake) as unknown as Action);
			return;
		}

		store.dispatch(sendAllIn() as unknown as Action);
	}

	store.subscribe(() => {
		const state = store.getState();
		const tempOldState = oldState;
		oldState = state;

		if (state.room2.persons.showman.replic !== tempOldState.room2.persons.showman.replic) {
			const showmanReplic = state.room2.persons.showman.replic;

			if (showmanReplic && showmanReplic.length > 0) {
				console.log(`${state.room2.persons.showman.name}: ${showmanReplic}`);
			}
		}

		if (state.room2.persons.players.some((player, index) => player.replic !== tempOldState.room2.persons.players[index]?.replic)) {
			state.room2.persons.players.forEach((player, index) => {
				const oldPlayer = tempOldState.room2.persons.players[index];

				if (player.replic !== oldPlayer?.replic) {
					if (player.replic && player.replic.length > 0) {
						console.log(`${player.name}: ${player.replic}`);
					}
				}
			});
		}

		if (state.room2.stage.decisionType !== tempOldState.room2.stage.decisionType) {
			switch (state.room2.stage.decisionType) {
				case DecisionType.Choose:
					if (state.table.mode === TableMode.RoundTable) {
						onSelectQuestion(state);
					} else if (state.table.mode === TableMode.Final) {
						onSelectTheme(state);
					}
					break;

				case DecisionType.Answer:
					if (state.table.layoutMode === LayoutMode.AnswerOptions) {
						onSelectAnswerOption(state);
					} else {
						onAnswer(state);
					}
					break;

				case DecisionType.SelectPlayer:
					onSelectPlayer(state);
					break;

				case DecisionType.Stake:
					onStake(state);
					break;

				case DecisionType.SelectChooser:
				case DecisionType.OralAnswer:
				case DecisionType.None:
					// No decision to make, do nothing
					break;

				default:
					console.log(`Unhandled decision type: ${state.room2.stage.decisionType}`);
					break;
			}
		}

		if (state.table.content.length > 0 &&
			tempOldState.table.content.length === 0 &&
			state.table.content[0].content.length > 0 &&
			state.table.content[0].content[0].type === ContentType.Text) {
			const questionText = state.table.content[0].content[0].value;

			const prompt = `Answer trivia question. Return only answer, nothing else.
				Think no more than 5 seconds. If you are not 90 percent sure, return "-".
				${questionText}`;

			// TODO: Replace with actual AI call
		}

		if (state.table.mode !== tempOldState.table.mode) {
			switch (state.table.mode) {
				case TableMode.Logo:
					console.log('Displaying logo');
					break;

				case TableMode.GameThemes:
					console.log(`Game themes: ${state.table.gameThemes.join(', ')}`);
					break;

				case TableMode.Content:
					console.log(`Content displayed: ${state.table.content.map(c => c.content.map(item => item.value).join(', ')).join(' | ')}`);
					break;

				case TableMode.Object:
					console.log(`${state.table.header}: ${state.table.text}`);
					break;

				case TableMode.QuestionType:
					console.log(`Question type: ${state.table.text}`);
					break;

				case TableMode.RoundThemes:
					console.log(`Round themes: ${state.table.roundInfo.map(theme => theme.name).join(', ')}`);
					break;

				case TableMode.Final:
					console.log('Final table displayed');
					break;

				case TableMode.Text:
					console.log(`Text displayed: ${state.table.text}`);
					break;

				case TableMode.Welcome:
					console.log('Welcome screen displayed');
					break;

				case TableMode.RoundTable:
					console.log('Round table displayed');
					break;

				default:
					console.log(`Unknown table mode: ${state.table.mode}`);
			}
		}

		if (state.room.stage.name !== tempOldState.room.stage.name) {
			if (state.room.stage.name === GameStage.After) {
				console.log('=== Game finished ===');
			}
		}
	});

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

		if (currentState.ui.navigation.path !== Path.Room) {
			throw new Error(`Expected path to be ${Path.Room}, but got ${currentState.ui.navigation.path}`);
		}
	}

	// Start the simulation
	simulateGameProcess().catch(error => {
		console.error('Simulation error:', error);
	});
}

// Initialize the application
initializeApp().catch(error => {
	console.error('App initialization error:', error);
});
