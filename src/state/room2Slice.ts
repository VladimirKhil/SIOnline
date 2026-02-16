import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import DataContext from '../model/DataContext';
import PlayerInfo from '../model/PlayerInfo';
import PersonInfo from '../model/PersonInfo';
import PlayerStates from '../model/enums/PlayerStates';
import localization from '../model/resources/localization';
import State from './State';
import Constants from '../model/enums/Constants';
import Role from '../model/Role';
import AppSettings, { initialState as initialAppSettings } from '../model/AppSettings';
import ChatMode from '../model/enums/ChatMode';
import ChatMessage from '../model/ChatMessage';
import UsersMode from '../model/enums/UsersMode';
import MessageLevel from '../model/enums/MessageLevel';
import JoinMode from '../client/game/JoinMode';
import Account from '../model/Account';
import Persons from '../model/Persons';
import Timers from '../model/Timers';
import TimerInfo from '../model/TimerInfo';
import TimerStates from '../model/enums/TimeStates';
import { stopAudio, userErrorChanged } from './commonSlice';
import { clearGameLog } from './globalActions';
import StakeTypes from '../model/enums/StakeTypes';

export enum DialogView {
	None,
	Complain,
	Report,
}

export enum ContextView {
	None,
	OralAnswer,
}

export enum DecisionType {
	None,
	Answer,
	SelectChooser,
	SelectPlayer,
	Stake,
	OralAnswer,
	Choose,
	Validation,
	Review,
}

// Helper function to check if a decision is needed
export const isDecisionNeeded = (decisionType: DecisionType): boolean => decisionType !== DecisionType.None;

export interface ValidationInfo {
	name: string;
	answer: string;
}

let isAnswerVersionThrottled = false;
let answerLock: number | null = null;
let timerRef: number | null = null;

export interface Room2State {
	persons: {
		showman: PersonInfo;
		players: PlayerInfo[];
		hostName: string | null;
		all: Persons;
	};

	name: string;
	role: Role;

	playState: {
		report: string;
		packageUri: string | null;
	};

	dialogView: DialogView;
	contextView: ContextView;

	stage: {
		isGameStarted: boolean;
		isAppellation: boolean;
		isEditingTables: boolean;
		isGamePaused: boolean;
		decisionType: DecisionType;
		questionCounter: number;
	}

	roundsNames: string[];
	timers: Timers;

	theme: {
		name: string;
		comments: string;
	}

	answer: string;
	answerType: string;

	validation: {
		header: string;
		message: string;
		isCompact: boolean;
		rightAnswers: string[];
		wrongAnswers: string[];
		queue: ValidationInfo[];
		showExtraRightButtons: boolean;
		newVersion: boolean;
	};

	chat: {
		isVisible: boolean;
		isActive: boolean;
		mode: ChatMode;
		message: string;
		messages: ChatMessage[];
		usersMode: UsersMode;
	};

	lastReplic: ChatMessage | null;

	isEditTableEnabled: boolean;
	isGameButtonEnabled: boolean;
	areSumsEditable: boolean;
	chatScrollPosition: number;
	noRiskMode: boolean;
	showMainTimer: boolean;

	settings: AppSettings;
	joinMode: JoinMode;
	kicked: boolean;
}

const initialState: Room2State = {
	persons: {
		showman: {
			name: '',
			isReady: false,
			replic: null,
			isDeciding: false,
			isHuman: true
		},
		players: [],
		hostName: null,
		all: {},
	},

	name: '',
	role: Role.Player,

	playState: {
		report: '',
		packageUri: null,
	},

	dialogView: DialogView.None,
	contextView: ContextView.None,

	stage: {
		isGameStarted: false,
		isAppellation: false,
		isEditingTables: false,
		isGamePaused: false,
		decisionType: DecisionType.None,
		questionCounter: 0,
	},

	roundsNames: [],

	timers: {
		round: {
			state: TimerStates.Stopped,
			isPausedBySystem: true,
			isPausedByUser: false,
			value: 0,
			maximum: 0,
		},

		press: {
			state: TimerStates.Stopped,
			isPausedBySystem: true,
			isPausedByUser: false,
			value: 0,
			maximum: 0
		},

		decision: {
			state: TimerStates.Stopped,
			isPausedBySystem: true,
			isPausedByUser: false,
			value: 0,
			maximum: 0
		}
	},

	theme: {
		name: '',
		comments: '',
	},

	answer: '',
	answerType: '',

	validation: {
		header: '',
		message: '',
		isCompact: true,
		rightAnswers: [],
		wrongAnswers: [],
		queue: [],
		showExtraRightButtons: false,
		newVersion: false,
	},

	chat: {
		isVisible: false,
		isActive: false,
		mode: ChatMode.Chat,
		message: '',
		messages: [],
		usersMode: UsersMode.Users,
	},

	lastReplic: null,

	isEditTableEnabled: false,
	isGameButtonEnabled: true,
	areSumsEditable: false,
	chatScrollPosition: 0,
	noRiskMode: false,
	showMainTimer: false,

	settings: initialAppSettings,
	joinMode: JoinMode.AnyRole,
	kicked: false,
};

