import GameType from '../../model/GameType';
import Role from '../../model/Role';
import PackageType from '../../model/enums/PackageType';

export const enum GameActionTypes {
	GameNameChanged = 'GAME_NAME_CHANGED',
	GamePasswordChanged = 'GAME_PASSWORD_CHANGED',
	GameVoiceChatChanged = 'GAME_VOICE_CHAT_CHANGED',
	GamePackageTypeChanged = 'GAME_PACKAGE_TYPE_CHANGED',
	GamePackageDataChanged = 'GAME_PACKAGE_DATA_CHANGED',
	GamePackageLibraryChanged = 'GAME_PACKAGE_LIBRARY_CHANGED',
	GameTypeChanged = 'GAME_TYPE_CHANGED',
	GameRoleChanged = 'GAME_ROLE_CHANGED',
	ShowmanTypeChanged = 'SHOWMAN_TYPE_CHANGED',
	PlayersCountChanged = 'PLAYERS_COUNT_CHANGED',
	HumanPlayersCountChanged = 'HUMAN_PLAYERS_COUNT_CHANGED',
	GameSet = 'GAME_SET',
	NewGame2 = 'NEW_GAME2',
}

export type GameNameChangedAction = { type: GameActionTypes.GameNameChanged, gameName: string };
export type GamePasswordChangedAction = { type: GameActionTypes.GamePasswordChanged, gamePassword: string };
export type GameVoiceChatChangedAction = { type: GameActionTypes.GameVoiceChatChanged, gameVoiceChat: string };
export type GamePackageTypeChangedAction = { type: GameActionTypes.GamePackageTypeChanged, packageType: PackageType };
export type GamePackageLibraryChangedAction = { type: GameActionTypes.GamePackageLibraryChanged, id: string, name: string, uri: string };
export type GamePackageDataChangedAction = { type: GameActionTypes.GamePackageDataChanged, packageName: string, packageData: File | null };
export type GameTypeChangedAction = { type: GameActionTypes.GameTypeChanged, gameType: GameType };
export type GameRoleChangedAction = { type: GameActionTypes.GameRoleChanged, gameRole: Role };
export type ShowmanTypeChangedAction = { type: GameActionTypes.ShowmanTypeChanged, isHuman: boolean };
export type PlayersCountChangedAction = { type: GameActionTypes.PlayersCountChanged, playersCount: number };
export type HumanPlayersCountChangedAction = { type: GameActionTypes.HumanPlayersCountChanged, humanPlayersCount: number };
export type GameSetAction = { type: GameActionTypes.GameSet, id: number, isAutomatic: boolean };
export type NewGame2Action = { type: GameActionTypes.NewGame2, userName: string };

export type KnownGameAction =
	| GameNameChangedAction
	| GamePasswordChangedAction
	| GameVoiceChatChangedAction
	| GamePackageTypeChangedAction
	| GamePackageDataChangedAction
	| GameTypeChangedAction
	| GameRoleChangedAction
	| ShowmanTypeChangedAction
	| PlayersCountChangedAction
	| HumanPlayersCountChangedAction
	| GameSetAction
	| GamePackageLibraryChangedAction
	| NewGame2Action;
