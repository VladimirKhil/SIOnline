export default interface UserState {
	login: string;
	avatar: string | null;
}

export const initialState: UserState = {
	login: '',
	avatar: null,
};
