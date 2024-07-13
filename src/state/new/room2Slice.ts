import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import DataContext from '../../model/DataContext';

export enum DialogView {
	None,
	Complain,
}

export interface Room2State {
	playState: {
		themeIndex: number;
		questionIndex: number;
	};

	dialogView: DialogView;
}

const initialState: Room2State = {
	playState: {
		themeIndex: -1,
		questionIndex: -1,
	},

	dialogView: DialogView.None,
};

export const complain = createAsyncThunk(
	'room2/complain',
	async (arg: any, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		await dataContext.game.markQuestion(arg.questionId, arg.complainText);
	},
);

export const room2Slice = createSlice({
	name: 'room2',
	initialState,
	reducers: {
		showDialog: (state: Room2State, action: PayloadAction<DialogView>) => {
			state.dialogView = action.payload;
		}
	},
	extraReducers: (builder) => {
		builder.addCase(complain.fulfilled, (state) => {
			state.dialogView = DialogView.None;
		});
	}
});

export const {
	showDialog,
} = room2Slice.actions;


export default room2Slice.reducer;