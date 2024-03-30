import { getCookie, setCookie } from './CookieHelpers';

const ACCEPT_LICENSE_KEY = 'ACCEPT_LICENSE';

export default class StateManager {
	initAsync(): Promise<void> {
		return Promise.resolve();
	}

	isLicenseAccepted() {
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