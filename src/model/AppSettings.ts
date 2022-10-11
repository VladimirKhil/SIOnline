import TimeSettings from '../client/contracts/TimeSettings';

export default interface AppSettings {
	culture: string | null;
	oral: boolean;
	falseStart: boolean;
	hintShowman: boolean;
	partialText: boolean;
	readingSpeed: number;
	ignoreWrong: boolean;
	managed: boolean;
	timeSettings: TimeSettings;
	usePingPenalty: boolean;
	preloadRoundContent: boolean;
	useApellations: boolean;
}
