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
	}

	return state;
};

export default settingsReducer;
