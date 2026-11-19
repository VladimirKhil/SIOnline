import AuthSource from './AuthSource';
import ServerRole from './ServerRole';

/** Defines a game person info. */
export default interface PersonInfo {
	IsOnline: boolean;
	Name: string;
	Role: ServerRole;
	AuthSource: AuthSource;
	UserId: string;
}
