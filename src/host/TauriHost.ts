import { setClipboardSupported, setExitSupported, setHostManagedUrls, setIsDesktop, setSteamLinkSupported } from '../state/commonSlice';
import { getCookie, setCookie } from '../utils/CookieHelpers';
import IHost, { FullScreenMode } from './IHost';
import { Store } from 'redux';

const ACCEPT_LICENSE_KEY = 'ACCEPT_LICENSE';

const isSteam = true;

declare global {
	interface Window {
		__TAURI__: any;
	}
}

export default class TauriHost implements IHost {
	private app = window.__TAURI__;

	private licenseAccepted = false;

	private clipboardSupported = false;

	private exitSupported = false;

	constructor(private isLegacy: boolean) {
		if (this.app) {
			const originalFetch = globalThis.fetch.bind(globalThis);

			globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
				if (typeof input === 'string' && input.startsWith('http://ipc.localhost/')) { // Pass through requests to localhost
					return originalFetch(input, init);
				}

				const response = await this.app.http.fetch(input, init);
				return response;
			};
		}

		const urlParams = new URLSearchParams(window.location.hash.substring(1));
		this.licenseAccepted = this.app || urlParams.get('licenseAccepted') === 'true';
		this.clipboardSupported = this.app || urlParams.get('clipboardSupported') === 'true';
		this.exitSupported = this.app || urlParams.get('exitSupported') === 'true';
	}

	isDesktop(): boolean {
		return true;
	}

	async initAsync(store: Store): Promise<void> {
		store.dispatch(setIsDesktop(true));
		console.log('Loaded from Tauri');

		if (isSteam) {
			store.dispatch(setHostManagedUrls(true));
			store.dispatch(setSteamLinkSupported(false)); // No need to navigate to Steam from here
		}

		if (!this.clipboardSupported) {
			store.dispatch(setClipboardSupported(false));
		}

		if (this.exitSupported) {
			store.dispatch(setExitSupported(true));
		}
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
		return !this.isLegacy || this.app;
	}

	detectFullScreen(): FullScreenMode {
		return FullScreenMode.Undefined;
	}

	async setFullScreen(fullScreen: boolean): Promise<boolean> {
		if (this.app) {
			try {
				await this.app.webviewWindow.getCurrentWebviewWindow().setFullscreen(fullScreen);
			} catch (e) {
				alert(e);
			}
		} else {
			window.parent.postMessage({ type: 'fullscreen', payload: fullScreen }, '*');
		}

		return true;
	}

	copyToClipboard(text: string): void {
		if (this.app) {
			this.app.clipboardManager.writeText(text);
		} else {
			window.parent.postMessage({ type: 'copyToClipboard', payload: text }, '*');
		}
	}

	copyUriToClipboard(): void {
		const text = window.location.href.replace('http://tauri.localhost', 'https://sigame.vladimirkhil.com');
		this.copyToClipboard(text);
	}

	openLink(url: string) {
		try {
			this.app.core.invoke('open_url_in_steam_overlay', { url });
		} catch (e) {
			console.error('Failed to open link:', e);
		}
	}

	exitApp() : void {
		if (this.app) {
			this.app.process.exit(0);
		} else {
			window.parent.postMessage({ type: 'exit' }, '*');
		}
	}
}