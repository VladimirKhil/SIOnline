import AccountSettings from './AccountSettings';
import ServerAppSettings from './ServerAppSettings';

/** Defines a new game settings. */
export default interface GameSettings {
	humanPlayerName: string;
	networkGameName: string;
	networkGamePassword: string;

	/** Network voice chat link. */
	networkVoiceChat: string;
	isPrivate: boolean;
	allowViewers: boolean;
	showman: AccountSettings;
	players: AccountSettings[];
	viewers: AccountSettings[];
	appSettings: ServerAppSettings;
}
