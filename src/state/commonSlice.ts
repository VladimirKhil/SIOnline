import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import GameSound from '../model/enums/GameSound';

export enum MessageLevel {
	Information,
	Warning,
	Error,
}

export interface CommonState {
	computerAccounts: string[] | null;
	isConnected: boolean;
	isConnectedReason: string;
	isSIHostConnected: boolean;
	isSIHostConnectedReason: string;
	serverName: string | null;
	serverLicense: string | null;
	maxPackageSizeMb: number;
	error: string | null;
	userError: string | null;
	messageLevel: MessageLevel;
	askForConsent: boolean;
	emojiCultures?: string[];
	clearUrls?: boolean;
	steamLinkSupported: boolean;
	hostManagedUrls: boolean;
	minimalLogo?: boolean;
	roomLinkEnabled: boolean;
	avatarLoadProgress: boolean;
	avatarLoadError: string | null;
	audio: GameSound | null;
	audioLoop: boolean;
	fontsReady: boolean;
	clipboardSupported: boolean;
	exitSupported?: boolean;
	logSupported?: boolean;
	isDesktop?: boolean;
	siHosts: Record<string, string>;
}

const initialState: CommonState = {
	computerAccounts: null,
	isConnected: true,
	isConnectedReason: '',
	isSIHostConnected: true,
	isSIHostConnectedReason: '',
	serverName: null,
	serverLicense: null,
	maxPackageSizeMb: 100,
	error: null,
	userError: null,
	messageLevel: MessageLevel.Error,
	askForConsent: true,
	steamLinkSupported: true,
	hostManagedUrls: false,
	roomLinkEnabled: true,
	avatarLoadProgress: false,
	avatarLoadError: null,
	audio: null,
	audioLoop: false,
	fontsReady: false,
	clipboardSupported: true,
	exitSupported: false,
	logSupported: true,
	isDesktop: false,
	siHosts: {},
};

export const commonSlice = createSlice({
	name: 'common',
	initialState,
	reducers: {
		isConnectedChanged: (state: CommonState, action: PayloadAction<{ isConnected: boolean, reason: string }>) => {
			state.isConnected = action.payload.isConnected;
			state.isConnectedReason = action.payload.reason;
		},
		isSIHostConnectedChanged: (state: CommonState, action: PayloadAction<{ isConnected: boolean, reason: string }>) => {
			state.isSIHostConnected = action.payload.isConnected;
			state.isSIHostConnectedReason = action.payload.reason;
		},
		computerAccountsChanged: (state: CommonState, action: PayloadAction<string[]>) => {
			state.computerAccounts = action.payload;
		},
		serverInfoChanged: (
			state: CommonState,
			action: PayloadAction<{ serverName: string, serverLicense: string, maxPackageSizeMb: number, siHosts: Record<string, string> }>) => {
			state.serverName = action.payload.serverName;
			state.serverLicense = action.payload.serverLicense;
			state.maxPackageSizeMb = action.payload.maxPackageSizeMb;
			state.siHosts = action.payload.siHosts;
		},
		commonErrorChanged: (state: CommonState, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},
		userErrorChangedInternal: (state: CommonState, action: PayloadAction<{ message: string | null, messageLevel?: MessageLevel }>) => {
			state.userError = action.payload.message;
			state.messageLevel = action.payload.messageLevel ?? MessageLevel.Error;
		},
		avatarLoadStart: (state: CommonState) => {
			state.avatarLoadProgress = true;
		},
		avatarLoadEnd: (state: CommonState) => {
			state.avatarLoadError = null;
			state.avatarLoadProgress = false;
		},
		avatarLoadError: (state: CommonState, action: PayloadAction<string>) => {
			state.avatarLoadError = action.payload;
			state.avatarLoadProgress = false;
		},
		playAudio: (state: CommonState, action: PayloadAction<{ audio: GameSound, loop: boolean }>) => {
			state.audio = action.payload.audio;
			state.audioLoop = action.payload.loop;
		},
		stopAudio: (state: CommonState) => {
			state.audio = null;
			state.audioLoop = false;
		},
		setFontsReady: (state: CommonState, action: PayloadAction<boolean>) => {
			state.fontsReady = action.payload;
		},
		setClipboardSupported: (state: CommonState, action: PayloadAction<boolean>) => {
			state.clipboardSupported = action.payload;
		},
		setExitSupported: (state: CommonState, action: PayloadAction<boolean>) => {
			state.exitSupported = action.payload;
		},
		setIsDesktop: (state: CommonState, action: PayloadAction<boolean>) => {
			state.isDesktop = action.payload;

			if (state.isDesktop) {
				state.askForConsent = false;
			}
		},
		setClearUrls: (state: CommonState, action: PayloadAction<boolean>) => {
			state.clearUrls = action.payload;
		},
		setSteamLinkSupported: (state: CommonState, action: PayloadAction<boolean>) => {
			state.steamLinkSupported = action.payload;
		},
		setMinimalLogo: (state: CommonState, action: PayloadAction<boolean>) => {
			state.minimalLogo = action.payload;
		},
		setRoomLinkEnabled: (state: CommonState, action: PayloadAction<boolean>) => {
			state.roomLinkEnabled = action.payload;
		},
		setHostManagedUrls: (state: CommonState, action: PayloadAction<boolean>) => {
			state.hostManagedUrls = action.payload;
		},
		setLogSupported: (state: CommonState, action: PayloadAction<boolean>) => {
			state.logSupported = action.payload;
		},
	}
});

export const userMessageChanged = createAsyncThunk(
	'common/userMessageChanged',
	async (arg: any, thunkAPI) => {
		thunkAPI.dispatch(commonSlice.actions.userErrorChangedInternal({
			message: arg.message,
			messageLevel: arg.messageLevel
		}));

		window.setTimeout(
			() => thunkAPI.dispatch(commonSlice.actions.userErrorChangedInternal({ message: null })),
			3000
		);
	},
);

export const userErrorChanged = (message: string) => userMessageChanged({
	message,
	messageLevel: MessageLevel.Error
});

export const userWarnChanged = (message: string) =>	userMessageChanged({
	message,
	messageLevel: MessageLevel.Warning
});

export const userInfoChanged = (message: string) =>	userMessageChanged({
	message,
	messageLevel: MessageLevel.Information
});

export const {
	isConnectedChanged,
	isSIHostConnectedChanged,
	computerAccountsChanged,
	serverInfoChanged,
	commonErrorChanged,
	avatarLoadStart,
	avatarLoadEnd,
	avatarLoadError,
	playAudio,
	stopAudio,
	setFontsReady,
	setClipboardSupported,
	setExitSupported,
	setIsDesktop,
	setClearUrls,
	setSteamLinkSupported,
	setMinimalLogo,
	setRoomLinkEnabled,
	setHostManagedUrls,
	setLogSupported,
} = commonSlice.actions;

export default commonSlice.reducer;