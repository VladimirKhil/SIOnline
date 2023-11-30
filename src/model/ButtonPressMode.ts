/** Defines well-known button press handler modes. */
const enum ButtonPressMode {
	/** Select winner randomly from all pressers withing an interval. */
	RandomWithinInterval = 0,

	/** First to press wins the button. */
	FirstWins = 1,

	/** Players with good ping get penalty. */
	UsePingPenalty = 2,
}

export default ButtonPressMode;
