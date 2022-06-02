import GameType from './GameType';
import PersonInfo from './PersonInfo';

export default interface GameInfo {
	gameID: number;
	gameName: string;
	language: string;
	mode: GameType;
	owner: string;
	packageName: string;
	passwordRequired: boolean;
	persons: PersonInfo[];
	realStartTime: string;
	rules: number;
	stage: number;
	stageName: string;
	started: boolean;
	startTime: string;
}
