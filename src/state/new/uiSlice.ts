import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import MainView from '../../model/enums/MainView';
import OnlineMode from '../../model/enums/OnlineMode';

interface UIState {
	mainView: MainView;
	previousMainView: MainView;
	onlineView: OnlineMode;
	windowWidth: number;
	areSettingsVisible: boolean;
}

const initialState: UIState = {
	mainView: MainView.Loading,
	previousMainView: MainView.Loading,
	onlineView: OnlineMode.Games,
	windowWidth: window.innerWidth,
	areSettingsVisible: false
};

export const uiSlice = createSlice({
	name: 'ui',
	initialState,
	reducers: {
		navigate: (state: UIState, action: PayloadAction<MainView>) => {
			state.previousMainView = state.mainView;
			state.mainView = action.payload;
		},
		navigateBack: (state: UIState) => {
			state.mainView = state.previousMainView;
		},
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
	navigate,
	navigateBack,
	showSettings,
	setOnlineView,
	setWindowWidth
} = uiSlice.actions;

export default uiSlice.reducer;