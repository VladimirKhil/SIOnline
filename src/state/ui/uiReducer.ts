import { AnyAction, Reducer } from 'redux';
import UIState, { initialState } from './UIState';
import { KnownUIAction, UIActionTypes } from './UIActions';
import OnlineMode from '../../model/enums/OnlineMode';

const uiReducer: Reducer<UIState> = (state: UIState = initialState, anyAction: AnyAction): UIState => {
	const action = anyAction as KnownUIAction;

	switch (action.type) {
		case UIActionTypes.ShowSettings:
			return {
				...state,
				areSettingsVisible: action.show,
				isSettingGameButtonKey: state.isSettingGameButtonKey && action.show
			};

		case UIActionTypes.CloseGameInfo:
			return {
				...state,
				onlineView: OnlineMode.Games
			};

		case UIActionTypes.OnlineModeChanged: {
			return {
				...state,
				onlineView: action.mode
			};
		}

		case UIActionTypes.WindowSizeChanged: {
			return {
				...state,
				windowWidth: action.width,
				windowHeight: action.height
			};
		}

		case UIActionTypes.IsSettingGameButtonKeyChanged:
			return {
				...state,
				isSettingGameButtonKey: action.isSettingGameButtonKey
			};

		case UIActionTypes.VisibilityChanged: {
			return {
				...state,
				isVisible: action.isVisible,
			};
		}

		case UIActionTypes.Navigate: {
			return {
				...state,
				navigation: action.navigation,
			};
		}

		case UIActionTypes.PlayersVisibilityChanged: {
			return {
				...state,
				showPlayers: action.isVisible,
			};
		}

		default:
			return state;
	}
};

export default uiReducer;
