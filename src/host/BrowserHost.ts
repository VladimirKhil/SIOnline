import { Store } from 'redux';
import { getCookie, setCookie } from '../utils/CookieHelpers';
import IHost, { FullScreenMode } from './IHost';

const ACCEPT_LICENSE_KEY = 'ACCEPT_LICENSE';

export default class BrowserHost implements IHost {
	isDesktop(): boolean {
		return false;
	}

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

	saveNavigationState(state: any, url: string | null | undefined, popCurrentState = false) {
		if (popCurrentState) {
			window.history.replaceState(state, '', url);
		} else {
			window.history.pushState(state, '', url);
		}
	}

	isFullScreenSupported(): boolean {
		return document.fullscreenEnabled;
	}

	detectFullScreen(): FullScreenMode {
		return window.innerHeight == screen.height && window.innerWidth == screen.width ? FullScreenMode.Yes : FullScreenMode.No;
	}

	async setFullScreen(fullScreen: boolean): Promise<boolean> {
		if (fullScreen && !document.fullscreenElement) {
			try {
				await document.documentElement.requestFullscreen();
			} catch (e) {
				return false;
			}
		} else if (!fullScreen && document.fullscreenElement) {
			document.exitFullscreen();
		}

		return true;
	}

	copyToClipboard(text: string): void {
		if (navigator.clipboard) {
			navigator.clipboard.writeText(text);
		} else {
			alert(text);
		}
	}

	exitApp() {}
}