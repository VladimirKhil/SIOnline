import SIStorageClient from 'sistorage-client';
import Package from 'sistorage-client/dist/models/Package';
import SIStorageClientOptions from 'sistorage-client/dist/SIStorageClientOptions';

/**
 * Storage client for Steam Workshop items
 */
export class SteamWorkshopStorageClient extends SIStorageClient {
	constructor(options: SIStorageClientOptions) {
		super(options);

		this.packages.getPackagesAsync = async (packageFilters, selectionParameters) => {
			try {
				// Call the Tauri command to get workshop items
				const { invoke } = window.__TAURI__.core;

				const response = await invoke('get_workshop_subscribed_items', {
					page: ((selectionParameters.from ?? 0) / 50) + 1
				});

				if (response && response.items) {
					// Convert workshop items to package info objects
					const packages: Package[] = response.items.map((item: any) => (<Package>{
						id: item.id.toString(),
						name: item.title,
						difficulty: 0,
						restrictionIds: [],
						publisherId: 0,
						authorIds: [],
						createDate: new Date(item.created_time * 1000),
						tagIds: [],
						languageId: 0,
						contentUri: `steam://workshop/${item.id}`,
						logoUri: item.preview_url,
						size: item.file_size || 0,
						rounds: [],
						questionCount: 0,
						contentTypeStatistic: {},
						downloadCount: 0,
						rating: item.score,
					}));

					return {
						packages,
						total: response.total,
					};
				}

				return { packages: [], total: 0 };
			} catch (error) {
				console.error('Error getting subscribed Workshop items:', error);
				return { packages: [], total: 0 };
			}
		};
	}
}

export default SteamWorkshopStorageClient;