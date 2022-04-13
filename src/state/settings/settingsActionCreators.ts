import * as SettingsActions from './SettingsActions';
import { ActionCreator } from 'redux';
import Sex from '../../model/enums/Sex';
import TimeSettings from '../../model/server/TimeSettings';

const onSoundVolumeChanged: ActionCreator<SettingsActions.SoundVolumeChangeAction> = (volume: number) => ({
	type: SettingsActions.SettingsActionTypes.SoundVolumeChanged,
	volume
});

const showPersonsAtBottomOnWideScreenChanged: ActionCreator<
	SettingsActions.ShowPersonsAtBottomOnWideScreenChangedAction
> = (showPersonsAtBottomOnWideScreen: boolean) => ({
	type: SettingsActions.SettingsActionTypes.ShowPersonsAtBottomOnWideScreenChanged,
	showPersonsAtBottomOnWideScreen
});

const onSexChanged: ActionCreator<SettingsActions.SexChangedAction> = (newSex: Sex) => ({
	type: SettingsActions.SettingsActionTypes.SexChanged,
	newSex
});

const onOralChanged: ActionCreator<SettingsActions.OralChangedAction> = (oral: boolean) => ({
	type: SettingsActions.SettingsActionTypes.OralChanged,
	oral
});

const onFalseStartsChanged: ActionCreator<SettingsActions.FalseStartsChangedAction> = (falseStarts: boolean) => ({
	type: SettingsActions.SettingsActionTypes.FalseStartsChanged,
	falseStarts
});

const onHintShowmanChanged: ActionCreator<SettingsActions.HintShowmanChangedAction> = (hintShowman: boolean) => ({
	type: SettingsActions.SettingsActionTypes.HintShowmanChanged,
	hintShowman
});

const onPartialTextChanged: ActionCreator<SettingsActions.PartialTextChangedAction> = (partialText: boolean) => ({
	type: SettingsActions.SettingsActionTypes.PartialTextChanged,
	partialText
});

const onReadingSpeedChanged: ActionCreator<SettingsActions.ReadingSpeedChangedAction> = (readingSpeed: number) => ({
	type: SettingsActions.SettingsActionTypes.ReadingSpeedChanged,
	readingSpeed
});

const onManagedChanged: ActionCreator<SettingsActions.ManagedChangedAction> = (managed: boolean) => ({
	type: SettingsActions.SettingsActionTypes.ManagedChanged,
	managed
});

const onIgnoreWrongChanged: ActionCreator<SettingsActions.IgnoreWrongChangedAction> = (ignoreWrong: boolean) => ({
	type: SettingsActions.SettingsActionTypes.IgnoreWrongChanged,
	ignoreWrong
});

const onTimeSettingChanged: ActionCreator<SettingsActions.TimeSettingChangedAction> = (
	name: keyof TimeSettings,
	value: number
) => ({
	type: SettingsActions.SettingsActionTypes.TimeSettingChanged,
	name,
	value
});

const resetSettings: ActionCreator<SettingsActions.ResetSettingsAction> = () => ({
	type: SettingsActions.SettingsActionTypes.ResetSettings
});

const languageChanged: ActionCreator<SettingsActions.LanguageChangedAction> = (language: string | null) => ({
	type: SettingsActions.SettingsActionTypes.LanguageChanged, language
});

const settingsActionCreators = {
	onSoundVolumeChanged,
	showPersonsAtBottomOnWideScreenChanged,
	onSexChanged,
	onOralChanged,
	onFalseStartsChanged,
	onHintShowmanChanged,
	onPartialTextChanged,
	onReadingSpeedChanged,
	onManagedChanged,
	onIgnoreWrongChanged,
	onTimeSettingChanged,
	resetSettings,
	languageChanged,
};

export default settingsActionCreators;
