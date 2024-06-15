import { AnyAction, Reducer } from 'redux';
import State, { initialState } from './State';
import { KnownRoomAction } from './room/RoomActions';
import roomReducer from './room/roomReducer';
import settingsReducer from './settings/settingsReducer';
import { KnownSettingsAction } from './settings/SettingsActions';
import tableReducer from './new/tableSlice';
import userReducer from './user/userReducer';
import { KnownUserAction } from './user/UserActions';
import loginReducer from './new/loginSlice';
import commonReducer from './common/commonReducer';
import { KnownCommonAction } from './common/CommonActions';
import siPackagesReducer from './siPackages/siPackagesReducer';
import { KnownSIPackagesAction } from './siPackages/SIPackagesActions';
import uiReducer from './ui/uiReducer';
import { KnownUIAction } from './ui/UIActions';
import onlineReducer from './online/onlineReducer';
import { KnownOnlineAction } from './online/OnlineActions';
import gameReducer from './game/gameReducer';
import { KnownGameAction } from './game/GameActions';
import { UnknownAction } from '@reduxjs/toolkit';

const reducer: Reducer<State> = (
	state: State = initialState,
	action: AnyAction): State => ({
	user: userReducer(state.user, action as KnownUserAction),
	login: loginReducer(state.login, action as UnknownAction),
	room: roomReducer(state.room, action as KnownRoomAction),
	common: commonReducer(state.common, action as KnownCommonAction),
	settings: settingsReducer(state.settings, action as KnownSettingsAction),
	table: tableReducer(state.table, action as UnknownAction),
	siPackages: siPackagesReducer(state.siPackages, action as KnownSIPackagesAction),
	ui: uiReducer(state.ui, action as KnownUIAction),
	online: onlineReducer(state.online, action as KnownOnlineAction),
	game: gameReducer(state.game, action as KnownGameAction)
});

export default reducer;
