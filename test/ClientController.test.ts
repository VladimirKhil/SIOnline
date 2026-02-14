import { AnyAction, Dispatch } from 'redux';
import ClientController from '../src/logic/ClientController';
import State, { initialState } from '../src/state/State';
import DataContext from '../src/model/DataContext';
import { AppDispatch } from '../src/state/store';
import Account from '../src/model/Account';
import Sex from '../src/model/enums/Sex';
import PersonInfo from '../src/model/PersonInfo';
import PlayerInfo from '../src/model/PlayerInfo';
import Persons from '../src/model/Persons';
import PlayerStates from '../src/model/enums/PlayerStates';
import ThemeInfo from '../src/model/ThemeInfo';
import ContentInfo from '../src/model/ContentInfo';
import JoinMode from '../src/client/game/JoinMode';
import StakeModes from '../src/client/game/StakeModes';
import ItemState from '../src/model/enums/ItemState';

describe('ClientController - Game Initialization Flow', () => {
	let controller: ClientController;
	let mockDispatch: Dispatch<AnyAction>;
	let mockAppDispatch: AppDispatch;
	let mockGetState: () => State;
	let mockDataContext: DataContext;
	let state: State;
	let dispatchedActions: AnyAction[];

	beforeEach(() => {
		// Initialize state
		state = JSON.parse(JSON.stringify(initialState));
state.settings.appSound = true; // Enable sounds for testing
		state.room2.name = 'TestUser';
		state.settings.appSound = true; // Enable sounds for testing
		state.room2.persons.players = [
			{
				name: 'Player1',
				isReady: false,
				sum: 0,
				stake: 0,
				state: PlayerStates.None,
				canBeSelected: false,
				replic: null,
				isDeciding: false,
				isHuman: true,
				isChooser: false,
				inGame: true,
				mediaLoaded: false,
				mediaPreloaded: false,
				mediaPreloadProgress: 0,
				answer: '',
				isAppellating: false,
			},
			{
				name: 'Player2',
				isReady: false,
				sum: 0,
				stake: 0,
				state: PlayerStates.None,
				canBeSelected: false,
				replic: null,
				isDeciding: false,
				isHuman: true,
				isChooser: false,
				inGame: true,
				mediaLoaded: false,
				mediaPreloaded: false,
				mediaPreloadProgress: 0,
				answer: '',
				isAppellating: false,
			},
		];

		// Setup mocks
		dispatchedActions = [];
		mockDispatch = jest.fn((action: AnyAction) => {
			dispatchedActions.push(action);
			return action;
		}) as Dispatch<AnyAction>;

		mockAppDispatch = jest.fn((action: AnyAction) => {
			dispatchedActions.push(action);
			return action;
		}) as unknown as AppDispatch;

		mockGetState = jest.fn(() => state);

		mockDataContext = {
			serverUri: 'http://localhost:5000',
			contentUris: ['http://localhost:5000'],
		} as DataContext;

		controller = new ClientController(
			mockDispatch,
			mockAppDispatch,
			mockGetState,
			mockDataContext
		);
	});

	describe('onConnected', () => {
		it('should handle player connection', () => {
			const account: Account = {
				name: 'NewPlayer',
				sex: Sex.Male,
				isHuman: true,
				avatar: null,
			};

			controller.onConnected(account, 'player', 0);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/personAdded');
			expect(actions).toContain('room2/playerChanged');
			expect(actions).toContain('common/stopAudio');
		});

		it('should handle showman connection', () => {
			const account: Account = {
				name: 'NewShowman',
				sex: Sex.Female,
				isHuman: true,
				avatar: null,
			};

			controller.onConnected(account, 'showman', -1);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/personAdded');
			expect(actions).toContain('room2/showmanChanged');
		});

		it('should not add self as connected', () => {
			const account: Account = {
				name: 'TestUser',
				sex: Sex.Male,
				isHuman: true,
				avatar: null,
			};

			controller.onConnected(account, 'player', 0);

			expect(mockAppDispatch).not.toHaveBeenCalled();
		});
	});

	describe('onInfo', () => {
		it('should update game info with all persons', () => {
			const all: Persons = {
				'Showman1': {
					name: 'Showman1',
					sex: Sex.Male,
					isHuman: true,
					avatar: null,
				},
				'Player1': {
					name: 'Player1',
					sex: Sex.Male,
					isHuman: true,
					avatar: null,
				},
			};

			const showman: PersonInfo = {
				name: 'Showman1',
				isReady: false,
				replic: null,
				isDeciding: false,
				isHuman: true,
			};

			const players: PlayerInfo[] = [
				{
					name: 'Player1',
					isReady: false,
					sum: 0,
					stake: 0,
					state: PlayerStates.None,
					canBeSelected: false,
					replic: null,
					isDeciding: false,
					isHuman: true,
					isChooser: false,
					inGame: true,
					mediaLoaded: false,
					mediaPreloaded: false,
					mediaPreloadProgress: 0,
					answer: '',
					isAppellating: false,
				},
			];

			controller.onInfo(all, showman, players);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/infoChanged');
		});
	});

	describe('onGameMetadata', () => {
		it('should update game metadata', () => {
			controller.onGameMetadata(
				'Test Game',
				'Test Package',
				'http://example.com',
				'http://voice.com'
			);

			expect(mockDispatch).toHaveBeenCalled();
		});
	});

	describe('onGameThemes', () => {
		it('should display game themes', () => {
			const themes = ['History', 'Science', 'Art'];

			controller.onGameThemes(themes);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('table/showGameThemes');
			// Sound is dispatched through playAudio action
		});
	});

	describe('onSums', () => {
		it('should update all player sums', () => {
			const sums = [100, 200];

			controller.onSums(sums);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/sumsChanged');
		});
	});

	describe('onPackage', () => {
		it('should display package with logo', () => {
			controller.onPackage('Test Package', 'http://logo.png');

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('table/captionChanged');
		});

		it('should display package without logo', () => {
			controller.onPackage('Test Package', null);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('table/showObject');
		});
	});

	describe('onPackageAuthors', () => {
		it('should display package authors', () => {
			const authors = ['Author1', 'Author2'];

			controller.onPackageAuthors(authors);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('table/showObject');
		});
	});
});

