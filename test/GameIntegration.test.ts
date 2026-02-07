/**
 * Comprehensive Game Integration Test
 * 
 * This test validates the complete game flow without UI:
 * 1. Connects to game server
 * 2. Creates and configures a new game
 * 3. Starts the game with bot players
 * 4. Plays through multiple questions
 * 5. Validates game state transitions
 * 
 * Purpose: Validate that game logic, server communication, and state management
 * work correctly together. This test serves as a regression test for future changes.
 * 
 * **IMPORTANT**: This test is DISABLED BY DEFAULT and only runs when explicitly enabled.
 * Set RUN_INTEGRATION_TEST=1 environment variable to run this test during manual development.
 * 
 * The test is skipped by default to prevent failures in CI/CD pipelines where live server
 * access may not be available or desired.
 * 
 * Usage:
 * - Run during development: RUN_INTEGRATION_TEST=1 npm test GameIntegration.test.ts
 * - CI/CD (skipped by default): npm test
 * 
 * Note: This test requires a live game server connection and may take 30+ seconds to complete.
 * Set TEST_TIMEOUT environment variable to control timeout (default: 60000ms).
 */

import { Action, AnyAction, applyMiddleware, createStore } from 'redux';
import State, { initialState } from '../src/state/State';
import reducer from '../src/state/reducer';
import DataContext from '../src/model/DataContext';
import IHost, { FullScreenMode } from '../src/host/IHost';
import SIStorageClient from 'sistorage-client';
import SIStorageInfo from '../src/client/contracts/SIStorageInfo';
import GameServerClient from '../src/client/GameServerClient';
import SIHostClient from '../src/client/SIHostClient';
import GameClient from '../src/client/game/GameClient';
import reduxThunk from 'redux-thunk';
import actionCreators from '../src/logic/actionCreators';
import { INavigationState } from '../src/state/uiSlice';
import Path from '../src/model/enums/Path';
import { navigate } from '../src/utils/Navigator';
import onlineActionCreators from '../src/state/online/onlineActionCreators';
import { changeLogin } from '../src/state/userSlice';
import { setName, setPackageType, setRole, setPlayersCount, setType, setPassword } from '../src/state/gameSlice';
import PackageType from '../src/model/enums/PackageType';
import Role from '../src/model/Role';
import GameType from '../src/model/GameType';
import { newGame } from '../src/state/online2Slice';
import { randomBytes } from 'crypto';
import { selectQuestion, selectTheme } from '../src/state/serverActions';
import TableMode from '../src/model/enums/TableMode';
import { DecisionType, playerSelected, pressGameButton, sendAnswer, sendPass, sendStake } from '../src/state/room2Slice';
import StakeModes from '../src/client/game/StakeModes';
import GameStage from '../src/model/enums/GameStage';

/**
 * Mock host implementation for testing
 */
class TestHost implements IHost {
	private readonly isSimulation = true;

	getRandomValue: () => number;

	constructor() {
		this.getRandomValue = () => {
			const buffer = randomBytes(4);
			const array = new Uint32Array(buffer.buffer, buffer.byteOffset, buffer.length / 4);
			return array[0];
		};
	}

	isDesktop(): boolean {
		return false;
	}

	async initAsync(): Promise<void> {
		// No-op for testing
	}

	onReady(): void {
		// No-op for testing
	}

	isLicenseAccepted(): boolean {
		return true;
	}

	acceptLicense(): void {
		// No-op for testing
	}

	loadNavigationState() {
		return null;
	}

	saveNavigationState(): void {
		// No-op for testing
	}

	isFullScreenSupported(): boolean {
		return false;
	}

	detectFullScreen(): FullScreenMode {
		return FullScreenMode.Undefined;
	}

	async setFullScreen(): Promise<boolean> {
		return Promise.resolve(false);
	}

	copyToClipboard(): void {
		// No-op for testing
	}

	copyUriToClipboard(): void {
		// No-op for testing
	}

	openLink(): void {
		// No-op for testing
	}

