import ButtonPressMode from '../../model/ButtonPressMode';
import TimeSettings from '../../model/TimeSettings';
import Sex from '../../model/enums/Sex';

export const enum SettingsActionTypes {
	SoundVolumeChanged = 'SOUND_VOLUME_CHANGED',
	SoundChanged = 'SOUND_CHANGED',
	AppSoundChanged = 'APP_SOUND_CHANGED',
	MainMenusSoundChanged = 'MAIN_MENU_SOUND_CHANGED',
	ShowPersonsAtBottomOnWideScreenChanged = 'SHOW_PERSONS_AT_BOTTOM_ON_WIDE_SCREEN',
	SexChanged = 'SEX_CHANGED',
	AvatarKeyChanged = 'AVATAR_KEY_CHANGED',
	OralChanged = 'ORAL_CHANGED',
	FalseStartsChanged = 'FALSE_STARTS_CHANGED',
	HintShowmanChanged = 'HINT_SHOWMAN_CHANGED',
	PartialTextChanged = 'PARTIAL_TEXT_CHANGED',
	ReadingSpeedChanged = 'READING_SPEED_CHANGED',
	ManagedChanged = 'MANAGED_CHANGED',
	UseApellationsChanged = 'USE_APELLATIONS_CHANGED',
	IgnoreWrongChanged = 'IGNORE_WRONG_CHANGED',
	UsePingPenaltyChanged = 'USE_PING_PENALTY_CHANGED',
	ButtonPressModeChanged = 'BUTTON_PRESS_MODE_CHANGED',
	PreloadRoundContentChanged = 'PRELOAD_DOUND_CONTENT_CHANGED',
	TimeSettingChanged = 'TIME_SETTING_CHANGED',
	ResetSettings = 'RESET_SETTINGS',
	LanguageChanged = 'LANGUAGE_CHANGED',
	GameButtonKeyChanged = 'GAME_BUTTON_KEY_CHANGED',
	LobbyChatVisibilityChanged = 'LOBBY_CHAT_VISIBILITY_CHANGED',
	ValidationAnswersVisibilityChanged = 'VALIDATION_ANSWERS_VISIBILITY_CHANGED',
	PlayAllQuestionsInFinalRoundChanged = 'PLAY_ALL_QUESTIONS_IN_FINAL_ROUND_CHANGED',
	OralPlayersActionsChanged = 'ORAL_PLAYERS_ACTIONS_CHANGED',
	AllowEveryoneToPlayHiddenStakesChanged = 'ALLOW_EVERYONE_TO_PLAY_HIDDEN_STAKES_CHANGED',
	DisplaySourcesChanged = 'DISPLAY_SOURCES_CHANGED',
	FloatingControlsChanged = 'FLOATING_CONTROLS_CHANGED',
	BindNextButtonChanged = 'BIND_NEXT_BUTTON_CHANGED',
	AttachContentToTableChanged = 'ATTACH_CONTENT_TO_TABLE_CHANGED',
	ShowVideoAvatarsChanged = 'SHOW_VIDEO_AVATARS_CHANGED',
}

export type SoundVolumeChangeAction = { type: SettingsActionTypes.SoundVolumeChanged; volume: number };
export type SoundChangedAction = { type: SettingsActionTypes.SoundChanged; sound: boolean };
export type AppSoundChangedAction = { type: SettingsActionTypes.AppSoundChanged; sound: boolean };
export type MainMenuSoundChangedAction = { type: SettingsActionTypes.MainMenusSoundChanged; sound: boolean };

export type ShowPersonsAtBottomOnWideScreenChangedAction = {
	type: SettingsActionTypes.ShowPersonsAtBottomOnWideScreenChanged;
	showPersonsAtBottomOnWideScreen: boolean;
};

