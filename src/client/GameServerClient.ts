import Role from '../model/enums/Role';
import GameCreationResult from '../model/server/GameCreationResult';
import GameInfo from '../model/server/GameInfo';
import GameSettings from '../model/server/GameSettings';
import HostInfo from '../model/server/HostInfo';
import PackageKey from '../model/server/PackageKey';
import Slice from '../model/server/Slice';
import IGameServerClient from './IGameServerClient';

/** Represents a connection to a SIGame Server. */
export default class GameServerClient implements IGameServerClient {
	/**
	 * Initializes a new instance of {@link GameServerClient}.
	 * @param connection Underlying SignalR connection.
	 */
	constructor(private connection: signalR.HubConnection) {

	}

	getComputerAccountsAsync(): Promise<string[]> {
		return this.connection.invoke<string[]>('GetComputerAccounts');
	}

	getGameHostInfoAsync(): Promise<HostInfo> {
		return this.connection.invoke<HostInfo>('GetGamesHostInfo');
	}

	getGamesSliceAsync(fromId: number): Promise<Slice<GameInfo>> {
		return this.connection.invoke<Slice<GameInfo>>('GetGamesSlice', fromId);
	}

	getUsersAsync(): Promise<string[]> {
		return this.connection.invoke<string[]>('GetUsers');
	}

	getNewsAsync(): Promise<string | null> {
		return this.connection.invoke<string | null>('GetNews');
	}

	sayInLobbyAsync(text: string): Promise<any> {
		return this.connection.invoke('Say', text);
	}

	hasPackageAsync(packageKey: PackageKey): Promise<boolean> {
		return this.connection.invoke<boolean>('HasPackage', packageKey);
	}

	createAndJoinGameAsync(gameSettings: GameSettings, packageKey: PackageKey, isMale: boolean): Promise<GameCreationResult> {
		return this.connection.invoke<GameCreationResult>(
			'CreateAndJoinGameNew',
			gameSettings,
			packageKey,
			[],
			isMale
		);
	}

	createAutomaticGameAsync(login: string, isMale: boolean): Promise<GameCreationResult> {
		return this.connection.invoke<GameCreationResult>(
			'CreateAutomaticGameNew',
			login,
			isMale
		);
	}

	joinGameAsync(gameId: number, role: Role, isMale: boolean, password: string): Promise<GameCreationResult> {
		return this.connection.invoke<GameCreationResult>(
			'JoinGameNew',
			gameId,
			role,
			isMale,
			password
		);
	}

	sendMessageToServerAsync(message: string): Promise<any> {
		return this.connection.invoke('SendMessage', {
			Text: message,
			IsSystem: true,
			Receiver: '@'
		});
	}

	msgAsync(...args: any[]): Promise<any> {
		return this.sendMessageToServerAsync(args.join('\n'));
	}

	sayAsync(message: string): Promise<any> {
		return this.connection.invoke('SendMessage', {
			Text: message,
			IsSystem: false,
			Receiver: '*'
		});
	}

	/** Leaves the game and returns to the lobby. */
	leaveGameAsync(): Promise<any> {
		return this.connection.invoke('LeaveGame');
	}

	logOutAsync(): Promise<any> {
		return this.connection.invoke('LogOut');
	}
}
