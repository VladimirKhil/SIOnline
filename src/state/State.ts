import RoomState, { initialState as roomInitialState } from './room/RoomState';
import * as settings from './new/settingsSlice';
import * as table from './new/tableSlice';
import UserState, { initialState as userInitialState } from './user/UserState';
import * as login from './new/loginSlice';
import * as room2 from './new/room2Slice';
import * as online2 from './new/online2Slice';
import CommonState, { initialState as commonInitialState } from './common/CommonState';
import SIPackagesState, { initialState as siPackagesInitialState } from './siPackages/SIPackagesState';
import UIState, { initialState as uiInitialState } from './ui/UIState';
import OnlineState, { initialState as onlineInitialState } from './online/OnlineState';
import GameState, { initialState as gameInitialState } from './game/GameState';

export default interface State {
	user: UserState;
	login: login.LoginState;
	ui: UIState;
	online: OnlineState;
	online2: online2.Online2State;
	game: GameState;
	room: RoomState;
	room2: room2.Room2State;
	table: table.TableState;
	common: CommonState;
	siPackages: SIPackagesState;
	settings: settings.SettingsState;
}

export const initialState: State = {
	user: userInitialState,
	login: login.loginSlice.getInitialState(),
	ui: uiInitialState,
	online: onlineInitialState,
	online2: online2.online2Slice.getInitialState(),
	game: gameInitialState,
	siPackages: siPackagesInitialState,
	room: roomInitialState,
	room2: room2.room2Slice.getInitialState(),
	table: table.tableSlice.getInitialState(),
	common: commonInitialState,
	settings: settings.settingsSlice.getInitialState(),
};
