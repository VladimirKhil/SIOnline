import IClientBase from '../IClientBase';
import JoinMode from './JoinMode';

/** Defines a high level game client built over IGameServerClient layer. */
export default interface IGameClient {
	gameServerClient: IClientBase;

	shouldClose: boolean;

	addTable(): Promise<boolean>;

	apellate(forRightAnswer: boolean): Promise<boolean>;

	approveAnswer(factor: number): Promise<boolean>;

	changeTableType(isShowman: boolean, tableIndex: number): Promise<boolean>;

	deleteTable(tableIndex: number): Promise<boolean>;

	deleteTheme(themeIndex: number): Promise<boolean>;

	freeTable(isShowman: boolean, tableIndex: number): Promise<boolean>;

	getPin(): Promise<boolean>;

	info(): Promise<boolean>;

	kick(personName: string): Promise<boolean>;

	leaveGame(): Promise<void>;

	markQuestion(questionId: number, comment: string): Promise<boolean>;

	/** Notifies that the client has loaded the media. */
	mediaLoaded(): Promise<boolean>;

	mediaPreloaded(): Promise<boolean>;

	moveable(): Promise<boolean>;

	moveNext(): Promise<boolean>;

	moveToRound(roundIndex: number): Promise<boolean>;

	onMediaCompleted(): Promise<boolean>;

	pass(): Promise<boolean>;

	pause(enable: boolean): Promise<boolean>;

	pressButton(deltaTime: number): Promise<boolean>;

	ready(isReady: boolean): Promise<boolean>;

	rejectAnswer(factor: number): Promise<boolean>;

	say(text: string): Promise<boolean>;

	selectQuestion(themeIndex: number, questionIndex: number): Promise<boolean>;

	sendAnswer(answer: string): Promise<boolean>;

	/** Sends answer version. */
	sendAnswerVersion(answerVersion: string): Promise<boolean>;

	sendAvatar(avatarUri: string): Promise<boolean>;

	sendGameReport(reportText: string): Promise<boolean>;

	sendImageAvatar(avatarUri: string): Promise<boolean>;

	sendVideoAvatar(avatarUri: string): Promise<boolean>;

	/** Gives turn to player. */
	setChooser(playerIndex: number): Promise<boolean>;

	/** Sets person as host. */
	setHost(personName: string): Promise<boolean>;

	/** Sets game join mode. */
	setJoinMode(joinMode: JoinMode): Promise<boolean>;

	setPlayerScore(playerIndex: number, score: number): Promise<boolean>;

	setOption(name: string, value: string): Promise<boolean>;

	setTable(isShowman: boolean, tableIndex: number, name: string): Promise<boolean>;

	stakeAllIn(): Promise<boolean>;

	stakePass(): Promise<boolean>;

	stakeValue(value: number): Promise<boolean>;

	start(): Promise<boolean>;

	/** Toggles (removes or restores) a question on game table. */
	toggle(themeIndex: number, questionIndex: number): Promise<boolean>;

	/** Sends command to unban the person by IP. */
	unban(ip: string): Promise<boolean>;

	/** Validates player answer. */
	validateAnswer(answer: string, isRight: boolean): Promise<boolean>;
}