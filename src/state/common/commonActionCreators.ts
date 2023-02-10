import { Action, ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import DataContext from '../../model/DataContext';
import State from '../State';
import * as CommonActions from './CommonActions';

const isConnectedChanged: ActionCreator<CommonActions.IsConnectedChangedAction> = (isConnected: boolean) => ({
	type: CommonActions.CommonActionTypes.IsConnectedChanged,
	isConnected
});

const computerAccountsChanged: ActionCreator<CommonActions.ComputerAccountsChangedAction> = (computerAccounts: string[]) => ({
	type: CommonActions.CommonActionTypes.ComputerAccountsChanged,
	computerAccounts
});

const onConnectionClosed: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(message: string) => async (dispatch: Dispatch<any>) => {
		dispatch(isConnectedChanged(false));

		alert(message);
		window.location.reload();
	};

const serverInfoChanged: ActionCreator<CommonActions.ServerInfoChangedAction> = (
	serverName: string,
	serverLicense: string,
	maxPackageSizeMb: number) => ({
	type: CommonActions.CommonActionTypes.ServerInfoChanged,
	serverName,
	serverLicense,
	maxPackageSizeMb,
});

const commonErrorChanged: ActionCreator<CommonActions.CommonErrorChangedAction> = (error: string) => ({
	type: CommonActions.CommonActionTypes.CommonErrorChanged, error
});

const avatarLoadStart: ActionCreator<CommonActions.AvatarLoadStartAction> = () => ({
	type: CommonActions.CommonActionTypes.AvatarLoadStart
});

const avatarLoadEnd: ActionCreator<CommonActions.AvatarLoadEndAction> = () => ({
	type: CommonActions.CommonActionTypes.AvatarLoadEnd
});

const avatarLoadError: ActionCreator<CommonActions.AvatarLoadErrorAction> = (error: string | null) => ({
	type: CommonActions.CommonActionTypes.AvatarLoadError,
	error
});

const commonActionCreators = {
	isConnectedChanged,
	computerAccountsChanged,
	onConnectionClosed,
	serverInfoChanged,
	commonErrorChanged,
	avatarLoadStart,
	avatarLoadEnd,
	avatarLoadError,
};

export default commonActionCreators;