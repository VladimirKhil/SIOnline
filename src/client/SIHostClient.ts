import IClientBase from './IClientBase';
import ISIHostClient from './ISIHostClient';
import GameInfo from './contracts/GameInfo';
import JoinGameRequest from './contracts/JoinGameRequest';
import JoinGameResponse from './contracts/JoinGameResponse';

export default class SIHostClient implements ISIHostClient, IClientBase {
	private joinInfo: JoinGameRequest | null = null;

	private completed = false;

	/**
	 * Initializes a new instance of {@link SIHostClient}.
	 * @param connection Underlying SignalR connection.
	 * @param errorHandler General error handler.
	 */
	constructor(public connection: signalR.HubConnection, private errorHandler: (error: any) => void) { }

	async tryGetGameInfoAsync(gameId: number): Promise<GameInfo | null> {
		const info = await this.connection.invoke<GameInfo | null>('TryGetGameInfo', gameId);
		return info;
	}

	async joinGameAsync(joinGameRequest: JoinGameRequest): Promise<JoinGameResponse> {
		const result = await this.connection.invoke<JoinGameResponse>('JoinGame', joinGameRequest);

		if (result.IsSuccess) {
			this.joinInfo = joinGameRequest;
		}

		return result;
	}

	async sendMessageToServerAsync(message: string): Promise<boolean> {
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
				this.errorHandler(e);
			}

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
			Sender: this.joinInfo?.UserName,
			Receiver: '*'
		});
	}

	async reconnectAsync(): Promise<any> {
		if (this.joinInfo) {
			await this.joinGameAsync(this.joinInfo);
		}
	}

	/** Leaves game and finishes processing. */
	async leaveGameAsync(): Promise<any> {
		this.joinInfo = null;
		this.completed = true;
	}
}