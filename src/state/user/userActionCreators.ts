import { ActionCreator } from 'redux';
import * as UserActions from './UserActions';

const onLoginChanged: ActionCreator<UserActions.LoginChangedAction> = (newLogin: string) => ({
	type: UserActions.UserActionTypes.LoginChanged,
	newLogin,
});

const avatarChanged: ActionCreator<UserActions.AvatarChangedAction> = (avatar: string) => ({
	type: UserActions.UserActionTypes.AvatarChanged,
	avatar,
});

const userActionCreators = {
	onLoginChanged,
	avatarChanged,
};

export default userActionCreators;