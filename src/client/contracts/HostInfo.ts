export default interface HostInfo {
	name: string;
	host: string;
	port: number;
	packagesPublicBaseUrl: string | null;
	contentPublicBaseUrls: string[] | null;
	license: string;
	maxPackageSizeMb: number;
}
