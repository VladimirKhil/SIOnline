export default interface HostInfo {
	host: string;
	port: number;
	packagesPublicBaseUrl: string | null;
	contentPublicBaseUrls: string[] | null;
}
