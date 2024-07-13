import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import DataContext from '../../model/DataContext';
import GameInfo from '../../client/contracts/GameInfo';

export interface Online2State {
	selectedGame: GameInfo | null;
}

const initialState: Online2State = {
	selectedGame: null,
};

export const online2Slice = createSlice({
	name: 'online2',
	initialState,
	reducers: {
		selectGame: (state: Online2State, action: PayloadAction<GameInfo>) => {
			state.selectedGame = action.payload;
		},
	},
	extraReducers: (builder) => {
	},
});

export const {
	selectGame
} = online2Slice.actions;


export default online2Slice.reducer;