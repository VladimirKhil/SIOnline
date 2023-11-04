import GameCreationResultCode from './GameCreationResultCode';

/** Defines game creation result. */
export default interface GameCreationResult {
	Code: GameCreationResultCode;
	ErrorMessage: string;
	GameId: number;
	IsHost: boolean; /* Obsolete */
}
