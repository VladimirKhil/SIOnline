import { createSlice } from '@reduxjs/toolkit';
import GameInfo from '../model/GameInfo';

export const MAX_HISTORY_LENGTH = 500;

export interface HistoryState {
	currentGame: GameInfo | null;
	gameHistory: GameInfo[];
}

const initialState: HistoryState = {
	currentGame: null,
	gameHistory: [],
};

export const historySlice = createSlice({
	name: 'history',
	initialState,
	reducers: {
		setCurrentGame: (state, action) => {
			state.currentGame = {
				date: new Date().toISOString(),
				packageName: '',
				packageAuthors: [],
				personName: action.payload,
				showman: '',
				results: {},
			};
		},
		setPackageName: (state, action) => {
			if (state.currentGame) {
				state.currentGame.packageName = action.payload;
			}
		},
		setPackageAuthors: (state, action) => {
			if (state.currentGame) {
				state.currentGame.packageAuthors = action.payload;
			}
		},
		setShowman: (state, action) => {
			if (state.currentGame) {
				state.currentGame.showman = action.payload;
			}
		},
		setGameResults: (state, action) => {
			if (state.currentGame) {
				state.currentGame.results = action.payload;
			}
		},
		addCurrentGameToHistory: (state) => {
			if (state.currentGame) {
				state.gameHistory = [...state.gameHistory, state.currentGame].slice(-MAX_HISTORY_LENGTH);
				state.currentGame = null;
			}
		}
	}
});

export const {
	setCurrentGame,
	setPackageName,
	setPackageAuthors,
	setShowman,
	setGameResults,
	addCurrentGameToHistory,
} = historySlice.actions;

export default historySlice.reducer;