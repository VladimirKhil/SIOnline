import * as SettingsActions from './SettingsActions';
import { ActionCreator } from 'redux';
import Sex from '../../model/enums/Sex';
import TimeSettings from '../../client/contracts/TimeSettings';

const onSoundVolumeChanged: ActionCreator<SettingsActions.SoundVolumeChangeAction> = (volume: number) => ({
	type: SettingsActions.SettingsActionTypes.SoundVolumeChanged,
	volume
});

const onSoundChanged: ActionCreator<SettingsActions.SoundChangedAction> = (sound: boolean) => ({
	type: SettingsActions.SettingsActionTypes.SoundChanged,
	sound
});

const onMainMenuSoundChanged: ActionCreator<SettingsActions.MainMenuSoundChangedAction> = (sound: boolean) => ({
	type: SettingsActions.SettingsActionTypes.MainMenusSoundChanged,
	sound
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

const onAvatarKeyChanged: ActionCreator<SettingsActions.AvatarKeyChangedAction> = (avatarKey: string | null) => ({
	type: SettingsActions.SettingsActionTypes.AvatarKeyChanged,
	avatarKey
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

const onUseApellationsChanged: ActionCreator<SettingsActions.UseApellationsChangedAction> = (useApellations: boolean) => ({
	type: SettingsActions.SettingsActionTypes.UseApellationsChanged,
	useApellations
});

const onIgnoreWrongChanged: ActionCreator<SettingsActions.IgnoreWrongChangedAction> = (ignoreWrong: boolean) => ({
	type: SettingsActions.SettingsActionTypes.IgnoreWrongChanged,
	ignoreWrong
});

const onUsePingPenaltyChanged: ActionCreator<SettingsActions.UsePingPenaltyChangedAction> = (usePingPenalty: boolean) => ({
	type: SettingsActions.SettingsActionTypes.UsePingPenaltyChanged,
	usePingPenalty
});

const onPreloadRoundContentChanged: ActionCreator<SettingsActions.PreloadRoundContentChangedAction> = (preloadRoundContent: boolean) => ({
	type: SettingsActions.SettingsActionTypes.PreloadRoundContentChanged,
	preloadRoundContent
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

const gameButtonKeyChanged: ActionCreator<SettingsActions.GameButtonKeyChangedAction> = (gameButtonKey: string | null) => ({
	type: SettingsActions.SettingsActionTypes.GameButtonKeyChanged, gameButtonKey
});

const onLobbyChatVisibilityChanged: ActionCreator<SettingsActions.LobbyChatVisibilityChangedAction> = (isLobbyChatVisible: boolean) => ({
	type: SettingsActions.SettingsActionTypes.LobbyChatVisibilityChanged, isLobbyChatVisible
});

const onValidationAnswersVisibilityChanged: ActionCreator<SettingsActions.ValidationAnswersVisibilityChangedAction> = (
	validationAnswersVisible: boolean) => ({
	type: SettingsActions.SettingsActionTypes.ValidationAnswersVisibilityChanged, validationAnswersVisible
});

const settingsActionCreators = {
	onSoundVolumeChanged,
	onSoundChanged,
	onMainMenuSoundChanged,
	showPersonsAtBottomOnWideScreenChanged,
	onSexChanged,
	onAvatarKeyChanged,
	onOralChanged,
	onFalseStartsChanged,
	onHintShowmanChanged,
	onPartialTextChanged,
	onReadingSpeedChanged,
	onManagedChanged,
	onUseApellationsChanged,
	onIgnoreWrongChanged,
	onUsePingPenaltyChanged,
	onPreloadRoundContentChanged,
	onTimeSettingChanged,
	resetSettings,
	languageChanged,
	gameButtonKeyChanged,
	onLobbyChatVisibilityChanged,
	onValidationAnswersVisibilityChanged,
};

export default settingsActionCreators;
