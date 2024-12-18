export default interface OnlineState {
	password: string;
	newGameShown: boolean;
	gameCreationProgress: boolean;
	joinGameProgress: boolean;
}

export const initialState: OnlineState = {
	password: '',
	newGameShown: false,
	gameCreationProgress: false,
	joinGameProgress: false,
};