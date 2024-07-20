import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import DataContext from '../../model/DataContext';

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
	playState: {
		report: string;
	};

	dialogView: DialogView;
	contextView: ContextView;
}

const initialState: Room2State = {
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
	async (arg: any, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		await dataContext.game.gameServerClient.msgAsync(arg.message, arg.playerIndex); // Bad design
	},
);

export const sendAnswer = createAsyncThunk(
	'room2/sendAnswer',
	async (answer: string, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		await dataContext.game.gameServerClient.msgAsync('ANSWER', answer);
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

export const sendNominal = createAsyncThunk(
	'room2/sendNominal',
	async (arg: void, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		await dataContext.game.gameServerClient.msgAsync('STAKE', 0);
	},
);

export const sendPass = createAsyncThunk(
	'room2/sendPass',
	async (arg: void, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		await dataContext.game.gameServerClient.msgAsync('STAKE', 2);
	},
);

export const sendAllIn = createAsyncThunk(
	'room2/sendAllIn',
	async (arg: void, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		await dataContext.game.gameServerClient.msgAsync('STAKE', 3);
	},
);

export const sendStake = createAsyncThunk(
	'room2/sendStake',
	async (arg: any, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		if (arg.message === 'STAKE') { // Bad design
			await dataContext.game.gameServerClient.msgAsync('STAKE', 1, arg.stake);
		} else {
			await dataContext.game.gameServerClient.msgAsync(arg.message, arg.stake);
		}
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
	},
	extraReducers: (builder) => {
		builder.addCase(complain.fulfilled, (state) => {
			state.dialogView = DialogView.None;
		});

		builder.addCase(sendGameReport.fulfilled, (state) => {
			state.dialogView = DialogView.None;
			state.contextView = ContextView.None;
		});
	},
});

export const {
	showDialog,
	setContext,
	setReport,
} = room2Slice.actions;


export default room2Slice.reducer;