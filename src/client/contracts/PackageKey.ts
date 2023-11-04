import FileKey from './FileKey';

export default interface PackageKey extends FileKey {
	Id: string | null;
}
