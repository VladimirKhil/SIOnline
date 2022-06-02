import TimeSettings from './TimeSettings';

export default interface ServerAppSettings {
	timeSettings: TimeSettings;
	readingSpeed: number;
	falseStart: boolean;
	hintShowman: boolean;
	partialText: boolean;
	oral: boolean;
	managed: boolean;
	ignoreWrong: boolean;
	gameMode: string;
	randomQuestionsBasePrice: number;
	randomRoundsCount: number;
	randomThemesCount: number;
	culture: string;
}
