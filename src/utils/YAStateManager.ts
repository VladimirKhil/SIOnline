import { Store } from 'redux';
import IStateManager from './IStateManager';
import userActionCreators from '../state/user/userActionCreators';

const SDK_PATH = 'https://yandex.ru/games/sdk/v2';

declare const YaGames: any;

export default class YAStateManager implements IStateManager {
	private player: any;

	private playerData: any;

	async initAsync(store: Store): Promise<void> {
		const scriptPromise = new Promise((resolve, reject) => {
			const script = document.createElement('script');
			document.body.appendChild(script);
			script.onload = resolve;
			script.onerror = reject;
			script.async = true;
			script.src = SDK_PATH;
		});

		await scriptPromise;

		const ysdk = await YaGames.init();
		const player = await ysdk.getPlayer();

		this.player = player;
		this.playerData = await this.player.getData();
		store.dispatch(userActionCreators.onLoginChanged(player.getName()) as any);

		console.log('Loaded from Yandex');
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