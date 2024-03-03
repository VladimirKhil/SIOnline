import { ActionCreator } from 'redux';
import * as UIActions from './UIActions';
import OnlineMode from '../../model/enums/OnlineMode';

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

const uiActionCreators = {
	showSettings,
	onOnlineModeChanged,
	closeGameInfo,
	windowSizeChanged,
	isSettingGameButtonKeyChanged,
	visibilityChanged,
};

export default uiActionCreators;