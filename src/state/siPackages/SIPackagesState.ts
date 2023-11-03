import Restriction from 'sistorage-client/dist/models/Restriction';
import PackagesPage from 'sistorage-client/dist/models/PackagesPage';

export default interface SIPackagesState {
	packages: PackagesPage;
	authors: Record<number, string>;
	tags: Record<number, string>;
	publishers: Record<number, string>;
	languages: Record<number, string>;
	restrictions: Record<number, Restriction>;
	isLoading: boolean;
	error: string | null;
	languageId?: number;
}

export const initialState: SIPackagesState = {
	authors: {},
	isLoading: false,

	packages: {
		packages: [],
		total: 0,
	},

	publishers: {},
	tags: {},
	languages: {},
	restrictions: [],
	error: '',
};
