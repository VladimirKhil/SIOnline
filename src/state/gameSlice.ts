import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import GameType from '../model/GameType';
import PackageType from '../model/enums/PackageType';
import Role from '../model/Role';
import localization from '../model/resources/localization';

export interface GameState {
	name: string;
	password: string;
	voiceChat: string;
	package: {
		type: PackageType;
		name: string;
		data: File | null;
		id: string | null;
		uri: string | null;
	};
	type: GameType;
	role: Role;
	isShowmanHuman: boolean;
	playersCount: number;
	humanPlayersCount: number;
	id: number;
	isAutomatic: boolean;
}

const initialState: GameState = {
	name: '',
	password: '',
	voiceChat: '',
	package: {
		type: PackageType.Random,
		name: '',
		data: null,
		id: null,
		uri: null,
	},
	type: GameType.Classic,
	role: Role.Player,
	isShowmanHuman: false,
	playersCount: 3,
	humanPlayersCount: 0,
	id: -1,
	isAutomatic: false
};

export const gameSlice = createSlice({
	name: 'game',
	initialState,
	reducers: {
		setName: (state: GameState, action: PayloadAction<string>) => {
			state.name = action.payload;
		},
		setPassword: (state: GameState, action: PayloadAction<string>) => {
			state.password = action.payload;
		},
		setVoiceChat: (state: GameState, action: PayloadAction<string>) => {
			state.voiceChat = action.payload;
		},
		setPackageType: (state: GameState, action: PayloadAction<PackageType>) => {
			state.package.type = action.payload;
		},
		setPackageData: (state: GameState, action: PayloadAction<{ name: string, data: File | null }>) => {
			state.package.name = action.payload.name;
			state.package.data = action.payload.data;
		},
		setPackageLibrary: (state: GameState, action: PayloadAction<{ name: string, id: string, uri: string }>) => {
			state.package.name = action.payload.name;
			state.package.id = action.payload.id;
			state.package.uri = action.payload.uri;
		},
		setType: (state: GameState, action: PayloadAction<GameType>) => {
			state.type = action.payload;
		},
		setRole: (state: GameState, action: PayloadAction<Role>) => {
			state.role = action.payload;
			state.humanPlayersCount = Math.min(state.humanPlayersCount, state.playersCount - (action.payload === Role.Player ? 1 : 0));
		},
		setShowmanHuman: (state: GameState, action: PayloadAction<boolean>) => {
			state.isShowmanHuman = action.payload;
		},
		setPlayersCount: (state: GameState, action: PayloadAction<number>) => {
			state.playersCount = action.payload;
			state.humanPlayersCount = Math.min(state.humanPlayersCount, action.payload - (state.role === Role.Player ? 1 : 0));
		},
		setHumanPlayersCount: (state: GameState, action: PayloadAction<number>) => {
			state.humanPlayersCount = action.payload;
		},
		setGameSet: (state: GameState, action: PayloadAction<{ id: number, isAutomatic: boolean }>) => {
			state.id = action.payload.id;
			state.isAutomatic = action.payload.isAutomatic;
		},
		newGame2: (state: GameState, action: PayloadAction<string>) => {
			state.name = state.name || `${localization.gameOf} ${action.payload}`;
		}
	}
});

export const {
	setName,
	setPassword,
	setVoiceChat,
	setPackageType,
	setPackageData,
	setPackageLibrary,
	setType,
	setRole,
	setShowmanHuman,
	setPlayersCount,
	setHumanPlayersCount,
	setGameSet,
	newGame2,
} = gameSlice.actions;

export default gameSlice.reducer;