import GameAccount from './GameAccount';

/** Defines game room settings. */
export default interface RoomSettings {
	hostName: string;
	showman: GameAccount;
	players: GameAccount[];
	name: string;
	password: string;
	voiceChatUri: string;
	isPrivate: boolean;
	isAutomatic: boolean;
}
