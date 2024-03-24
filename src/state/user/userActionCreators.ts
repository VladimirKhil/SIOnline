import { Action, ActionCreator, Dispatch } from 'redux';
import * as UserActions from './UserActions';
import State from '../State';
import DataContext from '../../model/DataContext';
import { ThunkAction } from 'redux-thunk';
import uiActionCreators from '../ui/uiActionCreators';
import Path from '../../model/enums/Path';

const onLoginChanged: ActionCreator<UserActions.LoginChangedAction> = (newLogin: string) => ({
	type: UserActions.UserActionTypes.LoginChanged,
	newLogin,
});

const avatarChanged: ActionCreator<UserActions.AvatarChangedAction> = (avatar: string) => ({
	type: UserActions.UserActionTypes.AvatarChanged,
	avatar,
});

const acceptLicense: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		dataContext.state.acceptLicense();
		dispatch(uiActionCreators.navigate(getState().ui.navigation.callbackState ?? { path: Path.Root }) as unknown as Action);
	};

const userActionCreators = {
	onLoginChanged,
	avatarChanged,
	acceptLicense,
};

export default userActionCreators;