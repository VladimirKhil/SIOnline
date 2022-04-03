import FileKey from './FileKey';

export default interface PackageKey extends FileKey {
	id: string | null;
}
