export default interface LoginState {
	inProgress: boolean;
	errorMessage: string | null;
	completed: boolean;
}

export const initialState: LoginState = {
	inProgress: false,
	errorMessage: null,
	completed: false,
};
