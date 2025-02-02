import SIStorageClient from 'sistorage-client';

export default interface SIStorage {
	client: SIStorageClient;

	info: {
		randomPackagesSupported: boolean;
		useIdentifiers: boolean;
		facets: string[];
	};
}