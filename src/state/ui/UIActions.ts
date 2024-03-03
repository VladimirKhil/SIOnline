import OnlineMode from '../../model/enums/OnlineMode';

export const enum UIActionTypes {
	ShowSettings = 'SHOW_SETTINGS',
	CloseGameInfo = 'CLOSE_GAME_INFO',
	WindowSizeChanged = 'WINDOW_SIZE_CHANGED',
	OnlineModeChanged = 'ONLINE_MODE_CHANGED',
	IsSettingGameButtonKeyChanged = 'IS_SETTING_GAME_BUTTON_KEY_CHANGED',
	VisibilityChanged = 'VISIBILITY_CHANGED',
}

export type ShowSettingsAction = { type: UIActionTypes.ShowSettings, show: boolean };
export type OnlineModeChangedAction = { type: UIActionTypes.OnlineModeChanged, mode: OnlineMode };
export type CloseGameInfoAction = { type: UIActionTypes.CloseGameInfo };
export type WindowSizeChangedAction = { type: UIActionTypes.WindowSizeChanged, width: number, height: number };
export type IsSettingGameButtonKeyChangedAction = { type: UIActionTypes.IsSettingGameButtonKeyChanged, isSettingGameButtonKey: boolean };
export type VisibilityChangedAction = { type: UIActionTypes.VisibilityChanged, isVisible: boolean };

export type KnownUIAction =
	ShowSettingsAction
	| OnlineModeChangedAction
	| CloseGameInfoAction
	| WindowSizeChangedAction
	| IsSettingGameButtonKeyChangedAction
	| VisibilityChangedAction;