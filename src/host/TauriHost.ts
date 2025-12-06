import SIStorageClient from 'sistorage-client';
import { setClearUrls,
	setClipboardSupported,
	setExitSupported,
	setHostManagedUrls,
	setIsDesktop,
	setLogSupported,
	setSteamLinkSupported } from '../state/commonSlice';
import { getCookie, setCookie } from '../utils/CookieHelpers';
import IHost, { FullScreenMode, UploadCallbacks } from './IHost';
import { Store } from 'redux';
import SIStorageInfo from '../client/contracts/SIStorageInfo';
import SteamWorkshopStorageClient from './SteamWorkshopStorageClient';
import localization from '../model/resources/localization';

const ACCEPT_LICENSE_KEY = 'ACCEPT_LICENSE';

const isSteam = false; // TODO: STEAM_CLIENT: true

/** Payload for upload progress events from Rust */
export interface UploadProgressPayload {
	loaded: number;
	total: number;
	progress: number;
}

/** Payload for upload result events from Rust */
export interface UploadResultPayload {
	success: boolean;
	uri: string | null;
	error: string | null;
	already_existed: boolean;
}

declare global {
	interface Window {
		__TAURI__?: TauriAPI;
	}
}

interface TauriAPI {
	opener?: {
		openPath: (path: string) => Promise<void>;
	};
	path?: {
		appLogDir(): Promise<string>;
		resolve(...paths: string[]): Promise<string>;
	};
	http?: {
		fetch: (url: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
	};
	webviewWindow?: {
		getCurrentWebviewWindow: () => { setFullscreen: (fullScreen: boolean) => Promise<void> };
	};
	clipboardManager?: {
		writeText: (text: string) => void;
	};
	core?: {
		invoke: (cmd: string, args: any) => Promise<any>;
	};
	process?: {
		exit: (code: number) => void;
	};
	event?: {
		listen: <T>(event: string, handler: (event: { payload: T }) => void) => Promise<() => void>;
	};
}

export default class TauriHost implements IHost {
	private app = window.__TAURI__;

	private licenseAccepted = false;

	private clipboardSupported = false;

	private exitSupported = false;

	private logSupported = false;

	private currentLogFilePath: string | null = null;

	constructor(private isLegacy: boolean) {
		if (this.app && this.app.http) {
			const originalFetch = globalThis.fetch.bind(globalThis);
			const { fetch } = this.app.http;

			globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
				if (typeof input === 'string' &&
					(input.startsWith('http://ipc.localhost/') ||
					input.startsWith('http://sigame.localhost/') ||
					!input.startsWith('http'))) { // Pass through requests to localhost
					return originalFetch(input, init);
				}

				const response = await fetch(input, init);
				return response;
			};
		}

		const urlParams = new URLSearchParams(window.location.hash.substring(1));
		this.licenseAccepted = !!this.app || urlParams.get('licenseAccepted') === 'true';
		this.clipboardSupported = !!this.app || urlParams.get('clipboardSupported') === 'true';
		this.exitSupported = (!!this.app && !!this.app.process) || urlParams.get('exitSupported') === 'true';
		this.logSupported = !!this.app || urlParams.get('logSupported') === 'true';
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

