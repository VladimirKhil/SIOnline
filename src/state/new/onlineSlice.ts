import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import ChatMessage from '../../model/ChatMessage';
import ChatMode from '../../model/enums/ChatMode';
import GamesFilter from '../../model/enums/GamesFilter';
import localization from '../../model/resources/localization';
import GameInfo from '../../client/contracts/GameInfo';

interface OnlineState {
	inProgress: boolean;
	error: string;
	gamesFilter: GamesFilter;
	gamesSearch: string;
	games: Record<number, GameInfo>;
	selectedGameId: number;
	users: string[];
	currentMessage: string;
	messages: ChatMessage[];
	password: string;
	chatMode: ChatMode;
	newGameShown: boolean;
	gameCreationProgress: boolean;
	gameCreationError: string | null;
	joinGameProgress: boolean;
	joingGameError: string | null;
	uploadPackageProgress: boolean;
	uploadPackagePercentage: number;
}

const initialState: OnlineState = {
	inProgress: false,
	error: '',
	gamesFilter: GamesFilter.NoFilter,
	gamesSearch: '',
	games: {},
	selectedGameId: -1,
	users: [],
	currentMessage: '',
	messages: [
		{
			sender: localization.appUser,
			text: localization.greeting
		}
	],
	password: '',
	chatMode: ChatMode.Chat,
	newGameShown: false,
	gameCreationProgress: false,
	gameCreationError: null,
	joinGameProgress: false,
	joingGameError: null,
	uploadPackageProgress: false,
	uploadPackagePercentage: 0
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