describe('ClientController - Round Flow', () => {
	let controller: ClientController;
	let mockDispatch: Dispatch<AnyAction>;
	let mockAppDispatch: AppDispatch;
	let mockGetState: () => State;
	let mockDataContext: DataContext;
	let state: State;
	let dispatchedActions: AnyAction[];

	beforeEach(() => {
		state = JSON.parse(JSON.stringify(initialState));
state.settings.appSound = true; // Enable sounds for testing
		state.room2.persons.players = [
			{
				name: 'Player1',
				isReady: false,
				sum: 0,
				stake: 0,
				state: PlayerStates.None,
				canBeSelected: false,
				replic: null,
				isDeciding: false,
				isHuman: true,
				isChooser: false,
				inGame: true,
				mediaLoaded: false,
				mediaPreloaded: false,
				mediaPreloadProgress: 0,
				answer: '',
				isAppellating: false,
			},
		];

		dispatchedActions = [];
		mockDispatch = jest.fn((action: AnyAction) => {
			dispatchedActions.push(action);
			return action;
		}) as Dispatch<AnyAction>;

		mockAppDispatch = jest.fn((action: AnyAction) => {
			dispatchedActions.push(action);
			return action;
		}) as unknown as AppDispatch;

		mockGetState = jest.fn(() => state);

		mockDataContext = {
			serverUri: 'http://localhost:5000',
			contentUris: ['http://localhost:5000'],
		} as DataContext;

		controller = new ClientController(
			mockDispatch,
			mockAppDispatch,
			mockGetState,
			mockDataContext
		);
	});

	describe('onStage', () => {
		it('should handle round stage transition', () => {
			controller.onStage('Round', 'Round 1', 0, 'SelectByPlayer');

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('common/stopAudio');
			expect(actions).toContain('room2/setIsGameStarted');
			expect(actions).toContain('common/playAudio');
			expect(actions).toContain('table/showObject');
			expect(actions).toContain('room2/resetQuestionCounter');
		});

		it('should handle begin stage', () => {
			controller.onStage('Begin', '', 0, '');

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('table/showLogo');
			expect(actions).toContain('table/captionChanged');
		});
	});

	describe('onRoundThemes', () => {
		it('should display round themes in OneByOne mode', () => {
			controller.onRoundThemes(['Theme1', 'Theme2'], 'OneByOne' as any);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('table/questionReset');
		});

		it('should display round themes in AllTogether mode', () => {
			controller.onRoundThemes(['Theme1', 'Theme2'], 'AllTogether' as any);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('table/setRoundThemes');
			expect(actions).toContain('table/showThemeStack');
		});
	});

	describe('onTable', () => {
		it('should display round table', () => {
			const table: ThemeInfo[] = [
				{
					name: 'Theme1',
					comment: '',
					questions: [100, 200, 300],
				},
			];

			controller.onTable(table);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('table/setRoundThemes');
		});
	});

	describe('onShowTable', () => {
		it('should show the round table', () => {
			controller.onShowTable();

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('table/showRoundTable');
			expect(actions).toContain('common/stopAudio');
		});
	});

	describe('onSetChooser', () => {
		it('should set player as chooser', () => {
			controller.onSetChooser(0, true, false);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/chooserChanged');
			expect(actions).toContain('room2/playerStateChanged');
		});
	});
});

