import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import GameSound from '../model/enums/GameSound';
import { gameSoundPlayer } from '../utils/GameSoundPlayer';

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
	avatarLoadProgress: boolean;
	avatarLoadError: string | null;
	audio: string | null;
	audioLoop: boolean;
	fontsReady: boolean;
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
	avatarLoadProgress: false,
	avatarLoadError: null,
	audio: null,
	audioLoop: false,
	fontsReady: false,
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
		serverInfoChanged: (state: CommonState, action: PayloadAction<{ serverName: string, serverLicense: string, maxPackageSizeMb: number }>) => {
			state.serverName = action.payload.serverName;
			state.serverLicense = action.payload.serverLicense;
			state.maxPackageSizeMb = action.payload.maxPackageSizeMb;
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
			state.audio = gameSoundPlayer.getSound(action.payload.audio) ?? null;
			state.audioLoop = action.payload.loop;
		},
		stopAudio: (state: CommonState) => {
			state.audio = null;
			state.audioLoop = false;
		},
		setFontsReady: (state: CommonState, action: PayloadAction<boolean>) => {
			state.fontsReady = action.payload;
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
} = commonSlice.actions;

export default commonSlice.reducer;