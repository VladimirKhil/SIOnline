import TimeSettings from './TimeSettings';

export default interface ServerAppSettings {
	TimeSettings: TimeSettings;
	ReadingSpeed: number;
	FalseStart: boolean;
	HintShowman: boolean;
	DefaultOral: boolean;
	IgnoreWrong: boolean;
	GameMode: string;
	RandomQuestionsBasePrice: number;
	RandomRoundsCount: number;
	RandomThemesCount: number;
	Culture: string;
}
