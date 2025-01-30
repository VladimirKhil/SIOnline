/** Defines game time settings. */
export default interface ServerTimeSettings {
	timeForChoosingQuestion: number;
	timeForThinkingOnQuestion: number;
	timeForPrintingAnswer: number;
	timeForGivingACat: number;
	timeForMakingStake: number;
	timeForThinkingOnSpecial: number;
	timeOfRound: number;
	timeForChoosingFinalTheme: number;
	timeForFinalThinking: number;
	timeForShowmanDecisions: number;
	timeForRightAnswer: number;
	timeForMediaDelay: number;
	timeForBlockingButton: number;
	partialImageTime: number;
	imageTime: number;
}
