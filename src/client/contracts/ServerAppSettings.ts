import ButtonPressMode from '../../model/ButtonPressMode';
import PenaltyType from '../../model/enums/PenaltyType';
import GameType from '../../model/GameType';
import ServerTimeSettings from './ServerTimeSettings';

/** Defines game rules. */
export default interface ServerAppSettings {
	timeSettings: ServerTimeSettings;
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

	managed: boolean;

	/** Question with button penalty. */
	questionWithButtonPenalty: PenaltyType;

	/** Question for yourself penalty. */
	questionForYourselfPenalty: PenaltyType;

	/** Question for yourself factor. */
	questionForYourselfFactor: number;

	/** Question for all penalty. */
	questionForAllPenalty: PenaltyType;

	/** Display package items sources. */
	displaySources: boolean;

	gameMode: GameType;
	randomQuestionsBasePrice: number;
	randomRoundsCount: number;
	randomThemesCount: number;
	culture: string;

	/** Button press mode. */
	buttonPressMode: ButtonPressMode;

	preloadRoundContent: boolean;
	useApellations: boolean;

	displayAnswerOptionsLabels: boolean;
	displayAnswerOptionsOneByOne: boolean;
}
