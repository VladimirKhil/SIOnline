import AccountSettings from './AccountSettings';
import ServerAppSettings from './ServerAppSettings';

export default interface GameSettings {
	HumanPlayerName: string;
	RandomSpecials: boolean;
	NetworkGameName: string;
	NetworkGamePassword: string;
	AllowViewers: boolean;
	Showman: AccountSettings;
	Players: AccountSettings[];
	Viewers: AccountSettings[];
	AppSettings: ServerAppSettings;
}
