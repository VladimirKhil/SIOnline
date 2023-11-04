/** Defines well-known package type. */
const enum PackageType {
	/** Prepared content. It's files are publicly accessed but root content file is protected with secret. */
	Content = 'Content',
	/** Library file. It is accessed a as single file with no password and should be extracted before use. */
	LibraryItem = 'LibraryItem',
}

export default PackageType;