import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import GameType from '../../model/enums/GameType';
import PackageType from '../../model/enums/PackageType';
import Role from '../../model/enums/Role';

interface GameState {
	name: string;
	password: string;
	package: {
		type: PackageType;
		name: string;
		data: File | null;
		id: string | null;
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
	package: {
		type: PackageType.Random,
		name: '',
		data: null,
		id: null
	},
	type: GameType.Simple,
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
		setInProgress: (state: GameState, action: PayloadAction<boolean>) => {
			
		}
	}
});

export const {
	setInProgress
} = gameSlice.actions;

export default gameSlice.reducer;