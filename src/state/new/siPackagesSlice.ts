import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SearchEntity } from '../../model/SearchEntity';
import { SIPackageInfo } from '../../model/SIPackageInfo';

interface SIPackagesState {
	packages: SIPackageInfo[];
	authors: SearchEntity[];
	tags: SearchEntity[];
	publishers: SearchEntity[];
	isLoading: boolean;
}

const initialState: SIPackagesState = {
	authors: [],
	isLoading: false,
	packages: [],
	publishers: [],
	tags: []
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