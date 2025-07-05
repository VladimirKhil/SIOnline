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

export enum DialogView {
	None,
	Complain,
	Report,
}

export enum ContextView {
	None,
	Answer,
	OralAnswer,
	Report,
}

export enum DecisionType {
	None,
	Answer,
	SelectChooser,
	SelectPlayer,
	Stake,
	OralAnswer,
	Choose,
}

// Helper function to check if a decision is needed
export const isDecisionNeeded = (decisionType: DecisionType): boolean => decisionType !== DecisionType.None;

interface ValidationInfo {
	name: string;
	answer: string;
}

export interface Room2State {
	persons: {
		showman: PersonInfo;
		players: PlayerInfo[];
		hostName: string | null;
	};

	name: string;
	role: Role;

	playState: {
		report: string;
	};

	dialogView: DialogView;
	contextView: ContextView;

	stage: {
		isGameStarted: boolean;
		isAppellation: boolean;
		isEditingTables: boolean;
		isGamePaused: boolean;
		decisionType: DecisionType;
	}

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
	chatScrollPosition: number;
	noRiskMode: boolean;

	settings: AppSettings;
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
	},

	name: '',
	role: Role.Player,

	playState: {
		report: '',
	},

	dialogView: DialogView.None,
	contextView: ContextView.None,

	stage: {
		isGameStarted: false,
		isAppellation: false,
		isEditingTables: false,
		isGamePaused: false,
		decisionType: DecisionType.None,
	},

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
	chatScrollPosition: 0,
	noRiskMode: false,

	settings: initialAppSettings,
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
			state.contextView = ContextView.Report;
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
		infoChanged: (state: Room2State, action: PayloadAction<{ showman: PersonInfo, players: PlayerInfo[] }>) => {
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
				answer: '',
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
		playerDeleted: (state: Room2State, action: PayloadAction<number>) => {
			state.persons.players.splice(action.payload, 1);
		},
		playersSwap: (state: Room2State, action: PayloadAction<{ index1: number, index2: number }>) => {
			const { players } = state.persons;
			const temp = players[action.payload.index1];
			players[action.payload.index1] = players[action.payload.index2];
			players[action.payload.index2] = temp;
		},
		playerStateChanged: (state: Room2State, action: PayloadAction<{ index: number, state: PlayerStates }>) => {
			state.persons.players[action.payload.index].state = action.payload.state;
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
		playerStakeChanged: (state: Room2State, action: PayloadAction<{ index: number, stake: number }>) => {
			state.persons.players[action.payload.index].stake = action.payload.stake;
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
		setHostName(state: Room2State, action: PayloadAction<string | null>) {
			state.persons.hostName = action.payload;
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
		},
		stopValidation(state: Room2State) {
			state.validation.queue = [];
		},
		nameChanged(state: Room2State, action: PayloadAction<string>) {
			state.name = action.payload;
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
		}
	},
	extraReducers: (builder) => {
		builder.addCase(sendAnswer.fulfilled, (state) => {
			state.contextView = ContextView.None;
			state.stage.decisionType = DecisionType.None;
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
		});

		builder.addCase(rejectAnswerDefault.fulfilled, (state) => {
			state.validation.queue.shift();
		});

		builder.addCase(approveAnswer.fulfilled, (state) => {
			state.validation.queue.shift();
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

export const {
	showDialog,
	setContext,
	setReport,
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
	playerDeleted,
	playersSwap,
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
	setHostName,
	questionAnswersChanged,
	validate,
	askValidation,
	stopValidation,
	nameChanged,
	toggleEditTable,
	setIsGameStarted,
	setIsAppellation,
	setIsEditingTables,
	setIsPaused,
	setRoomRole,
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
} = room2Slice.actions;

export default room2Slice.reducer;