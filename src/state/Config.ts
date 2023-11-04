export default interface Config {
	serverUri?: string;
	apiUri?: string;
	serverDiscoveryUri?: string;
	rootUri?: string;
	ads?: string;
	rewriteUrl?: boolean;
	registerServiceWorker?: boolean;
	enableNoSleep?: boolean;
	askForConsent?: boolean;
}
