import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LoginState {
	inProgress: boolean;
	errorMessage: string | null;
}

const initialState: LoginState = {
	inProgress: false,
	errorMessage: null,
};

export const loginSlice = createSlice({
	name: 'login',
	initialState,
	reducers: {
		startLogin: (state: LoginState) => {
			state.inProgress = true;
			state.errorMessage = '';
		},
		endLogin: (state: LoginState, action: PayloadAction<string | null>) => {
			state.inProgress = false;
			state.errorMessage = action.payload;
		}
	}
});

export const {
	startLogin,
	endLogin
} = loginSlice.actions;

export default loginSlice.reducer;