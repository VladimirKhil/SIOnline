import * as signalR from '@microsoft/signalr';
import * as signalRMsgPack from '@microsoft/signalr-protocol-msgpack';
import ISIHostClient from './ISIHostClient';
import ISIHostListener from './ISIHostListener';
import AuthorizationMode from './contracts/AuthorizationMode';
import GameInfo from './contracts/GameInfo';
import JoinGame2Result from './contracts/JoinGame2Result';
import JoinGameRequest from './contracts/JoinGameRequest';
import ServerRole from './contracts/ServerRole';

export class ReconnectError extends Error {
	constructor(public result: JoinGame2Result) {
		super(result);
		this.name = 'ReconnectError';
	}
}

interface AuthorizationData {
	AuthorizationMode: AuthorizationMode;
	AuthTicket?: string | null;
}

export default class SIHostClient implements ISIHostClient {
	private isDisconnecting = false;

	private joinInfo: JoinGameRequest | null = null;

	private completed = false;

	/** Underlying SignalR connection. */
	private connection?: signalR.HubConnection;

	private listener?: ISIHostListener;

	public userName: string | null = null;

	constructor(private readonly authorizationProvider?: (authorizationMode?: AuthorizationMode) => Promise<AuthorizationData | null>) {
	}

	async connectAsync(serverUri: string, listener: ISIHostListener): Promise<void> {
		this.listener = listener;

		const connectionBuilder = new signalR.HubConnectionBuilder()
			.withAutomaticReconnect({
				nextRetryDelayInMilliseconds: (retryContext: signalR.RetryContext) => {
					if (this.completed || this.isDisconnecting) {
						return null;
					}

					return Math.min(1000 * (retryContext.previousRetryCount + 1), 5000);
				}
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

			const delay = (ms: number) => new Promise(resolve => { setTimeout(resolve, ms); });
			let retryCount = 0;

			while (!this.completed && !this.isDisconnecting) {
				try {
					await delay(Math.min(1000 * retryCount, 5000));

					if (this.completed || this.isDisconnecting) {
						break;
					}

					await this.connection?.start();
					await this.reconnectAsync();
					listener.onReconnected();
					break;
				} catch (error) {
					if (error instanceof ReconnectError && error.result === JoinGame2Result.GameNotFound) {
						break;
					}

					retryCount += 1;
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

	async joinGameAsync(joinGameRequest: JoinGameRequest): Promise<JoinGame2Result> {
		if (!this.connection) {
			throw new Error('Not connected to server');
		}

		let request = joinGameRequest;

		if (joinGameRequest.AuthorizationMode !== AuthorizationMode.None) {
			request = await this.enrichJoinRequestAsync(joinGameRequest);
		}

		const result = await this.connection.invoke<JoinGame2Result>('JoinGame2', request);

		if (result === JoinGame2Result.Success) {
			this.joinInfo = {
				...request,
				AuthTicket: request.AuthorizationMode === AuthorizationMode.Steam ? null : request.AuthTicket ?? null,
			};

			this.userName = request.AuthorizationMode === AuthorizationMode.Steam ? `Ⓢ${request.UserName}` : request.UserName;
		}

		return result;
	}

	private async enrichJoinRequestAsync(joinGameRequest: JoinGameRequest): Promise<JoinGameRequest> {
		const authData = await this.authorizationProvider?.(joinGameRequest.AuthorizationMode);

		if (!authData) {
			return joinGameRequest;
		}

		return {
			...joinGameRequest,
			AuthorizationMode: authData.AuthorizationMode,
			AuthTicket: authData.AuthTicket ?? null,
		};
	}

	updateJoinRole(role: ServerRole): void {
		if (!this.joinInfo) {
			return;
		}

		this.joinInfo = {
			...this.joinInfo,
			Role: role,
		};
	}

	async sendMessageToServerAsync(message: string): Promise<boolean> {
		if (!this.connection) {
			throw new Error('Not connected to server');
		}

		try {
			await this.connection.invoke('SendMessage', {
				Text: message,
				IsSystem: true,
				Sender: this.userName,
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
			Sender: this.userName,
			Receiver: '*'
		});
	}

	async reconnectAsync(): Promise<any> {
		if (this.joinInfo) {
			const result = await this.joinGameAsync(this.joinInfo);

			if (result !== JoinGame2Result.Success) {
				throw new ReconnectError(result);
			}
		}
	}

	/** Leaves game and finishes processing. */
	async leaveGameAsync(): Promise<any> {
		this.joinInfo = null;
		this.completed = true;
	}
}