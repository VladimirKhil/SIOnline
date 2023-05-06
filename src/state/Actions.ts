import OnlineMode from '../model/enums/OnlineMode';
import GamesFilter from '../model/enums/GamesFilter';
import ChatMode from '../model/enums/ChatMode';
import GameType from '../client/contracts/GameType';
import Role from '../client/contracts/Role';
import GameInfo from '../client/contracts/GameInfo';
import PackageType from '../model/enums/PackageType';

export const enum ActionTypes {
	ClearGames = 'CLEAR_GAMES',
	ReceiveGames = 'RECEIVE_GAMES',
	ReceiveUsers = 'RECEIVE_USERS',
	ReceiveMessage = 'RECEIVE_MESSAGE',
	OnlineLoadFinished = 'ONLINE_LOAD_FINISHED',
	OnlineLoadError = 'ONLINE_LOAD_ERROR',
	GamesFilterToggle = 'GAMES_FILTER_TOGGLE',
	GamesSearchChanged = 'GAMES_SEARCH_CHANGED',
	SelectGame = 'SELECT_GAME',
	NewAutoGame = 'NEW_AUTO_GAME',
	NewGame = 'NEW_GAME',
	NewGameCancel = 'NEW_GAME_CANCEL',
	PasswordChanged = 'PASSWORD_CHANGED',
	ChatModeChanged = 'CHAT_MODE_CHANGED',
	GameCreated = 'GAME_CREATED',
	GameChanged = 'GAME_CHANGED',
	GameDeleted = 'GAME_DELETED',
	UserJoined = 'USER_JOINED',
	UserLeaved = 'USER_LEAVED',
	MessageChanged = 'MESSAGE_CHANGED',
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
	GameCreationStart = 'GAME_CREATION_START',
	GameCreationEnd = 'GAME_CREATION_END',
	GameSet = 'GAME_SET',
	JoinGameStarted = 'JOIN_GAME_STARTED',
	JoinGameFinished = 'JOIN_GAME_FINISHED',
	UploadPackageStarted = 'UPLOAD_PACKAGE_STARTED',
	UploadPackageFinished = 'UPLOAD_PACKAGE_FINISHED',
	UploadPackageProgress = 'UPLOAD_PACKAGE_PROGRESS',
	UnselectGame = 'UNSELECT_GAME',
	DropSelectedGame = 'DROP_SELECTED_GAME',
	ResetLobby = 'RESET_LOBBY',
}
export type ClearGamesAction = { type: ActionTypes.ClearGames };
export type ReceiveGamesAction = { type: ActionTypes.ReceiveGames, games: GameInfo[] };
export type ReceiveUsersAction = { type: ActionTypes.ReceiveUsers, users: string[] };
export type ReceiveMessageAction = { type: ActionTypes.ReceiveMessage, sender: string, message: string };
export type OnlineLoadFinishedAction = { type: ActionTypes.OnlineLoadFinished };
export type OnlineLoadErrorAction = { type: ActionTypes.OnlineLoadError, error: string };
export type GamesFilterToggleAction = { type: ActionTypes.GamesFilterToggle, filter: GamesFilter };
export type GamesSearchChangedAction = { type: ActionTypes.GamesSearchChanged, search: string };
export type SelectGameAction = { type: ActionTypes.SelectGame, gameId: number };
export type NewAutoGameAction = { type: ActionTypes.NewAutoGame };
export type NewGameAction = { type: ActionTypes.NewGame };
export type NewGameCancelAction = { type: ActionTypes.NewGameCancel };
export type PasswordChangedAction = { type: ActionTypes.PasswordChanged, newPassword: string };
export type ChatModeChangedAction = { type: ActionTypes.ChatModeChanged, chatMode: ChatMode };
export type GameCreatedAction = { type: ActionTypes.GameCreated, game: GameInfo };
export type GameChangedAction = { type: ActionTypes.GameChanged, game: GameInfo };
export type GameDeletedAction = { type: ActionTypes.GameDeleted, gameId: number };
export type UserJoinedAction = { type: ActionTypes.UserJoined, login: string };
export type UserLeavedAction = { type: ActionTypes.UserLeaved, login: string };
export type MessageChangedAction = { type: ActionTypes.MessageChanged, message: string };
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
export type GameCreationStartAction = { type: ActionTypes.GameCreationStart };
export type GameCreationEndAction = { type: ActionTypes.GameCreationEnd, error: string | null };
export type GameSetAction = { type: ActionTypes.GameSet, id: number, isAutomatic: boolean };
export type JoinGameStartedAction = { type: ActionTypes.JoinGameStarted };
export type JoinGameFinishedAction = { type: ActionTypes.JoinGameFinished, error: string | null };
export type UploadPackageStartedAction = { type: ActionTypes.UploadPackageStarted };
export type UploadPackageFinishedAction = { type: ActionTypes.UploadPackageFinished };
export type UploadPackageProgressAction = { type: ActionTypes.UploadPackageProgress, progress: number };
export type UnselectGameAction = { type: ActionTypes.UnselectGame };
export type DropSelectedGameAction = { type: ActionTypes.DropSelectedGame };
export type ResetLobbyAction = { type: ActionTypes.ResetLobby };

export type KnownAction =
	ClearGamesAction
	| ReceiveGamesAction
	| ReceiveUsersAction
	| ReceiveMessageAction
	| OnlineLoadFinishedAction
	| OnlineLoadErrorAction
	| GamesFilterToggleAction
	| GamesSearchChangedAction
	| SelectGameAction
	| NewAutoGameAction
	| NewGameAction
	| NewGameCancelAction
	| PasswordChangedAction
	| ChatModeChangedAction
	| GameCreatedAction
	| GameChangedAction
	| GameDeletedAction
	| UserJoinedAction
	| UserLeavedAction
	| MessageChangedAction
	| GameNameChangedAction
	| GamePasswordChangedAction
	| GamePackageTypeChangedAction
	| GamePackageDataChangedAction
	| GameTypeChangedAction
	| GameRoleChangedAction
	| ShowmanTypeChangedAction
	| PlayersCountChangedAction
	| HumanPlayersCountChangedAction
	| GameCreationStartAction
	| GameCreationEndAction
	| GameSetAction
	| JoinGameStartedAction
	| JoinGameFinishedAction
	| UploadPackageStartedAction
	| UploadPackageFinishedAction
	| UploadPackageProgressAction
	| UnselectGameAction
	| GamePackageLibraryChangedAction
	| UnselectGameAction
	| ResetLobbyAction;
