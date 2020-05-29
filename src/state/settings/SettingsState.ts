import Sex from '../../model/enums/Sex';

export default interface SettingsState {
	isSoundEnabled: boolean;
	showPersonsAtBottomOnWideScreen: boolean;
	sex: Sex;
}

export const initialState: SettingsState = {
	isSoundEnabled: false,
	showPersonsAtBottomOnWideScreen: true,
	sex: Sex.Male
};
