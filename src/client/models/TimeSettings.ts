/** Defines game time settings in seconds, except buttonsAccepting (milliseconds). */
export default interface TimeSettings {
	questionSelection: number;
	themeSelection: number;
	playerSelection: number;
	buttonPressing: number;
	buttonsAccepting: number;
	answering: number;
	soloAnswering: number;
	hiddenAnswering: number;
	stakeMaking: number;
	showmanDecision: number;
	round: number;
	buttonBlocking: number;
	reflection: number;
	image: number;
	partialImage: number;
	appellation: number;
}
