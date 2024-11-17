export default interface Config {
	serverUri?: string;
	serverDiscoveryUri?: string;
	rootUri?: string;
	ads?: string;
	rewriteUrl?: boolean;
	registerServiceWorker?: boolean;
	enableNoSleep?: boolean;
	askForConsent?: boolean;
	siStatisticsServiceUri: string;
	appRegistryServiceUri: string;
	emojiCultures?: string[];
	clearUrls?: boolean;
}
