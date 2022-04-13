import TimeSettings from './server/TimeSettings';

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
}
