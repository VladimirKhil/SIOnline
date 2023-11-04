/** Defines game time settings. */
export default interface ServerTimeSettings {
	TimeForChoosingQuestion: number;
	TimeForThinkingOnQuestion: number;
	TimeForPrintingAnswer: number;
	TimeForGivingACat: number;
	TimeForMakingStake: number;
	TimeForThinkingOnSpecial: number;
	TimeOfRound: number;
	TimeForChoosingFinalTheme: number;
	TimeForFinalThinking: number;
	TimeForShowmanDecisions: number;
	TimeForRightAnswer: number;
	TimeForMediaDelay: number;
	TimeForBlockingButton: number;
}
