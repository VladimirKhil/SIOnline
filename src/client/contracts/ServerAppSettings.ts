import ServerTimeSettings from './ServerTimeSettings';

/** Defines game rules. */
export default interface ServerAppSettings {
	TimeSettings: ServerTimeSettings;
	ReadingSpeed: number;
	FalseStart: boolean;
	HintShowman: boolean;
	PartialText: boolean;
	/** Play all questions in final round. */
	PlayAllQuestionsInFinalRound: boolean;
	/** Allow all players to play hidden stakes question. */
	AllowEveryoneToPlayHiddenStakes: boolean;
	Oral: boolean;
	/** Oral players actions game flag. */
	OralPlayersActions: boolean;
	Managed: boolean;
	IgnoreWrong: boolean;
	/** Display package items sources. */
	DisplaySources: boolean;
	GameMode: string;
	RandomQuestionsBasePrice: number;
	RandomRoundsCount: number;
	RandomThemesCount: number;
	Culture: string;
	UsePingPenalty: boolean;
	PreloadRoundContent: boolean;
	UseApellations: boolean;
}
