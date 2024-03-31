import { Store } from 'redux';
import { getCookie, setCookie } from './CookieHelpers';
import IStateManager from './IStateManager';

const ACCEPT_LICENSE_KEY = 'ACCEPT_LICENSE';

export default class StateManager implements IStateManager {
	initAsync(store: Store): Promise<void> {
		return Promise.resolve();
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

	saveNavigationState(state: any, url: string | null | undefined) {
		window.history.pushState(state, '', url);
	}
}