import * as SettingsActions from './SettingsActions';
import { ActionCreator } from 'redux';

const isSoundEnabledChanged: ActionCreator<SettingsActions.IsSoundEnabledChangedAction> = (isSoundEnabled: boolean) => ({
	type: SettingsActions.SettingsActionTypes.IsSoundEnabledChanged, isSoundEnabled
});

const settingsActionCreators = {
	isSoundEnabledChanged
};

export default settingsActionCreators;
