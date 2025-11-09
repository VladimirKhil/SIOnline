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
import reduxThunk from 'redux-thunk';
import actionCreators from './logic/actionCreators';
import { INavigationState } from './state/uiSlice';
import Path from './model/enums/Path';
import { navigate } from './utils/Navigator';
import onlineActionCreators from './state/online/onlineActionCreators';
import { changeLogin } from './state/userSlice';
import { setName, setPackageType, setRole, setPlayersCount, setType, setPassword } from './state/gameSlice';
import PackageType from './model/enums/PackageType';
import Role from './model/Role';
import GameType from './model/GameType';
import { newGame } from './state/online2Slice';
import { randomBytes } from 'crypto';
import { selectAnswerOption, selectQuestion, selectTheme } from './state/serverActions';
import ContentType from './model/enums/ContentType';
import ServerInfo from './model/server/ServerInfo';
import { DecisionType, playerSelected, pressGameButton, sendAllIn, sendAnswer, sendPass, sendStake } from './state/room2Slice';
import TableMode from './model/enums/TableMode';
import StakeModes from './client/game/StakeModes';
import GameStage from './model/enums/GameStage';
import ItemState from './model/enums/ItemState';
import LayoutMode from './model/enums/LayoutMode';
import OpenAI from 'openai';

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

	async getPackageData(): Promise<[File, string] | null> {
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

	getPackageSource(): string | undefined {
		return undefined;
	}

	getFallbackPackageSource(): string | undefined {
		return undefined;
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

// Global variables to track question processing
let questionTimeout: NodeJS.Timeout | null = null;
let isProcessingQuestion = false;
let preparedAnswer: string | null = null;
let canPressButton = false;

async function callOpenAI(question: string, options?: string[], themeName?: string, themeComment?: string): Promise<string> {
	const apiKey = process.env.OPENAI_API_KEY;

	if (!apiKey) {
		console.log('\x1b[31mOPENAI_API_KEY environment variable not set\x1b[0m');
		return '-';
	}

	try {
		const openai = new OpenAI({ apiKey });

		// Build context information
		let contextInfo = '';
		if (themeName) {
			contextInfo = `\n\nContext:\nTheme: ${themeName}`;
			if (themeComment) {
				contextInfo += `\nTheme comment: ${themeComment}`;
			}
		}

		let prompt: string;

		if (options && options.length > 0) {
			// Multiple choice mode - provide options to choose from
			const optionsList = options.map((opt, idx) => `${idx + 1}. ${opt}`).join('\n');
			prompt = 'You are an expert trivia player. Answer this multiple choice trivia question by selecting the correct option. ' +
				'Respond with ONLY the exact text of the correct answer option (without the number). ' +
				'If you are not at least 90% confident, respond with exactly "-".' +
				contextInfo +
				`\n\nQuestion: ${question}\n\nOptions:\n${optionsList}\n\nAnswer:`;
		} else {
			// Free-form answer mode
			prompt = 'You are an expert trivia player. Answer this trivia question with just the answer - ' +
				'no explanations, no reasoning, just the answer. If you are not at least 90% confident in your answer, ' +
				'respond with exactly "-".' +
				contextInfo +
				'\n\nQuestion: ' + question + '\n\nAnswer:';
		}

		console.log('\x1b[33mAsking OpenAI...\x1b[0m');

		const response = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo',
			messages: [
				{
					role: 'user',
					content: prompt
				}
			],
			max_tokens: 100,
			temperature: 0.1 // Low temperature for more deterministic answers
		});

		const answer = response.choices[0]?.message?.content?.trim() || '-';
		return answer;
	} catch (error) {
		console.error('\x1b[31mOpenAI API error:\x1b[0m', error);
		return '-';
	}
}

