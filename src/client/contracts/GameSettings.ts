import AccountSettings from './AccountSettings';
import ServerAppSettings from './ServerAppSettings';

/** Defines a new game settings. */
export default interface GameSettings {
	HumanPlayerName: string;
	RandomSpecials: boolean;
	NetworkGameName: string;
	NetworkGamePassword: string;

	/** Network voice chat link. */
	NetworkVoiceChat: string;
	IsPrivate: boolean;
	AllowViewers: boolean;
	Showman: AccountSettings;
	Players: AccountSettings[];
	Viewers: AccountSettings[];
	AppSettings: ServerAppSettings;
}
