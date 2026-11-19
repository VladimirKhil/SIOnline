/** Defines how a computer player chooses a question. */
export default interface QuestionChoiceSettings {
	cheaperProbability: number;
	moreExpensiveProbability: number;
	samePriceProbability: number;
	byPriorityProbability: number;
	priority: number[];
}
