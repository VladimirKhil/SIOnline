import GameCreationResult from './contracts/GameCreationResult';
import GameInfo from './contracts/GameInfo';
import GameSettings from './contracts/GameSettings';
import HostInfo from './contracts/HostInfo';
import PackageKey from './contracts/PackageKey';
import Slice from './contracts/Slice';
import IGameServerClient from './IGameServerClient';
import PackageInfo from './contracts/PackageInfo';
import Role from '../model/Role';
import IClientBase from './IClientBase';

const enum State { None, Lobby, Game }

interface JoinInfo {
	gameId: number;
	role: Role;
	isMale: boolean;
	password: string;
}

/** Represents a connection to a SIGame Server. */
export default class GameServerClient implements IGameServerClient, IClientBase {
	private state: State = State.None;

	private culture = '';

	private joinInfo: JoinInfo | null = null;

	/**
	 * Initializes a new instance of {@link GameServerClient}.
	 * @param connection Underlying SignalR connection.
	 */
	constructor(private connection: signalR.HubConnection, private errorHandler: (error: any) => void) {

	}

	getComputerAccountsAsync(culture: string): Promise<string[]> {
		return this.connection.invoke<string[]>('GetComputerAccountsNew', culture);
	}

	getGameHostInfoAsync(culture: string): Promise<HostInfo> {
		return this.connection.invoke<HostInfo>('GetGamesHostInfoNew', culture);
	}

	async joinLobbyAsync(culture: string): Promise<boolean> {
		await this.connection.invoke<boolean>('JoinLobby2', culture);

		this.state = State.Lobby;
		this.culture = culture;

		return true;
	}

	getGamesSliceAsync(fromId: number): Promise<Slice<GameInfo>> {
		return this.connection.invoke<Slice<GameInfo>>('GetGamesSlice', fromId);
	}

	getUsersAsync(): Promise<string[]> {
		return this.connection.invoke<string[]>('GetUsers');
	}

	getLoginAsync(): Promise<string> {
		return this.connection.invoke<string>('GetLogin');
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

	async joinGameAsync(gameId: number, role: Role, isMale: boolean, password: string): Promise<GameCreationResult> {
		const result = await this.connection.invoke<GameCreationResult>(
			'JoinGameNew',
			gameId,
			role,
			isMale,
			password
		);

		if (!result.ErrorMessage) {
			this.state = State.Game;
			this.joinInfo = { gameId, role, isMale, password };
		}

		return result;
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

	/** Leaves game and returns to lobby. */
	async leaveGameAsync(): Promise<any> {
		await this.connection.invoke('LeaveGame');
		this.state = State.None;
	}

	logOutAsync(): Promise<any> {
		return this.connection.invoke('LogOut');
	}

	async reconnectAsync(): Promise<any> {
		if (this.state === State.Lobby) {
			await this.joinLobbyAsync(this.culture);
		} else if (this.state === State.Game && this.joinInfo) {
			await this.joinGameAsync(this.joinInfo.gameId, this.joinInfo.role, this.joinInfo.isMale, this.joinInfo.password);
		}
	}
}
