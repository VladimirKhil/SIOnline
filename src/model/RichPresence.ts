/** Describes what the user is currently doing. Desktop hosts publish it as Discord Rich Presence. */
export default interface RichPresence {
	/** Current activity outside of a room or package name in a room. */
	details?: string;

	/** Current game stage in a room. */
	state?: string;

	/** Unix time (in milliseconds) when the current activity has started. */
	startTimestamp?: number;

	/** Number of occupied player places in the current room. */
	partySize?: number;

	/** Total number of player places in the current room. */
	partyMax?: number;

	/** Link to the current room join screen. Other Discord users see it as a button. */
	joinUrl?: string;

	/** Text of the join button. */
	joinLabel?: string;
}
