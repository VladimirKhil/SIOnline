import { Store } from 'redux';
import { getCookie, setCookie } from '../utils/CookieHelpers';
import IHost, { FullScreenMode } from './IHost';
import SIStorageClient from 'sistorage-client';
import SIStorageInfo from '../client/contracts/SIStorageInfo';

const ACCEPT_LICENSE_KEY = 'ACCEPT_LICENSE';

export default class BrowserHost implements IHost {
	private gameLog = '';

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

	getPackageData(id: string): Promise<[File, string] | null> {
		return new Promise(() => null);
	}

	exitApp() {}

	async clearGameLog(): Promise<boolean> {
		this.gameLog = '';
		return true;
	}

	async addGameLog(content: string, newLine: boolean): Promise<boolean> {
		if (newLine && this.gameLog.length > 0) {
			this.gameLog += '\n';
		}

		this.gameLog += content;
		return true;
	}

	async openGameLog(): Promise<boolean> {
		// Create a blob with the game log
		const blob = new Blob([this.gameLog], { type: 'text/plain' });

		// Create a temporary URL for the blob
		const url = URL.createObjectURL(blob);

		// Create a download link and click it
		const link = document.createElement('a');
		link.href = url;
		link.download = `game-log-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
		document.body.appendChild(link);
		link.click();

		// Clean up
		URL.revokeObjectURL(url);
		document.body.removeChild(link);
		return true;
	}

	getPackageSource(_packageId?: string): string | undefined {
		return 'https://www.sibrowser.ru'; // Using this source for statistics for now
	}

	getFallbackPackageSource(): string | undefined {
		return undefined;
	}
}