export const complain = createAsyncThunk(
	'room2/complain',
	async (arg: any, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		await dataContext.game.markQuestion(arg.questionId, arg.complainText);
	},
);

export const sendGameReport = createAsyncThunk(
	'room2/sendGameReport',
	async (arg: string, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		await dataContext.game.sendGameReport(arg);
	},
);

export const playerSelected = createAsyncThunk(
	'room2/playerSelected',
	async (arg: number, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		const { decisionType } = (thunkAPI.getState() as State).room2.stage;

		if (decisionType === DecisionType.SelectChooser) {
			await dataContext.game.selectChooser(arg);
		} else {
			await dataContext.game.selectPlayer(arg);
		}
	},
);

export const sendAnswer = createAsyncThunk(
	'room2/sendAnswer',
	async (answer: string, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		await dataContext.game.sendAnswer(answer);

		if (answerLock) {
			window.clearTimeout(answerLock);
			answerLock = null;
			isAnswerVersionThrottled = false;
		}
	},
);

export const approveAnswerDefault = createAsyncThunk(
	'room2/approveAnswerDefault',
	async (arg: void, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		const { newVersion, queue } = (thunkAPI.getState() as State).room2.validation;

		if (newVersion) {
			if (queue.length === 0) {
				return;
			}

			const [{ answer }] = queue;
			await dataContext.game.validateAnswer(answer, true);
		} else {
			await dataContext.game.approveAnswer(1.0);
		}
	},
);

export const rejectAnswerDefault = createAsyncThunk(
	'room2/rejectAnswerDefault',
	async (arg: void, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		const { newVersion, queue } = (thunkAPI.getState() as State).room2.validation;

		if (newVersion) {
			if (queue.length === 0) {
				return;
			}

			const [{ answer }] = queue;
			await dataContext.game.validateAnswer(answer, false);
		} else {
			await dataContext.game.rejectAnswer(1.0);
		}
	},
);

export const approveAnswer = createAsyncThunk(
	'room2/approveAnswer',
	async (arg: any, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		const { newVersion } = (thunkAPI.getState() as State).room2.validation;

		if (newVersion) {
			await dataContext.game.validateAnswer(arg.answer, true);
		} else {
			await dataContext.game.approveAnswer(arg.factor);
		}
	},
);

export const rejectAnswer = createAsyncThunk(
	'room2/rejectAnswer',
	async (arg: any, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		const { newVersion } = (thunkAPI.getState() as State).room2.validation;

		if (newVersion) {
			await dataContext.game.validateAnswer(arg.answer, false);
		} else {
			await dataContext.game.rejectAnswer(arg.factor);
		}
	},
);

export const sendPass = createAsyncThunk(
	'room2/sendPass',
	async (_arg: void, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		await dataContext.game.stakePass();
	},
);

export const sendAllIn = createAsyncThunk(
	'room2/sendAllIn',
	async (arg: void, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		await dataContext.game.stakeAllIn();
	},
);

export const sendStake = createAsyncThunk(
	'room2/sendStake',
	async (arg: number, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		await dataContext.game.stakeValue(arg);
	},
);

export const getPin = createAsyncThunk(
	'room2/getPin',
	async (arg: void, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		await dataContext.game.getPin();
	},
);

export const setHost = createAsyncThunk(
	'room2/setHost',
	async (arg: string, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		await dataContext.game.setHost(arg);
	},
);

export const kick = createAsyncThunk(
	'room2/kick',
	async (arg: string, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		await dataContext.game.kick(arg);
	},
);

export const addTable = createAsyncThunk(
	'room2/addTable',
	async (_arg: void, thunkAPI) => {
		if ((thunkAPI.getState() as State).room2.persons.players.length >= Constants.MAX_PLAYER_COUNT) {
			return;
		}

		const dataContext = thunkAPI.extra as DataContext;
		await dataContext.game.addTable();
	},
);

export const toggleQuestion = createAsyncThunk(
	'room2/toggleQuestion',
	async (arg: { themeIndex: number, questionIndex: number }, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		await dataContext.game.toggle(arg.themeIndex, arg.questionIndex);
	},
);

