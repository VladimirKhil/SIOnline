import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import GameSound from '../../model/enums/GameSound';
import { gameSoundPlayer } from '../../utils/GameSoundPlayer';

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
	askForConsent: boolean;
	emojiCultures?: string[];
	clearUrls?: boolean;
	avatarLoadProgress: boolean;
	avatarLoadError: string | null;
	audio: string | null;
	audioLoop: boolean;
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
	askForConsent: true,
	avatarLoadProgress: false,
	avatarLoadError: null,
	audio: null,
	audioLoop: false,
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
		userErrorChangedInternal: (state: CommonState, action: PayloadAction<string | null>) => {
			state.userError = action.payload;
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
			state.audio = null; // Force audio to be updated. Is there a better way?
			state.audio = gameSoundPlayer.getSound(action.payload.audio) ?? null;
			state.audioLoop = action.payload.loop;
		},
		stopAudio: (state: CommonState) => {
			state.audio = null;
			state.audioLoop = false;
		},
	}
});

export const userErrorChanged = createAsyncThunk(
	'common/userErrorChanged',
	async (error: string, thunkAPI) => {
		thunkAPI.dispatch(commonSlice.actions.userErrorChangedInternal(error));

		window.setTimeout(
			() => thunkAPI.dispatch(commonSlice.actions.userErrorChangedInternal(null)),
			3000
		);
	},
);

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
} = commonSlice.actions;

export default commonSlice.reducer;