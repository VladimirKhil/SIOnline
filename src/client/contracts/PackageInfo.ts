import PackageType from './PackageType';

/** Contains public game package info. */
export default interface PackageInfo {
	/** Package type. */
	Type: PackageType;

	/** Package relative or absolute uri. */
	Uri: string;

	/** Content service uri. */
	ContentServiceUri: string | null;

	/** Secret used for accessing package root content file when a custom Content service is used. */
	Secret: string | null;
}