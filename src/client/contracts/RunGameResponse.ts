import GameCreationResultCode from './GameCreationResultCode';

/** Defines a run game response. */
export default interface RunGameResponse {
	/** Is run successfull. */
	IsSuccess: boolean;

	/** Game host uri. */
	HostUri: string;

	/** Game identifier. */
	GameId: number;

	/** Should the person be a game host. */
	IsHost: boolean;

	/** Creation error code. */
	ErrorType: GameCreationResultCode;
}
