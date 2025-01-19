import { Store } from 'redux';
import { getCookie, setCookie } from './CookieHelpers';
import IStateManager from './IStateManager';

const ACCEPT_LICENSE_KEY = 'ACCEPT_LICENSE';

export default class StateManager implements IStateManager {
	initAsync(store: Store): Promise<void> {
		return Promise.resolve();
	}

	onReady() {
	}

	isLicenseAccepted(): boolean {
		return getCookie(ACCEPT_LICENSE_KEY) !== '';
	}

	acceptLicense() {
		setCookie(ACCEPT_LICENSE_KEY, '1', 365);
	}

	loadNavigationState(): any {
		return window.history.state;
	}

	saveNavigationState(state: any, url: string | null | undefined) {
		window.history.pushState(state, '', url);
	}

	isFullScreenSupported(): boolean {
		return document.fullscreenEnabled;
	}

	async setFullScreen(fullScreen: boolean): Promise<boolean> {
		if (fullScreen && !document.fullscreenElement) {
			try {
				await document.documentElement.requestFullscreen();
			} catch (e) {
				console.error(e);
				return false;
			}
		} else if (!fullScreen && document.fullscreenElement) {
			document.exitFullscreen();
		}

		return true;
	}
}