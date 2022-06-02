/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
import Role from './contracts/Role';
import FileKey from './contracts/FileKey';
import GameCreationResult from './contracts/GameCreationResult';
import GameInfo from './contracts/GameInfo';
import GameSettings from './contracts/GameSettings';
import HostInfo from './contracts/HostInfo';
import PackageKey from './contracts/PackageKey';
import Slice from './contracts/Slice';
import IGameServerClient from './IGameServerClient';

/** Defines a disconnected version of IGameServerClient. */
export default class DummyGameServerClient implements IGameServerClient {
	async getComputerAccountsAsync(culture: string): Promise<string[]> {
		return [];
	}

	async getGameHostInfoAsync(culture: string): Promise<HostInfo> {
		this.throwNotConnectedError();
	}

	async getGamesSliceAsync(fromId: number): Promise<Slice<GameInfo>> {
		this.throwNotConnectedError();
	}

	async getUsersAsync(): Promise<string[]> {
		return [];
	}

	async getNewsAsync(): Promise<string | null> {
		return null;
	}

	async sayInLobbyAsync(text: string): Promise<any> {

	}

	async hasPackageAsync(packageKey: PackageKey): Promise<boolean> {
		return false;
	}

	async hasImageAsync(fileKey: FileKey): Promise<string | null> {
		return null;
	}

	async createAndJoinGameAsync(gameSettings: GameSettings, packageKey: PackageKey, isMale: boolean): Promise<GameCreationResult> {
		this.throwNotConnectedError();
	}

	async createAutomaticGameAsync(login: string, isMale: boolean): Promise<GameCreationResult> {
		this.throwNotConnectedError();
	}

	async joinGameAsync(gameId: number, role: Role, isMale: boolean, password: string): Promise<GameCreationResult> {
		this.throwNotConnectedError();
	}

	async sendMessageToServerAsync(message: string): Promise<boolean> {
		return true;
	}

	async msgAsync(...args: any[]): Promise<boolean> {
		return true;
	}

	async sayAsync(...args: any[]): Promise<any> {

	}

	async leaveGameAsync(): Promise<any> {

	}

	async logOutAsync(): Promise<any> {

	}

	private throwNotConnectedError(): never {
		throw new Error('Connection is closed!');
	}
}
