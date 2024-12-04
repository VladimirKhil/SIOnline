import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import DataContext from '../../model/DataContext';
import PlayerInfo from '../../model/PlayerInfo';
import PersonInfo from '../../model/PersonInfo';
import PlayerStates from '../../model/enums/PlayerStates';
import Messages from '../../client/game/Messages';
import { RootState } from './store';
import localization from '../../model/resources/localization';
import roomActionCreators from '../room/roomActionCreators';

export enum DialogView {
	None,
	Complain,
	Report,
}

export enum ContextView {
	None,
	Report,
}

export interface Room2State {
	persons: {
		showman: PersonInfo;
		players: PlayerInfo[];
	};

	playState: {
		report: string;
	};

	dialogView: DialogView;
	contextView: ContextView;
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
	},

	playState: {
		report: '',
	},

	dialogView: DialogView.None,
	contextView: ContextView.None,
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
		const { message } = (thunkAPI.getState() as RootState).room.selection;
		await dataContext.game.gameServerClient.msgAsync(message, arg);
		// TODO: move to fulfilled section after migrating the property to Redux Toolkit
		thunkAPI.dispatch(roomActionCreators.decisionNeededChanged(false));
	},
);

export const sendAnswer = createAsyncThunk(
	'room2/sendAnswer',
	async (answer: string, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		await dataContext.game.sendAnswer(answer);
	},
);

export const approveAnswer = createAsyncThunk(
	'room2/approveAnswer',
	async (factor: number, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		await dataContext.game.approveAnswer(factor);
	},
);

export const rejectAnswer = createAsyncThunk(
	'room2/rejectAnswer',
	async (factor: number, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		await dataContext.game.rejectAnswer(factor);
	},
);

export const sendPass = createAsyncThunk(
	'room2/sendPass',
	async (_arg: void, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		await dataContext.game.gameServerClient.msgAsync(Messages.SetStake, 'Pass');
	},
);

export const sendAllIn = createAsyncThunk(
	'room2/sendAllIn',
	async (arg: void, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		await dataContext.game.gameServerClient.msgAsync(Messages.SetStake, 'AllIn');
	},
);

export const sendStake = createAsyncThunk(
	'room2/sendStake',
	async (arg: any, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		await dataContext.game.gameServerClient.msgAsync(Messages.SetStake, 'Stake', arg);
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
	},
	extraReducers: (builder) => {
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
		});
	},
});

export const {
	showDialog,
	setContext,
	setReport,
	showmanReplicChanged,
	playerReplicChanged,
	infoChanged,
	playersStateCleared,
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
} = room2Slice.actions;


export default room2Slice.reducer;