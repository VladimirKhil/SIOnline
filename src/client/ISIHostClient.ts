import JoinGameRequest from './contracts/JoinGameRequest';
import JoinGameResponse from './contracts/JoinGameResponse';

export default interface ISIHostClient {
	/**
	 * Joins an existsing game.
	 */
	joinGameAsync(joinGameRequest: JoinGameRequest): Promise<JoinGameResponse>;

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

	/** Reconnects to server after re-establishing connection. */
	reconnectAsync(): Promise<any>;
}