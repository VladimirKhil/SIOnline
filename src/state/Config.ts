export default interface Config {
	serverUri?: string;
	serverDiscoveryUri?: string;
	rootUri?: string;
	useMessagePackProtocol?: boolean;
	ads?: string;
	forceHttps?: boolean;
	rewriteUrl?: boolean;
}
