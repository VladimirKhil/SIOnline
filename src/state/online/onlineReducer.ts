import { AnyAction, Reducer } from 'redux';
import OnlineState, { initialState } from './OnlineState';
import { KnownOnlineAction, OnlineActionTypes } from './OnlineActions';

const onlineReducer: Reducer<OnlineState> = (state: OnlineState = initialState, anyAction: AnyAction): OnlineState => {
	const action = anyAction as KnownOnlineAction;

	switch (action.type) {

		case OnlineActionTypes.PasswordChanged: {
			return {
				...state,
				password: action.newPassword
			};
		}

		case OnlineActionTypes.NewGame: {
			return {
				...state,
				newGameShown: true,
				gameCreationProgress: false,
			};
		}

		case OnlineActionTypes.NewGameCancel: {
			return {
				...state,
				newGameShown: false,
				gameCreationProgress: false
			};
		}

		case OnlineActionTypes.GameCreationStart: {
			return {
				...state,
				gameCreationProgress: true,
			};
		}

		case OnlineActionTypes.GameCreationEnd: {
			return {
				...state,
				gameCreationProgress: false,
			};
		}

		case OnlineActionTypes.JoinGameStarted: {
			return {
				...state,
				joinGameProgress: true,
			};
		}

		case OnlineActionTypes.JoinGameFinished: {
			return {
				...state,
				joinGameProgress: false,
			};
		}

		default:
			return state;
	}
};

export default onlineReducer;