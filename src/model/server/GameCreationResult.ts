import GameCreationResultCode from './GameCreationResultCode';

export default interface GameCreationResult {
	code: GameCreationResultCode;
	errorMessage: string;
	gameId: number;
	isHost: boolean; /* Obsolete */
}
