import JoinMode from './JoinMode';

/** Defines a high level game client built over IGameServerClient layer. */
export default interface IGameClient {
	info(): Promise<boolean>;

	markQuestion(): Promise<boolean>;

	/** Notifies that the client has loaded the media. */
	mediaLoaded(): Promise<boolean>;

	moveable(): Promise<boolean>;

	pass(): Promise<boolean>;

	pause(enable: boolean): Promise<boolean>;

	pressButton(deltaTime: number): Promise<boolean>;

	ready(): Promise<boolean>;

	/** Sends answer version. */
	sendAnswerVersion(answerVersion: string): Promise<boolean>;

	sendAvatar(avatarUri: string): Promise<boolean>;

	/** Gives turn to player. */
	setChooser(playerIndex: number): Promise<boolean>;

	/** Sets person as host. */
	setHost(personName: string): Promise<boolean>;

	/** Sets game join mode. */
	setJoinMode(joinMode: JoinMode): Promise<boolean>;

	/** Toggles (removes or restores) a question on game table. */
	toggle(themeIndex: number, questionIndex: number): Promise<boolean>;

	/** Sends command to unban the person by IP. */
	unban(ip: string): Promise<boolean>;
}