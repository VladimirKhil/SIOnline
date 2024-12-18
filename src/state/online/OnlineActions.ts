export const enum OnlineActionTypes {
	PasswordChanged = 'PASSWORD_CHANGED',
	NewGame = 'NEW_GAME',
	NewGameCancel = 'NEW_GAME_CANCEL',
	GameCreationStart = 'GAME_CREATION_START',
	GameCreationEnd = 'GAME_CREATION_END',
	JoinGameStarted = 'JOIN_GAME_STARTED',
	JoinGameFinished = 'JOIN_GAME_FINISHED',
}

export type NewGameAction = { type: OnlineActionTypes.NewGame };
export type NewGameCancelAction = { type: OnlineActionTypes.NewGameCancel };
export type PasswordChangedAction = { type: OnlineActionTypes.PasswordChanged, newPassword: string };
export type GameCreationStartAction = { type: OnlineActionTypes.GameCreationStart };
export type GameCreationEndAction = { type: OnlineActionTypes.GameCreationEnd };
export type JoinGameStartedAction = { type: OnlineActionTypes.JoinGameStarted };
export type JoinGameFinishedAction = { type: OnlineActionTypes.JoinGameFinished };

export type KnownOnlineAction =
	NewGameAction
	| NewGameCancelAction
	| PasswordChangedAction
	| GameCreationStartAction
	| GameCreationEndAction
	| JoinGameStartedAction
	| JoinGameFinishedAction;