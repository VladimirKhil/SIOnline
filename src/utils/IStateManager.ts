import { Store } from 'redux';

export default interface IStateManager {
	initAsync(store: Store): Promise<void>;

	onReady(): void;

	isLicenseAccepted(): boolean;

	acceptLicense(): void;

	loadNavigationState(): any;

	saveNavigationState(state: any, url: string | null | undefined): void;
}