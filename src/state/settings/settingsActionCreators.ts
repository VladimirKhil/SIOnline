import * as SettingsActions from './SettingsActions';
import { ActionCreator } from 'redux';
import Sex from '../../model/enums/Sex';
import TimeSettings from '../../model/server/TimeSettings';

const isSoundEnabledChanged: ActionCreator<SettingsActions.IsSoundEnabledChangedAction> = (isSoundEnabled: boolean) => ({
	type: SettingsActions.SettingsActionTypes.IsSoundEnabledChanged, isSoundEnabled
});

const showPersonsAtBottomOnWideScreenChanged: ActionCreator<SettingsActions.ShowPersonsAtBottomOnWideScreenChangedAction> = 
	(showPersonsAtBottomOnWideScreen: boolean) => ({
	type: SettingsActions.SettingsActionTypes.ShowPersonsAtBottomOnWideScreenChanged, showPersonsAtBottomOnWideScreen
});

const onSexChanged: ActionCreator<SettingsActions.SexChangedAction> = (newSex: Sex) => ({
	type: SettingsActions.SettingsActionTypes.SexChanged, newSex
});

const onOralChanged: ActionCreator<SettingsActions.OralChangedAction> = (oral: boolean) => ({
	type: SettingsActions.SettingsActionTypes.OralChanged, oral
});

const onFalseStartsChanged: ActionCreator<SettingsActions.FalseStartsChangedAction> = (falseStarts: boolean) => ({
	type: SettingsActions.SettingsActionTypes.FalseStartsChanged, falseStarts
});

const onHintShowmanChanged: ActionCreator<SettingsActions.HintShowmanChangedAction> = (hintShowman: boolean) => ({
	type: SettingsActions.SettingsActionTypes.HintShowmanChanged, hintShowman
});

const onTimeSettingChanged: ActionCreator<SettingsActions.TimeSettingChangedAction> = (name: keyof(TimeSettings), value: number) => ({
	type: SettingsActions.SettingsActionTypes.TimeSettingChanged, name, value
});

const resetSettings: ActionCreator<SettingsActions.ResetSettingsAction> = () => ({
	type: SettingsActions.SettingsActionTypes.ResetSettings
});

const settingsActionCreators = {
	isSoundEnabledChanged,
	showPersonsAtBottomOnWideScreenChanged,
	onSexChanged,
	onOralChanged,
	onFalseStartsChanged,
	onHintShowmanChanged,
	onTimeSettingChanged,
	resetSettings
};

export default settingsActionCreators;
