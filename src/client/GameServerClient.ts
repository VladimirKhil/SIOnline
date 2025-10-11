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
import StorageFilter from './contracts/StorageFilter';
import IGameServerListener from './IGameServerListener';

/** Represents a connection to a SIGame Server. */
export default class GameServerClient implements IGameServerClient {
	private isDisconnecting = false;

	/** Underlying SignalR connection. */
	private connection?: signalR.HubConnection;

	/**
	 * Initializes a new instance of {@link GameServerClient}.
	 */
	constructor(private serverUri: string) {}

	isConnected(): boolean {
		return this.connection?.state === signalR.HubConnectionState.Connected;
	}

	async connect(runtimeUri: string, listener: IGameServerListener): Promise<void> {
		const connectionBuilder = new signalR.HubConnectionBuilder()
			.withAutomaticReconnect({
				nextRetryDelayInMilliseconds: (retryContext: signalR.RetryContext) => 1000 * (retryContext.previousRetryCount + 1)
			})
			.withUrl(`${runtimeUri}/sionline`)
			.withHubProtocol(new signalRMsgPack.MessagePackHubProtocol());

		this.connection = connectionBuilder.build();

		this.connection.on('GameCreated', listener.onGameCreated);
		this.connection.on('GameChanged', listener.onGameChanged);
		this.connection.on('GameDeleted', listener.onGameDeleted);

		this.connection.onreconnecting(e => {
			if (this.isDisconnecting) {
				return;
			}

			listener.onReconnecting(e);
		});

		this.connection.onreconnected(() => {
			if (this.isDisconnecting) {
				return;
			}

			listener.onReconnected();
		});

		this.connection.onclose(async e => {
			if (this.isDisconnecting) {
				return;
			}

			listener.onClose(e);

			if (e) {
				try {
					await this.connection?.start();
				} catch (error) {
					console.error('Error while restarting connection: ' + error);
				}
			}
		});

		await this.connection.start();
	}

	async disconnect(): Promise<void> {
		if (!this.connection) {
			return;
		}

		this.connection.off('GameCreated');
		this.connection.off('GameChanged');
		this.connection.off('GameDeleted');

		this.isDisconnecting = true;

		try {
			await this.connection.stop();
		} finally {
			this.isDisconnecting = false;
		}
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

	async getStorageFilterAsync(storageId: string): Promise<StorageFilter> {
		const response = await fetch(`${this.serverUri}/api/v1/info/storage-filter/${storageId}`);

		if (!response.ok) {
			return { packages: {}, tags: [] };
		}

		return <StorageFilter>(await response.json());
	}

	getGamesSliceAsync(fromId: number): Promise<Slice<GameInfo>> {
		if (!this.connection) {
			return Promise.reject(new Error('Not connected to the server'));
		}

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
