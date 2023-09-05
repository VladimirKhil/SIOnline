import TimeSettings from './TimeSettings';

export default interface ServerAppSettings {
	timeSettings: TimeSettings;
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
	managed: boolean;
	ignoreWrong: boolean;
	/** Display package items sources. */
	displaySources: boolean;
	gameMode: string;
	randomQuestionsBasePrice: number;
	randomRoundsCount: number;
	randomThemesCount: number;
	culture: string;
	usePingPenalty: boolean;
	preloadRoundContent: boolean;
	useApellations: boolean;
}
