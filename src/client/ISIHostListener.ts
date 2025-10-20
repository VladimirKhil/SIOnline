import Message from './contracts/Message';
import PersonInfo from './contracts/PersonInfo';

export default interface ISIHostListener {
	onReceive(message: Message): void;
	onDisconnect(): void;
	onGamePersonsChanged(gameId: number, persons: PersonInfo[]): void;
	onError(e: unknown): void;
	onReconnecting(error?: Error): void;
	onReconnected(): void;
	onClose(error?: Error): void;
}