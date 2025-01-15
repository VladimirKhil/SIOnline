import { Store } from 'redux';
import IStateManager from './IStateManager';
import { changeLogin } from '../state/userSlice';

const SDK_PATH = 'https://sdk.games.s3.yandex.net/sdk.js';

declare const YaGames: any;

export default class YAStateManager implements IStateManager {
	private ysdk: any;
	private player: any;

	private playerData: any;

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

	saveNavigationState(state: any, url: string | null | undefined) {
		this.playerData = {
			...this.playerData,
			state: state
		};

		this.player.setData(this.playerData);

		window.history.pushState(state, '', url);
	}
}