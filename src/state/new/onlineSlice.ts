import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import GamesFilter from '../../model/enums/GamesFilter';
import GameInfo from '../../client/contracts/GameInfo';
import LobbySideMode from '../../model/enums/LobbySideMode';

interface OnlineState {
	inProgress: boolean;
	error: string;
	gamesFilter: GamesFilter;
	gamesSearch: string;
	games: Record<number, GameInfo>;
	selectedGameId: number;
	password: string;
	chatMode: LobbySideMode;
	newGameShown: boolean;
	gameCreationProgress: boolean;
	joinGameProgress: boolean;
}

const initialState: OnlineState = {
	inProgress: false,
	error: '',
	gamesFilter: GamesFilter.NoFilter,
	gamesSearch: '',
	games: {},
	selectedGameId: -1,
	password: '',
	chatMode: LobbySideMode.Trends,
	newGameShown: false,
	gameCreationProgress: false,
	joinGameProgress: false,
};

export const onlineSlice = createSlice({
	name: 'online',
	initialState,
	reducers: {
		setInProgress: (state: OnlineState, action: PayloadAction<boolean>) => {

		}
	}
});

export const {
	setInProgress
} = onlineSlice.actions;

export default onlineSlice.reducer;