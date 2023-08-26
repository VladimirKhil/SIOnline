import GameType from '../client/contracts/GameType';
import Role from '../client/contracts/Role';
import RoomState, { initialState as roomInitialState } from './room/RoomState';
import SettingsState, { initialState as settingsInitialState } from './settings/SettingsState';
import PackageType from '../model/enums/PackageType';
import TableState, { initialState as tableInitialState } from './table/TableState';
import UserState, { initialState as userInitialState } from './user/UserState';
import LoginState, { initialState as loginInitialState } from './login/LoginState';
import CommonState, { initialState as commonInitialState } from './common/CommonState';
import SIPackagesState, { initialState as siPackagesInitialState } from './siPackages/SIPackagesState';
import UIState, { initialState as uiInitialState } from './ui/UIState';
import OnlineState, { initialState as onlineInitialState } from './online/OnlineState';

export default interface State {
	user: UserState;
	login: LoginState;
	ui: UIState;
	online: OnlineState;
	game: {
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
	};
	room: RoomState;
	table: TableState;
	common: CommonState;
	siPackages: SIPackagesState;
	settings: SettingsState;
}

export const initialState: State = {
	user: userInitialState,
	login: loginInitialState,
	ui: uiInitialState,
	online: onlineInitialState,
	game: {
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
	},
	siPackages: siPackagesInitialState,
	room: roomInitialState,
	table: tableInitialState,
	common: commonInitialState,
	settings: settingsInitialState
};
