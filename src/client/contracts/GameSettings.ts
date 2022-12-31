import AccountSettings from './AccountSettings';
import ServerAppSettings from './ServerAppSettings';

export default interface GameSettings {
	humanPlayerName: string;
	randomSpecials: boolean;
	networkGameName: string;
	networkGamePassword: string;
	isPrivate: boolean;
	allowViewers: boolean;
	showman: AccountSettings;
	players: AccountSettings[];
	viewers: AccountSettings[];
	appSettings: ServerAppSettings;
}
