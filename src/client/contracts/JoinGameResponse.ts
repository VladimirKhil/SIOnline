import JoinGameErrorType from './JoinGameErrorType';

/**
 * Defines a join game response.
 */
export default interface JoinGameResponse {
    /**
     * Indicates if the join operation was successful.
     */
    IsSuccess: boolean;

    /**
     * Error type for failed joins.
     */
    ErrorType: JoinGameErrorType;

    /**
     * Optional message.
     */
    Message?: string | null;
}