import SIContentInfo from './SIContentInfo';
import SIStorageInfo from './SIStorageInfo';

/** Provides game server information. */
export default interface HostInfo {
	/** Server public name. */
	Name: string;

	/** Server hostname. */
	Host: string;

	/** Port number for TCP-based connections. */
	Port: number;

	/** Base Urls that are considered valid for in-game content files. */
	ContentPublicBaseUrls: string[] | null;

	/** Server license text. */
	License: string;

	/** Maximum allowed package size in MB. */
	MaxPackageSizeMb: number;

	/** Contains information about well-known SIContent services. */
	ContentInfos: SIContentInfo[];

	/** Contains information about well-known SIStorage services. */
	StorageInfos: SIStorageInfo[];
}