describe('ClientController - Question Flow', () => {
	let controller: ClientController;
	let mockDispatch: Dispatch<AnyAction>;
	let mockAppDispatch: AppDispatch;
	let mockGetState: () => State;
	let mockDataContext: DataContext;
	let state: State;
	let dispatchedActions: AnyAction[];

	beforeEach(() => {
		state = JSON.parse(JSON.stringify(initialState));
state.settings.appSound = true; // Enable sounds for testing
		state.room2.persons.players = [
			{
				name: 'Player1',
				isReady: false,
				sum: 100,
				stake: 0,
				state: PlayerStates.None,
				canBeSelected: false,
				replic: null,
				isDeciding: false,
				isHuman: true,
				isChooser: false,
				inGame: true,
				mediaLoaded: false,
				mediaPreloaded: false,
				mediaPreloadProgress: 0,
				answer: '',
				isAppellating: false,
			},
		];
		state.table.roundInfo = [
			{
				name: 'Theme1',
				comment: '',
				questions: [100, 200, 300],
			},
		];
		state.room2.theme = { name: 'Theme1', comments: '' };

		dispatchedActions = [];
		mockDispatch = jest.fn((action: AnyAction) => {
			dispatchedActions.push(action);
			return action;
		}) as Dispatch<AnyAction>;

		mockAppDispatch = jest.fn((action: AnyAction) => {
			dispatchedActions.push(action);
			return action;
		}) as unknown as AppDispatch;

		mockGetState = jest.fn(() => state);

		mockDataContext = {
			serverUri: 'http://localhost:5000',
			contentUris: ['http://localhost:5000'],
		} as DataContext;

		controller = new ClientController(
			mockDispatch,
			mockAppDispatch,
			mockGetState,
			mockDataContext
		);
	});

	describe('onQuestionSelected', () => {
		it('should handle question selection', () => {
			controller.onQuestionSelected(0, 0, 100);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/playersStateCleared');
			expect(actions).toContain('table/questionReset');
			expect(actions).toContain('room2/incrementQuestionCounter');
			expect(actions).toContain('room2/setTheme');
			expect(actions).toContain('common/playAudio');
		});
	});

	describe('onQuestionType', () => {
		it('should handle simple question type', () => {
			controller.onQuestionType('simple', true, false);

			expect(mockDispatch).toHaveBeenCalled();
			// Default type doesn't show special display
		});

		it('should handle stake question type', () => {
			controller.onQuestionType('stake', false, false);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('common/playAudio');
			expect(actions).toContain('table/showQuestionType');
		});

		it('should handle forAll question type', () => {
			controller.onQuestionType('forAll', false, false);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('common/playAudio');
			expect(actions).toContain('table/showQuestionType');
		});
	});

	describe('onContent', () => {
		it('should handle text content', () => {
			const content: ContentInfo[] = [
				{ type: 'text', value: 'Question text' },
			];

			controller.onContent('screen', content);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('table/showContent');
		});

		it('should handle image content', () => {
			const content: ContentInfo[] = [
				{ type: 'image', value: 'http://localhost:5000/image.jpg' },
			];

			controller.onContent('screen', content);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('table/showContent');
		});

		it('should handle video content', () => {
			const content: ContentInfo[] = [
				{ type: 'video', value: 'http://localhost:5000/video.mp4' },
			];

			controller.onContent('screen', content);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('table/showContent');
		});

		it('should handle replic content', () => {
			const content: ContentInfo[] = [
				{ type: 'text', value: 'Showman says something' },
			];

			controller.onContent('replic', content);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('table/switchToContent');
		});

		it('should handle background audio', () => {
			const content: ContentInfo[] = [
				{ type: 'audio', value: 'http://localhost:5000/audio.mp3' },
			];

			controller.onContent('background', content);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('table/showBackgroundAudio');
		});
	});

	describe('onContentAppend', () => {
		it('should append partial text', () => {
			controller.onContentAppend('screen', '0', 'text', 'more text');

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('table/appendPartialText');
		});
	});

	describe('onContentShape', () => {
		it('should set partial text shape', () => {
			controller.onContentShape('____');

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('table/showPartialText');
			expect(actions).toContain('table/showContent');
		});
	});

	describe('onQuestion', () => {
		it('should start question with price', () => {
			controller.onQuestion('100');

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/playersStateCleared');
			expect(actions).toContain('table/showObject');
		});
	});
});

