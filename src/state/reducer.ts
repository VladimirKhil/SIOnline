import { AnyAction, Reducer } from 'redux';
import State, { initialState } from './State';
import { KnownRoomAction } from './room/RoomActions';
import roomReducer from './room/roomReducer';
import settingsReducer from './new/settingsSlice';
import tableReducer from './new/tableSlice';
import userReducer from './new/userSlice';
import room2Reducer from './new/room2Slice';
import online2Reducer from './new/online2Slice';
import loginReducer from './new/loginSlice';
import commonReducer from './new/commonSlice';
import uiReducer from './new/uiSlice';
import siPackagesReducer from './new/siPackagesSlice';
import onlineReducer from './online/onlineReducer';
import { KnownOnlineAction } from './online/OnlineActions';
import gameReducer from './new/gameSlice';
import { UnknownAction } from '@reduxjs/toolkit';

const reducer: Reducer<State> = (
	state: State = initialState,
	action: AnyAction): State => ({
	user: userReducer(state.user, action as UnknownAction),
	login: loginReducer(state.login, action as UnknownAction),
	room: roomReducer(state.room, action as KnownRoomAction),
	room2: room2Reducer(state.room2, action as UnknownAction),
	common: commonReducer(state.common, action as UnknownAction),
	settings: settingsReducer(state.settings, action as UnknownAction),
	table: tableReducer(state.table, action as UnknownAction),
	siPackages: siPackagesReducer(state.siPackages, action as UnknownAction),
	ui: uiReducer(state.ui, action as UnknownAction),
	online: onlineReducer(state.online, action as KnownOnlineAction),
	online2: online2Reducer(state.online2, action as UnknownAction),
	game: gameReducer(state.game, action as UnknownAction),
});

export default reducer;
