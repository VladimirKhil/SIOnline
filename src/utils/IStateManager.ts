import { Store } from 'redux';

export enum FullScreenMode {
	Undefined,
	Yes,
	No,
}

export default interface IStateManager {
	initAsync(store: Store): Promise<void>;

	onReady(): void;

	isLicenseAccepted(): boolean;

	acceptLicense(): void;

	loadNavigationState(): any;

	saveNavigationState(state: any, url: string | null | undefined): void;

	isFullScreenSupported(): boolean;

	detectFullScreen(): FullScreenMode;

	setFullScreen(fullScreen: boolean): Promise<boolean>;
}