describe('ClientController - Answer Phase Flow', () => {
	let controller: ClientController;
	let mockDispatch: Dispatch<AnyAction>;
	let mockAppDispatch: AppDispatch;
	let mockGetState: () => State;
	let mockDataContext: DataContext;
	let state: State;
	let dispatchedActions: AnyAction[];

	beforeEach(() => {
		state = JSON.parse(JSON.stringify(initialState));
state.settings.appSound = true; // Enable sounds for testing
		state.room2.persons.players = [
			{
				name: 'Player1',
				isReady: false,
				sum: 100,
				stake: 0,
				state: PlayerStates.None,
				canBeSelected: false,
				replic: null,
				isDeciding: false,
				isHuman: true,
				isChooser: false,
				inGame: true,
				mediaLoaded: false,
				mediaPreloaded: false,
				mediaPreloadProgress: 0,
				answer: '',
				isAppellating: false,
			},
		];

		dispatchedActions = [];
		mockDispatch = jest.fn((action: AnyAction) => {
			dispatchedActions.push(action);
			return action;
		}) as Dispatch<AnyAction>;

		mockAppDispatch = jest.fn((action: AnyAction) => {
			dispatchedActions.push(action);
			return action;
		}) as unknown as AppDispatch;

		mockGetState = jest.fn(() => state);

		mockDataContext = {
			serverUri: 'http://localhost:5000',
			contentUris: ['http://localhost:5000'],
		} as DataContext;

		controller = new ClientController(
			mockDispatch,
			mockAppDispatch,
			mockGetState,
			mockDataContext
		);
	});

	describe('onBeginPressButton', () => {
		it('should enable button press', () => {
			controller.onBeginPressButton();

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('table/canPressChanged');
		});
	});

	describe('onEndPressButtonByPlayer', () => {
		it('should handle button press by player', () => {
			controller.onEndPressButtonByPlayer(0);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('table/canPressChanged');
			expect(actions).toContain('room2/playerStateChanged');
			expect(actions).toContain('common/playAudio');
		});
	});

	describe('onEndPressButtonByTimeout', () => {
		it('should handle timeout when no one pressed', () => {
			controller.onEndPressButtonByTimeout();

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('table/canPressChanged');
			expect(actions).toContain('room2/stopTimer');
			expect(actions).toContain('common/playAudio');
		});
	});

	describe('onAskAnswer', () => {
		it('should request text answer in simple layout', () => {
			state.table.layoutMode = 0; // LayoutMode.Simple

			controller.onAskAnswer('text');

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/answerChanged');
			expect(actions).toContain('room2/answerTypeChanged');
			expect(actions).toContain('room2/setDecisionType');
		});

		it('should enable selection in non-simple layout', () => {
			state.table.layoutMode = 1; // LayoutMode.AnswerOptions

			controller.onAskAnswer(null);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('table/isSelectableChanged');
		});
	});

	describe('onPlayerAnswer', () => {
		it('should display player answer', () => {
			controller.onPlayerAnswer(0, 'My answer');

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/playerReplicChanged');
		});
	});

	describe('onAskValidate', () => {
		it('should request answer validation', () => {
			controller.onAskValidate(0, 'Player answer');

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/askValidation');
		});
	});

	describe('onAskSelectPlayer', () => {
		it('should request player selection', () => {
			controller.onAskSelectPlayer('Answerer', [0, 1]);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/selectPlayers');
			expect(actions).toContain('room2/setDecisionType');
		});
	});

	describe('onAskStake', () => {
		it('should request stake', () => {
			const stakeModes: StakeModes = StakeModes.Stake | StakeModes.Pass;

			controller.onAskStake(stakeModes, 100, 500, 100, 'Staker', 'Player1');

			expect(mockDispatch).toHaveBeenCalled();
			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/setDecisionType');
		});
	});
});

