import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import OnlineMode from '../model/enums/OnlineMode';
import Path from '../model/enums/Path';
import Role from '../model/Role';
import Sex from '../model/enums/Sex';

export interface INavigationState {
	path: Path;
	returnToLobby?: boolean;
	packageUri?: string;
	packageName?: string;
	hostUri?: string;
	gameId?: number;
	newGameMode?: 'single' | 'multi' | null;
	callbackState?: INavigationState;
	role?: Role;
	sex?: Sex;
	password?: string;
	isAutomatic?: boolean;
}

export interface UIState {
	onlineView: OnlineMode;
	windowWidth: number;
	windowHeight: number;
	areSettingsVisible: boolean;
	isProfileVisible: boolean;
	isSettingGameButtonKey: boolean;
	isVisible: boolean;
	navigation: INavigationState;
	showPlayers: boolean;
	qrCode: string | null;
	isFullScreenSupported: boolean;
}

const initialState: UIState = {
	onlineView: OnlineMode.Games,
	windowWidth: window.innerWidth,
	windowHeight: window.innerHeight,
	areSettingsVisible: false,
	isProfileVisible: false,
	isSettingGameButtonKey: false,
	isVisible: true,
	navigation: {
		path: Path.Loading,
	},
	showPlayers: true,
	qrCode: null,
	isFullScreenSupported: true,
};

export const uiSlice = createSlice({
	name: 'ui',
	initialState,
	reducers: {
		showSettings: (state: UIState, action: PayloadAction<boolean>) => {
			state.areSettingsVisible = action.payload;
			state.isSettingGameButtonKey = state.isSettingGameButtonKey && action.payload;
		},
		showProfile: (state: UIState, action: PayloadAction<boolean>) => {
			state.isProfileVisible = action.payload;
		},
		closeGameInfo: (state: UIState) => {
			state.onlineView = OnlineMode.Games;
		},
		onlineModeChanged: (state: UIState, action: PayloadAction<OnlineMode>) => {
			state.onlineView = action.payload;
		},
		windowSizeChanged: (state: UIState, action: PayloadAction<{ width: number, height: number }>) => {
			state.windowWidth = action.payload.width;
			state.windowHeight = action.payload.height;
		},
		isSettingGameButtonKeyChanged: (state: UIState, action: PayloadAction<boolean>) => {
			state.isSettingGameButtonKey = action.payload;
		},
		visibilityChanged: (state: UIState, action: PayloadAction<boolean>) => {
			state.isVisible = action.payload;
		},
		navigateCore: (state: UIState, action: PayloadAction<INavigationState>) => {
			state.navigation = action.payload;
		},
		playersVisibilityChanged: (state: UIState, action: PayloadAction<boolean>) => {
			state.showPlayers = action.payload;
		},
		setQrCode: (state: UIState, action: PayloadAction<string | null>) => {
			state.qrCode = action.payload;
		},
		setFullScreenSupported: (state: UIState, action: PayloadAction<boolean>) => {
			state.isFullScreenSupported = action.payload;
		},
	}
});

export const {
	showSettings,
	showProfile,
	closeGameInfo,
	onlineModeChanged,
	windowSizeChanged,
	isSettingGameButtonKeyChanged,
	visibilityChanged,
	navigateCore,
	playersVisibilityChanged,
	setQrCode,
	setFullScreenSupported,
} = uiSlice.actions;

export default uiSlice.reducer;