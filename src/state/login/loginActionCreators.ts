import { ActionCreator } from 'redux';
import * as LoginActions from './LoginActions';

const loginStart: ActionCreator<LoginActions.LoginStartAction> = () => ({
	type: LoginActions.LoginActionTypes.LoginStart
});

const loginEnd: ActionCreator<LoginActions.LoginEndAction> = (error: string | null = null) => ({
	type: LoginActions.LoginActionTypes.LoginEnd,
	error
});

const loginActionCreators = {
	loginStart,
	loginEnd,
};

export default loginActionCreators;