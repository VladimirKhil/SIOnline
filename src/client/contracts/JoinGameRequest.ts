import ServerRole from './ServerRole';
import ServerSex from './ServerSex';

/**
 * Contains data required to join a game.
 */
export default interface JoinGameRequest {
    /**
     * Game identifier.
     */
    GameId: number;

    /**
     * User name.
     */
    UserName: string;

    /**
     * Role to join.
     */
    Role: ServerRole;

    /**
     * User sex.
     */
    Sex: ServerSex;

    /**
     * Game password.
     */
    Password?: string | null;

    /** Game PIN. */
    Pin: number | null;
}