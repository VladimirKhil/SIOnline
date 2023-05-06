import OnlineMode from '../../model/enums/OnlineMode';

export const enum UIActionTypes {
	NavigateToLogin = 'NAVIGATE_TO_LOGIN',
	ShowSettings = 'SHOW_SETTINGS',
	NavigateToHowToPlay = 'NAVIGATE_TO_HOW_TO_PLAY',
	NavigateBack = 'NAVIGATE_BACK',
	NavigateToWelcome = 'NAVIGATE_TO_WELCOME',
	NavigateToNewGame = 'NAVIGATE_TO_NEW_GAME',
	NavigateToGames = 'NAVIGATE_TO_GAMES',
	NavigateToLobby = 'NAVIGATE_TO_LOBBY',
	NavigateToError = 'NAVIGATE_TO_ERROR',
	NavigateToGame = 'NAVIGATE_TO_GAME',
	CloseGameInfo = 'CLOSE_GAME_INFO',
	WindowSizeChanged = 'WINDOW_SIZE_CHANGED',
	OnlineModeChanged = 'ONLINE_MODE_CHANGED',
	IsSettingGameButtonKeyChanged = 'IS_SETTING_GAME_BUTTON_KEY_CHANGED',
}

export type NavigateToLoginAction = { type: UIActionTypes.NavigateToLogin };
export type ShowSettingsAction = { type: UIActionTypes.ShowSettings, show: boolean };
export type NavigateToHowToPlayAction = { type: UIActionTypes.NavigateToHowToPlay };
export type NavigateBackAction = { type: UIActionTypes.NavigateBack };
export type NavigateToWelcomeAction = { type: UIActionTypes.NavigateToWelcome };
export type NavigateToNewGameAction = { type: UIActionTypes.NavigateToNewGame };
export type NavigateToGamesAction = { type: UIActionTypes.NavigateToGames };
export type NavigateToLobbyAction = { type: UIActionTypes.NavigateToLobby };
export type NavigateToErrorAction = { type: UIActionTypes.NavigateToError };
export type NavigateToGameAction = { type: UIActionTypes.NavigateToGame };
export type OnlineModeChangedAction = { type: UIActionTypes.OnlineModeChanged, mode: OnlineMode };
export type CloseGameInfoAction = { type: UIActionTypes.CloseGameInfo };
export type WindowSizeChangedAction = { type: UIActionTypes.WindowSizeChanged, width: number, height: number };
export type IsSettingGameButtonKeyChangedAction = { type: UIActionTypes.IsSettingGameButtonKeyChanged, isSettingGameButtonKey: boolean };

export type KnownUIAction =
	NavigateToLoginAction
	| ShowSettingsAction
	| NavigateToHowToPlayAction
	| NavigateBackAction
	| NavigateToWelcomeAction
	| NavigateToNewGameAction
	| NavigateToGamesAction
	| NavigateToLobbyAction
	| NavigateToErrorAction
	| NavigateToGameAction
	| OnlineModeChangedAction
	| CloseGameInfoAction
	| WindowSizeChangedAction
	| IsSettingGameButtonKeyChangedAction;