/**
 * Enum defining join game error types.
 */
const enum JoinGameErrorType {
    /**
     * Invalid role value.
     */
    InvalidRole,

    /**
     * Game with provided identifier not found.
     */
    GameNotFound,

    /**
     * Internal server error.
     */
    InternalServerError,

    /**
     * Forbidden to join this game (you are banned).
     */
    Forbidden,

    /**
     * Common join error.
     */
    CommonJoinError,
}

export default JoinGameErrorType;