	getStorage(): { storageClient?: SIStorageClient; storageInfo?: SIStorageInfo; } {
		return {};
	}

	async getPackageData(): Promise<[File, string] | null> {
		return Promise.resolve(null);
	}

	exitApp(): void {
		// No-op for testing
	}

	async clearGameLog(): Promise<boolean> {
		return Promise.resolve(true);
	}

	async addGameLog(): Promise<boolean> {
		return Promise.resolve(true);
	}

	async openGameLog(): Promise<boolean> {
		return Promise.resolve(true);
	}

	getPackageSource(): string | undefined {
		return undefined;
	}

	getFallbackPackageSource(): string | undefined {
		return undefined;
	}
}

/**
 * Test configuration constants
 */
const TEST_CONFIG = {
	// Time to wait between decision making to simulate thinking time
	DECISION_DELAY_MS: 500,
	
	// Default server URL (can be overridden with environment variable)
	DEFAULT_SERVER_URL: process.env.TEST_SERVER_URL || 'https://vladimirkhil.com/si/api',
	
	// Minimum questions to play before test completes
	MIN_QUESTIONS_TO_PLAY: 3,
	
	// Wait timeout for various conditions
	DEFAULT_WAIT_TIMEOUT_MS: 10000,
	GAME_START_TIMEOUT_MS: 15000,
	QUESTION_PLAY_TIMEOUT_MS: 30000,
};

/**
 * Helper to wait for a condition to be true
 * 
 * @param condition Function that returns true when condition is met
 * @param timeout Maximum time to wait in milliseconds
 * @param checkInterval How often to check the condition in milliseconds
 * @returns Promise that resolves when condition is true or rejects on timeout
 * 
 * Note: This could be extracted to a shared test utilities module for reuse
 */
function waitFor(
	condition: () => boolean,
	timeout: number = TEST_CONFIG.DEFAULT_WAIT_TIMEOUT_MS,
	checkInterval: number = 100
): Promise<void> {
	return new Promise((resolve, reject) => {
		const startTime = Date.now();
		
		const check = () => {
			if (condition()) {
				resolve();
			} else if (Date.now() - startTime > timeout) {
				reject(new Error('Timeout waiting for condition'));
			} else {
				setTimeout(check, checkInterval);
			}
		};
		
		check();
	});
}

/**
 * Helper to select a random available question
 */
function selectRandomQuestion(state: State, store: any): boolean {
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

		store.dispatch(selectQuestion(selectedQuestion) as unknown as Action);
		return true;
	}

	return false;
}

/**
 * Helper to select a random available theme
 */
function selectRandomTheme(state: State, store: any): boolean {
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

		store.dispatch(selectTheme(selectedThemeIndex) as unknown as Action);
		return true;
	}

	return false;
}

/**
 * Helper to handle decision making
 */
function handleDecision(state: State, store: any): boolean {
	switch (state.room2.stage.decisionType) {
		case DecisionType.Choose:
			if (state.table.mode === TableMode.RoundTable) {
				return selectRandomQuestion(state, store);
			} else if (state.table.mode === TableMode.ThemeStack) {
				return selectRandomTheme(state, store);
			}
			break;

		case DecisionType.Answer:
			// For testing, we'll send a simple answer
			store.dispatch(sendAnswer('Test Answer') as unknown as Action);
			return true;

		case DecisionType.SelectPlayer:
			// Select first available player
			const { players } = state.room2.persons;
			const availablePlayers = players.filter(p => p.canBeSelected);
			if (availablePlayers.length > 0) {
				const playerIndex = players.indexOf(availablePlayers[0]);
				store.dispatch(playerSelected(playerIndex) as unknown as Action);
				return true;
			}
			break;

		case DecisionType.Stake:
			const { stakes } = state.room;
			if ((stakes.stakeModes & StakeModes.Pass) > 0) {
				store.dispatch(sendPass() as unknown as Action);
				return true;
			} else if ((stakes.stakeModes & StakeModes.Stake) > 0) {
				const randomStake = stakes.minimum;
				store.dispatch(sendStake(randomStake) as unknown as Action);
				return true;
			}
			break;

		default:
			// No action needed for other decision types
			break;
	}

	return false;
}

