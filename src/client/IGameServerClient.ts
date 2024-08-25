import GameInfo from './contracts/GameInfo';
import HostInfo from './contracts/HostInfo';
import Slice from './contracts/Slice';
import RunGameRequest from './contracts/RunGameRequest';
import RunGameResponse from './contracts/RunGameResponse';
import RunAutoGameRequest from './contracts/RunAutoGameRequest';

/** Defines the SIGame Server client. */
export default interface IGameServerClient {
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
	getLoginAsync(): Promise<string | null>;

	/** Sends a message to the lobby chat. */
	sayInLobbyAsync(text: string): Promise<any>;

	/**
	 * Runs a new game.
	 * @param runGameRequest Game options.
	 */
	runGameAsync(runGameRequest: RunGameRequest): Promise<RunGameResponse>;

	/**
	 * Runs a new automatic game.
	 * @param runAutoGameRequest Automatic game options.
	 */
	runAutoGameAsync(runAutoGameRequest: RunAutoGameRequest): Promise<RunGameResponse>;

	/** Logs out from the server. */
	logOutAsync(): Promise<any>;

	/** Reconnects to server after re-establishing connection. */
	reconnectAsync(): Promise<any>;
}
