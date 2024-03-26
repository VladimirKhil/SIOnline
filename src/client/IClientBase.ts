export default interface IClientBase {
	/**
	 * Sends a message inside game.
	 * @param args Arguments to construct a message.
	 * @returns The success status of sending operation.
	 */
	msgAsync(...args: any[]): Promise<boolean>;
}