export const room2Slice = createSlice({
	name: 'room2',
	initialState,
	reducers: {
		showDialog: (state: Room2State, action: PayloadAction<DialogView>) => {
			state.dialogView = action.payload;
		},
		setContext: (state: Room2State, action: PayloadAction<ContextView>) => {
			state.contextView = action.payload;
		},
		setReport: (state: Room2State, action: PayloadAction<string>) => {
			state.playState.report = action.payload;
			state.playState.packageUri = null;
			state.stage.decisionType = DecisionType.Review;
		},
		setReview: (state: Room2State, action: PayloadAction<string | null>) => {
			state.playState.report = '';
			state.playState.packageUri = action.payload;
			state.stage.decisionType = DecisionType.Review;
		},
		showmanReplicChanged: (state: Room2State, action: PayloadAction<string>) => {
			state.persons.showman.replic = action.payload;

			state.persons.players.forEach(p => {
				p.replic = null;
			});
		},
		playerReplicChanged: (state: Room2State, action: PayloadAction<{ playerIndex: number, replic: string }>) => {
			state.persons.showman.replic = null;

			state.persons.players.forEach((p, i) => {
				p.replic = i === action.payload.playerIndex ? action.payload.replic : null;
			});
		},
		infoChanged: (state: Room2State, action: PayloadAction<{ all: Persons, showman: PersonInfo, players: PlayerInfo[] }>) => {
			state.persons.all = action.payload.all;
			state.persons.showman = action.payload.showman;
			state.persons.players = action.payload.players;
		},
		playersStateCleared: (state: Room2State) => {
			state.persons.players.forEach(p => {
				p.state = PlayerStates.None;
				p.stake = 0;
				p.answer = '';
				p.mediaLoaded = false;
				p.canBeSelected = false;
				p.isAppellating = false;
			});
		},
		playerRoundStateCleared: (state: Room2State) => {
			state.persons.players.forEach(p => {
				p.mediaPreloaded = false;
			});
		},
		sumsChanged: (state: Room2State, action: PayloadAction<number[]>) => {
			state.persons.players.forEach((p, i) => {
				p.sum = i < action.payload.length ? action.payload[i] : 0;
			});
		},
		showmanChanged: (state: Room2State, action: PayloadAction<{ name: string, isHuman?: boolean, isReady?: boolean }>) => {
			state.persons.showman.name = action.payload.name;
			state.persons.showman.isHuman = action.payload.isHuman ?? state.persons.showman.isHuman;
			state.persons.showman.isReady = action.payload.isReady ?? state.persons.showman.isReady;
		},
		playerAdded: (state: Room2State) => {
			state.persons.players.push({
				name: '',
				sum: 0,
				stake: 0,
				state: PlayerStates.None,
				canBeSelected: false,
				isReady: false,
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
			});
		},
		playerChanged: (state: Room2State, action: PayloadAction<{ index: number, name: string, isHuman?: boolean, isReady?: boolean }>) => {
			const player = state.persons.players[action.payload.index];
			player.name = action.payload.name;
			player.isHuman = action.payload.isHuman ?? player.isHuman;
			player.isReady = action.payload.isReady ?? player.isReady;
		},
		playerSumChanged: (state: Room2State, action: PayloadAction<{ index: number, value: number }>) => {
			state.persons.players[action.payload.index].sum = action.payload.value;
		},
		playersAnswersChanged: (state: Room2State, action: PayloadAction<string[]>) => {
			state.persons.players.forEach((p, i) => {
				p.answer = i < action.payload.length ? action.payload[i] : '';
			});
		},
		setPlayerAnswer: (state: Room2State, action: PayloadAction<{ index: number, answer: string }>) => {
			if (action.payload.index >= 0 && action.payload.index < state.persons.players.length) {
				state.persons.players[action.payload.index].answer = action.payload.answer;
			}
		},
		playerDeleted: (state: Room2State, action: PayloadAction<number>) => {
			state.persons.players.splice(action.payload, 1);
		},
		playersSwap: (state: Room2State, action: PayloadAction<{ index1: number, index2: number }>) => {
			const { players } = state.persons;
			const temp = players[action.payload.index1];
			players[action.payload.index1] = players[action.payload.index2];
			players[action.payload.index2] = temp;
		},
		setPlayerApellating: (state: Room2State, action: PayloadAction<{ index: number, isAppellating: boolean }>) => {
			state.persons.players[action.payload.index].isAppellating = action.payload.isAppellating;
		},
		playerStateChanged: (state: Room2State, action: PayloadAction<{ index: number, state: PlayerStates }>) => {
			if (action.payload.index >= 0 && action.payload.index < state.persons.players.length) {
				state.persons.players[action.payload.index].state = action.payload.state;
			}
		},
		playerStatesChanged: (state: Room2State, action: PayloadAction<{ indices: number[], state: PlayerStates }>) => {
			action.payload.indices.map(i => state.persons.players[i].state = action.payload.state);
		},
		playerLostStateDropped: (state: Room2State, action: PayloadAction<number>) => {
			const player = state.persons.players[action.payload];

			if (player.state === PlayerStates.Lost) {
				player.state = PlayerStates.None;
			}
		},
		playerLostStatesDropped: (state: Room2State, action: PayloadAction<number[]>) => {
			action.payload.map(i => {
				const player = state.persons.players[i];

				if (player.state === PlayerStates.Lost) {
					player.state = PlayerStates.None;
				}
			});
		},
		playerStakeChanged: (state: Room2State, action: PayloadAction<{ index: number, stakeType: StakeTypes, stake: number }>) => {
			if (action.payload.index >= 0 && action.payload.index < state.persons.players.length) {
				const player = state.persons.players[action.payload.index];
				player.stake = action.payload.stakeType === StakeTypes.AllIn ? player.sum : action.payload.stake;
			}
		},
		deselectPlayers(state: Room2State) {
			state.persons.players.forEach(p => p.canBeSelected = false);
		},
		selectPlayers(state: Room2State, action: PayloadAction<number[]>) {
			state.persons.players.forEach((p, i) => {
				p.canBeSelected = action.payload.length === 0 || action.payload.includes(i);
			});

			if (action.payload.length === 0) {
				state.persons.showman.replic = localization.giveTurnHint;
			}
		},
		activateShowmanDecision(state: Room2State) {
			state.persons.showman.isDeciding = true;
		},
		activatePlayerDecision(state: Room2State, action: PayloadAction<number>) {
			state.persons.players[action.payload].isDeciding = true;
		},
		clearDecisions(state: Room2State) {
			state.persons.showman.isDeciding = false;
			state.persons.players.forEach(p => p.isDeciding = false);
		},
		isReadyChanged(state: Room2State, action: PayloadAction<{ personIndex: number, isReady: boolean }>) {
			if (action.payload.personIndex === -1) {
				state.persons.showman.isReady = action.payload.isReady;
			} else {
				state.persons.players[action.payload.personIndex].isReady = action.payload.isReady;
			}
		},
		chooserChanged(state: Room2State, action: PayloadAction<number>) {
			state.persons.players.forEach((p, i) => {
				p.isChooser = i === action.payload;
			});
		},
		playerInGameChanged(state: Room2State, action: PayloadAction<{ playerIndex: number, inGame: boolean }>) {
			state.persons.players[action.payload.playerIndex].inGame = action.payload.inGame;
		},
		playerMediaLoaded(state: Room2State, action: PayloadAction<number>) {
			state.persons.players[action.payload].mediaLoaded = true;
		},
		playerMediaPreloaded(state: Room2State, action: PayloadAction<number>) {
			state.persons.players[action.payload].mediaPreloaded = true;
		},
		setPlayerMediaPreloadProgress(state: Room2State, action: PayloadAction<{ playerName: string, progress: number }>) {
			for (let i = 0; i < state.persons.players.length; i += 1) {
				if (state.persons.players[i].name === action.payload.playerName) {
					state.persons.players[i].mediaPreloadProgress = action.payload.progress;
					return;
				}
			}
		},
		setHostName(state: Room2State, action: PayloadAction<string | null>) {
			state.persons.hostName = action.payload;
		},
		personAdded: (state: Room2State, action: PayloadAction<Account>) => {
			state.persons.all[action.payload.name] = action.payload;
		},
		personRemoved: (state: Room2State, action: PayloadAction<string>) => {
			delete state.persons.all[action.payload];
		},
		personAvatarChanged: (state: Room2State, action: PayloadAction<{ personName: string, avatarUri: string }>) => {
			if (state.persons.all[action.payload.personName]) {
				state.persons.all[action.payload.personName].avatar = action.payload.avatarUri;
			}
		},
		personAvatarVideoChanged: (state: Room2State, action: PayloadAction<{ personName: string, avatarUri: string }>) => {
			if (state.persons.all[action.payload.personName]) {
				state.persons.all[action.payload.personName].avatarVideo = action.payload.avatarUri;
			}
		},
		questionAnswersChanged(state: Room2State, action: PayloadAction<{ rightAnswers: string[], wrongAnswers: string[] }>) {
			state.validation.rightAnswers = action.payload.rightAnswers;
			state.validation.wrongAnswers = action.payload.wrongAnswers;
		},
		validate(state: Room2State, action: PayloadAction<{
			header: string,
			name: string,
			answer: string,
			message: string,
			rightAnswers: string[],
			wrongAnswers: string[],
			showExtraRightButtons: boolean }>) {
			state.validation.header = action.payload.header;
			state.validation.message = action.payload.message;
			state.validation.rightAnswers = action.payload.rightAnswers;
			state.validation.wrongAnswers = action.payload.wrongAnswers;
			state.validation.queue = [{ name: action.payload.name, answer: action.payload.answer }];
			state.validation.showExtraRightButtons = action.payload.showExtraRightButtons;
			state.validation.newVersion = false;
			state.stage.decisionType = DecisionType.Validation;
		},
		askValidation(state: Room2State, action: PayloadAction<{ playerIndex: number, answer: string }>) {
			if (action.payload.playerIndex === -1 || action.payload.playerIndex >= state.persons.players.length) {
				return;
			}

			const player = state.persons.players[action.payload.playerIndex];
			state.validation.queue.push({ name: player.name, answer: action.payload.answer });
			state.validation.header = localization.answerChecking;
			state.validation.message = '';
			state.validation.showExtraRightButtons = false;
			state.validation.newVersion = true;
			state.stage.decisionType = DecisionType.Validation;
		},
		stopValidation(state: Room2State) {
			state.validation.queue = [];
			state.stage.decisionType = DecisionType.None;
		},
		nameChanged(state: Room2State, action: PayloadAction<string>) {
			state.name = action.payload;
		},
		setTheme(state: Room2State, action: PayloadAction<{ name: string, comments: string }>) {
			state.theme = action.payload;
		},
		answerChanged(state: Room2State, action: PayloadAction<string>) {
			state.answer = action.payload;
		},
		answerTypeChanged(state: Room2State, action: PayloadAction<string>) {
			state.answerType = action.payload;
		},
		toggleEditTable(state: Room2State) {
			state.isEditTableEnabled = !state.isEditTableEnabled;
		},
		setIsGameStarted(state: Room2State, action: PayloadAction<boolean>) {
			state.stage.isGameStarted = action.payload;
		},
		setIsAppellation(state: Room2State, action: PayloadAction<boolean>) {
			state.stage.isAppellation = action.payload;
		},
		setIsEditingTables(state: Room2State, action: PayloadAction<boolean>) {
			state.stage.isEditingTables = action.payload;
		},
		setIsPaused(state: Room2State, action: PayloadAction<boolean>) {
			state.stage.isGamePaused = action.payload;
			state.isEditTableEnabled = false;
		},
		setRoomRole(state: Room2State, action: PayloadAction<Role>) {
			state.role = action.payload;
			state.isEditTableEnabled = false;
			state.areSumsEditable = false;
		},
		incrementQuestionCounter(state: Room2State) {
			state.stage.questionCounter += 1;
		},
		resetQuestionCounter(state: Room2State) {
			state.stage.questionCounter = 0;
		},
		setSettingDisplayAnswerOptionsLabels: (state: Room2State, action: PayloadAction<boolean>) => {
			state.settings.displayAnswerOptionsLabels = action.payload;
		},
		setSettingFalseStart: (state: Room2State, action: PayloadAction<boolean>) => {
			state.settings.falseStart = action.payload;
		},
		setSettingOral: (state: Room2State, action: PayloadAction<boolean>) => {
			state.settings.oral = action.payload;
		},
		setSettingPartialImages: (state: Room2State, action: PayloadAction<boolean>) => {
			state.settings.partialImages = action.payload;
		},
		setSettingPartialImageTime: (state: Room2State, action: PayloadAction<number>) => {
			state.settings.timeSettings.partialImageTime = action.payload;
		},
		setSettingTimeForBlockingButton: (state: Room2State, action: PayloadAction<number>) => {
			state.settings.timeSettings.timeForBlockingButton = action.payload;
		},
		setSettingPartialText: (state: Room2State, action: PayloadAction<boolean>) => {
			state.settings.partialText = action.payload;
		},
		setSettingReadingSpeed: (state: Room2State, action: PayloadAction<number>) => {
			state.settings.readingSpeed = action.payload;
		},
		setSettingManaged: (state: Room2State, action: PayloadAction<boolean>) => {
			state.settings.managed = action.payload;
		},
		setSettingUseApellations: (state: Room2State, action: PayloadAction<boolean>) => {
			state.settings.useApellations = action.payload;
		},
		setSettingPlayAllQuestionsInFinalRound: (state: Room2State, action: PayloadAction<boolean>) => {
			state.settings.playAllQuestionsInFinalRound = action.payload;
		},
		setSettingAllowEveryoneToPlayHiddenStakes: (state: Room2State, action: PayloadAction<boolean>) => {
			state.settings.allowEveryoneToPlayHiddenStakes = action.payload;
		},
		setSettingOralPlayersActions: (state: Room2State, action: PayloadAction<boolean>) => {
			state.settings.oralPlayersActions = action.payload;
		},
		setChatScrollPosition: (state: Room2State, action: PayloadAction<number>) => {
			state.chatScrollPosition = action.payload;
		},
		setDecisionType: (state: Room2State, action: PayloadAction<DecisionType>) => {
			state.stage.decisionType = action.payload;
		},
		setNoRiskMode: (state: Room2State, action: PayloadAction<boolean>) => {
			state.noRiskMode = action.payload;
		},
		setIsGameButtonEnabled: (state: Room2State, action: PayloadAction<boolean>) => {
			state.isGameButtonEnabled = action.payload;
		},
		setChatMode: (state: Room2State, action: PayloadAction<ChatMode>) => {
			state.chat.mode = action.payload;
		},
		setUsersMode: (state: Room2State, action: PayloadAction<UsersMode>) => {
			state.chat.usersMode = action.payload;
		},
		setChatMessage: (state: Room2State, action: PayloadAction<string>) => {
			state.chat.message = action.payload;
		},
		setChatVisibility: (state: Room2State, action: PayloadAction<boolean>) => {
			state.chat.isVisible = action.payload;

			if (!action.payload) {
				state.chat.isActive = false;
			}
		},
		addChatMessage: (state: Room2State, action: PayloadAction<ChatMessage>) => {
			state.chat.messages.push(action.payload);
		},
		setLastReplic: (state: Room2State, action: PayloadAction<ChatMessage | null>) => {
			state.lastReplic = action.payload;

			if (action.payload) {
				state.chat.isActive = true;
			}
		},
		setChatActive: (state: Room2State, action: PayloadAction<boolean>) => {
			state.chat.isActive = action.payload;
		},
		clearChat: (state: Room2State) => {
			state.chat.messages = [];
			state.chat.message = '';
			state.chat.isActive = false;
		},
		addOperationErrorMessage: (state: Room2State, action: PayloadAction<string>) => {
			state.chat.messages.push({
				sender: '',
				text: action.payload,
				level: MessageLevel.Warning,
			});
		},
		setJoinMode	: (state: Room2State, action: PayloadAction<JoinMode>) => {
			state.joinMode = action.payload;
		},
		setAreSumsEditable: (state: Room2State, action: PayloadAction<boolean>) => {
			state.areSumsEditable = action.payload;
		},
		setKicked: (state: Room2State, action: PayloadAction<boolean>) => {
			state.kicked = action.payload;
		},
		setRoundsNames: (state: Room2State, action: PayloadAction<string[]>) => {
			state.roundsNames = action.payload;
		},
		setShowMainTimer: (state: Room2State, action: PayloadAction<boolean>) => {
			state.showMainTimer = action.payload;
		},
		runTimer: (state: Room2State, action: PayloadAction<{ timerIndex: number, maximumTime: number, runByUser: boolean }>) => {
			const updateTimer = (timer: TimerInfo): TimerInfo => ({
				state: TimerStates.Running,
				isPausedByUser: action.payload.runByUser ? false : timer.isPausedByUser,
				isPausedBySystem: !action.payload.runByUser ? false : timer.isPausedBySystem,
				maximum: action.payload.maximumTime,
				value: 0
			});

			switch (action.payload.timerIndex) {
				case 0:
					state.timers.round = updateTimer(state.timers.round);
					break;
				case 1:
					state.timers.press = updateTimer(state.timers.press);
					break;
				case 2:
					state.timers.decision = updateTimer(state.timers.decision);
					break;
				default:
					break;
			}
		},
		pauseTimer: (state: Room2State, action: PayloadAction<{ timerIndex: number, currentTime: number, pausedByUser: boolean }>) => {
			const updateTimer = (timer: TimerInfo): TimerInfo => ({
				...timer,
				state: timer.state === TimerStates.Running ? TimerStates.Paused : timer.state,
				isPausedByUser: action.payload.pausedByUser ? true : timer.isPausedByUser,
				isPausedBySystem: !action.payload.pausedByUser ? true : timer.isPausedBySystem,
				value: timer.state === TimerStates.Running ? action.payload.currentTime : timer.value
			});

			switch (action.payload.timerIndex) {
				case 0:
					state.timers.round = updateTimer(state.timers.round);
					break;
				case 1:
					state.timers.press = updateTimer(state.timers.press);
					break;
				case 2:
					state.timers.decision = updateTimer(state.timers.decision);
					break;
				default:
					break;
			}
		},
		resumeTimer: (state: Room2State, action: PayloadAction<{ timerIndex: number, runByUser: boolean }>) => {
			const updateTimer = (timer: TimerInfo): TimerInfo => ({
				...timer,
				state: timer.state === TimerStates.Paused ||
					(!action.payload.runByUser && !timer.isPausedByUser)
						? TimerStates.Running
						: timer.state,
				isPausedByUser: action.payload.runByUser ? false : timer.isPausedByUser,
				isPausedBySystem: !action.payload.runByUser ? false : timer.isPausedBySystem
			});

			switch (action.payload.timerIndex) {
				case 0:
					state.timers.round = updateTimer(state.timers.round);
					break;
				case 1:
					state.timers.press = updateTimer(state.timers.press);
					break;
				case 2:
					state.timers.decision = updateTimer(state.timers.decision);
					break;
				default:
					break;
			}
		},
		stopTimer: (state: Room2State, action: PayloadAction<number>) => {
			const updateTimer = (timer: TimerInfo): TimerInfo => ({
				...timer,
				state: TimerStates.Stopped,
				isPausedByUser: false,
				isPausedBySystem: true,
				value: 0
			});

			switch (action.payload) {
				case 0:
					state.timers.round = updateTimer(state.timers.round);
					break;
				case 1:
					state.timers.press = updateTimer(state.timers.press);
					break;
				case 2:
					state.timers.decision = updateTimer(state.timers.decision);
					break;
				default:
					break;
			}
		},
		timerMaximumChanged: (state: Room2State, action: PayloadAction<{ timerIndex: number, maximumTime: number }>) => {
			const updateTimer = (timer: TimerInfo): TimerInfo => ({
				...timer,
				maximum: action.payload.maximumTime
			});

			switch (action.payload.timerIndex) {
				case 0:
					state.timers.round = updateTimer(state.timers.round);
					break;
				case 1:
					state.timers.press = updateTimer(state.timers.press);
					break;
				case 2:
					state.timers.decision = updateTimer(state.timers.decision);
					break;
				default:
					break;
			}
		},
	},
	extraReducers: (builder) => {
		builder.addCase(sendAnswer.fulfilled, (state) => {
			state.contextView = ContextView.None;
			state.stage.decisionType = DecisionType.None;
			state.answer = '';
		});

		builder.addCase(sendPass.fulfilled, (state) => {
			state.contextView = ContextView.None;
			state.stage.decisionType = DecisionType.None;
		});

		builder.addCase(sendStake.fulfilled, (state) => {
			state.contextView = ContextView.None;
			state.stage.decisionType = DecisionType.None;
		});

		builder.addCase(sendAllIn.fulfilled, (state) => {
			state.contextView = ContextView.None;
			state.stage.decisionType = DecisionType.None;
		});

		builder.addCase(complain.fulfilled, (state) => {
			state.dialogView = DialogView.None;
		});

		builder.addCase(sendGameReport.fulfilled, (state) => {
			state.dialogView = DialogView.None;
			state.contextView = ContextView.None;
		});

		builder.addCase(playerSelected.fulfilled, (state) => {
			state.persons.players.forEach(p => p.canBeSelected = false);
			state.persons.showman.replic = null;
			state.stage.decisionType = DecisionType.None;
		});

		builder.addCase(approveAnswerDefault.fulfilled, (state) => {
			state.validation.queue.shift();
			state.stage.decisionType = DecisionType.None;
		});

		builder.addCase(rejectAnswerDefault.fulfilled, (state) => {
			state.validation.queue.shift();
			state.stage.decisionType = DecisionType.None;
		});

		builder.addCase(approveAnswer.fulfilled, (state) => {
			state.validation.queue.shift();
			state.stage.decisionType = DecisionType.None;
		});

		builder.addCase(rejectAnswer.fulfilled, (state) => {
			state.validation.queue.shift();
			state.stage.decisionType = DecisionType.None;
		});
	},
});

