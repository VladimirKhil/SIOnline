import IGameClient from './IGameClient';
import IClientBase from '../IClientBase';
import Messages from './Messages';
import JoinMode from './JoinMode';

export default class GameClient implements IGameClient {
	/**
	 * Initializes a new instance of {@link GameClient}.
	 * @param gameServerClient Underlying SIGameServer client.
	 */
	constructor(public gameServerClient: IClientBase, public shouldClose: boolean) { }

	addTable(): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Config, 'ADDTABLE');
	}

	approveAnswer(factor: number): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.IsRight, '+', factor);
	}

	changeTableType(isShowman: boolean, tableIndex: number): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Config, 'CHANGETYPE', isShowman ? 'showman' : 'player', isShowman ? '' : tableIndex);
	}

	deleteTable(tableIndex: number): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Config, 'DELETETABLE', tableIndex);
	}

	deleteTheme(themeIndex: number): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Delete, themeIndex);
	}

	freeTable(isShowman: boolean, tableIndex: number): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Config, 'FREE', isShowman ? 'showman' : 'player', isShowman ? '' : tableIndex);
	}

	getPin(): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Pin);
	}

	info(): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Info);
	}

	kick(personName: string): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Ban, personName);
	}

	markQuestion(questionId: number, comment: string): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Mark, questionId, comment);
	}

	mediaLoaded(): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.MediaLoaded);
	}

	moveable(): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Moveable);
	}

	onMediaCompleted(): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Atom);
	}

	pass(): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Pass);
	}

	pause(enable: boolean): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Pause, enable ? '+' : '-');
	}

	pressButton(deltaTime: number): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.I, deltaTime);
	}

	ready(): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Ready);
	}

	rejectAnswer(factor: number): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.IsRight, '-', factor);
	}

	selectQuestion(themeIndex: number, questionIndex: number): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Choice, themeIndex, questionIndex);
	}

	sendAnswer(answer: string): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Answer, answer);
	}

	sendAnswerVersion(answerVersion: string): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.AnswerVersion, answerVersion);
	}

	sendAvatar(avatarUri: string): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Picture, avatarUri);
	}

	sendGameReport(reportText: string): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Report, 'ACCEPT', reportText);
	}

	sendImageAvatar(avatarUri: string): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Avatar, 'image', avatarUri);
	}

	sendVideoAvatar(avatarUri: string): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Avatar, 'video', avatarUri);
	}

	setChooser(playerIndex: number): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.SetChooser, playerIndex);
	}

	setHost(personName: string): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.SetHost, personName);
	}

	setJoinMode(joinMode: JoinMode): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.SetJoinMode, JoinMode[joinMode]);
	}

	setTable(isShowman: boolean, tableIndex: number, name: string): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Config, 'SET', isShowman ? 'showman' : 'player', isShowman ? '' : tableIndex, name);
	}

	toggle(themeIndex: number, questionIndex: number): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Toggle, themeIndex, questionIndex);
	}

	unban(ip: string): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Unban, ip);
	}

	validateAnswer(answer: string, isRight: boolean): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Validate, answer, isRight ? '+' : '-');
	}
}