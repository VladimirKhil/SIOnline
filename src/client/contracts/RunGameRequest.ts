import ComputerAccount from './ComputerAccount';
import GameSettings from './GameSettings';
import PackageInfo from './PackageInfo';

/** Defines a game run request. */
export default interface RunGameRequest {
	/** Game options. */
	GameSettings: GameSettings;

	/** Game package descriptor. */
	PackageInfo: PackageInfo;

	/** Custom computer accounts information. */
	ComputerAccounts: ComputerAccount[];
}