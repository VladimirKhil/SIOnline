import GameCreationResult from './contracts/GameCreationResult';
import GameInfo from './contracts/GameInfo';
import GameSettings from './contracts/GameSettings';
import HostInfo from './contracts/HostInfo';
import Slice from './contracts/Slice';
import PackageInfo from './contracts/PackageInfo';
import Role from '../model/Role';
import IClientBase from './IClientBase';
import RunGameRequest from './contracts/RunGameRequest';
import RunGameResponse from './contracts/RunGameResponse';

/** Defines the SIGame Server client. */
export default interface IGameServerClient extends IClientBase {
	/** Gets default computer accounts names. */
	getComputerAccountsAsync(culture: string): Promise<string[]>;

	/** Gets server global info. */
	getGameHostInfoAsync(culture: string): Promise<HostInfo>;

	/** Joins server lobby. */
	joinLobbyAsync(culture: string): Promise<boolean>;

	/**
	 * Gets partial running games list starting from the first game after the game with id {@link fromId}.
	 * To receive all games from the server, use 0 as {@link fromId} value;
	 * then use the last `gameId` in returned list as a new {@link fromId} value.
	 * @param fromId gameId to start with.
	 */
	getGamesSliceAsync(fromId: number): Promise<Slice<GameInfo>>;

	/** Gets active users list in the lobby. */
	getUsersAsync(): Promise<string[]>;

	/** Gets server news string. */
	getNewsAsync(): Promise<string | null>;

	/** Gets user login. */
	getLoginAsync(): Promise<string>;

	/** Sends a message to the lobby chat. */
	sayInLobbyAsync(text: string): Promise<any>;

	/**
	 * Runs a new game.
	 * @param runGameRequest Game options.
	 */
	runGameAsync(runGameRequest: RunGameRequest): Promise<RunGameResponse>;

	/**
	 * Creates an automatic game to play with anybody and joins it.
	 * @param login User login.
	 * @param isMale If person is a male (or female otherwise).
	 */
	createAutomaticGameAsync(login: string, isMale: boolean): Promise<GameCreationResult>;

	/**
	 * Joins an existsing game.
	 * @param gameId Game identifier to join.
	 * @param role Role to use.
	 * @param isMale If person is a male (or female otherwise).
	 * @param password Game password.
	 */
	joinGameAsync(gameId: number, role: Role, isMale: boolean, password: string): Promise<GameCreationResult>;

	/** Logs out from the server. */
	logOutAsync(): Promise<any>;

	/** Reconnects to server after re-establishing connection. */
	reconnectAsync(): Promise<any>;
}
