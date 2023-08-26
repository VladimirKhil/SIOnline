import GameType from '../client/contracts/GameType';
import Role from '../client/contracts/Role';
import PackageType from '../model/enums/PackageType';

export const enum ActionTypes {
	GameNameChanged = 'GAME_NAME_CHANGED',
	GamePasswordChanged = 'GAME_PASSWORD_CHANGED',
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

export type GameNameChangedAction = { type: ActionTypes.GameNameChanged, gameName: string };
export type GamePasswordChangedAction = { type: ActionTypes.GamePasswordChanged, gamePassword: string };
export type GamePackageTypeChangedAction = { type: ActionTypes.GamePackageTypeChanged, packageType: PackageType };
export type GamePackageLibraryChangedAction = { type: ActionTypes.GamePackageLibraryChanged, name: string, id: string };
export type GamePackageDataChangedAction = { type: ActionTypes.GamePackageDataChanged, packageName: string, packageData: File | null };
export type GameTypeChangedAction = { type: ActionTypes.GameTypeChanged, gameType: GameType };
export type GameRoleChangedAction = { type: ActionTypes.GameRoleChanged, gameRole: Role };
export type ShowmanTypeChangedAction = { type: ActionTypes.ShowmanTypeChanged, isHuman: boolean };
export type PlayersCountChangedAction = { type: ActionTypes.PlayersCountChanged, playersCount: number };
export type HumanPlayersCountChangedAction = { type: ActionTypes.HumanPlayersCountChanged, humanPlayersCount: number };
export type GameSetAction = { type: ActionTypes.GameSet, id: number, isAutomatic: boolean };
export type NewGame2Action = { type: ActionTypes.NewGame2 };

export type KnownAction =
	| GameNameChangedAction
	| GamePasswordChangedAction
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
