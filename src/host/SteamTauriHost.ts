import { Store } from 'redux';
import TauriHost from './TauriHost';
import SIStorageClient from 'sistorage-client';
import SIStorageInfo from '../client/contracts/SIStorageInfo';
import SteamWorkshopStorageClient from './SteamWorkshopStorageClient';
import localization from '../model/resources/localization';
import { changeLogin } from '../state/userSlice';
import { setAvatarKey } from '../state/settingsSlice';
import Constants from '../model/enums/Constants';
import State from '../state/State';
import { setHostManagedUrls, setSteamLinkSupported } from '../state/commonSlice';

export default class SteamTauriHost extends TauriHost {
	async initAsync(store: Store): Promise<void> {
		await super.initAsync(store);

		store.dispatch(setHostManagedUrls(true));
		store.dispatch(setSteamLinkSupported(false)); // No need to navigate to Steam from here

		if (this.app && this.app.core) {
			this.app.core.invoke('get_steam_user_info', {}).then((userInfo: { name: string, avatar: string | null }) => {
				const state = store.getState() as State;

				if (userInfo.name && !state.user.login) {
					store.dispatch(changeLogin(userInfo.name));
				}

				if (userInfo.avatar && !localStorage.getItem(Constants.AVATAR_KEY)) {
					localStorage.setItem(Constants.AVATAR_KEY, userInfo.avatar);
					store.dispatch(setAvatarKey(Math.random().toString()));
				}
			}).catch((error: any) => {
				console.error('Failed to get Steam user info:', error);
			});
		}
	}

	async setFullScreen(fullScreen: boolean): Promise<boolean> {
		if (this.app && this.app.webviewWindow) {
			try {
				await this.app.webviewWindow.getCurrentWebviewWindow().setFullscreen(fullScreen);
			} catch (e) {
				alert(e);
			}
			return true;
		}

		return super.setFullScreen(fullScreen);
	}

	getStorage(): { storageClient?: SIStorageClient; storageInfo?: SIStorageInfo; } {
		const storageClient = new SteamWorkshopStorageClient({
			serviceUri: 'steam://app',
		});

		const storageInfo: SIStorageInfo = {
			name: localization.steamWorkshop,
			uri: 'https://steamcommunity.com/app/3553500/workshop',
			id: 'SteamWorkshop',
			serviceUri: '',
			randomPackagesSupported: false,
			identifiersSupported: true,
			maximumPageSize: 20,
			packageProperties: [],
			facets: [],
			limitedApi: true,
			emptyMessage: localization.noPackagesSteam,
		};

		return { storageClient, storageInfo };
	}

	getPackageSource(packageId?: string): string | undefined {
		return packageId
			? `https://steamcommunity.com/sharedfiles/filedetails/?id=${packageId}`
			: 'https://steamcommunity.com';
	}

	getFallbackPackageSource(): string | undefined {
		return 'https://www.sibrowser.ru';
	}
}
