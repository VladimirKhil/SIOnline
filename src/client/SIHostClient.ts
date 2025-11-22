import * as signalR from '@microsoft/signalr';
import * as signalRMsgPack from '@microsoft/signalr-protocol-msgpack';
import IClientBase from './IClientBase';
import ISIHostClient from './ISIHostClient';
import ISIHostListener from './ISIHostListener';
import GameInfo from './contracts/GameInfo';
import JoinGameRequest from './contracts/JoinGameRequest';
import JoinGameResponse from './contracts/JoinGameResponse';

export default class SIHostClient implements ISIHostClient, IClientBase {
	private isDisconnecting = false;

	private joinInfo: JoinGameRequest | null = null;

	private completed = false;

	/** Underlying SignalR connection. */
	private connection?: signalR.HubConnection;

	private listener?: ISIHostListener;

	async connectAsync(serverUri: string, listener: ISIHostListener): Promise<void> {
		this.listener = listener;

		const connectionBuilder = new signalR.HubConnectionBuilder()
			.withAutomaticReconnect({
				nextRetryDelayInMilliseconds: (retryContext: signalR.RetryContext) => 1000 * (retryContext.previousRetryCount + 1)
			})
			.withUrl(serverUri + 'sihost')
			.withHubProtocol(new signalRMsgPack.MessagePackHubProtocol());

		this.connection = connectionBuilder.build();

		this.connection.on('Receive', listener.onReceive.bind(listener));
		this.connection.on('Disconnect', listener.onDisconnect.bind(listener));
		this.connection.on('GamePersonsChanged', listener.onGamePersonsChanged.bind(listener));

		this.connection.onreconnecting(e => {
			if (this.isDisconnecting) {
				return;
			}

			listener.onReconnecting(e);
		});

		this.connection.onreconnected(async () => {
			if (this.isDisconnecting) {
				return;
			}

			try {
				await this.reconnectAsync();
			} catch (e) {
				listener.onError(e);
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
					await this.reconnectAsync();
					listener.onReconnected();
				} catch (error) {
					// empty
				}
			}
		});

		await this.connection.start();
	}

	async disconnectAsync(): Promise<void> {
		if (!this.connection) {
			return;
		}

		this.connection.off('Receive');
		this.connection.off('Disconnect');
		this.connection.off('GamePersonsChanged');

		this.isDisconnecting = true;

		try {
			await this.connection.stop();
		} finally {
			this.isDisconnecting = false;
		}

		this.connection = undefined;
	}

	async tryGetGameInfoAsync(gameId: number): Promise<GameInfo | null> {
		if (!this.connection) {
			throw new Error('Not connected to server');
		}

		const info = await this.connection.invoke<GameInfo | null>('TryGetGameInfo', gameId);
		return info;
	}

	async joinGameAsync(joinGameRequest: JoinGameRequest): Promise<JoinGameResponse> {
		if (!this.connection) {
			throw new Error('Not connected to server');
		}

		const result = await this.connection.invoke<JoinGameResponse>('JoinGame', joinGameRequest);

		if (result.IsSuccess) {
			this.joinInfo = joinGameRequest;
		}

		return result;
	}

	async sendMessageToServerAsync(message: string): Promise<boolean> {
		if (!this.connection) {
			throw new Error('Not connected to server');
		}

		try {
			await this.connection.invoke('SendMessage', {
				Text: message,
				IsSystem: true,
				Sender: this.joinInfo?.UserName,
				Receiver: '@'
			});

			return true;
		} catch (e) {
			if (!this.completed) {
				this.listener?.onError(e);
			}

			return false;
		}
	}

	msgAsync(...args: any[]): Promise<boolean> {
		return this.sendMessageToServerAsync(args.join('\n'));
	}

	sayAsync(message: string): Promise<any> {
		if (!this.connection) {
			throw new Error('Not connected to server');
		}

		return this.connection.invoke('SendMessage', {
			Text: message,
			IsSystem: false,
			Sender: this.joinInfo?.UserName,
			Receiver: '*'
		});
	}

	async reconnectAsync(): Promise<any> {
		if (this.joinInfo) {
			const result = await this.joinGameAsync(this.joinInfo);

			if (!result.IsSuccess) {
				throw new Error(`Reconnection failed: ${result.ErrorType} ${result.Message ?? ''}`);
			}
		}
	}

	/** Leaves game and finishes processing. */
	async leaveGameAsync(): Promise<any> {
		this.joinInfo = null;
		this.completed = true;
	}
}