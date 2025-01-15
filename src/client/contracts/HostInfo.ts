import SIContentInfo from './SIContentInfo';
import SIStorageInfo from './SIStorageInfo';

/** Provides game server information. */
export default interface HostInfo {
	/** Server public name. */
	name: string;

	/** Server hostname. */
	host: string;

	/** Port number for TCP-based connections. */
	port: number;

	/** Base Urls that are considered valid for in-game content files. */
	contentPublicBaseUrls: string[] | null;

	/** Server license text. */
	license: string;

	/** Maximum allowed package size in MB. */
	maxPackageSizeMb: number;

	/** Contains information about well-known SIContent services. */
	contentInfos: SIContentInfo[];

	/** Contains information about well-known SIStorage services. */
	storageInfos: SIStorageInfo[];
}
