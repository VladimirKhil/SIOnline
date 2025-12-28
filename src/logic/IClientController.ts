import PlayerStates from '../model/enums/PlayerStates';

/**
 * Interface for ClientController that handles game messages and state updates.
 * This interface defines the contract for processing various game events and messages.
 */
export default interface IClientController {
	/**
	 * Handles a chat message from a user
	 * @param sender - The name of the message sender
	 * @param text - The message text
	 */
	onMessage(sender: string, text: string): void;

	/**
	 * Handles a single player state change
	 * @param playerIndex - The index of the player
	 * @param state - The new state of the player
	 */
	onSinglePlayerStateChanged(playerIndex: number, state: PlayerStates): void;

	/**
	 * Handles a single player stake change
	 * @param playerIndex - The index of the player
	 * @param stake - The stake amount
	 */
	onSinglePlayerStakeChanged(playerIndex: number, stake: number): void;
}
