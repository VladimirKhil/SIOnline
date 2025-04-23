import { Store } from 'redux';
import IHost, { FullScreenMode } from './IHost';
import { changeLogin } from '../state/userSlice';
import { setClearUrls, setMinimalLogo, setRoomLinkEnabled } from '../state/commonSlice';
import SIStorageClient from 'sistorage-client';
import SIStorageInfo from '../client/contracts/SIStorageInfo';

const SDK_PATH = 'https://sdk.games.s3.yandex.net/sdk.js';

declare const YaGames: any;

export default class YandexHost implements IHost {
	private ysdk: any;
	private player: any;

	private playerData: any;

	isDesktop(): boolean {
		return false;
	}

	async initAsync(store: Store): Promise<void> {
		const scriptPromise = new Promise((resolve, reject) => {
			const script = document.createElement('script');
			document.head.appendChild(script);
			script.onload = resolve;
			script.onerror = reject;
			script.async = true;
			script.src = SDK_PATH;
		});

		await scriptPromise;

		this.ysdk = await YaGames.init();
		this.player = await this.ysdk.getPlayer();

		this.playerData = await this.player.getData();
		store.dispatch(changeLogin(this.player.getName()) as any);

		store.dispatch(setMinimalLogo(true));
		store.dispatch(setClearUrls(true));
		store.dispatch(setRoomLinkEnabled(false));

		console.log('Loaded from Yandex');
	}

	onReady() {
		this.ysdk.features.LoadingAPI?.ready();
	}

	isLicenseAccepted() {
		return this.playerData.acceptLicense;
	}

	acceptLicense() {
		this.playerData = {
			...this.playerData,
			acceptLicense: true
		};

		this.player.setData(this.playerData);
	}

	loadNavigationState(): any {
		return window.history.state ?? this.playerData.state;
	}

	saveNavigationState(state: any, url: string | null | undefined, popCurrentState: boolean) {
		this.playerData = {
			...this.playerData,
			state: state
		};

		this.player.setData(this.playerData);

		window.history.pushState(state, '', url);
	}

	isFullScreenSupported(): boolean {
		return false; // Yandex has its own fullscreen button
	}

	detectFullScreen(): FullScreenMode {
		return FullScreenMode.Undefined;
	}

	async setFullScreen(): Promise<boolean> { return false; }

	copyToClipboard(text: string): void {
		if (navigator.clipboard) {
			navigator.clipboard.writeText(text);
		} else {
			alert(text);
		}
	}

	copyUriToClipboard(): void {
		if (navigator.clipboard) {
			navigator.clipboard.writeText(window.location.href);
		} else {
			alert(window.location.href);
		}
	}

	openLink(url: string): void {}

	getStorage(): { storageClient?: SIStorageClient; storageInfo?: SIStorageInfo; } {
		return { };
	}

	getPackageData(id: string): Promise<File | null> {
		return new Promise(() => null);
	}

	exitApp() {}
}