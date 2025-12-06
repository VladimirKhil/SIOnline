import { Store } from 'redux';
import SIStorageInfo from '../client/contracts/SIStorageInfo';
import SIStorageClient from 'sistorage-client';

export enum FullScreenMode {
	Undefined,
	Yes,
	No,
}

/** Callbacks for upload progress reporting */
export interface UploadCallbacks {
	onStartUpload: () => void;
	onUploadProgress: (progress: number) => void;
	onFinishUpload: () => void;
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

	getPackageData(id: string): Promise<[File, string] | null>;

	/** Exits application. */
	exitApp(): void;

	/** Creates game log. */
	clearGameLog(): Promise<boolean>;

	/** Writes game log.*/
	addGameLog(content: string, newLine: boolean): Promise<boolean>;

	/** Opens current game log. */
	openGameLog(): Promise<boolean>;

	getRandomValue?: () => number;

	getPackageSource(packageId?: string): string | undefined;

	getFallbackPackageSource(): string | undefined;

	/**
	 * Upload a package directly to the content service (bypassing web transfer).
	 * This is optional and only supported by certain hosts (e.g., TauriHost with Steam).
	 *
	 * @param id Package ID (e.g., workshop item ID)
	 * @param packageName Name for the package
	 * @param contentServiceUri URI of the content service
	 * @param callbacks Upload progress callbacks
	 * @returns Package URI if successful, null if not supported or failed
	 */
	uploadPackageToContentService?(
		id: string,
		packageName: string,
		contentServiceUri: string,
		callbacks: UploadCallbacks
	): Promise<string | null>;
}