import GameCreationResultCode from './GameCreationResultCode';

/** Defines a run game response. */
export default interface RunGameResponse {
	/** Is run successfull. */
	isSuccess: boolean;

	/** Game host uri. */
	hostUri: string;

	/** Game identifier. */
	gameId: number;

	/** Should the person be a game host. */
	isHost: boolean;

	/** Creation error code. */
	errorType: GameCreationResultCode;
}
