import IClientBase from './IClientBase';
import ISIHostClient from './ISIHostClient';
import JoinGameRequest from './contracts/JoinGameRequest';
import JoinGameResponse from './contracts/JoinGameResponse';

export default class SIHostClient implements ISIHostClient, IClientBase {
	private joinInfo: JoinGameRequest | null = null;

	/**
	 * Initializes a new instance of {@link SIHostClient}.
	 * @param connection Underlying SignalR connection.
	 * @param errorHandler General error handler.
	 */
	constructor(private connection: signalR.HubConnection, private errorHandler: (error: any) => void) { }

	async joinGameAsync(joinGameRequest: JoinGameRequest): Promise<JoinGameResponse> {
		const result = await this.connection.invoke<JoinGameResponse>('JoinGame', joinGameRequest);

		if (result.isSuccess) {
			this.joinInfo = joinGameRequest;
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

	async reconnectAsync(): Promise<any> {
		if (this.joinInfo) {
			await this.joinGameAsync(this.joinInfo);
		}
	}

	/** Leaves game and returns to lobby. */
	async leaveGameAsync(): Promise<any> {
		this.joinInfo = null;
	}
}