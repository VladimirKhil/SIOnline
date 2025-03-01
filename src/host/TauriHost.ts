import { setIsDesktop } from '../state/commonSlice';
import { getCookie, setCookie } from '../utils/CookieHelpers';
import IHost, { FullScreenMode } from './IHost';
import { Store } from 'redux';

const ACCEPT_LICENSE_KEY = 'ACCEPT_LICENSE';

export default class TauriHost implements IHost {
	constructor(private isLegacy: boolean, private licenseAccepted: boolean) { }

	isDesktop(): boolean {
		return true;
	}

	async initAsync(store: Store): Promise<void> {
		store.dispatch(setIsDesktop(true));
		console.log('Loaded from Tauri');
	}

	onReady() {
	}

	isLicenseAccepted(): boolean {
		return this.licenseAccepted || getCookie(ACCEPT_LICENSE_KEY) === '1';
	}

	acceptLicense() {
		window.parent.postMessage({ type: 'acceptLicense' }, '*');
		setCookie(ACCEPT_LICENSE_KEY, '1', 365);
	}

	loadNavigationState(): any {
		return window.history.state;
	}

	saveNavigationState(state: any, url: string | null | undefined, popCurrentState: boolean) {
		if (popCurrentState) {
			window.history.replaceState(state, '', url);
		} else {
			window.history.pushState(state, '', url);
		}
	}

	isFullScreenSupported(): boolean {
		return !this.isLegacy;
	}

	detectFullScreen(): FullScreenMode {
		return FullScreenMode.Undefined;
	}

	async setFullScreen(fullScreen: boolean): Promise<boolean> {
		window.parent.postMessage({ type: 'fullscreen', payload: fullScreen }, '*');
		return true;
	}

	copyToClipboard(text: string): void {
		window.parent.postMessage({ type: 'copyToClipboard', payload: text }, '*');
	}

	exitApp() : void {
		window.parent.postMessage({ type: 'exit' }, '*');
	}
}