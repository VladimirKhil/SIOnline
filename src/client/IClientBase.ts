export default interface IClientBase {
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

	/** Leaves running game. */
	leaveGameAsync(): Promise<any>;
}