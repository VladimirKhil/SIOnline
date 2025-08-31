import PackageType from './PackageType';

/** Contains public game package info. */
export default interface PackageInfo {
	/** Package type. */
	type: PackageType;

	/** Package relative or absolute uri. */
	uri: string;

	/** Content service uri. */
	contentServiceUri: string | null;

	/** Secret used for accessing package root content file when a custom Content service is used. */
	secret: string | null;

	/** Optional source uri of the package. */
	source: string | null;
}