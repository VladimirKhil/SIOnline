import Sex from '../../model/enums/Sex';

export default interface SettingsState {
	isSoundEnabled: boolean;
	sex: Sex;
}

export const initialState: SettingsState = {
	isSoundEnabled: false,
	sex: Sex.Male
};
