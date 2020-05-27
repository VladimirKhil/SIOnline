import Sex from '../../model/enums/Sex';

export const enum SettingsActionTypes {
	IsSoundEnabledChanged = 'IS_SOUND_ENABLED_CHANGED',
	SexChanged = 'SEX_CHANGED'
}

export type IsSoundEnabledChangedAction = { type: SettingsActionTypes.IsSoundEnabledChanged, isSoundEnabled: boolean };
export type SexChangedAction = { type: SettingsActionTypes.SexChanged, newSex: Sex };

export type KnownSettingsAction =
	IsSoundEnabledChangedAction
	| SexChangedAction
;
