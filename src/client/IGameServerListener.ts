import GameInfo from './contracts/GameInfo';

export default interface IGameServerListener {
	onGameCreated(gameInfo: GameInfo): void;
	onGameChanged(gameInfo: GameInfo): void;
	onGameDeleted(gameId: number): void;
	onReconnecting(error?: Error): void;
	onReconnected(): void;
	onClose(error?: Error): void;
}