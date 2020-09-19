import OnlineMode from '../model/enums/OnlineMode';
import GamesFilter from '../model/enums/GamesFilter';
import ChatMode from '../model/enums/ChatMode';
import GameType from '../model/enums/GameType';
import Role from '../model/enums/Role';
import GameInfo from '../model/server/GameInfo';
import PackageType from '../model/enums/PackageType';

export const enum ActionTypes {
	IsConnectedChanged = 'IS_CONNECTED_CHANGED',
	ComputerAccountsChanged = 'COMPUTER_ACCOUNTS_CHANGED',
	NavigateToLogin = 'NAVIGATE_TO_LOGIN',
	ShowSettings = 'SHOW_SETTINGS',
	NavigateToHowToPlay = 'NAVIGATE_TO_HOW_TO_PLAY',
	NavigateBack = 'NAVIGATE_BACK',
	LoginChanged = 'LOGIN_CHANGED',
	LoginStart = 'LOGIN_START',
	LoginEnd = 'LOGIN_END',
	NavigateToGamesList = 'NAVIGATE_TO_GAMES_LIST',
	ClearGames = 'CLEAR_GAMES',
	ReceiveGames = 'RECEIVE_GAMES',
	ReceiveUsers = 'RECEIVE_USERS',
	ReceiveMessage = 'RECEIVE_MESSAGE',
	OnlineLoadFinished = 'ONLINE_LOAD_FINISHED',
	OnlineLoadError = 'ONLINE_LOAD_ERROR',
	OnlineModeChanged = 'ONLINE_MODE_CHANGED',
	GamesFilterToggle = 'GAMES_FILTER_TOGGLE',
	GamesSearchChanged = 'GAMES_SEARCH_CHANGED',
	SelectGame = 'SELECT_GAME',
	CloseGameInfo = 'CLOSE_GAME_INFO',
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
	WindowWidthChanged = 'WINDOW_WIDTH_CHANGED',
	GameNameChanged = 'GAME_NAME_CHANGED',
	GamePasswordChanged = 'GAME_PASSWORD_CHANGED',
	GamePackageTypeChanged = 'GAME_PACKAGE_TYPE_CHANGED',
	GamePackageDataChanged = 'GAME_PACKAGE_DATA_CHANGED',
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
	UploadPackageProgress = 'UPLOAD_PACKAGE_PROGRESS'
}

export type IsConnectedChangedAction = { type: ActionTypes.IsConnectedChanged, isConnected: boolean };
export type ComputerAccountsChangedAction = { type: ActionTypes.ComputerAccountsChanged, computerAccounts: string[] };
export type NavigateToLoginAction = { type: ActionTypes.NavigateToLogin };
export type ShowSettingsAction = { type: ActionTypes.ShowSettings, show: boolean };
export type NavigateToHowToPlayAction = { type: ActionTypes.NavigateToHowToPlay };
export type NavigateBackAction = { type: ActionTypes.NavigateBack };
export type LoginChangedAction = { type: ActionTypes.LoginChanged, newLogin: string };
export type LoginStartAction = { type: ActionTypes.LoginStart };
export type LoginEndAction = { type: ActionTypes.LoginEnd, error: string | null };
export type NavigateToGamesListAction = { type: ActionTypes.NavigateToGamesList };
export type ClearGamesAction = { type: ActionTypes.ClearGames };
export type ReceiveGamesAction = { type: ActionTypes.ReceiveGames, games: GameInfo[] };
export type ReceiveUsersAction = { type: ActionTypes.ReceiveUsers, users: string[] };
export type ReceiveMessageAction = { type: ActionTypes.ReceiveMessage, sender: string, message: string };
export type OnlineLoadFinishedAction = { type: ActionTypes.OnlineLoadFinished };
export type OnlineLoadErrorAction = { type: ActionTypes.OnlineLoadError, error: string };
export type OnlineModeChangedAction = { type: ActionTypes.OnlineModeChanged, mode: OnlineMode };
export type GamesFilterToggleAction = { type: ActionTypes.GamesFilterToggle, filter: GamesFilter };
export type GamesSearchChangedAction = { type: ActionTypes.GamesSearchChanged, search: string };
export type SelectGameAction = { type: ActionTypes.SelectGame, gameId: number, showInfo: boolean };
export type CloseGameInfoAction = { type: ActionTypes.CloseGameInfo };
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
export type WindowWidthChangedAction = { type: ActionTypes.WindowWidthChanged, width: number };
export type GameNameChangedAction = { type: ActionTypes.GameNameChanged, gameName: string };
export type GamePasswordChangedAction = { type: ActionTypes.GamePasswordChanged, gamePassword: string };
export type GamePackageTypeChangedAction = { type: ActionTypes.GamePackageTypeChanged, packageType: PackageType };
export type GamePackageDataChangedAction = { type: ActionTypes.GamePackageDataChanged, packageName: string, packageData: File | null };
export type GameTypeChangedAction = { type: ActionTypes.GameTypeChanged, gameType: GameType };
export type GameRoleChangedAction = { type: ActionTypes.GameRoleChanged, gameRole: Role };
export type ShowmanTypeChangedAction = { type: ActionTypes.ShowmanTypeChanged, isHuman: boolean };
export type PlayersCountChangedAction = { type: ActionTypes.PlayersCountChanged, playersCount: number };
export type HumanPlayersCountChangedAction = { type: ActionTypes.HumanPlayersCountChanged, humanPlayersCount: number };
export type GameCreationStartAction = { type: ActionTypes.GameCreationStart };
export type GameCreationEndAction = { type: ActionTypes.GameCreationEnd, error: string | null };
export type GameSetAction = { type: ActionTypes.GameSet, id: number, isHost: boolean, isAutomatic: boolean, role: Role };
export type JoinGameStartedAction = { type: ActionTypes.JoinGameStarted };
export type JoinGameFinishedAction = { type: ActionTypes.JoinGameFinished, error: string | null };
export type UploadPackageStartedAction = { type: ActionTypes.UploadPackageStarted };
export type UploadPackageFinishedAction = { type: ActionTypes.UploadPackageFinished };
export type UploadPackageProgressAction = { type: ActionTypes.UploadPackageProgress, progress: number };

export type KnownAction =
	IsConnectedChangedAction
	| ComputerAccountsChangedAction
	| NavigateToLoginAction
	| ShowSettingsAction
	| NavigateToHowToPlayAction
	| NavigateBackAction
	| LoginChangedAction
	| LoginStartAction
	| LoginEndAction
	| NavigateToGamesListAction
	| ClearGamesAction
	| ReceiveGamesAction
	| ReceiveUsersAction
	| ReceiveMessageAction
	| OnlineLoadFinishedAction
	| OnlineLoadErrorAction
	| OnlineModeChangedAction
	| GamesFilterToggleAction
	| GamesSearchChangedAction
	| SelectGameAction
	| CloseGameInfoAction
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
	| WindowWidthChangedAction
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
	;
