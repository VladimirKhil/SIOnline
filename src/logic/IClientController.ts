import PlayerStates from '../model/enums/PlayerStates';
import StakeTypes from '../model/enums/StakeTypes';

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
	 * @param stakeType - The type of the stake (e.g., normal, pass, all-in)
	 * @param stake - The stake amount
	 */
	onSinglePlayerStakeChanged(playerIndex: number, stakeType: StakeTypes, stake: number): void;
}
