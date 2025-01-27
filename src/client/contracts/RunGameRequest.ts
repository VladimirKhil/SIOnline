import ComputerAccount from './ComputerAccount';
import GameSettings from './GameSettings';
import PackageInfo from './PackageInfo';

/** Defines a game run request. */
export default interface RunGameRequest {
	/** Game options. */
	gameSettings: GameSettings;

	/** Game package descriptor. */
	packageInfo: PackageInfo;

	/** Custom computer accounts information. */
	computerAccounts: ComputerAccount[];
}