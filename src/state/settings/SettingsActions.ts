import Sex from '../../model/enums/Sex';

export const enum SettingsActionTypes {
	IsSoundEnabledChanged = 'IS_SOUND_ENABLED_CHANGED',
	ShowPersonsAtBottomOnWideScreenChanged = 'SHOW_PERSONS_AT_BOTTOM_ON_WIDE_SCREEN',
	SexChanged = 'SEX_CHANGED',
	OralChanged = 'ORAL_CHANGED',
	FalseStartsChanged = 'FALSE_STARTS_CHANGED',
	HintShowmanChanged = 'HINT_SHOWMAN_CHANGED'
}

export type IsSoundEnabledChangedAction = { type: SettingsActionTypes.IsSoundEnabledChanged, isSoundEnabled: boolean };
export type ShowPersonsAtBottomOnWideScreenChangedAction = {
	type: SettingsActionTypes.ShowPersonsAtBottomOnWideScreenChanged,
	showPersonsAtBottomOnWideScreen: boolean
};
export type SexChangedAction = { type: SettingsActionTypes.SexChanged, newSex: Sex };
export type FalseStartsChangedAction = { type: SettingsActionTypes.FalseStartsChanged, falseStarts: boolean };
export type OralChangedAction = { type: SettingsActionTypes.OralChanged, oral: boolean };
export type HintShowmanChangedAction = { type: SettingsActionTypes.HintShowmanChanged, hintShowman: boolean };

export type KnownSettingsAction =
	IsSoundEnabledChangedAction
	| ShowPersonsAtBottomOnWideScreenChangedAction
	| SexChangedAction
	| OralChangedAction
	| FalseStartsChangedAction
	| HintShowmanChangedAction
;
