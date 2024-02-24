export const enum CommonActionTypes {
	IsConnectedChanged = 'IS_CONNECTED_CHANGED',
	ComputerAccountsChanged = 'COMPUTER_ACCOUNTS_CHANGED',
	ServerInfoChanged = 'SERVER_INFO_CHANGED',
	CommonErrorChanged = 'COMMON_ERROR_CHANGED',
	AvatarLoadStart = 'AVATAR_LOAD_START',
	AvatarLoadEnd = 'AVATAR_LOAD_END',
	AvatarLoadError = 'AVATAR_LOAD_ERROR',
	AudioChanged = 'AUDIO_CHANGED',
}

export type IsConnectedChangedAction = { type: CommonActionTypes.IsConnectedChanged, isConnected: boolean };
export type ComputerAccountsChangedAction = { type: CommonActionTypes.ComputerAccountsChanged, computerAccounts: string[] };
export type CommonErrorChangedAction = { type: CommonActionTypes.CommonErrorChanged, error: string };
export type AvatarLoadStartAction = { type: CommonActionTypes.AvatarLoadStart };
export type AvatarLoadEndAction = { type: CommonActionTypes.AvatarLoadEnd };
export type AvatarLoadErrorAction = { type: CommonActionTypes.AvatarLoadError, error: string | null };
export type AudioChangedAction = { type: CommonActionTypes.AudioChanged, audio: string | null, loop: boolean };

export type ServerInfoChangedAction = {
	type: CommonActionTypes.ServerInfoChanged,
	serverName: string,
	serverLicense: string,
	maxPackageSizeMb: number,
};

export type KnownCommonAction =
	ComputerAccountsChangedAction
	| IsConnectedChangedAction
	| ServerInfoChangedAction
	| CommonErrorChangedAction
	| AvatarLoadStartAction
	| AvatarLoadEndAction
	| AvatarLoadErrorAction
	| AudioChangedAction;