export const pressGameButton = createAsyncThunk(
	'room2/pressGameButton',
	async (_arg: void, thunkAPI) => {
		if (!(thunkAPI.getState() as State).room2.isGameButtonEnabled) {
			return;
		}

		const dataContext = thunkAPI.extra as DataContext;
		const deltaTime = Date.now() - (thunkAPI.getState() as State).table.canPressUpdateTime;

		if (!await dataContext.game.pressButton(deltaTime)) {
			return;
		}

		thunkAPI.dispatch(room2Slice.actions.setIsGameButtonEnabled(false));

		setTimeout(
			() => {
				thunkAPI.dispatch(room2Slice.actions.setIsGameButtonEnabled(true));
			},
			(thunkAPI.getState() as State).room2.settings.timeSettings.timeForBlockingButton * 1000
		);
	},
);

const timeoutIds: Record<string, NodeJS.Timeout> = {};

export const showMediaPreloadProgress = createAsyncThunk(
	'room2/showMediaPreloadProgress',
	async (arg: { playerName: string, progress: number }, thunkAPI) => {
		if (timeoutIds[arg.playerName]) {
			clearTimeout(timeoutIds[arg.playerName]);
			delete timeoutIds[arg.playerName];
		}

		thunkAPI.dispatch(room2Slice.actions.setPlayerMediaPreloadProgress(arg));

		timeoutIds[arg.playerName] = setTimeout(() => {
			thunkAPI.dispatch(room2Slice.actions.setPlayerMediaPreloadProgress({
				playerName: arg.playerName,
				progress: 0,
			}));
		}, 10000);
	},
);

