import OnlineMode from '../model/enums/OnlineMode';
import GamesFilter from '../model/enums/GamesFilter';
import ChatMode from '../model/enums/ChatMode';
import GameType from '../client/contracts/GameType';
import Role from '../client/contracts/Role';
import GameInfo from '../client/contracts/GameInfo';
import PackageType from '../model/enums/PackageType';
import { SIPackageInfo } from '../model/SIPackageInfo';
import { SearchEntity } from '../model/SearchEntity';

export const enum ActionTypes {
	NavigateToLogin = 'NAVIGATE_TO_LOGIN',
	ShowSettings = 'SHOW_SETTINGS',
	NavigateToHowToPlay = 'NAVIGATE_TO_HOW_TO_PLAY',
	NavigateBack = 'NAVIGATE_BACK',
	NavigateToWelcome = 'NAVIGATE_TO_WELCOME',
	NavigateToNewGame = 'NAVIGATE_TO_NEW_GAME',
	NavigateToGames = 'NAVIGATE_TO_GAMES',
	NavigateToLobby = 'NAVIGATE_TO_LOBBY',
	NavigateToError = 'NAVIGATE_TO_ERROR',
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
	WindowSizeChanged = 'WINDOW_SIZE_CHANGED',
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
	SearchPackages = 'SEARCH_PACKAGES',
	SearchPackagesFinished = 'SEARCH_PACKAGES_FINISHED',
	SearchPackagesError = 'SEARCH_PACKAGES_ERROR',
	ReceiveAuthors = 'RECEIVE_AUTHORS',
	ReceiveAuthorsFinished = 'RECEIVE_AUTHORS_FINISHED',
	ReceiveTags = 'RECEIVE_TAGS',
	ReceiveTagsFinished = 'RECEIVE_TAGS_FINISHED',
	ReceivePublishers = 'RECEIVE_PUBLISHERS',
	ReceivePublishersFinished = 'RECEIVE_PUBLISHERS_FINISHED',
	IsSettingGameButtonKeyChanged = 'IS_SETTING_GAME_BUTTON_KEY_CHANGED',
	EmojiPickerToggle = 'EMOJI_PICKER_TOGGLE',
}

export type NavigateToLoginAction = { type: ActionTypes.NavigateToLogin };
export type ShowSettingsAction = { type: ActionTypes.ShowSettings, show: boolean };
export type NavigateToHowToPlayAction = { type: ActionTypes.NavigateToHowToPlay };
export type NavigateBackAction = { type: ActionTypes.NavigateBack };
export type NavigateToWelcomeAction = { type: ActionTypes.NavigateToWelcome };
export type NavigateToNewGameAction = { type: ActionTypes.NavigateToNewGame };
export type NavigateToGamesAction = { type: ActionTypes.NavigateToGames };
export type NavigateToLobbyAction = { type: ActionTypes.NavigateToLobby };
export type NavigateToErrorAction = { type: ActionTypes.NavigateToError };
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
export type WindowSizeChangedAction = { type: ActionTypes.WindowSizeChanged, width: number, height: number };
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
export type SearchPackagesAction = { type: ActionTypes.SearchPackages };
export type SearchPackagesFinishedAction = { type: ActionTypes.SearchPackagesFinished, packages: SIPackageInfo[] };
export type SearchPackagesErrorAction = { type: ActionTypes.SearchPackagesError, error: string | null };
export type ReceiveAuthorsAction = { type: ActionTypes.ReceiveAuthors };
export type ReceiveAuthorsFinishedAction = { type: ActionTypes.ReceiveAuthorsFinished, authors: SearchEntity[] };
export type ReceiveTagsAction = { type: ActionTypes.ReceiveTags };
export type ReceiveTagsFinishedAction = { type: ActionTypes.ReceiveTagsFinished, tags: SearchEntity[] };
export type ReceivePublishersAction = { type: ActionTypes.ReceivePublishers };
export type ReceivePublishersFinishedAction = { type: ActionTypes.ReceivePublishersFinished, publishers: SearchEntity[] };
export type IsSettingGameButtonKeyChangedAction = { type: ActionTypes.IsSettingGameButtonKeyChanged, isSettingGameButtonKey: boolean };
export type EmojiPickerToggleAction = { type: ActionTypes.EmojiPickerToggle, isOpened: boolean };

export type KnownAction =
	NavigateToLoginAction
	| ShowSettingsAction
	| NavigateToHowToPlayAction
	| NavigateBackAction
	| NavigateToWelcomeAction
	| NavigateToNewGameAction
	| NavigateToGamesAction
	| NavigateToLobbyAction
	| NavigateToErrorAction
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
	| WindowSizeChangedAction
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
	| SearchPackagesAction
	| SearchPackagesFinishedAction
	| SearchPackagesErrorAction
	| ReceiveAuthorsAction
	| ReceiveAuthorsFinishedAction
	| ReceiveTagsAction
	| ReceiveTagsFinishedAction
	| ReceivePublishersAction
	| ReceivePublishersFinishedAction
	| GamePackageLibraryChangedAction
	| IsSettingGameButtonKeyChangedAction
	| EmojiPickerToggleAction;
