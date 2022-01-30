import TimeSettings from './server/TimeSettings';

export default interface AppSettings {
	oral: boolean;
	falseStart: boolean;
	hintShowman: boolean;
	timeSettings: TimeSettings;
}
