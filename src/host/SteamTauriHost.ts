import { Store } from 'redux';
import AuthorizationMode from '../client/contracts/AuthorizationMode';
import TauriHost from './TauriHost';
import SIStorageClient from 'sistorage-client';
import SIStorageInfo from '../client/contracts/SIStorageInfo';
import SteamWorkshopStorageClient from './SteamWorkshopStorageClient';
import localization from '../model/resources/localization';
import { changeAuthName, changeLogin } from '../state/userSlice';
import { setAvatarKey } from '../state/settingsSlice';
import Constants from '../model/enums/Constants';
import State from '../state/State';
import { setHostManagedUrls, setSteamLinkSupported } from '../state/commonSlice';
import { AuthorizationData } from './IHost';
import { AccountServiceClient } from 'accountservice-client';

const defaultSteamAuthIdentity = 'SIGameServer';

export default class SteamTauriHost extends TauriHost {
	async initAsync(store: Store): Promise<void> {
		await super.initAsync(store);

		store.dispatch(setHostManagedUrls(true));
		store.dispatch(setSteamLinkSupported(false)); // No need to navigate to Steam from here

		if (!this.app || !this.app.core) {
			return;
		}

		try {
			const userInfo: { name: string, avatar: string | null } = await this.app.core.invoke('get_steam_user_info', {});
			const state = store.getState() as State;

			if (userInfo.name) {
				if (!state.user.login) {
					store.dispatch(changeLogin(userInfo.name));
				}

				store.dispatch(changeAuthName(userInfo.name));
			}

			if (userInfo.avatar && !localStorage.getItem(Constants.AVATAR_KEY)) {
				localStorage.setItem(Constants.AVATAR_KEY, userInfo.avatar);
				localStorage.setItem(Constants.AVATAR_NAME_KEY, 'steam_avatar.png');
				store.dispatch(setAvatarKey(Math.random().toString()));
			} else if (localStorage.getItem(Constants.AVATAR_KEY) && !localStorage.getItem(Constants.AVATAR_NAME_KEY)) {
				localStorage.setItem(Constants.AVATAR_NAME_KEY, 'steam_avatar.png');
			}

			const identity = defaultSteamAuthIdentity;

			const authTicket = await this.app.core.invoke('get_steam_auth_ticket', {
				identity,
			});

			const accountServiceClient = new AccountServiceClient('https://localhost:7039');

			const { userId } = await accountServiceClient.loginBySteamAsync({
				authTicket,
			});

			console.log('Steam user logged in with userId:', userId);
		} catch (error) {
			console.error('Failed to get Steam user info:', error);
		}
	}

	getSupportedAuthModes(): AuthorizationMode[] {
		return [AuthorizationMode.Steam];
	}

	async getAuthorizationData(authorizationMode?: AuthorizationMode): Promise<AuthorizationData | null> {
		if (authorizationMode !== AuthorizationMode.Steam) {
			return null;
		}

		if (!this.app || !this.app.core) {
			throw new Error('Steam authorization is not available');
		}

		const identity = defaultSteamAuthIdentity;

		const authTicket = await this.app.core.invoke('get_steam_auth_ticket', {
			identity,
		});

		return {
			AuthorizationMode: AuthorizationMode.Steam,
			AuthTicket: authTicket,
		};
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
