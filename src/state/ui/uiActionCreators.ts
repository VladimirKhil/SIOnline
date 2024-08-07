import { Action, ActionCreator, Dispatch } from 'redux';
import * as UIActions from './UIActions';
import OnlineMode from '../../model/enums/OnlineMode';
import { INavigationState } from './UIState';
import { ThunkAction } from 'redux-thunk';
import State from '../State';
import DataContext from '../../model/DataContext';
import Path from '../../model/enums/Path';
import onlineActionCreators from '../online/onlineActionCreators';

const showSettings: ActionCreator<UIActions.ShowSettingsAction> = (show: boolean) => ({
	type: UIActions.UIActionTypes.ShowSettings,
	show
});

const isSettingGameButtonKeyChanged: ActionCreator<UIActions.IsSettingGameButtonKeyChangedAction> = (isSettingGameButtonKey: boolean) => ({
	type: UIActions.UIActionTypes.IsSettingGameButtonKeyChanged, isSettingGameButtonKey
});

const onOnlineModeChanged: ActionCreator<UIActions.OnlineModeChangedAction> = (mode: OnlineMode) => ({
	type: UIActions.UIActionTypes.OnlineModeChanged,
	mode
});

const closeGameInfo: ActionCreator<UIActions.CloseGameInfoAction> = () => ({
	type: UIActions.UIActionTypes.CloseGameInfo
});

const windowSizeChanged: ActionCreator<UIActions.WindowSizeChangedAction> = (width: number, height: number) => ({
	type: UIActions.UIActionTypes.WindowSizeChanged,
	width,
	height
});

const visibilityChanged: ActionCreator<UIActions.VisibilityChangedAction> = (isVisible: boolean) => ({
	type: UIActions.UIActionTypes.VisibilityChanged, isVisible
});

const navigateCore: ActionCreator<UIActions.NavigateAction> = (navigation: INavigationState) => ({
	type: UIActions.UIActionTypes.Navigate, navigation
});

const handleNavigation = (navigation: INavigationState, dispatch: Dispatch<Action>, getState: () => State) => {
	let nav: INavigationState;

	if (navigation.path === Path.Room) {
		nav = { ...navigation, returnToLobby: getState().ui.navigation.path === Path.Lobby };
	} else if (navigation.path === Path.JoinRoom) {
		dispatch(onlineActionCreators.receiveGameStart());
		nav = navigation;
	} else {
		nav = navigation;
	}

	dispatch(navigateCore(nav));

	switch (nav.path) {
		case Path.Rooms:
			dispatch(onlineActionCreators.friendsPlay() as unknown as Action);
			break;

		case Path.JoinRoom:
			// No action required for now
			break;

		case Path.Lobby:
			dispatch(onlineActionCreators.navigateToLobby() as unknown as Action);
			break;

		default:
			break;
	}
};

const navigate: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(navigation: INavigationState) => async (dispatch: Dispatch<Action>, getState: () => State, dataContext: DataContext) => {
	if (window.history.length === 0 || !window.history.state || (window.history.state as INavigationState).path !== navigation.path) {
		if (navigation.path === Path.Room && navigation.gameId) {
			dataContext.state.saveNavigationState(
				navigation,
				dataContext.config.rewriteUrl
					? `${dataContext.config.rootUri}?gameId=${navigation.gameId}&host=${encodeURIComponent(navigation.hostUri ?? '')}`
					: null
			);
		} else {
			dataContext.state.saveNavigationState(navigation, dataContext.config.rewriteUrl ? dataContext.config.rootUri : null);
		}
	}

	handleNavigation(navigation, dispatch, getState);
};

const onNavigated: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(navigation: INavigationState) => async (dispatch: Dispatch<Action>, getState: () => State) => {
	handleNavigation(navigation, dispatch, getState);
};

const playersVisibilityChanged: ActionCreator<UIActions.PlayersVisibilityChangedAction> = (isVisible: boolean) => ({
	type: UIActions.UIActionTypes.PlayersVisibilityChanged, isVisible
});

const uiActionCreators = {
	showSettings,
	onOnlineModeChanged,
	closeGameInfo,
	windowSizeChanged,
	isSettingGameButtonKeyChanged,
	visibilityChanged,
	navigate,
	onNavigated,
	playersVisibilityChanged,
};

export default uiActionCreators;