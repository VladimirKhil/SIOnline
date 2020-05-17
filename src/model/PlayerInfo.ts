import PlayerStates from './enums/PlayerStates';

export default interface PlayerInfo {
	name: string;

	sum: number;
	stake: number;

	state: PlayerStates;

	canBeSelected: boolean;

	isReady: boolean;

	replic: string | null;
}
