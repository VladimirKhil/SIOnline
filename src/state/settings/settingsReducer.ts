import SettingsState, { initialState } from './SettingsState';
import { AnyAction, Reducer } from 'redux';
import { KnownSettingsAction, SettingsActionTypes } from './SettingsActions';

const settingsReducer: Reducer<SettingsState> = (state: SettingsState = initialState, anyAction: AnyAction): SettingsState => {
	const action = anyAction as KnownSettingsAction;

	switch (action.type) {
		case SettingsActionTypes.IsSoundEnabledChanged:
			return {
				...state,
				isSoundEnabled: action.isSoundEnabled
			};

		case SettingsActionTypes.ShowPersonsAtBottomOnWideScreenChanged:
			return {
				...state,
				showPersonsAtBottomOnWideScreen: action.showPersonsAtBottomOnWideScreen
			};

		case SettingsActionTypes.SexChanged:
			return {
				...state,
				sex: action.newSex
			};

		case SettingsActionTypes.OralChanged:
			return {
				...state,
				appSettings: {
					...state.appSettings,
					oral: action.oral
				}
			};

		case SettingsActionTypes.FalseStartsChanged:
			return {
				...state,
				appSettings: {
					...state.appSettings,
					falseStart: action.falseStarts
				}
			};

		case SettingsActionTypes.HintShowmanChanged:
			return {
				...state,
				appSettings: {
					...state.appSettings,
					hintShowman: action.hintShowman
				}
			};
		
		case SettingsActionTypes.TimeSettingChanged:
			return {
				...state,
				appSettings: {
					...state.appSettings,
					timeSettings: {
						...state.appSettings.timeSettings,
						[action.name]: action.value
					}
				}
			};

		case SettingsActionTypes.ResetSettings:
			return initialState;

		default:
			return state;
	}
};

export default settingsReducer;
