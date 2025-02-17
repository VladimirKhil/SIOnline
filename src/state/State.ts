import RoomState, { initialState as roomInitialState } from './room/RoomState';
import * as settings from './settingsSlice';
import * as table from './tableSlice';
import * as user from './userSlice';
import * as login from './loginSlice';
import * as room2 from './room2Slice';
import * as online2 from './online2Slice';
import * as common from './commonSlice';
import * as game from './gameSlice';
import * as siPackages from './siPackagesSlice';
import * as ui from './uiSlice';
import * as siquester from './siquesterSlice';

import OnlineState, { initialState as onlineInitialState } from './online/OnlineState';

export default interface State {
	user: user.UserState;
	login: login.LoginState;
	ui: ui.UIState;
	online: OnlineState;
	online2: online2.Online2State;
	game: game.GameState;
	room: RoomState;
	room2: room2.Room2State;
	table: table.TableState;
	common: common.CommonState;
	siPackages: siPackages.SIPackagesState;
	settings: settings.SettingsState;
	siquester: siquester.SIQuesterState;
}

export const initialState: State = {
	user: user.userSlice.getInitialState(),
	login: login.loginSlice.getInitialState(),
	ui: ui.uiSlice.getInitialState(),
	online: onlineInitialState,
	online2: online2.online2Slice.getInitialState(),
	game: game.gameSlice.getInitialState(),
	siPackages: siPackages.siPackagesSlice.getInitialState(),
	room: roomInitialState,
	room2: room2.room2Slice.getInitialState(),
	table: table.tableSlice.getInitialState(),
	common: common.commonSlice.getInitialState(),
	settings: settings.settingsSlice.getInitialState(),
	siquester: siquester.siquesterSlice.getInitialState(),
};
