import { createSlice } from '@reduxjs/toolkit';

export interface LoginState {
	inProgress: boolean;
}

const initialState: LoginState = {
	inProgress: false,
};

export const loginSlice = createSlice({
	name: 'login',
	initialState,
	reducers: {
		startLogin: (state: LoginState) => {
			state.inProgress = true;
		},
		endLogin: (state: LoginState) => {
			state.inProgress = false;
		}
	}
});

export const {
	startLogin,
	endLogin,
} = loginSlice.actions;

export default loginSlice.reducer;