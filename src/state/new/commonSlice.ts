import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CommonState {
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
		serverNameChanged: (state: CommonState, action: PayloadAction<string>) => {
			state.serverName = action.payload;
		},
		computerAccountsChanged: (state: CommonState, action: PayloadAction<string[]>) => {
			state.computerAccounts = action.payload;
		}
	}
});

export const {
	serverNameChanged,
	computerAccountsChanged
} = commonSlice.actions;

export default commonSlice.reducer;