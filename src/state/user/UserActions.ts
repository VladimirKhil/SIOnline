export const enum UserActionTypes {
	LoginChanged = 'LOGIN_CHANGED',
	AvatarChanged = 'AVATAR_CHANGED',
}

export type LoginChangedAction = { type: UserActionTypes.LoginChanged, newLogin: string };
export type AvatarChangedAction = { type: UserActionTypes.AvatarChanged, avatar: string };

export type KnownUserAction = LoginChangedAction | AvatarChangedAction;