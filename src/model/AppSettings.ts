import TimeSettings from './server/TimeSettings';

export default interface AppSettings {
	oral: boolean;
	falseStart: boolean;
	hintShowman: boolean;
	partialText: boolean;
	readingSpeed: number;
	ignoreWrong: boolean;
	managed: boolean;
	timeSettings: TimeSettings;
}
