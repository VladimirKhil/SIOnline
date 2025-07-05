import ButtonPressMode from './ButtonPressMode';
import PenaltyType from './enums/PenaltyType';
import TimeSettings from './TimeSettings';

export default interface AppSettings {
	readingSpeed: number;
	falseStart: boolean;
	hintShowman: boolean;
	partialText: boolean;
	partialImages: boolean;

	/** Play all questions in final round. */
	playAllQuestionsInFinalRound: boolean;

	/** Allow all players to play hidden stakes question. */
	allowEveryoneToPlayHiddenStakes: boolean;

	oral: boolean;

	/** Oral players actions game flag. */
	oralPlayersActions: boolean;

	/** Question with button penalty. */
	questionWithButtonPenalty: PenaltyType;

	/** Question for yourself penalty. */
	questionForYourselfPenalty: PenaltyType;

	/** Question for yourself factor. */
	questionForYourselfFactor: number;

	/** Question for all penalty. */
	questionForAllPenalty: PenaltyType;

	culture: string | null;
	managed: boolean;
	timeSettings: TimeSettings;

	/** Button press mode. */
	buttonPressMode: ButtonPressMode;

	preloadRoundContent: boolean;

	useApellations: boolean;

	displayAnswerOptionsOneByOne: boolean;

	displayAnswerOptionsLabels: boolean;
}

export const initialState: AppSettings = {
	culture: null,
	oral: false,
	oralPlayersActions: true,
	falseStart: true,
	hintShowman: false,
	partialText: false,
	partialImages: false,
	allowEveryoneToPlayHiddenStakes: true,
	playAllQuestionsInFinalRound: false,
	readingSpeed: 20,
	managed: false,
	questionWithButtonPenalty: PenaltyType.SubtractPoints,
	questionForYourselfPenalty: PenaltyType.None,
	questionForYourselfFactor: 2,
	questionForAllPenalty: PenaltyType.SubtractPoints,
	timeSettings: {
		timeForChoosingQuestion: 30,
		timeForThinkingOnQuestion: 5,
		timeForPrintingAnswer: 25,
		timeForGivingACat: 30,
		timeForMakingStake: 30,
		timeForThinkingOnSpecial: 25,
		timeOfRound: 3600,
		timeForChoosingFinalTheme: 30,
		timeForFinalThinking: 45,
		timeForShowmanDecisions: 30,
		timeForRightAnswer: 2,
		timeForBlockingButton: 3,
		partialImageTime: 3,
		imageTime: 5,
	},
	buttonPressMode: ButtonPressMode.RandomWithinInterval,
	preloadRoundContent: true,
	useApellations: true,
	displayAnswerOptionsLabels: true,
	displayAnswerOptionsOneByOne: true,
};
