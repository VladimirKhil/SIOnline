import Role from '../model/enums/Role';
import FileKey from '../model/server/FileKey';
import GameCreationResult from '../model/server/GameCreationResult';
import GameInfo from '../model/server/GameInfo';
import GameSettings from '../model/server/GameSettings';
import HostInfo from '../model/server/HostInfo';
import PackageKey from '../model/server/PackageKey';
import Slice from '../model/server/Slice';

/** Defines the SIGame Server client. */
export default interface IGameServerClient {
	/** Gets default computer accounts names. */
	getComputerAccountsAsync(culture: string): Promise<string[]>;
	/** Gets server global info. */
	getGameHostInfoAsync(): Promise<HostInfo>;
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
	/** Sends a message to the lobby chat. */
	sayInLobbyAsync(text: string): Promise<any>;
	/**
	 * Checks whether a specific package exists on a server.
	 * If not, it must be uploaded first to start a new game with it.
	 * @param packageKey Package key to check.
	 */
	hasPackageAsync(packageKey: PackageKey): Promise<boolean>;
	/**
	 * Checks whether a specific image exists on a server.
	 * @param fileKey File key to check.
	 */
	hasImageAsync(fileKey: FileKey): Promise<string | null>;
	/**
	 * Creates a new game and joins it as a host.
	 * @param gameSettings Game settings.
	 * @param packageKey Package key to use.
	 * @param isMale If host is a male person (or female otherwise).
	 */
	createAndJoinGameAsync(gameSettings: GameSettings, packageKey: PackageKey, isMale: boolean): Promise<GameCreationResult>;
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
	/**
	 * Sends a message inside game. Method should be awaited.
	 * @param message Message to send.
	 * @returns The success status of sending operation.
	 */
	sendMessageToServerAsync(message: string): Promise<boolean>;
	/**
	 * Sends a message inside game.
	 * @param args Arguments to construct a message.
	 * @returns The success status of sending operation.
	 */
	msgAsync(...args: any[]): Promise<boolean>;
	/**
	 * Sends a message in game chat.
	 * @param message Message to send.
	 */
	sayAsync(message: string): Promise<any>;
	/** Leaves running game. */
	leaveGameAsync(): Promise<any>;
	/** Logs out from the server. */
	logOutAsync(): Promise<any>;
}
