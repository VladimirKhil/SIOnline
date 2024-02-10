import { ActionCreator } from 'redux';
import * as UIActions from './UIActions';
import OnlineMode from '../../model/enums/OnlineMode';

const navigateToLogin: ActionCreator<UIActions.NavigateToLoginAction> = () => ({
	type: UIActions.UIActionTypes.NavigateToLogin
});

const showSettings: ActionCreator<UIActions.ShowSettingsAction> = (show: boolean) => ({
	type: UIActions.UIActionTypes.ShowSettings,
	show
});

const navigateToHowToPlay: ActionCreator<UIActions.NavigateToHowToPlayAction> = () => ({
	type: UIActions.UIActionTypes.NavigateToHowToPlay
});

const navigateBack: ActionCreator<UIActions.NavigateBackAction> = () => ({
	type: UIActions.UIActionTypes.NavigateBack
});

const navigateToWelcome: ActionCreator<UIActions.NavigateToWelcomeAction> = () => ({
	type: UIActions.UIActionTypes.NavigateToWelcome
});

const friendsPlayInternal: ActionCreator<UIActions.NavigateToGamesAction> = () => ({
	type: UIActions.UIActionTypes.NavigateToGames
});

const isSettingGameButtonKeyChanged: ActionCreator<UIActions.IsSettingGameButtonKeyChangedAction> = (isSettingGameButtonKey: boolean) => ({
	type: UIActions.UIActionTypes.IsSettingGameButtonKeyChanged, isSettingGameButtonKey
});

const singlePlay: ActionCreator<UIActions.NavigateToNewGameAction> = () => ({
	type: UIActions.UIActionTypes.NavigateToNewGame
});

const navigateToLobbyInternal: ActionCreator<UIActions.NavigateToLobbyAction> = () => ({
	type: UIActions.UIActionTypes.NavigateToLobby
});

const onOnlineModeChanged: ActionCreator<UIActions.OnlineModeChangedAction> = (mode: OnlineMode) => ({
	type: UIActions.UIActionTypes.OnlineModeChanged,
	mode
});

const closeGameInfo: ActionCreator<UIActions.CloseGameInfoAction> = () => ({
	type: UIActions.UIActionTypes.CloseGameInfo
});

const navigateToError: ActionCreator<UIActions.NavigateToErrorAction> = () => ({
	type: UIActions.UIActionTypes.NavigateToError
});

const navigateToGame: ActionCreator<UIActions.NavigateToGameAction> = () => ({
	type: UIActions.UIActionTypes.NavigateToGame
});

const windowSizeChanged: ActionCreator<UIActions.WindowSizeChangedAction> = (width: number, height: number) => ({
	type: UIActions.UIActionTypes.WindowSizeChanged,
	width,
	height
});

const visibilityChanged: ActionCreator<UIActions.VisibilityChangedAction> = (isVisible: boolean) => ({
	type: UIActions.UIActionTypes.VisibilityChanged, isVisible
});

const uiActionCreators = {
	navigateToLogin,
	showSettings,
	navigateToHowToPlay,
	navigateBack,
	navigateToWelcome,
	singlePlay,
	onOnlineModeChanged,
	closeGameInfo,
	windowSizeChanged,
	isSettingGameButtonKeyChanged,
	navigateToError,
	navigateToGame,
	navigateToLobbyInternal,
	friendsPlayInternal,
	visibilityChanged,
};

export default uiActionCreators;