import Role from './contracts/Role';
import GameCreationResult from './contracts/GameCreationResult';
import GameInfo from './contracts/GameInfo';
import GameSettings from './contracts/GameSettings';
import HostInfo from './contracts/HostInfo';
import PackageKey from './contracts/PackageKey';
import Slice from './contracts/Slice';
import IGameServerClient from './IGameServerClient';
import PackageInfo from './contracts/PackageInfo';

/** Represents a connection to a SIGame Server. */
export default class GameServerClient implements IGameServerClient {
	/**
	 * Initializes a new instance of {@link GameServerClient}.
	 * @param connection Underlying SignalR connection.
	 */
	constructor(private connection: signalR.HubConnection, private errorHandler: (error : any) => void) {

	}

	getComputerAccountsAsync(culture: string): Promise<string[]> {
		return this.connection.invoke<string[]>('GetComputerAccountsNew', culture);
	}

	getGameHostInfoAsync(culture: string): Promise<HostInfo> {
		return this.connection.invoke<HostInfo>('GetGamesHostInfoNew', culture);
	}

	getGamesSliceAsync(fromId: number): Promise<Slice<GameInfo>> {
		return this.connection.invoke<Slice<GameInfo>>('GetGamesSlice', fromId);
	}

	getUsersAsync(): Promise<string[]> {
		return this.connection.invoke<string[]>('GetUsers');
	}

	getNewsAsync(): Promise<string | null> {
		return this.connection.invoke<string | null>('GetNews');
	}

	sayInLobbyAsync(text: string): Promise<any> {
		return this.connection.invoke('Say', text);
	}

	createAndJoinGameAsync(gameSettings: GameSettings, packageKey: PackageKey, isMale: boolean): Promise<GameCreationResult> {
		return this.connection.invoke<GameCreationResult>(
			'CreateAndJoinGameNew',
			gameSettings,
			packageKey,
			[],
			isMale
		);
	}

	createAndJoinGame2Async(gameSettings: GameSettings, packageInfo: PackageInfo, isMale: boolean): Promise<GameCreationResult> {
		return this.connection.invoke<GameCreationResult>(
			'CreateAndJoinGame2',
			gameSettings,
			packageInfo,
			[],
			isMale
		);
	}

	createAutomaticGameAsync(login: string, isMale: boolean): Promise<GameCreationResult> {
		return this.connection.invoke<GameCreationResult>(
			'CreateAutomaticGameNew',
			login,
			isMale
		);
	}

	joinGameAsync(gameId: number, role: Role, isMale: boolean, password: string): Promise<GameCreationResult> {
		return this.connection.invoke<GameCreationResult>(
			'JoinGameNew',
			gameId,
			role,
			isMale,
			password
		);
	}

	async sendMessageToServerAsync(message: string): Promise<boolean> {
		try {
			await this.connection.invoke('SendMessage', {
				Text: message,
				IsSystem: true,
				Receiver: '@'
			});

			return true;
		} catch (e) {
			this.errorHandler(e);
			return false;
		}
	}

	msgAsync(...args: any[]): Promise<boolean> {
		return this.sendMessageToServerAsync(args.join('\n'));
	}

	sayAsync(message: string): Promise<any> {
		return this.connection.invoke('SendMessage', {
			Text: message,
			IsSystem: false,
			Receiver: '*'
		});
	}

	/** Leaves the game and returns to the lobby. */
	leaveGameAsync(): Promise<any> {
		return this.connection.invoke('LeaveGame');
	}

	logOutAsync(): Promise<any> {
		return this.connection.invoke('LogOut');
	}
}
