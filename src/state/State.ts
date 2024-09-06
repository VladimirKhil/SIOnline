import RoomState, { initialState as roomInitialState } from './room/RoomState';
import * as settings from './new/settingsSlice';
import * as table from './new/tableSlice';
import * as user from './new/userSlice';
import * as login from './new/loginSlice';
import * as room2 from './new/room2Slice';
import * as online2 from './new/online2Slice';
import * as common from './new/commonSlice';
import * as game from './new/gameSlice';
import SIPackagesState, { initialState as siPackagesInitialState } from './siPackages/SIPackagesState';
import UIState, { initialState as uiInitialState } from './ui/UIState';
import OnlineState, { initialState as onlineInitialState } from './online/OnlineState';

export default interface State {
	user: user.UserState;
	login: login.LoginState;
	ui: UIState;
	online: OnlineState;
	online2: online2.Online2State;
	game: game.GameState;
	room: RoomState;
	room2: room2.Room2State;
	table: table.TableState;
	common: common.CommonState;
	siPackages: SIPackagesState;
	settings: settings.SettingsState;
}

export const initialState: State = {
	user: user.userSlice.getInitialState(),
	login: login.loginSlice.getInitialState(),
	ui: uiInitialState,
	online: onlineInitialState,
	online2: online2.online2Slice.getInitialState(),
	game: game.gameSlice.getInitialState(),
	siPackages: siPackagesInitialState,
	room: roomInitialState,
	room2: room2.room2Slice.getInitialState(),
	table: table.tableSlice.getInitialState(),
	common: common.commonSlice.getInitialState(),
	settings: settings.settingsSlice.getInitialState(),
};