let lastReplicLock: number;

export const addToChat = createAsyncThunk(
	'room2/addToChat',
	async (chatMessage: ChatMessage, thunkAPI) => {
		thunkAPI.dispatch(room2Slice.actions.addChatMessage(chatMessage));

		const state = thunkAPI.getState() as State;
		if (!state.room2.chat.isVisible && state.ui.windowWidth < 800) {
			thunkAPI.dispatch(room2Slice.actions.setLastReplic(chatMessage));

			if (lastReplicLock) {
				window.clearTimeout(lastReplicLock);
			}

			lastReplicLock = window.setTimeout(
				() => {
					thunkAPI.dispatch(room2Slice.actions.setLastReplic(null));
				},
				3000,
			);
		}
	},
);

export const sendChatMessage = createAsyncThunk(
	'room2/sendChatMessage',
	async (_arg: void, thunkAPI) => {
		const state = thunkAPI.getState() as State;
		const dataContext = thunkAPI.extra as DataContext;
		const text = state.room2.chat.message;

		if (text.length > 0) {
			dataContext.game.say(text);
		}

		thunkAPI.dispatch(room2Slice.actions.setChatMessage(''));

		// Temporarily
		thunkAPI.dispatch(addToChat({
			sender: state.room2.name,
			text,
			level: MessageLevel.Information,
		}));

		if (!state.room2.chat.isVisible) {
			thunkAPI.dispatch(room2Slice.actions.setChatActive(true));
		}
	},
);

