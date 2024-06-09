/** Defines well-known button press handler modes. */
const enum ButtonPressMode {
	/** Select winner randomly from all pressers withing an interval. */
	RandomWithinInterval = 0,

	/** First to press wins the button. */
	FirstWins = 1,

	/** First to press wins the button. Reaction value is calculated on the client side. */
	FirstWinsClient = 2,
}

export default ButtonPressMode;
