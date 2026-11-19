import ComputerAccount from './ComputerAccount';
import PackageInfo from '../contracts/PackageInfo';
import RoomSettings from './RoomSettings';
import RulesSettings from './RulesSettings';
import TimeSettings from './TimeSettings';

/** Defines a game run request based on contract settings. */
export default interface RunGameRequest2 {
	roomSettings: RoomSettings;
	rulesSettings: RulesSettings;
	timeSettings: TimeSettings;
	language: string;
	packageInfo: PackageInfo;
	computerAccounts: ComputerAccount[];
}
