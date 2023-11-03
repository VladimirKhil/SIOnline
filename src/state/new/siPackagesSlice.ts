import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Author from 'sistorage-client/dist/models/Author';
import Language from 'sistorage-client/dist/models/Language';
import Package from 'sistorage-client/dist/models/Package';
import Publisher from 'sistorage-client/dist/models/Publisher';
import Restriction from 'sistorage-client/dist/models/Restriction';
import Tag from 'sistorage-client/dist/models/Tag';

interface SIPackagesState {
	packages: Package[];
	authors: Author[];
	tags: Tag[];
	publishers: Publisher[];
	languages: Language[];
	restrictions: Restriction[];
	isLoading: boolean;
	error: string | null;
	languageId?: number;
}

const initialState: SIPackagesState = {
	authors: [],
	isLoading: false,
	packages: [],
	publishers: [],
	tags: [],
	languages: [],
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