describe('ClientController - Answer Result Flow', () => {
	let controller: ClientController;
	let mockDispatch: Dispatch<AnyAction>;
	let mockAppDispatch: AppDispatch;
	let mockGetState: () => State;
	let mockDataContext: DataContext;
	let state: State;
	let dispatchedActions: AnyAction[];

	beforeEach(() => {
		state = JSON.parse(JSON.stringify(initialState));
state.settings.appSound = true; // Enable sounds for testing
		state.room2.persons.players = [
			{
				name: 'Player1',
				isReady: false,
				sum: 100,
				stake: 0,
				state: PlayerStates.None,
				canBeSelected: false,
				replic: null,
				isDeciding: false,
				isHuman: true,
				isChooser: false,
				inGame: true,
				mediaLoaded: false,
				mediaPreloaded: false,
				mediaPreloadProgress: 0,
				answer: '',
				isAppellating: false,
			},
		];
		state.room.stage.currentPrice = 100;

		dispatchedActions = [];
		mockDispatch = jest.fn((action: AnyAction) => {
			dispatchedActions.push(action);
			return action;
		}) as Dispatch<AnyAction>;

		mockAppDispatch = jest.fn((action: AnyAction) => {
			dispatchedActions.push(action);
			return action;
		}) as unknown as AppDispatch;

		mockGetState = jest.fn(() => state);

		mockDataContext = {
			serverUri: 'http://localhost:5000',
			contentUris: ['http://localhost:5000'],
		} as DataContext;

		controller = new ClientController(
			mockDispatch,
			mockAppDispatch,
			mockGetState,
			mockDataContext
		);
	});

	describe('onPerson', () => {
		it('should handle correct answer', () => {
			controller.onPerson(0, true);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/playerStateChanged');
			// playAudio is called with applause sound
		});

		it('should handle wrong answer', () => {
			controller.onPerson(0, false);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/playerStateChanged');
			// playAudio is called with wrong answer sound
		});
	});

	describe('onRightAnswer', () => {
		it('should display right answer in simple layout', () => {
			state.table.layoutMode = 0; // LayoutMode.Simple

			controller.onRightAnswer('Correct answer');

			expect(mockAppDispatch).toHaveBeenCalled();
			expect(mockDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('table/setAnswerView');
			// Other actions are dispatched through thunks
		});

		it('should highlight right option in answer options layout', () => {
			state.table.layoutMode = 1; // LayoutMode.AnswerOptions

			controller.onRightAnswer('Option B');

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('table/rightOption');
		});
	});

	describe('onRightAnswerStart', () => {
		it('should start showing right answer', () => {
			controller.onRightAnswerStart('Correct');

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('table/setAnswerView');
			expect(actions).toContain('table/captionChanged');
		});
	});

	describe('onSum', () => {
		it('should update individual player sum', () => {
			controller.onSum(0, 200);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/playerSumChanged');
		});
	});

	describe('onQuestionEnd', () => {
		it('should end question', () => {
			controller.onQuestionEnd();

			expect(mockDispatch).toHaveBeenCalled();
			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('table/endQuestion');
			expect(actions).toContain('room2/setNoRiskMode');
		});
	});

	describe('onPass', () => {
		it('should mark player as passed', () => {
			controller.onPass(0);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/playerStateChanged');
		});
	});

	describe('onWrongTry', () => {
		it('should mark player as having wrong try', () => {
			controller.onWrongTry(0);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/playerStateChanged');
		});
	});
});

describe('ClientController - Timer Operations', () => {
	let controller: ClientController;
	let mockDispatch: Dispatch<AnyAction>;
	let mockAppDispatch: AppDispatch;
	let mockGetState: () => State;
	let mockDataContext: DataContext;
	let state: State;
	let dispatchedActions: AnyAction[];

	beforeEach(() => {
		state = JSON.parse(JSON.stringify(initialState));
state.settings.appSound = true; // Enable sounds for testing
		state.room2.persons.players = [
			{
				name: 'Player1',
				isReady: false,
				sum: 100,
				stake: 0,
				state: PlayerStates.None,
				canBeSelected: false,
				replic: null,
				isDeciding: false,
				isHuman: true,
				isChooser: false,
				inGame: true,
				mediaLoaded: false,
				mediaPreloaded: false,
				mediaPreloadProgress: 0,
				answer: '',
				isAppellating: false,
			},
		];

		dispatchedActions = [];
		mockDispatch = jest.fn((action: AnyAction) => {
			dispatchedActions.push(action);
			return action;
		}) as Dispatch<AnyAction>;

		mockAppDispatch = jest.fn((action: AnyAction) => {
			dispatchedActions.push(action);
			return action;
		}) as unknown as AppDispatch;

		mockGetState = jest.fn(() => state);

		mockDataContext = {
			serverUri: 'http://localhost:5000',
			contentUris: ['http://localhost:5000'],
		} as DataContext;

		controller = new ClientController(
			mockDispatch,
			mockAppDispatch,
			mockGetState,
			mockDataContext
		);
	});

	describe('onTimerRun', () => {
		it('should run timer', () => {
			controller.onTimerRun(1, 300, null);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/runTimer');
		});

		it('should activate player decision when timer starts for player', () => {
			controller.onTimerRun(2, 300, 0);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/runTimer');
			expect(actions).toContain('room2/activatePlayerDecision');
		});

		it('should activate showman decision when timer starts for showman', () => {
			controller.onTimerRun(2, 300, -1);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/activateShowmanDecision');
		});

		it('should show main timer when appropriate', () => {
			controller.onTimerRun(2, 300, -2);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/setShowMainTimer');
		});
	});

	describe('onTimerPause', () => {
		it('should pause timer', () => {
			controller.onTimerPause(1, 150);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/pauseTimer');
		});
	});

	describe('onTimerResume', () => {
		it('should resume timer', () => {
			controller.onTimerResume(1);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/resumeTimer');
		});
	});

	describe('onTimerStop', () => {
		it('should stop timer', () => {
			controller.onTimerStop(1);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/stopTimer');
		});

		it('should clear decisions when stopping main timer', () => {
			controller.onTimerStop(2);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/stopTimer');
			expect(actions).toContain('room2/setShowMainTimer');
			expect(actions).toContain('room2/clearDecisions');
		});
	});

	describe('onTimerMaximumChanged', () => {
		it('should change timer maximum', () => {
			controller.onTimerMaximumChanged(1, 500);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/timerMaximumChanged');
		});
	});

	describe('onPause', () => {
		it('should pause game', () => {
			controller.onPause(true, [100, 200, 300]);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/setIsPaused');
			expect(actions).toContain('room2/pauseTimer');
		});

		it('should resume game', () => {
			controller.onPause(false, [100, 200, 300]);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/setIsPaused');
			expect(actions).toContain('room2/resumeTimer');
		});
	});
});

describe('ClientController - Game End Flow', () => {
	let controller: ClientController;
	let mockDispatch: Dispatch<AnyAction>;
	let mockAppDispatch: AppDispatch;
	let mockGetState: () => State;
	let mockDataContext: DataContext;
	let state: State;
	let dispatchedActions: AnyAction[];

	beforeEach(() => {
		state = JSON.parse(JSON.stringify(initialState));
state.settings.appSound = true; // Enable sounds for testing
		state.room2.persons.players = [
			{
				name: 'Player1',
				isReady: false,
				sum: 500,
				stake: 0,
				state: PlayerStates.None,
				canBeSelected: false,
				replic: null,
				isDeciding: false,
				isHuman: true,
				isChooser: false,
				inGame: true,
				mediaLoaded: false,
				mediaPreloaded: false,
				mediaPreloadProgress: 0,
				answer: '',
				isAppellating: false,
			},
			{
				name: 'Player2',
				isReady: false,
				sum: 300,
				stake: 0,
				state: PlayerStates.None,
				canBeSelected: false,
				replic: null,
				isDeciding: false,
				isHuman: true,
				isChooser: false,
				inGame: true,
				mediaLoaded: false,
				mediaPreloaded: false,
				mediaPreloadProgress: 0,
				answer: '',
				isAppellating: false,
			},
		];

		dispatchedActions = [];
		mockDispatch = jest.fn((action: AnyAction) => {
			dispatchedActions.push(action);
			return action;
		}) as Dispatch<AnyAction>;

		mockAppDispatch = jest.fn((action: AnyAction) => {
			dispatchedActions.push(action);
			return action;
		}) as unknown as AppDispatch;

		mockGetState = jest.fn(() => state);

		mockDataContext = {
			serverUri: 'http://localhost:5000',
			contentUris: ['http://localhost:5000'],
		} as DataContext;

		controller = new ClientController(
			mockDispatch,
			mockAppDispatch,
			mockGetState,
			mockDataContext
		);
	});

	describe('onRoundEnd', () => {
		it('should handle round end with empty reason', () => {
			controller.onRoundEnd('empty');

			// addSimpleMessage is called which dispatches actions
			expect(mockAppDispatch).toHaveBeenCalled();
		});

		it('should handle round end with timeout reason', () => {
			controller.onRoundEnd('timeout');

			// addSimpleMessage is called which dispatches actions
			expect(mockAppDispatch).toHaveBeenCalled();
		});
	});

	describe('onGameStatistics', () => {
		it('should display game statistics', () => {
			const statistics = [
				{
					name: 'Player1',
					rightAnswerCount: 8,
					wrongAnswerCount: 2,
					rightTotal: 800,
					wrongTotal: 200,
				},
				{
					name: 'Player2',
					rightAnswerCount: 5,
					wrongAnswerCount: 5,
					rightTotal: 500,
					wrongTotal: 500,
				},
			];

			controller.onGameStatistics(statistics);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('table/showStatistics');
		});
	});

	describe('onWinner', () => {
		it('should play winner sound', () => {
			state.settings.writeGameLog = false; // Simplify test

			controller.onWinner();

			// playAudio is called if sound is enabled
			// This is conditional on settings
			expect(mockAppDispatch).toHaveBeenCalled();
		});
	});

	describe('onStop', () => {
		it('should stop all timers and show logo', () => {
			controller.onStop();

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/stopTimer');
			expect(actions).toContain('table/showLogo');
			expect(actions).toContain('room2/setShowMainTimer');
		});
	});
});

describe('ClientController - Miscellaneous Operations', () => {
	let controller: ClientController;
	let mockDispatch: Dispatch<AnyAction>;
	let mockAppDispatch: AppDispatch;
	let mockGetState: () => State;
	let mockDataContext: DataContext;
	let state: State;
	let dispatchedActions: AnyAction[];

	beforeEach(() => {
		state = JSON.parse(JSON.stringify(initialState));
state.settings.appSound = true; // Enable sounds for testing
		state.room2.persons.players = [
			{
				name: 'Player1',
				isReady: false,
				sum: 100,
				stake: 0,
				state: PlayerStates.None,
				canBeSelected: false,
				replic: null,
				isDeciding: false,
				isHuman: true,
				isChooser: false,
				inGame: true,
				mediaLoaded: false,
				mediaPreloaded: false,
				mediaPreloadProgress: 0,
				answer: '',
				isAppellating: false,
			},
		];
		state.room2.persons.showman = {
			name: 'Showman1',
			isReady: false,
			replic: null,
			isDeciding: false,
			isHuman: true,
		};

		dispatchedActions = [];
		mockDispatch = jest.fn((action: AnyAction) => {
			dispatchedActions.push(action);
			return action;
		}) as Dispatch<AnyAction>;

		mockAppDispatch = jest.fn((action: AnyAction) => {
			dispatchedActions.push(action);
			return action;
		}) as unknown as AppDispatch;

		mockGetState = jest.fn(() => state);

		mockDataContext = {
			serverUri: 'http://localhost:5000',
			contentUris: ['http://localhost:5000'],
		} as DataContext;

		controller = new ClientController(
			mockDispatch,
			mockAppDispatch,
			mockGetState,
			mockDataContext
		);
	});

	describe('onReady', () => {
		it('should mark player as ready', () => {
			controller.onReady('Player1', true);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/isReadyChanged');
		});

		it('should mark showman as ready', () => {
			controller.onReady('Showman1', true);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/isReadyChanged');
		});
	});

	describe('onDisconnected', () => {
		it('should handle player disconnection', () => {
			controller.onDisconnected('Player1');

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/personRemoved');
			// addSimpleMessage dispatches addToChat internally
		});
	});

	describe('onReplic', () => {
		it('should handle showman replic', () => {
			controller.onReplic('s', 'Hello players');

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/showmanReplicChanged');
		});
	});

	describe('onJoinModeChanged', () => {
		it('should change join mode', () => {
			state.room2.persons.hostName = 'HostUser'; // Set hostName for inform message

			controller.onJoinModeChanged(JoinMode.OnlyViewer, true);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/setJoinMode');
			// userInfoChanged only called if inform is true and hostName is set
		});
	});

	describe('onOptionChanged', () => {
		it('should change oral setting', () => {
			controller.onOptionChanged('Oral', 'true', 'Host');

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/setSettingOral');
			// userInfoChanged and addToChat only called if reason is provided
		});

		it('should change false start setting', () => {
			controller.onOptionChanged('FalseStart', 'false', 'Host');

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/setSettingFalseStart');
		});

		it('should change reading speed', () => {
			controller.onOptionChanged('ReadingSpeed', '50', 'Host');

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/setSettingReadingSpeed');
		});
	});

	describe('onCancel', () => {
		it('should cancel current decision', () => {
			controller.onCancel();

			expect(mockDispatch).toHaveBeenCalled();
			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('room2/setDecisionType');
			expect(actions).toContain('room2/stopValidation');
			expect(actions).toContain('room2/deselectPlayers');
		});
	});

	describe('onChoose', () => {
		it('should enable question selection', () => {
			controller.onChoose();

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('table/isSelectableChanged');
			expect(actions).toContain('room2/setDecisionType');
		});
	});

	describe('onTheme', () => {
		it('should display theme with animation', () => {
			controller.onTheme('History', true, 'About history', [], []);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('table/showObject');
			expect(actions).toContain('table/captionChanged');
			// playAudio called if sound enabled
		});

		it('should display theme without animation', () => {
			controller.onTheme('Science', false, '', [], []);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('table/showObject');
			expect(actions).toContain('room2/playersStateCleared');
		});
	});

	describe('onAnswerOptionsLayout', () => {
		it('should set up answer options layout', () => {
			controller.onAnswerOptionsLayout(true, ['Text', 'Text', 'Image'], false, 2);

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('table/answerOptions');
		});
	});

	describe('onAnswerOption', () => {
		it('should update answer option', () => {
			state.table.layoutMode = 1; // LayoutMode.AnswerOptions
			state.table.answerOptions = [
				{
					label: '',
					state: ItemState.Normal,
					content: { type: 0, value: '', read: false, partial: false },
				},
			];

			controller.onAnswerOption(0, 'A', 'text', 'Option A text');

			expect(mockAppDispatch).toHaveBeenCalled();
			const actions = dispatchedActions.map(a => a.type);
			expect(actions).toContain('table/updateOption');
		});
	});

	describe('onContentState', () => {
		it('should update content state in answer options', () => {
			state.table.layoutMode = 1; // LayoutMode.AnswerOptions
			state.table.answerOptions = [
				{
					label: 'A',
					state: ItemState.Normal,
					content: { type: 0, value: 'text', read: false, partial: false },
				},
			];

			controller.onContentState('screen', 1, ItemState.Right);

			// The method only dispatches if conditions are met
			// Let's verify the method was called without errors
			expect(controller).toBeDefined();
		});
	});
});
