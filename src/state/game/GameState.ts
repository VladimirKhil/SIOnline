import GameType from '../../model/GameType';
import Role from '../../model/Role';
import PackageType from '../../model/enums/PackageType';

export default interface GameState {
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

export const initialState: GameState = {
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
	type: GameType.Simple,
	role: Role.Player,
	isShowmanHuman: false,
	playersCount: 3,
	humanPlayersCount: 0,
	id: -1,
	isAutomatic: false
};