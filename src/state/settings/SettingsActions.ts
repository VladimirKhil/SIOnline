export const enum SettingsActionTypes {
	IsSoundEnabledChanged = 'IS_SOUND_ENABLED_CHANGED'
}

export type IsSoundEnabledChangedAction = { type: SettingsActionTypes.IsSoundEnabledChanged, isSoundEnabled: boolean };

export type KnownSettingsAction =
	IsSoundEnabledChangedAction
;
