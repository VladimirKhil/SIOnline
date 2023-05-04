import { SIPackageInfo } from '../../model/SIPackageInfo';
import { SearchEntity } from '../../model/SearchEntity';

export default interface SIPackagesState {
	packages: SIPackageInfo[];
	authors: SearchEntity[];
	tags: SearchEntity[];
	publishers: SearchEntity[];
	isLoading: boolean;
	error: string | null;
}

export const initialState: SIPackagesState = {
	authors: [],
	isLoading: false,
	packages: [],
	publishers: [],
	tags: [],
	error: '',
};
