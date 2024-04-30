/**
 * Enum defining join game error types.
 */
const enum JoinGameErrorType {
    /**
     * Invalid role value.
     */
    InvalidRole = 'InvalidRole',

    /**
     * Game with provided identifier not found.
     */
    GameNotFound = 'GameNotFound',

    /**
     * Internal server error.
     */
    InternalServerError = 'InternalServerError',

    /**
     * Forbidden to join this game (you are banned).
     */
    Forbidden = 'Forbidden',

    /**
     * Common join error.
     */
    CommonJoinError = 'CommonJoinError',
}

export default JoinGameErrorType;