export const updateAnswer = createAsyncThunk(
	'room2/updateAnswer',
	async (answer: string, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		thunkAPI.dispatch(room2Slice.actions.answerChanged(answer));

		if (isAnswerVersionThrottled) {
			return;
		}

		isAnswerVersionThrottled = true;

		answerLock = window.setTimeout(
			async () => {
				isAnswerVersionThrottled = false;
				const latestAnswer = (thunkAPI.getState() as State).room2.answer;

				if (latestAnswer) {
					await dataContext.game.sendAnswerVersion(latestAnswer);
				}
			},
			3000
		);
	},
);

export const showLeftSeconds = createAsyncThunk(
	'room2/showLeftSeconds',
	async (leftSeconds: number, thunkAPI) => {
		let leftSecondsString = (leftSeconds % 60).toString();

		if (leftSecondsString.length < 2) {
			leftSecondsString = `0${leftSeconds}`;
		}

		thunkAPI.dispatch(showmanReplicChanged(`${localization.theGameWillStartIn} 00:00:${leftSecondsString} ${localization.orByFilling}`));

		if (leftSeconds > 0) {
			timerRef = window.setTimeout(
				() => {
					thunkAPI.dispatch(showLeftSeconds(leftSeconds - 1));
				},
				1000
			);
		}
	},
);

