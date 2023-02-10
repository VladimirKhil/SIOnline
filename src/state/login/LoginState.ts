export default interface LoginState {
	inProgress: boolean;
	errorMessage: string | null;
}

export const initialState: LoginState = {
	inProgress: false,
	errorMessage: null,
};
