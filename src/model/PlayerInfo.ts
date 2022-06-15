import PlayerStates from './enums/PlayerStates';
import PersonInfo from './PersonInfo';

export default interface PlayerInfo extends PersonInfo {
	sum: number;
	stake: number;
	state: PlayerStates;
	canBeSelected: boolean;
	isChooser: boolean;
}