export const exitGame = createAsyncThunk(
	'room2/exitGame',
	async (_arg: void, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;

		try {
			// TODO: show progress bar
			await dataContext.game.leaveGame();
		} catch (e) {
			thunkAPI.dispatch(userErrorChanged(localization.exitError));
		}

		if (timerRef) {
			window.clearTimeout(timerRef);
			timerRef = null;
		}

		thunkAPI.dispatch(clearChat());
		thunkAPI.dispatch(setKicked(false));

		thunkAPI.dispatch(stopTimer(0));
		thunkAPI.dispatch(stopTimer(1));
		thunkAPI.dispatch(stopTimer(2));

		thunkAPI.dispatch(setIsPaused(false));
		thunkAPI.dispatch(setIsAppellation(false));
		thunkAPI.dispatch(setShowMainTimer(false));

		thunkAPI.dispatch(stopAudio());
		thunkAPI.dispatch(clearGameLog());
	},
);

export const {
	showDialog,
	setContext,
	setReport,
	setReview,
	showmanReplicChanged,
	playerReplicChanged,
	infoChanged,
	playersStateCleared,
	playerRoundStateCleared,
	sumsChanged,
	showmanChanged,
	playerAdded,
	playerChanged,
	playerSumChanged,
	playersAnswersChanged,
	setPlayerAnswer,
	playerDeleted,
	playersSwap,
	setPlayerApellating,
	playerStateChanged,
	playerStatesChanged,
	playerLostStateDropped,
	playerLostStatesDropped,
	playerStakeChanged,
	deselectPlayers,
	selectPlayers,
	activateShowmanDecision,
	activatePlayerDecision,
	clearDecisions,
	isReadyChanged,
	chooserChanged,
	playerInGameChanged,
	playerMediaLoaded,
	playerMediaPreloaded,
	setPlayerMediaPreloadProgress,
	setHostName,
	personAdded,
	personRemoved,
	personAvatarChanged,
	personAvatarVideoChanged,
	questionAnswersChanged,
	validate,
	askValidation,
	stopValidation,
	nameChanged,
	setTheme,
	answerChanged,
	answerTypeChanged,
	toggleEditTable,
	setIsGameStarted,
	setIsAppellation,
	setIsEditingTables,
	setIsPaused,
	setRoomRole,
	incrementQuestionCounter,
	resetQuestionCounter,
	setSettingDisplayAnswerOptionsLabels,
	setSettingFalseStart,
	setSettingOral,
	setSettingPartialImages,
	setSettingPartialImageTime,
	setSettingTimeForBlockingButton,
	setSettingPartialText,
	setSettingReadingSpeed,
	setSettingManaged,
	setSettingUseApellations,
	setSettingPlayAllQuestionsInFinalRound,
	setSettingAllowEveryoneToPlayHiddenStakes,
	setSettingOralPlayersActions,
	setChatScrollPosition,
	setDecisionType,
	setNoRiskMode,
	setIsGameButtonEnabled,
	setChatMode,
	setUsersMode,
	setChatMessage,
	setChatVisibility,
	addChatMessage,
	setLastReplic,
	setChatActive,
	clearChat,
	addOperationErrorMessage,
	setJoinMode,
	setAreSumsEditable,
	setKicked,
	setRoundsNames,
	setShowMainTimer,
	runTimer,
	pauseTimer,
	resumeTimer,
	stopTimer,
	timerMaximumChanged,
} = room2Slice.actions;

export default room2Slice.reducer;