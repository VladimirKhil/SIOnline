import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import OnlineMode from '../../model/enums/OnlineMode';
import { INavigationState } from '../ui/UIState';
import Path from '../../model/enums/Path';

interface UIState {
	onlineView: OnlineMode;
	windowWidth: number;
	windowHeight: number;
	areSettingsVisible: boolean;
	isSettingGameButtonKey: boolean;
	isVisible: boolean;
	navigation: INavigationState;
}

const initialState: UIState = {
	onlineView: OnlineMode.Games,
	windowWidth: window.innerWidth,
	windowHeight: window.innerHeight,
	areSettingsVisible: false,
	isSettingGameButtonKey: false,
	isVisible: true,
	navigation: {
		path: Path.Login,
	},
};

export const uiSlice = createSlice({
	name: 'ui',
	initialState,
	reducers: {
		showSettings: (state: UIState, action: PayloadAction<boolean>) => {
			state.areSettingsVisible = action.payload;
		},
		setOnlineView: (state: UIState, action: PayloadAction<OnlineMode>) => {
			state.onlineView = action.payload;
		},
		setWindowWidth: (state: UIState, action: PayloadAction<number>) => {
			state.windowWidth = action.payload;
		}
	}
});

export const {
	showSettings,
	setOnlineView,
	setWindowWidth
} = uiSlice.actions;

export default uiSlice.reducer;