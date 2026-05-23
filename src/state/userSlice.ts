import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
	login: string;
	/** Authorized name. */
	authName?: string;
	avatar: string | null;
}

const initialState: UserState = {
	login: '',
	avatar: null,
};

export const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		changeLogin: (state: UserState, action: PayloadAction<string>) => {
			state.login = action.payload;
		},
		changeAuthName: (state: UserState, action: PayloadAction<string>) => {
			state.authName = action.payload;
		},
		changeAvatar: (state: UserState, action: PayloadAction<string>) => {
			state.avatar = action.payload;
		},
	}
});

export const {
	changeLogin,
	changeAuthName,
	changeAvatar,
} = userSlice.actions;

export default userSlice.reducer;