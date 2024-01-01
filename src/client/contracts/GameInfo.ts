import ServerGameType from './ServerGameType';
import PersonInfo from './PersonInfo';
import GameStage from './GameStage';

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
	ProgressCurrent: number;
	ProgressTotal: number;
	RealStartTime: string;
	Rules: string;
	Stage: GameStage;
	StageName: string;
	Started: boolean;
	StartTime: string;
}
