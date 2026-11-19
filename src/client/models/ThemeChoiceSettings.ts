/** Defines how a computer player chooses a theme. */
export default interface ThemeChoiceSettings {
	byNumberProbability: number;
	sameThemeProbability: number;
	byPriorityProbability: number;
	priority: number[];
}
