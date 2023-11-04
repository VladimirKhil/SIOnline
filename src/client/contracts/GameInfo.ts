import ServerGameType from './ServerGameType';
import PersonInfo from './PersonInfo';

/** Defines a server game info. */
export default interface GameInfo {
	GameID: number;
	GameName: string;
	Language: string;
	Mode: ServerGameType;
	Owner: string;
	PackageName: string;
	PasswordRequired: boolean;
	Persons: PersonInfo[];
	RealStartTime: string;
	Rules: number;
	Stage: number;
	StageName: string;
	Started: boolean;
	StartTime: string;
}
