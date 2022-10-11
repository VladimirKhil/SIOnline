import TimerStates from './enums/TimeStates';

/** Defines a timer. */
export default interface TimerInfo {
	/** Timer state. */
	state: TimerStates;

	/** Is timer paused by the game. */
	isPausedBySystem: boolean;

	/** Is timer paused by the host/showman. */
	isPausedByUser: boolean;

	/** Current timer value. */
	value: number;
	
	/** Maximum timer value. */
	maximum: number;
}
