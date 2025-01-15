import GameInfo from './contracts/GameInfo';
import HostInfo from './contracts/HostInfo';
import Slice from './contracts/Slice';
import RunGameRequest from './contracts/RunGameRequest';
import RunGameResponse from './contracts/RunGameResponse';
import RunAutoGameRequest from './contracts/RunAutoGameRequest';
import GetGameByPinResponse from './contracts/GetGameByPinResponse';

/** Defines the SIGame Server client. */
export default interface IGameServerClient {
	connection: signalR.HubConnection;

	isConnected(): boolean;

	connect(): Promise<void>;

	disconnect(): Promise<void>;

	/** Gets default computer accounts names. */
	getComputerAccountsAsync(culture: string): Promise<string[]>;

	/** Gets server global info. */
	getGameHostInfoAsync(culture: string): Promise<HostInfo>;

	/**
	 * Gets partial running games list starting from the first game after the game with id {@link fromId}.
	 * To receive all games from the server, use 0 as {@link fromId} value;
	 * then use the last `gameId` in returned list as a new {@link fromId} value.
	 * @param fromId gameId to start with.
	 */
	getGamesSliceAsync(fromId: number): Promise<Slice<GameInfo>>;

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

	/**
	 * Gets game info by PIN.
	 * @param pin Game PIN.
	 */
	getGameByPinAsync(pin: number): Promise<GetGameByPinResponse | null>;
}
