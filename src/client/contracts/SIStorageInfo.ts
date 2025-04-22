/** Contains information about SI Storage service. */
export default interface SIStorageInfo {
	/** Storage service identifier. */
	id: string;

	/** Storage service uri. */
	serviceUri: string;

	/** Storage service name. */
	name: string;

	/** Are random packages supported. */
	randomPackagesSupported: boolean;

	/** Are integer identifiers supported. */
	identifiersSupported: boolean;

	/** Maximum package search page size. */
	maximumPageSize: number;

	/** Public storage uri. */
	uri: string;

	/** Package properties supported by storage. */
	packageProperties: string[];

	/** Facets supported by storage. */
	facets: string[];

	/** Does storage support limited API. */
	limitedApi?: boolean;
}