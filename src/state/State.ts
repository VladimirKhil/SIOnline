import RoomState, { initialState as roomInitialState } from './room/RoomState';
import SettingsState, { initialState as settingsInitialState } from './settings/SettingsState';
import TableState, { initialState as tableInitialState } from './table/TableState';
import UserState, { initialState as userInitialState } from './user/UserState';
import LoginState, { initialState as loginInitialState } from './login/LoginState';
import CommonState, { initialState as commonInitialState } from './common/CommonState';
import SIPackagesState, { initialState as siPackagesInitialState } from './siPackages/SIPackagesState';
import UIState, { initialState as uiInitialState } from './ui/UIState';
import OnlineState, { initialState as onlineInitialState } from './online/OnlineState';
import GameState, { initialState as gameInitialState } from './game/GameState';

export default interface State {
	user: UserState;
	login: LoginState;
	ui: UIState;
	online: OnlineState;
	game: GameState;
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
	game: gameInitialState,
	siPackages: siPackagesInitialState,
	room: roomInitialState,
	table: tableInitialState,
	common: commonInitialState,
	settings: settingsInitialState
};
