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

	info(): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Info);
	}

	markQuestion(): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Mark);
	}

	mediaLoaded(): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.MediaLoaded);
	}

	moveable(): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Moveable);
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

	sendAnswerVersion(answerVersion: string): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.AnswerVersion, answerVersion);
	}

	sendAvatar(avatarUri: string): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Picture, avatarUri);
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

	toggle(themeIndex: number, questionIndex: number): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Toggle, themeIndex, questionIndex);
	}

	unban(ip: string): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Unban, ip);
	}
}