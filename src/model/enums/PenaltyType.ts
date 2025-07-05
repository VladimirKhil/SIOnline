/** Defines types of penalties for giving wrong answers. */
const enum PenaltyType {
	/** No penalty applied (question without risk). */
	None,

	/** Subtract points from the player for giving a wrong answer. */
	SubtractPoints,
}

export default PenaltyType;