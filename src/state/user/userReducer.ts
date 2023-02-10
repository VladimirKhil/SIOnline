import { AnyAction, Reducer } from 'redux';
import { KnownUserAction, UserActionTypes } from './UserActions';
import UserState, { initialState } from './UserState';

const userReducer: Reducer<UserState> = (state: UserState = initialState, anyAction: AnyAction): UserState => {
	const action = anyAction as KnownUserAction;

	switch (action.type) {
		case UserActionTypes.LoginChanged:
			return {
				...state,
				login: action.newLogin,
			};

		case UserActionTypes.AvatarChanged:
			return {
				...state,
				avatar: action.avatar
			};

		default:
			return state;
	}
};

export default userReducer;
