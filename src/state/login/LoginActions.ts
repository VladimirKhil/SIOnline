export const enum LoginActionTypes {
	LoginStart = 'LOGIN_START',
	LoginEnd = 'LOGIN_END',
}

export type LoginStartAction = { type: LoginActionTypes.LoginStart };
export type LoginEndAction = { type: LoginActionTypes.LoginEnd, error: string | null };

export type KnownLoginAction = LoginStartAction | LoginEndAction;