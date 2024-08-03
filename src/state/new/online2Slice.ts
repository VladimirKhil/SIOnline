import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import GameInfo from '../../client/contracts/GameInfo';
import PersonInfo from '../../client/contracts/PersonInfo';

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
		onGamePersonsChanged: (state: Online2State, action: PayloadAction<{ gameId: number, persons: PersonInfo[] }>) => {
			if (state.selectedGame?.GameID === action.payload.gameId) {
				state.selectedGame.Persons = action.payload.persons;
			}
		}
	},
	extraReducers: (builder) => {
	},
});

export const {
	selectGame,
	onGamePersonsChanged,
} = online2Slice.actions;


export default online2Slice.reducer;