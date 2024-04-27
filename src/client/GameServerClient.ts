import GameInfo from './contracts/GameInfo';
import HostInfo from './contracts/HostInfo';
import Slice from './contracts/Slice';
import IGameServerClient from './IGameServerClient';
import IClientBase from './IClientBase';
import RunGameResponse from './contracts/RunGameResponse';
import RunGameRequest from './contracts/RunGameRequest';
import RunAutoGameRequest from './contracts/RunAutoGameRequest';

const enum State { None, Lobby, Game }

/** Represents a connection to a SIGame Server. */
export default class GameServerClient implements IGameServerClient, IClientBase {
	private state: State = State.None;

	private culture = '';

	/**
	 * Initializes a new instance of {@link GameServerClient}.
	 * @param connection Underlying SignalR connection.
	 */
	constructor(public connection: signalR.HubConnection, private errorHandler: (error: any) => void) { }

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

	runGameAsync(runGameRequest: RunGameRequest): Promise<RunGameResponse> {
		return this.connection.invoke<RunGameResponse>(
			'RunGame',
			runGameRequest
		);
	}

	runAutoGameAsync(runAutoGameRequest: RunAutoGameRequest): Promise<RunGameResponse> {
		return this.connection.invoke<RunGameResponse>(
			'RunAutoGame',
			runAutoGameRequest
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
		}
	}
}