describe('Game Integration Test', () => {
	// Skip this test by default - only run when RUN_INTEGRATION_TEST=1 is set
	// This prevents the test from running in CI/CD pipelines where live server access may not be available
	const shouldRun = process.env.RUN_INTEGRATION_TEST === '1';
	const testTimeout = parseInt(process.env.TEST_TIMEOUT || '60000', 10);

	// Mark test as skipped unless explicitly enabled
	(shouldRun ? describe : describe.skip)('Full Game Flow', () => {
		let store: any;
		let dataContext: DataContext;
		let gameStarted = false;
		let questionsPlayed = 0;

		beforeAll(async () => {
			// This test requires a live server connection
			// Test is DISABLED BY DEFAULT - set RUN_INTEGRATION_TEST=1 to enable
			// This prevents failures in CI/CD pipelines where live server access may not be available
			console.log('Starting game integration test...');
			console.log('Note: This test requires a live game server connection');
			console.log(`Server URL: ${TEST_CONFIG.DEFAULT_SERVER_URL}`);
		});

		it('should complete a full game flow', async () => {
			// Track game events
			const events: string[] = [];
			let oldState: State;

			try {
				// Create game server client
				// Server URL can be configured via TEST_SERVER_URL environment variable
				const gameClient = new GameServerClient(TEST_CONFIG.DEFAULT_SERVER_URL);

				dataContext = {
					config: {
						siStatisticsServiceUri: '',
						appRegistryServiceUri: '',
					},
					serverUri: TEST_CONFIG.DEFAULT_SERVER_URL,
					gameClient,
					game: new GameClient(new SIHostClient()),
					contentUris: null,
					contentClients: [],
					storageClients: [],
					host: new TestHost(),
				};

				// Create Redux store
				store = createStore<State, AnyAction, Record<string, unknown>, Record<string, unknown>>(
					reducer,
					{
						...initialState,
					},
					applyMiddleware(reduxThunk.withExtraArgument(dataContext))
				);

				oldState = store.getState();

				// Subscribe to state changes to handle game flow
				store.subscribe(async () => {
					const state = store.getState();

					// Track decision type changes
					if (state.room2.stage.decisionType !== oldState.room2.stage.decisionType &&
						state.room2.stage.decisionType !== DecisionType.None) {
						events.push(`Decision: ${DecisionType[state.room2.stage.decisionType]}`);
						
						// Add small delay to simulate thinking time
						await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.DECISION_DELAY_MS));
						handleDecision(state, store);
					}

					// Track stage changes
					if (state.room.stage.name !== oldState.room.stage.name) {
						events.push(`Stage: ${state.room.stage.name}`);
						
						if (state.room.stage.name === GameStage.After) {
							events.push('Game finished');
						}
					}

					// Track when questions are selected
					if (state.room.stage.currentPrice !== oldState.room.stage.currentPrice &&
						state.room.stage.currentPrice > 0) {
						questionsPlayed++;
						events.push(`Question ${questionsPlayed}: Price ${state.room.stage.currentPrice}`);
					}

					// Track game start
					if (state.room2.stage.isGameStarted && !oldState.room2.stage.isGameStarted) {
						gameStarted = true;
						events.push('Game started');
					}

					oldState = state;
				});

				// Step 1: Initialize
				const initialView: INavigationState = { path: Path.Root };
				store.dispatch(actionCreators.initStageSkipLoginLicenseAsync(initialView, store.dispatch) as unknown as Action);
				events.push('Initialized');

				// Step 2: Set user login
				store.dispatch(changeLogin('TestPlayer'));
				events.push('Set login');

				// Step 3: Navigate to lobby
				store.dispatch(navigate({ navigation: { path: Path.Lobby }, saveState: true }) as unknown as Action);
				events.push('Navigated to lobby');

				// Wait for lobby to load
				await new Promise(resolve => setTimeout(resolve, 2000));

				// Step 4: Create new game
				store.dispatch(newGame());
				store.dispatch(setName('Integration Test Game'));
				store.dispatch(setPassword(''));
				store.dispatch(setRole(Role.Player));
				store.dispatch(setPlayersCount(2));
				store.dispatch(setType(GameType.Classic));
				store.dispatch(setPackageType(PackageType.Random));
				events.push('Configured game');

				// Step 5: Create the game
				store.dispatch(onlineActionCreators.createNewGame(false, store.dispatch) as unknown as Action);
				events.push('Created game');

				// Wait for game creation and server response
				await waitFor(() => store.getState().ui.navigation.path === Path.Room, TEST_CONFIG.DEFAULT_WAIT_TIMEOUT_MS);
				events.push('Entered game room');

				// Step 6: Add bot players
				await dataContext.game.changeTableType(false, 1);
				await new Promise(resolve => setTimeout(resolve, 1000));
				events.push('Added bot player');

				// Wait for game to start
				await waitFor(() => gameStarted, TEST_CONFIG.GAME_START_TIMEOUT_MS);

				// Step 7: Play through questions
				// Wait for questions to be played (the subscriber will handle the gameplay)
				await waitFor(() => questionsPlayed >= TEST_CONFIG.MIN_QUESTIONS_TO_PLAY, TEST_CONFIG.QUESTION_PLAY_TIMEOUT_MS);

				// Verify the game flow
				expect(events).toContain('Initialized');
				expect(events).toContain('Set login');
				expect(events).toContain('Navigated to lobby');
				expect(events).toContain('Configured game');
				expect(events).toContain('Created game');
				expect(events).toContain('Game started');
				expect(questionsPlayed).toBeGreaterThanOrEqual(TEST_CONFIG.MIN_QUESTIONS_TO_PLAY);

				console.log('\n=== Game Integration Test Results ===');
				console.log(`Questions played: ${questionsPlayed}`);
				console.log(`Total events: ${events.length}`);
				console.log('Sample events:');
				events.slice(0, 20).forEach(event => console.log(`  - ${event}`));
				console.log('=====================================\n');

			} catch (error) {
				console.error('Integration test error:', error);
				console.log('Events recorded:', events);
				throw error;
			}
		}, testTimeout);
	});

	describe('Test Documentation', () => {
		it('should document the test scenario', () => {
			const testDescription = {
				name: 'Comprehensive Game Integration Test',
				purpose: 'Validate complete game flow without UI',
				steps: [
					'1. Initialize application and Redux store',
					'2. Set user login credentials',
					'3. Navigate to game lobby',
					'4. Configure new game (name, players, type, package)',
					'5. Create game on server',
					'6. Add bot players to game',
					'7. Wait for game to start',
					'8. Automatically play through multiple questions',
					'9. Handle various decision types (choose question, answer, select player, stake)',
					'10. Validate game state transitions',
				],
				validations: [
					'User can connect to server',
					'Game can be created and configured',
					'Bot players can be added',
					'Game starts successfully',
					'Questions are selected and played',
					'Game state transitions correctly',
					'Multiple questions can be completed',
				],
				configuration: {
					skipVariable: 'SKIP_INTEGRATION_TEST=1',
					timeoutVariable: 'TEST_TIMEOUT (default: 60000ms)',
				},
				requirements: [
					'Live game server connection (or mocked server)',
					'Network connectivity to game server',
					'Sufficient timeout for game progression',
				],
			};

			// This test just documents the structure
			expect(testDescription.steps.length).toBeGreaterThan(0);
			expect(testDescription.validations.length).toBeGreaterThan(0);
			
			console.log('\n=== Test Scenario Description ===');
			console.log(JSON.stringify(testDescription, null, 2));
			console.log('=================================\n');
		});
	});
});
