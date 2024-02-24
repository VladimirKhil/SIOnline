import { AnyAction, Reducer } from 'redux';
import CommonState, { initialState } from './CommonState';
import { KnownCommonAction, CommonActionTypes } from './CommonActions';

const commonReducer: Reducer<CommonState> = (state: CommonState = initialState, anyAction: AnyAction): CommonState => {
	const action = anyAction as KnownCommonAction;

	switch (action.type) {
		case CommonActionTypes.IsConnectedChanged:
			return {
				...state,
				isConnected: action.isConnected
			};

		case CommonActionTypes.ComputerAccountsChanged:
			return {
				...state,
				computerAccounts: action.computerAccounts
			};

		case CommonActionTypes.ServerInfoChanged:
			return {
				...state,
				serverName: action.serverName,
				serverLicense: action.serverLicense,
				maxPackageSizeMb: action.maxPackageSizeMb,
			};

		case CommonActionTypes.CommonErrorChanged:
			return {
				...state,
				error: action.error,
			};

		case CommonActionTypes.AvatarLoadStart:
			return {
				...state,
				avatarLoadProgress: true
			};

		case CommonActionTypes.AvatarLoadEnd:
			return {
				...state,
				avatarLoadError: null,
				avatarLoadProgress: false
			};

		case CommonActionTypes.AvatarLoadError:
			return {
				...state,
				avatarLoadError: action.error,
				avatarLoadProgress: false
			};

		case CommonActionTypes.AudioChanged:
			return {
				...state,
				audio: action.audio,
				audioLoop: action.loop,
			};

		default:
			return state;
	}
};

export default commonReducer;