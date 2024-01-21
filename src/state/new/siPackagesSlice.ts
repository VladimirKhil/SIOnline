import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import PackagesPage from 'sistorage-client/dist/models/PackagesPage';
import Restriction from 'sistorage-client/dist/models/Restriction';

interface SIPackagesState {
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

const initialState: SIPackagesState = {
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

export const siPackagesSlice = createSlice({
	name: 'siPackages',
	initialState,
	reducers: {
		setInProgress: (state: SIPackagesState, action: PayloadAction<boolean>) => {

		}
	}
});

export const {
	setInProgress
} = siPackagesSlice.actions;

export default siPackagesSlice.reducer;