export default interface PlayerStatistics {
	name: string;
	rightAnswerCount: number;
	wrongAnswerCount: number;
	rightTotal: number;
	wrongTotal: number;
	currentScore?: number; // Current player score (optional, may not exist for some players)
}
