import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
	login: string;
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
		changeAvatar: (state: UserState, action: PayloadAction<string>) => {
			state.avatar = action.payload;
		},
	}
});

export const {
	changeLogin,
	changeAvatar,
} = userSlice.actions;

export default userSlice.reducer;