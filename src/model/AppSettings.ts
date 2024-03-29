import ButtonPressMode from './ButtonPressMode';
import TimeSettings from './TimeSettings';

export default interface AppSettings {
	readingSpeed: number;
	falseStart: boolean;
	hintShowman: boolean;
	partialText: boolean;

	/** Play all questions in final round. */
	playAllQuestionsInFinalRound: boolean;

	/** Allow all players to play hidden stakes question. */
	allowEveryoneToPlayHiddenStakes: boolean;

	oral: boolean;

	/** Oral players actions game flag. */
	oralPlayersActions: boolean;

	ignoreWrong: boolean;

	/** Display package items sources. */
	displaySources: boolean;

	culture: string | null;
	managed: boolean;
	timeSettings: TimeSettings;
	usePingPenalty: boolean;

	/** Button press mode. */
	buttonPressMode: ButtonPressMode;

	preloadRoundContent: boolean;
	useApellations: boolean;
}
