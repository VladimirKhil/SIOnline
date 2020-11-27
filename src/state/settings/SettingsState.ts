import Sex from '../../model/enums/Sex';
import AppSettings from '../../model/AppSettings';

export default interface SettingsState {
	isSoundEnabled: boolean;
	showPersonsAtBottomOnWideScreen: boolean;
	sex: Sex;
	appSettings: AppSettings;
}

export const initialState: SettingsState = {
	isSoundEnabled: false,
	showPersonsAtBottomOnWideScreen: true,
	sex: Sex.Male,
	appSettings: {
		oral: false,
		falseStart: true,
		hintShowman: false
	}
};
