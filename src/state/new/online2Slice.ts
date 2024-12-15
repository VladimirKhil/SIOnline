import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import GameInfo from '../../client/contracts/GameInfo';
import PersonInfo from '../../client/contracts/PersonInfo';

export interface Online2State {
	selectedGame: GameInfo | null;
	uploadPackageProgress: boolean;
	uploadPackagePercentage: number;
}

const initialState: Online2State = {
	selectedGame: null,
	uploadPackageProgress: false,
	uploadPackagePercentage: 0,
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
		},
		uploadPackageStarted: (state: Online2State) => {
			state.uploadPackageProgress = true;
		},
		uploadPackageFinished: (state: Online2State) => {
			state.uploadPackageProgress = false;
		},
		uploadPackageProgress: (state: Online2State, action: PayloadAction<number>) => {
			state.uploadPackagePercentage = action.payload;
		},
	},
});

export const {
	selectGame,
	onGamePersonsChanged,
	uploadPackageStarted,
	uploadPackageFinished,
	uploadPackageProgress,
} = online2Slice.actions;


export default online2Slice.reducer;