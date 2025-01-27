import GameInfo from './contracts/GameInfo';
import HostInfo from './contracts/HostInfo';
import Slice from './contracts/Slice';
import IGameServerClient from './IGameServerClient';
import RunGameResponse from './contracts/RunGameResponse';
import RunGameRequest from './contracts/RunGameRequest';
import RunAutoGameRequest from './contracts/RunAutoGameRequest';
import GetGameByPinResponse from './contracts/GetGameByPinResponse';
import * as signalR from '@microsoft/signalr';
import * as signalRMsgPack from '@microsoft/signalr-protocol-msgpack';

/** Represents a connection to a SIGame Server. */
export default class GameServerClient implements IGameServerClient {
	/** Underlying SignalR connection. */
	public connection: signalR.HubConnection;

	/**
	 * Initializes a new instance of {@link GameServerClient}.
	 */
	constructor(private serverUri?: string) {
		if (!serverUri) {
			this.connection = new signalR.HubConnectionBuilder().withUrl('http://fake').build();
			return;
		}

		const connectionBuilder = new signalR.HubConnectionBuilder()
			.withAutomaticReconnect({
				nextRetryDelayInMilliseconds: (retryContext: signalR.RetryContext) => 1000 * (retryContext.previousRetryCount + 1)
			})
			.withUrl(`${serverUri}/sionline`)
			.withHubProtocol(new signalRMsgPack.MessagePackHubProtocol());

		this.connection = connectionBuilder.build();
	}

	isConnected(): boolean {
		return this.connection.state === signalR.HubConnectionState.Connected;
	}

	async connect(): Promise<void> {
		await this.connection.start();
	}

	async disconnect(): Promise<void> {
		await this.connection.stop();
	}

	async getComputerAccountsAsync(culture: string): Promise<string[]> {
		const response = await fetch(`${this.serverUri}/api/v1/info/bots`, {
			headers: {
				'Accept-Language': culture
			}
		});

		if (!response.ok) {
			throw new Error(`Error while retrieving computer accounts: ${response.status} ${await response.text()}`);
		}

		return <string[]>(await response.json());
	}

	async getGameHostInfoAsync(culture: string): Promise<HostInfo> {
		const response = await fetch(`${this.serverUri}/api/v1/info/host`, {
			headers: {
				'Accept-Language': culture
			}
		});

		if (!response.ok) {
			throw new Error(`Error while retrieving computer accounts: ${response.status} ${await response.text()}`);
		}

		return <HostInfo>(await response.json());
	}

	getGamesSliceAsync(fromId: number): Promise<Slice<GameInfo>> {
		return this.connection.invoke<Slice<GameInfo>>('GetGamesSlice', fromId);
	}

	async runGameAsync(runGameRequest: RunGameRequest): Promise<RunGameResponse> {
		const response = await fetch(`${this.serverUri}/api/v1/games`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(runGameRequest)
		});

		if (!response.ok) {
			// TODO: no special handling is needed for now
		}

		return <RunGameResponse>(await response.json());
	}

	async runAutoGameAsync(runAutoGameRequest: RunAutoGameRequest): Promise<RunGameResponse> {
		const response = await fetch(`${this.serverUri}/api/v1/games/auto`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(runAutoGameRequest)
		});

		if (!response.ok) {
			// TODO: no special handling is needed for now
		}

		return <RunGameResponse>(await response.json());
	}

	async getGameByPinAsync(pin: number): Promise<GetGameByPinResponse | null> {
		const response = await fetch(`${this.serverUri}/api/v1/games?pin=${pin}`);

		if (!response.ok) {
			if (response.status === 404) {
				return null;
			}

			throw new Error(`Error while retrieving game by pin: ${response.status} ${await response.text()}`);
		}

		return <GetGameByPinResponse>(await response.json());
	}
}
