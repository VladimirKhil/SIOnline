import { Store } from 'redux';

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

	/** Exits application. */
	exitApp(): void;
}