		if (!this.logSupported) {
			store.dispatch(setLogSupported(false));
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
		return !this.isLegacy || !!this.app;
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
			if (!this.app || !this.app.core) {
				console.warn('Tauri app core is not available, cannot open link:', url);
				return;
			}

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

	async getPackageData(id: string): Promise<[File, string] | null> {
		if (!this.app || !this.app.core) {
			console.warn('Tauri app core or http module is not available, cannot get package data');
			return null;
		}

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

			const file = new File([blob], 'package.siq', { type: 'application/x-zip-compressed' });
			const packageSource = `https://steamcommunity.com/sharedfiles/filedetails/?id=${itemId}`;

			// Create a File object from the blob
			return [file, packageSource];
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

	async clearGameLog(): Promise<boolean> {
		if (!this.app) {
			window.parent.postMessage({ type: 'clearGameLog' }, '*');
			return true;
		}

		this.currentLogFilePath = null;
		return true;
	}

	async addGameLog(content: string, newLine: boolean): Promise<boolean> {
		if (!this.app || !this.app.core || !this.app.path) {
			window.parent.postMessage({ type: 'addGameLog', payload: { content, newLine } }, '*');
			return true;
		}

		try {
			if (!this.currentLogFilePath) {
				const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
				this.currentLogFilePath = `game-log-${timestamp}.txt`;
			} else if (newLine) {
				content = '\n' + content;
			}

			this.app.core.invoke('append_text_file', { fileName: this.currentLogFilePath, content });

			return true;
		} catch (error) {
			console.error('Failed to write game log to file:', error);
			return false;
		}
	}

	async openGameLog(): Promise<boolean> {
		if (!this.app || !this.app.opener || !this.app.path || !this.currentLogFilePath) {
			window.parent.postMessage({ type: 'openGameLog' }, '*');
			return false;
		}

		try {
			const appLogDir = await this.app.path.appLogDir();

			const fullPath = await this.app.path.resolve(
				appLogDir,
				this.currentLogFilePath,
			);

			console.log(`Opening game log file: ${fullPath}`);
			await this.app.opener.openPath(fullPath);
			return true;
		} catch (error) {
			console.error('Failed to open game log file:', error);
			return false;
		}
	}

	getPackageSource(packageId?: string): string | undefined {
		if (isSteam) {
			return packageId
				? `https://steamcommunity.com/sharedfiles/filedetails/?id=${packageId}`
				: 'https://steamcommunity.com';
		}

		return 'https://www.sibrowser.ru'; // Using this source for statistics for now
	}

	getFallbackPackageSource(): string | undefined {
		return isSteam ? 'https://www.sibrowser.ru' : undefined;
	}

	/**
	 * Upload a workshop package directly to the content service from Rust.
	 * This avoids transferring large files through the webview.
	 *
	 * @param id Workshop item ID
	 * @param packageName Name for the package
	 * @param contentServiceUri URI of the content service to upload to
	 * @param callbacks Upload progress callbacks
	 * @returns Package URI if successful, null otherwise
	 */
	async uploadPackageToContentService(
		id: string,
		packageName: string,
		contentServiceUri: string,
		callbacks: UploadCallbacks,
	): Promise<string | null> {
		const app = this.app;
		if (!app || !app.core || !app.event) {
			console.warn('Tauri app core or event module is not available, cannot upload package directly');
			return null;
		}

		const itemId = parseInt(id, 10);

		if (isNaN(itemId)) {
			console.error('Invalid workshop item ID:', id);
			return null;
		}

		console.log(`Starting direct upload of workshop item ${itemId} to ${contentServiceUri}`);

		let progressUnlisten: (() => void) | null = null;
		let resultUnlisten: (() => void) | null = null;

		const cleanup = () => {
			if (progressUnlisten) {
				progressUnlisten();
			}
			if (resultUnlisten) {
				resultUnlisten();
			}
		};

		try {
			// Set up event listeners first, before invoking the command
			const resultPromise = new Promise<string | null>((resolve) => {
				// We need to set up the listener asynchronously but use the promise synchronously
				// So we'll use a nested approach

				const setupListeners = async () => {
					progressUnlisten = await app.event?.listen<UploadProgressPayload>(
						'upload-progress',
						(event) => {
							if (event.payload.progress === 0 && event.payload.loaded === 0) {
								callbacks.onStartUpload();
							}
							callbacks.onUploadProgress(event.payload.progress);
						}
					) ?? null;

					resultUnlisten = await app.event?.listen<UploadResultPayload>(
						'upload-result',
						(event) => {
							callbacks.onFinishUpload();

							if (event.payload.success && event.payload.uri) {
								console.log(`Package uploaded successfully: ${event.payload.uri}`);
								cleanup();
								resolve(event.payload.uri);
							} else {
								console.error('Package upload failed:', event.payload.error);
								cleanup();
								resolve(null);
							}
						}
					) ?? null;

					// Invoke the Rust command to start the upload
					await app.core?.invoke('upload_workshop_package', {
						itemId,
						contentServiceUri,
						packageName,
					});
				};

				setupListeners().catch((error) => {
					console.error('Failed to set up upload listeners:', error);
					callbacks.onFinishUpload();
					cleanup();
					resolve(null);
				});
			});

			return await resultPromise;
		} catch (error) {
			console.error('Failed to invoke upload_workshop_package:', error);
			callbacks.onFinishUpload();
			cleanup();
			return null;
		}
	}
}