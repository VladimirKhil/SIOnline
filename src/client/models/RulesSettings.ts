import ButtonPressMode from '../../model/ButtonPressMode';
import PenaltyType from '../../model/enums/PenaltyType';
import GameMode from './enums/GameMode';

/** Defines game rules settings. */
export default interface RulesSettings {
	readingSpeed: number;
	falseStart: boolean;
	partialText: boolean;
	partialImages: boolean;
	hideImageOnAnswerAndPause: boolean;
	playAllThemesInThemesRemovalRound: boolean;
	allowEveryoneToPlayHiddenStakes: boolean;
	oral: boolean;
	oralPlayersActions: boolean;
	managed: boolean;
	questionWithButtonPenalty: PenaltyType;
	questionForYourselfPenalty: PenaltyType;
	questionForAllPenalty: PenaltyType;
	validateEqualAnswersSeparately: boolean;
	questionForYourselfFactor: number;
	buttonPressMode: ButtonPressMode;
	buttonsAcceptInterval: number;
	preloadRoundContent: boolean;
	gameMode: GameMode;
	useAppellations: boolean;
	displayAnswerOptionsOneByOne: boolean;
	displayAnswerOptionsLabels: boolean;
	prependThemeCommentsToQuestion: boolean;
	appendRightAnswerTextToComplexAnswer: boolean;
}
