/** Defines a computer player's pass and all-in behavior. */
export default interface RiskSettings {
	passOnFirstCategoryProbability: number;
	passOnLastCategoryProbability: number;
	allInOnFirstCategoryProbability: number;
	allInOnLastCategoryProbability: number;
}
