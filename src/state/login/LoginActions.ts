export const enum LoginActionTypes {
	LoginStart = 'LOGIN_START',
	LoginEnd = 'LOGIN_END',
	LogOut = 'LOG_OUT',
}

export type LoginStartAction = { type: LoginActionTypes.LoginStart };
export type LoginEndAction = { type: LoginActionTypes.LoginEnd, error: string | null };
export type LogOutAction = { type: LoginActionTypes.LogOut };

export type KnownLoginAction = LoginStartAction | LoginEndAction | LogOutAction;