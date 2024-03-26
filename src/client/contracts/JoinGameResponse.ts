import JoinGameErrorType from './JoinGameErrorType';

/**
 * Defines a join game response.
 */
export default interface JoinGameResponse {
    /**
     * Indicates if the join operation was successful.
     */
    isSuccess: boolean;

    /**
     * Error type for failed joins.
     */
    errorType: JoinGameErrorType;

    /**
     * Optional message.
     */
    message?: string | null;
}