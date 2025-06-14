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
	siHostKey?: string;
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
	settingKey: string | null;
	isVisible: boolean;
	navigation: INavigationState;
	showPlayers: boolean;
	qrCode: string | null;
	isFullScreenSupported: boolean;
}

const initialState: UIState = {
	onlineView: OnlineMode.Games,
	windowWidth: typeof window !== 'undefined' ? window.innerWidth : 1920,
	windowHeight: typeof window !== 'undefined' ? window.innerHeight : 1080,
	areSettingsVisible: false,
	isProfileVisible: false,
	settingKey: null,
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
			state.settingKey = null;
		},
		showProfile: (state: UIState, action: PayloadAction<boolean>) => {
			state.isProfileVisible = action.payload;
		},
		onlineModeChanged: (state: UIState, action: PayloadAction<OnlineMode>) => {
			state.onlineView = action.payload;
		},
		windowSizeChanged: (state: UIState, action: PayloadAction<{ width: number, height: number }>) => {
			state.windowWidth = action.payload.width;
			state.windowHeight = action.payload.height;
		},
		settingKeyChanged: (state: UIState, action: PayloadAction<string | null>) => {
			state.settingKey = action.payload;
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
	onlineModeChanged,
	windowSizeChanged,
	settingKeyChanged,
	visibilityChanged,
	navigateCore,
	playersVisibilityChanged,
	setQrCode,
	setFullScreenSupported,
} = uiSlice.actions;

export default uiSlice.reducer;