import { AnyAction, Reducer } from 'redux';
import State, { initialState } from './State';
import { KnownRoomAction } from './room/RoomActions';
import roomReducer from './room/roomReducer';
import settingsReducer from './settingsSlice';
import tableReducer from './tableSlice';
import userReducer from './userSlice';
import room2Reducer from './room2Slice';
import online2Reducer from './online2Slice';
import loginReducer from './loginSlice';
import commonReducer from './commonSlice';
import uiReducer from './uiSlice';
import siPackagesReducer from './siPackagesSlice';
import gameReducer from './gameSlice';
import { UnknownAction } from '@reduxjs/toolkit';
import siquesterReducer from './siquesterSlice';

const reducer: Reducer<State> = (
	state: State = initialState,
	action: AnyAction
): State => ({
	user: userReducer(state.user, action as UnknownAction),
	login: loginReducer(state.login, action as UnknownAction),
	room: roomReducer(state.room, action as KnownRoomAction),
	room2: room2Reducer(state.room2, action as UnknownAction),
	common: commonReducer(state.common, action as UnknownAction),
	settings: settingsReducer(state.settings, action as UnknownAction),
	table: tableReducer(state.table, action as UnknownAction),
	siPackages: siPackagesReducer(state.siPackages, action as UnknownAction),
	ui: uiReducer(state.ui, action as UnknownAction),
	online2: online2Reducer(state.online2, action as UnknownAction),
	game: gameReducer(state.game, action as UnknownAction),
	siquester: siquesterReducer(state.siquester, action as UnknownAction),
});

export default reducer;
