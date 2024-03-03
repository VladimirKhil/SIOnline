export default interface Config {
	serverUri?: string;
	serverDiscoveryUri?: string;
	rootUri?: string;
	ads?: string;
	registerServiceWorker?: boolean;
	enableNoSleep?: boolean;
	askForConsent?: boolean;
	siStatisticsServiceUri: string;
	emojiCultures?: string[];
	clearUrls?: boolean;
}
