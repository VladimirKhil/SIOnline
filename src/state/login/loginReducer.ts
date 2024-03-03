import { AnyAction, Reducer } from 'redux';
import LoginState, { initialState } from './LoginState';
import { KnownLoginAction, LoginActionTypes } from './LoginActions';

const loginReducer: Reducer<LoginState> = (state: LoginState = initialState, anyAction: AnyAction): LoginState => {
	const action = anyAction as KnownLoginAction;

	switch (action.type) {
		case LoginActionTypes.LoginStart:
			return {
				...state,
				inProgress: true,
				errorMessage: ''
			};

		case LoginActionTypes.LoginEnd:
			return {
				...state,
				inProgress: false,
				errorMessage: action.error,
				completed: !action.error,
			};

		case LoginActionTypes.LogOut:
			return {
				...state,
				completed: false,
			};

		default:
			return state;
	}
};

export default loginReducer;