async function initializeApp() {
	const serverUri = await getServerUri('https://vladimirkhil.com/api/si/servers');

	const gameClient = new GameServerClient(serverUri);

	const dataContext: DataContext = {
		config: {
			siStatisticsServiceUri: '',
			appRegistryServiceUri: '',
		},
		serverUri: serverUri,
		gameClient,
		game: new GameClient(new SIHostClient()),
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

			console.log(`\x1b[33m> Selecting question: Theme ${selectedQuestion.themeIndex}, Question ${selectedQuestion.questionIndex}\x1b[0m`);

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

			console.log(`\x1b[33m> Selecting theme: ${selectedThemeIndex}\x1b[0m`);

			// Dispatch the selection action
			store.dispatch(selectTheme(selectedThemeIndex) as unknown as Action);
		}
	}

	async function startThinkingOnQuestion(questionText: string, answerOptions?: string[], themeName?: string, themeComment?: string): Promise<void> {
		// Clear any existing timeout
		if (questionTimeout) {
			clearTimeout(questionTimeout);
			questionTimeout = null;
		}

		if (isProcessingQuestion) {
			console.log('\x1b[33m> Already processing a question, ignoring...\x1b[0m');
			return;
		}

		isProcessingQuestion = true;
		preparedAnswer = null;

		if (answerOptions && answerOptions.length > 0) {
			console.log(`\x1b[33m> Starting to think on question with ${answerOptions.length} options...\x1b[0m`);
		} else {
			console.log('\x1b[33m> Starting to think on question...\x1b[0m');
		}

		if (themeName) {
			console.log(`\x1b[33m> Theme: ${themeName}${themeComment ? ` (${themeComment})` : ''}\x1b[0m`);
		}

		// Set up 5-second timeout
		const timeoutPromise = new Promise<string>((resolve) => {
			questionTimeout = setTimeout(() => {
				console.log('\x1b[33m> 5 seconds elapsed, stopping AI thinking...\x1b[0m');
				resolve('-');
			}, 5000);
		});

		try {
			// Race between OpenAI response and timeout
			const answer = await Promise.race([
				callOpenAI(questionText, answerOptions, themeName, themeComment),
				timeoutPromise
			]);

			// Clear timeout if AI responded faster
			if (questionTimeout) {
				clearTimeout(questionTimeout);
				questionTimeout = null;
			}

			preparedAnswer = answer;
			console.log(`\x1b[33m> Answer ready: ${answer}\x1b[0m`);

			// Press the button if we can and have an answer
			if (canPressButton && answer !== '-') {
				console.log('\x1b[33m> Pressing button to answer...\x1b[0m');
				store.dispatch(pressGameButton() as unknown as Action);
			}
		} catch (error) {
			console.error('\x1b[31mError getting AI answer:\x1b[0m', error);
			preparedAnswer = '-';
		}

		isProcessingQuestion = false;
	}

	function onAnswer() {
		// Use the prepared answer if available, otherwise default to '-'
		const answer = preparedAnswer || '-';
		console.log(`\x1b[33m> Sending prepared answer: ${answer}\x1b[0m`);
		store.dispatch(sendAnswer(answer) as unknown as Action);

		// Clear the prepared answer after use
		preparedAnswer = null;
	}

	function onSelectAnswerOption(state: State) {
		// Select a random answer option
		const availableOptions = state.table.answerOptions.filter(option => option.state === ItemState.Normal);

		if (availableOptions.length === 0) {
			console.log('No answer options available');
			return;
		}

		let optionIndex = Math.floor(Math.random() * availableOptions.length);
		let matchType = 'random';

		if (preparedAnswer && preparedAnswer !== '-') {
			// Try to find exact match first
			for (let i = 0; i < availableOptions.length; i += 1) {
				if (availableOptions[i].content.value.toLowerCase().trim() === preparedAnswer.toLowerCase().trim()) {
					optionIndex = i;
					matchType = 'exact';
					break;
				}
			}

			// If no exact match, try partial match (AI answer contains option or vice versa)
			if (matchType === 'random') {
				for (let i = 0; i < availableOptions.length; i += 1) {
					const optionText = availableOptions[i].content.value.toLowerCase().trim();
					const answerText = preparedAnswer.toLowerCase().trim();

					if (optionText.includes(answerText) || answerText.includes(optionText)) {
						optionIndex = i;
						matchType = 'partial';
						break;
					}
				}
			}
		}

		const selectedOption = availableOptions[optionIndex];
		console.log(`\x1b[33m> Selecting answer option (${matchType}): ${selectedOption.label} - ${selectedOption.content.value}\x1b[0m`);

		const { label } = selectedOption;
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

				console.log(`\x1b[33m> Selecting player: ${selectedPlayer.name}\x1b[0m`);

				// Dispatch the selection action
				store.dispatch(playerSelected(selectedPlayerIndex) as unknown as Action);
			}
		}
	}

	function onStake(state: State) {
		const { stakes } = state.room;

		if ((stakes.stakeModes & StakeModes.Pass) > 0) {
			// If Pass stake is available, select it
			console.log('\x1b[33m> Selecting Pass stake\x1b[0m');
			store.dispatch(sendPass() as unknown as Action);
			return;
		}

		if ((stakes.stakeModes & StakeModes.Stake) > 0) {
			const stakeRange = (stakes.maximum - stakes.minimum) / stakes.step;
			const randomStake = (Math.floor(Math.random() * stakeRange) * stakes.step) + stakes.minimum;
			console.log(`\x1b[33m> Sending random stake: ${randomStake}\x1b[0m`);
			store.dispatch(sendStake(randomStake) as unknown as Action);
			return;
		}

		console.log('\x1b[33m> Selecting All In stake\x1b[0m');
		store.dispatch(sendAllIn() as unknown as Action);
	}

	store.subscribe(async () => {
		const state = store.getState();
		const tempOldState = oldState;
		oldState = state;

		if (state.room2.persons.showman.replic !== tempOldState.room2.persons.showman.replic) {
			const showmanReplic = state.room2.persons.showman.replic;

			if (showmanReplic && showmanReplic.length > 0) {
				console.log(`\x1b[31m${state.room2.persons.showman.name}\x1b[0m: ${showmanReplic}`);
			}
		}

		if (state.room2.persons.players.some((player, index) => player.replic !== tempOldState.room2.persons.players[index]?.replic)) {
			state.room2.persons.players.forEach((player, index) => {
				const oldPlayer = tempOldState.room2.persons.players[index];

				if (player.replic !== oldPlayer?.replic) {
					if (player.replic && player.replic.length > 0) {
						console.log(`\x1b[32m${player.name}\x1b[0m: ${player.replic}`);
					}
				}
			});
		}

		if (state.room2.stage.decisionType !== tempOldState.room2.stage.decisionType) {
			// add small delay here to simulate thinking time
			await new Promise(resolve => setTimeout(resolve, 1000));

			switch (state.room2.stage.decisionType) {
				case DecisionType.Choose:
					if (state.table.mode === TableMode.RoundTable) {
						onSelectQuestion(state);
					} else if (state.table.mode === TableMode.ThemeStack) {
						onSelectTheme(state);
					}
					break;

				case DecisionType.Answer:
					if (state.table.layoutMode === LayoutMode.AnswerOptions) {
						onSelectAnswerOption(state);
					} else {
						onAnswer();
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

			if (state.table.layoutMode !== LayoutMode.AnswerOptions) {
				// Get theme context
				const { themeName, themeIndex } = state.room.stage;
				const themeComment = themeIndex >= 0 && themeIndex < state.table.roundInfo.length
					? state.table.roundInfo[themeIndex].comment
					: undefined;

				// Start thinking on the question immediately for non-answer-options mode
				startThinkingOnQuestion(questionText, undefined, themeName, themeComment);
			}
		}

		const { header, text, hint, caption } = state.table;

		if (state.table.mode !== tempOldState.table.mode) {
			switch (state.table.mode) {
				case TableMode.Logo:
					console.log('\x1b[36m============== Logo ==============\x1b[0m');
					break;

				case TableMode.GameThemes:
					console.log('\x1b[36mGame themes\x1b[0m:');

					for (const theme of state.table.roundInfo) {
						console.log(theme.name);
					}
					break;

				case TableMode.Content:
					{
						const contentText = state.table.content.map(c => c.content.map(item => item.value).join(', ')).join(' | ');
						console.log(`${caption ? `\x1b[36m${caption}\x1b[0m: ` : ''}${contentText}`);
						break;
					}

				case TableMode.Object:
					console.log(`${header ? `\x1b[36m${header}\x1b[0m: ` : ''}${text} ${hint ? `(${hint})` : ''}`);
					break;

				case TableMode.QuestionType:
					console.log(`\x1b[36mQuestion type\x1b[0m: ${state.table.text}`);
					break;

				case TableMode.RoundThemes:
					console.log(`\x1b[36mRound themes\x1b[0m: ${state.table.roundInfo.map(theme => theme.name).join(', ')}`);
					break;

				case TableMode.ThemeStack:
					console.log(`\x1b[36mThemes\x1b[0m: ${state.table.roundInfo.map(theme => theme.name).join(', ')}`);
					break;

				case TableMode.Text:
					console.log(`${caption ? `\x1b[36m${caption}\x1b[0m: ` : ''}${state.table.text}`);
					break;

				case TableMode.Welcome:
					console.log('\x1b[36m============== Welcome screen ==============\x1b[0m');
					break;

				case TableMode.RoundTable:
					console.log('\x1b[36m============== Round Table ==============\x1b[0m');

					for (const theme of state.table.roundInfo) {
						console.log(`\x1b[36m${theme.name}\x1b[0m: ${theme.questions.map(q => q > -1 ? q : '    ').join(' ')}`);
					}

					console.log('\x1b[36m=========================================\x1b[0m');

					break;

				default:
					console.log(`Unknown table mode: ${state.table.mode}`);
					break;
			}
		} else if (state.table.text !== tempOldState.table.text) {
			switch (state.table.mode) {
				case TableMode.Object:
					console.log(`${header ? `\x1b[36m${header}\x1b[0m: ` : ''}${text} ${hint ? `(${hint})` : ''}`);
					break;

				default:
					break; // No other modes display text directly
			}
		} else if (state.table.content !== tempOldState.table.content) {
			switch (state.table.mode) {
				case TableMode.Content:
					{
						const contentText = state.table.content.map(c => c.content.map(item => item.value).join(', ')).join(' | ');
						console.log(`${caption ? `\x1b[36m${caption}\x1b[0m: ` : ''}${contentText}`);
						break;
					}

				default:
					// No other modes display content directly
					break;
			}
		} else if (state.table.answerOptions !== tempOldState.table.answerOptions) {
			if (state.table.answerOptions.length > 0) {
				if (tempOldState.table.answerOptions.length === 0) {
					console.log('\x1b[36mAnswer options:\x1b[0m');
				}

				for (let i = 0; i < state.table.answerOptions.length; i += 1) {
					const option = state.table.answerOptions[i];

					if (option.state === ItemState.Normal && (tempOldState.table.answerOptions[i]?.state !== ItemState.Normal ||
						option.content.value !== tempOldState.table.answerOptions[i]?.content.value)) {
						console.log(`\x1b[36m${option.label}\x1b[0m: ${option.content.value}`);
					} else if (option.state === ItemState.Active && tempOldState.table.answerOptions[i]?.state !== ItemState.Active) {
						console.log(`\x1b[32m${option.label}\x1b[0m: (selected)`);
					} else if (option.state === ItemState.Right && tempOldState.table.answerOptions[i]?.state !== ItemState.Right) {
						console.log(`\x1b[32m${option.label}\x1b[0m: (correct)`);
					}
				}

				// Check if all answer options have been populated (last option arrived)
				const allOptionsPopulated = state.table.answerOptions.length > 0 &&
					state.table.answerOptions.every(option => option.content.value.length > 0);

				const wasAllOptionsPopulated = tempOldState.table.answerOptions.length > 0 &&
					tempOldState.table.answerOptions.every(option => option.content.value.length > 0);

				// If all options just became populated, start thinking
				if (allOptionsPopulated && !wasAllOptionsPopulated && state.table.content.length > 0 &&
					state.table.content[0].content.length > 0 &&
					state.table.content[0].content[0].type === ContentType.Text) {
					const questionText = state.table.content[0].content[0].value;
					const options = state.table.answerOptions.map(opt => opt.content.value);

					// Get theme context
					const { themeName, themeIndex } = state.room.stage;
					const themeComment = themeIndex >= 0 && themeIndex < state.table.roundInfo.length
						? state.table.roundInfo[themeIndex].comment
						: undefined;

					console.log('\x1b[33m> All answer options received, starting to think...\x1b[0m');
					startThinkingOnQuestion(questionText, options, themeName, themeComment);
				}
			}
		}

		if (state.table.canPress !== tempOldState.table.canPress) {
			canPressButton = state.table.canPress;
			console.log(state.table.canPress ? '\x1b[90mCan press button\x1b[0m' : '\x1b[90mCannot press button\x1b[0m');

			// If we can press the button and have a prepared answer ready
			if (canPressButton && preparedAnswer && preparedAnswer !== '-') {
				console.log('\x1b[33m> Button available and answer ready, pressing...\x1b[0m');
				store.dispatch(pressGameButton() as unknown as Action);
			}
		}

		if (state.room.stage.isAfterQuestion !== tempOldState.room.stage.isAfterQuestion) {
			if (state.room.stage.isAfterQuestion) {
				console.log(`\x1b[36mScore\x1b[0m: ${state.room2.persons.players.map(p => `${p.name}: ${p.sum}`).join(', ')}`);
			}
		}

		if (state.room.stage.name !== tempOldState.room.stage.name) {
			if (state.room.stage.name === GameStage.After) {
				console.log('\x1b[36m=== Game finished ===\x1b[0m');
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
		store.dispatch(setName('Simulated Game ' + new Date().toISOString()));
		store.dispatch(setPassword('Password'));
		store.dispatch(setRole(Role.Player));
		store.dispatch(setPlayersCount(3));
		store.dispatch(setType(GameType.Classic));
		store.dispatch(setPackageType(PackageType.Random));
		console.log('Game configured as: Classic game with 3 players');

		// Step 4: Create a new game (single player vs bots)
		store.dispatch(onlineActionCreators.createNewGame(false, store.dispatch) as unknown as Action);

		// Wait for game creation
		await new Promise(resolve => setTimeout(resolve, 5000));

		// Start playing the game
		const currentState = store.getState();

		if (currentState.ui.navigation.path !== Path.Room) {
			throw new Error(`Expected path to be ${Path.Room}, but got ${currentState.ui.navigation.path}`);
		}

		// Add tables for 2 more players (we already have 1 player - the bot player)
		console.log('Adding bot players...');

		// Add first bot
		await dataContext.game.changeTableType(false, 1);

		// Add second bot
		await dataContext.game.changeTableType(false, 2);

		// Wait a bit for bots to be ready
		await new Promise(resolve => setTimeout(resolve, 2000));

		console.log('Bot players added, ready to start game');
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
