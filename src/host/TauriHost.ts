import SIStorageClient from 'sistorage-client';
import { setClearUrls, setClipboardSupported, setExitSupported, setHostManagedUrls, setIsDesktop, setSteamLinkSupported } from '../state/commonSlice';
import { getCookie, setCookie } from '../utils/CookieHelpers';
import IHost, { FullScreenMode } from './IHost';
import { Store } from 'redux';
import SIStorageInfo from '../client/contracts/SIStorageInfo';
import SteamWorkshopStorageClient from './SteamWorkshopStorageClient';
import localization from '../model/resources/localization';

const ACCEPT_LICENSE_KEY = 'ACCEPT_LICENSE';

const isSteam = true;

declare global {
	interface Window {
		__TAURI__?: any;
	}
}

export default class TauriHost implements IHost {
	private app = window.__TAURI__;

	private licenseAccepted = false;

	private clipboardSupported = false;

	private exitSupported = false;

	constructor(private isLegacy: boolean) {
		if (this.app && this.app.http) {
			const originalFetch = globalThis.fetch.bind(globalThis);

			globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
				if (typeof input === 'string' &&
					(input.startsWith('http://ipc.localhost/') ||
					input.startsWith('http://sigame.localhost/') ||
					!input.startsWith('http'))) { // Pass through requests to localhost
					return originalFetch(input, init);
				}

				const response = await this.app.http.fetch(input, init);
				return response;
			};
		}

		const urlParams = new URLSearchParams(window.location.hash.substring(1));
		this.licenseAccepted = this.app || urlParams.get('licenseAccepted') === 'true';
		this.clipboardSupported = this.app || urlParams.get('clipboardSupported') === 'true';
		this.exitSupported = (this.app && this.app.process) || urlParams.get('exitSupported') === 'true';
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
		} else {
			store.dispatch(setClearUrls(true));
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
		if (this.app && this.app.webviewWindow &&
			isSteam) { // Temporary condition for old Tauri-based clients
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
		if (this.app && this.app.clipboardManager) {
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

	getStorage(): { storageClient?: SIStorageClient; storageInfo?: SIStorageInfo; } {
		if (!isSteam) {
			return { };
		}

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

	async getPackageData(id: string): Promise<File | null> {
		try {
			const itemId = parseInt(id, 10);
			
			console.log(`Getting package data for workshop item: ${itemId}`);
			
			// Instead of directly downloading the file data, request a URL through our custom protocol
			const startTime = performance.now();
			
			// This returns metadata with a custom protocol URL
			const fileInfo = await this.app.core.invoke('get_workshop_file_url', { itemId });
			
			const endTime = performance.now();
			console.log(`Retrieved file URL for workshop item ${itemId} in ${(endTime - startTime).toFixed(2)}ms`);
			console.log(`File size: ${fileInfo.size} bytes, URL: ${fileInfo.file_url}`);
			
			// Now we use fetch to get the file through our custom protocol
			// This approach is more memory efficient as the browser handles streaming
			const response = await fetch(fileInfo.file_url);
			
			if (!response.ok) {
				throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
			}
			
			// Get the file as a blob
			const blob = await response.blob();
			console.log(`Retrieved blob of size: ${blob.size} bytes`);
			
			// Create a File object from the blob
			return new File([blob], 'package.siq', { type: 'application/x-zip-compressed' });
		} catch (error) {
			console.error('Failed to get package data:', error);
			return null;
		}
	}

	exitApp() : void {
		if (this.app && this.app.process) {
			this.app.process.exit(0);
		} else {
			window.parent.postMessage({ type: 'exit' }, '*');
		}
	}
}