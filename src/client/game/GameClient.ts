import IGameClient from './IGameClient';
import IGameServerClient from '../IGameServerClient';
import Messages from './Messages';

export default class GameClient implements IGameClient {
	/**
	 * Initializes a new instance of {@link GameClient}.
	 * @param gameServerClient Underlying SIGameServer client.
	 */
	constructor(private gameServerClient: IGameServerClient) {

	}

	mediaLoaded(): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.MediaLoaded);
	}

	sendAnswerVersion(answerVersion: string): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.AnswerVersion, answerVersion);
	}

	setHost(personName: string): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.SetHost, personName);
	}

	toggle(themeIndex: number, questionIndex: number): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Toggle, themeIndex, questionIndex);
	}

	unban(ip: string): Promise<boolean> {
		return this.gameServerClient.msgAsync(Messages.Unban, ip);
	}
}