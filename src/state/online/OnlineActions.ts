import GamesResponse from 'sistatistics-client/dist/models/GamesResponse';
import GameInfo from '../../client/contracts/GameInfo';
import GamesFilter from '../../model/enums/GamesFilter';
import LobbySideMode from '../../model/enums/LobbySideMode';
import GamesStatistic from 'sistatistics-client/dist/models/GamesStatistic';
import PackagesStatistic from 'sistatistics-client/dist/models/PackagesStatistic';

export const enum OnlineActionTypes {
	UnselectGame = 'UNSELECT_GAME',
	DropSelectedGame = 'DROP_SELECTED_GAME',
	ResetLobby = 'RESET_LOBBY',
	ClearGames = 'CLEAR_GAMES',
	ReceiveGamesStart = 'RECEIVE_GAMES_START',
	ReceiveGames = 'RECEIVE_GAMES',
	GameCreated = 'GAME_CREATED',
	GameChanged = 'GAME_CHANGED',
	GameDeleted = 'GAME_DELETED',
	OnlineLoadFinished = 'ONLINE_LOAD_FINISHED',
	OnlineLoadError = 'ONLINE_LOAD_ERROR',
	GamesFilterToggle = 'GAMES_FILTER_TOGGLE',
	GamesSearchChanged = 'GAMES_SEARCH_CHANGED',
	SelectGame = 'SELECT_GAME',
	PasswordChanged = 'PASSWORD_CHANGED',
	ChatModeChanged = 'CHAT_MODE_CHANGED',
	NewGame = 'NEW_GAME',
	NewGameCancel = 'NEW_GAME_CANCEL',
	GameCreationStart = 'GAME_CREATION_START',
	GameCreationEnd = 'GAME_CREATION_END',
	JoinGameStarted = 'JOIN_GAME_STARTED',
	JoinGameFinished = 'JOIN_GAME_FINISHED',
	LatestGamesLoaded = 'LATEST_GAMES_LOADED',
	GamesStatisticLoaded = 'GAMES_STATISTICS_LOADED',
	PackagesStatisticsLoaded = 'PACKAGES_STATISTICS_LOADED',
}

export type ClearGamesAction = { type: OnlineActionTypes.ClearGames };
export type ReceiveGamesStartAction = { type: OnlineActionTypes.ReceiveGamesStart };
export type ReceiveGamesAction = { type: OnlineActionTypes.ReceiveGames, games: GameInfo[] };
export type OnlineLoadFinishedAction = { type: OnlineActionTypes.OnlineLoadFinished };
export type OnlineLoadErrorAction = { type: OnlineActionTypes.OnlineLoadError, error: string };
export type GamesFilterToggleAction = { type: OnlineActionTypes.GamesFilterToggle, filter: GamesFilter };
export type GamesSearchChangedAction = { type: OnlineActionTypes.GamesSearchChanged, search: string };
export type SelectGameAction = { type: OnlineActionTypes.SelectGame, gameId: number };
export type NewGameAction = { type: OnlineActionTypes.NewGame };
export type NewGameCancelAction = { type: OnlineActionTypes.NewGameCancel };
export type PasswordChangedAction = { type: OnlineActionTypes.PasswordChanged, newPassword: string };
export type ChatModeChangedAction = { type: OnlineActionTypes.ChatModeChanged, chatMode: LobbySideMode };
export type GameCreatedAction = { type: OnlineActionTypes.GameCreated, game: GameInfo };
export type GameChangedAction = { type: OnlineActionTypes.GameChanged, game: GameInfo };
export type GameDeletedAction = { type: OnlineActionTypes.GameDeleted, gameId: number };
export type GameCreationStartAction = { type: OnlineActionTypes.GameCreationStart };
export type GameCreationEndAction = { type: OnlineActionTypes.GameCreationEnd };
export type UnselectGameAction = { type: OnlineActionTypes.UnselectGame };
export type DropSelectedGameAction = { type: OnlineActionTypes.DropSelectedGame };
export type ResetLobbyAction = { type: OnlineActionTypes.ResetLobby };
export type JoinGameStartedAction = { type: OnlineActionTypes.JoinGameStarted };
export type JoinGameFinishedAction = { type: OnlineActionTypes.JoinGameFinished };
export type LatestGamesLoadedAction = { type: OnlineActionTypes.LatestGamesLoaded, latestGames: GamesResponse };
export type GamesStatisticLoadedAction = { type: OnlineActionTypes.GamesStatisticLoaded, gamesStatistics: GamesStatistic };
export type PackagesStatisticsLoadedAction = { type: OnlineActionTypes.PackagesStatisticsLoaded, packagesStatistics: PackagesStatistic };

export type KnownOnlineAction =
	ClearGamesAction
	| DropSelectedGameAction
	| ReceiveGamesStartAction
	| ReceiveGamesAction
	| OnlineLoadFinishedAction
	| OnlineLoadErrorAction
	| GamesFilterToggleAction
	| GamesSearchChangedAction
	| SelectGameAction
	| NewGameAction
	| NewGameCancelAction
	| PasswordChangedAction
	| ChatModeChangedAction
	| GameCreatedAction
	| GameChangedAction
	| GameDeletedAction
	| GameCreationStartAction
	| GameCreationEndAction
	| UnselectGameAction
	| UnselectGameAction
	| ResetLobbyAction
	| JoinGameStartedAction
	| JoinGameFinishedAction
	| LatestGamesLoadedAction
	| GamesStatisticLoadedAction
	| PackagesStatisticsLoadedAction;