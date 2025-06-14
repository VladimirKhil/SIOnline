import { Store } from 'redux';
import SIStorageInfo from '../client/contracts/SIStorageInfo';
import SIStorageClient from 'sistorage-client';

export enum FullScreenMode {
	Undefined,
	Yes,
	No,
}

export default interface IHost {
	isDesktop(): boolean;

	initAsync(store: Store): Promise<void>;

	onReady(): void;

	isLicenseAccepted(): boolean;

	acceptLicense(): void;

	loadNavigationState(): any;

	saveNavigationState(state: any, url: string | null | undefined, popCurrentState: boolean): void;

	isFullScreenSupported(): boolean;

	detectFullScreen(): FullScreenMode;

	setFullScreen(fullScreen: boolean): Promise<boolean>;

	copyToClipboard(text: string): void;

	copyUriToClipboard(): void;

	openLink(url: string): void;

	getStorage(): { storageClient?: SIStorageClient; storageInfo?: SIStorageInfo; };

	getPackageData(id: string): Promise<File | null>;

	/** Exits application. */
	exitApp(): void;

	/** Creates game log. */
	clearGameLog(): Promise<boolean>;

	/** Writes game log.*/
	addGameLog(content: string, newLine: boolean): Promise<boolean>;

	/** Opens current game log. */
	openGameLog(): Promise<boolean>;

	getRandomValue?: () => number;

	messageHandler?: (message: string) => void;
}