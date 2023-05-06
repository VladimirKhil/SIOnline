import { AnyAction, Reducer } from 'redux';
import UIState, { initialState } from './UIState';
import { KnownUIAction, UIActionTypes } from './UIActions';
import MainView from '../../model/enums/MainView';
import OnlineMode from '../../model/enums/OnlineMode';

const uiReducer: Reducer<UIState> = (state: UIState = initialState, anyAction: AnyAction): UIState => {
	const action = anyAction as KnownUIAction;

	switch (action.type) {
		case UIActionTypes.NavigateToLogin:
			return {
				...state,
				mainView: MainView.Login,
				previousMainView: state.mainView
			};

		case UIActionTypes.ShowSettings:
			return {
				...state,
				areSettingsVisible: action.show,
				isSettingGameButtonKey: state.isSettingGameButtonKey && action.show
			};

		case UIActionTypes.NavigateToHowToPlay:
			return {
				...state,
				mainView: MainView.About,
				previousMainView: state.mainView
			};

		case UIActionTypes.NavigateBack:
			return {
				...state,
				mainView: state.previousMainView
			};

		case UIActionTypes.NavigateToWelcome:
			return {
				...state,
				mainView: MainView.Welcome,
				previousMainView: state.mainView
			};

		case UIActionTypes.NavigateToNewGame:
			return {
				...state,
				mainView: MainView.NewGame,
				previousMainView: state.mainView
			};

		case UIActionTypes.NavigateToGames:
			return {
				...state,
				mainView: MainView.Games,
				previousMainView: state.mainView
			};

		case UIActionTypes.NavigateToLobby:
			return {
				...state,
				mainView: MainView.Lobby,
				previousMainView: state.mainView
			};

		case UIActionTypes.NavigateToError:
			return {
				...state,
				mainView: MainView.Error,
				previousMainView: state.mainView
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

		default:
			return state;
	}
};

export default uiReducer;