export type SexChangedAction = { type: SettingsActionTypes.SexChanged; newSex: Sex };
export type AvatarKeyChangedAction = { type: SettingsActionTypes.AvatarKeyChanged; avatarKey: string | null };
export type FalseStartsChangedAction = { type: SettingsActionTypes.FalseStartsChanged; falseStarts: boolean };
export type OralChangedAction = { type: SettingsActionTypes.OralChanged; oral: boolean };
export type HintShowmanChangedAction = { type: SettingsActionTypes.HintShowmanChanged; hintShowman: boolean };
export type PartialTextChangedAction = { type: SettingsActionTypes.PartialTextChanged; partialText: boolean };
export type ReadingSpeedChangedAction = { type: SettingsActionTypes.ReadingSpeedChanged; readingSpeed: number };
export type ManagedChangedAction = { type: SettingsActionTypes.ManagedChanged; managed: boolean };
export type UseApellationsChangedAction = { type: SettingsActionTypes.UseApellationsChanged; useApellations: boolean };
export type IgnoreWrongChangedAction = { type: SettingsActionTypes.IgnoreWrongChanged; ignoreWrong: boolean };
export type UsePingPenaltyChangedAction = { type: SettingsActionTypes.UsePingPenaltyChanged; usePingPenalty: boolean };
export type ButtonPressModeChangedAction = { type: SettingsActionTypes.ButtonPressModeChanged; buttonPressMode: ButtonPressMode };
export type PreloadRoundContentChangedAction = { type: SettingsActionTypes.PreloadRoundContentChanged; preloadRoundContent: boolean };

export type TimeSettingChangedAction = {
	type: SettingsActionTypes.TimeSettingChanged;
	name: keyof TimeSettings;
	value: number;
};

export type ResetSettingsAction = { type: SettingsActionTypes.ResetSettings };
export type LanguageChangedAction = { type: SettingsActionTypes.LanguageChanged, language: string | null };
export type GameButtonKeyChangedAction = { type: SettingsActionTypes.GameButtonKeyChanged, gameButtonKey: string | null };
export type LobbyChatVisibilityChangedAction = { type: SettingsActionTypes.LobbyChatVisibilityChanged, isLobbyChatVisible: boolean };

export type ValidationAnswersVisibilityChangedAction = {
	type: SettingsActionTypes.ValidationAnswersVisibilityChanged,
	validationAnswersVisible: boolean
};

export type PlayAllQuestionsInFinalRoundChangedAction = {
	type: SettingsActionTypes.PlayAllQuestionsInFinalRoundChanged,
	playAllQuestionsInFinalRound: boolean
};

export type OralPlayersActionsChangedAction = { type: SettingsActionTypes.OralPlayersActionsChanged, oralPlayersActions: boolean };

export type AllowEveryoneToPlayHiddenStakesChangedAction = {
	type: SettingsActionTypes.AllowEveryoneToPlayHiddenStakesChanged,
	allowEveryoneToPlayHiddenStakes: boolean
};

export type DisplaySourcesChangedAction = { type: SettingsActionTypes.DisplaySourcesChanged, displaySources: boolean };
export type FloatingControlsChangedAction = { type: SettingsActionTypes.FloatingControlsChanged, float: boolean };
export type BindNextButtonChangedAction = { type: SettingsActionTypes.BindNextButtonChanged, bindNextButton: boolean };
export type AttachContentToTableChangedAction = { type: SettingsActionTypes.AttachContentToTableChanged, attachContentToTable: boolean };
export type ShowVideoAvatarsChangedAction = { type: SettingsActionTypes.ShowVideoAvatarsChanged, showVideoAvatars: boolean };

export type KnownSettingsAction =
	| SoundVolumeChangeAction
	| SoundChangedAction
	| AppSoundChangedAction
	| MainMenuSoundChangedAction
	| ShowPersonsAtBottomOnWideScreenChangedAction
	| SexChangedAction
	| AvatarKeyChangedAction
	| OralChangedAction
	| FalseStartsChangedAction
	| PartialTextChangedAction
	| ReadingSpeedChangedAction
	| HintShowmanChangedAction
	| ManagedChangedAction
	| UseApellationsChangedAction
	| IgnoreWrongChangedAction
	| UsePingPenaltyChangedAction
	| ButtonPressModeChangedAction
	| PreloadRoundContentChangedAction
	| TimeSettingChangedAction
	| ResetSettingsAction
	| LanguageChangedAction
	| GameButtonKeyChangedAction
	| LobbyChatVisibilityChangedAction
	| ValidationAnswersVisibilityChangedAction
	| PlayAllQuestionsInFinalRoundChangedAction
	| OralPlayersActionsChangedAction
	| AllowEveryoneToPlayHiddenStakesChangedAction
	| DisplaySourcesChangedAction
	| FloatingControlsChangedAction
	| BindNextButtonChangedAction
	| AttachContentToTableChangedAction
	| ShowVideoAvatarsChangedAction;
