import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import PackagesPage from 'sistorage-client/dist/models/PackagesPage';
import Restriction from 'sistorage-client/dist/models/Restriction';
import DataContext from '../model/DataContext';
import { RootState } from './store';
import getErrorMessage from '../utils/ErrorHelpers';
import { arrayToRecord, arrayToValue } from '../utils/ArrayExtensions';
import { getFullCulture } from '../utils/StateHelpers';
import State from './State';

export interface StorageInfo {
	name: string;
	randomPackagesSupported: boolean;
	useIdentifiers: boolean;
	facets: string[];
	pageSize: number;
	uri?: string;
}

export interface SIPackagesState {
	storages: StorageInfo[];
	storageIndex: number;
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
	storages: [],
	storageIndex: 0,
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

export const receiveAuthors = createAsyncThunk(
	'siPackages/receiveAuthors',
	async (arg: void, thunkAPI) => {
		const state = thunkAPI.getState() as RootState;
		const { languageId, storageIndex } = state.siPackages;
		const dataContext = thunkAPI.extra as DataContext;
		const { storageClients } = dataContext;
		const storageClient = storageClients[storageIndex];
		const storage = state.siPackages.storages[storageIndex];

		if (!storageClient || !storage || (storage.facets.length > 0 && storage.facets.indexOf('authors') === -1)) {
			return;
		}

		const authors = await storageClient.facets.getAuthorsAsync(languageId);
		return authors;
	}
);

export const receiveTags = createAsyncThunk(
	'siPackages/receiveTags',
	async (arg: void, thunkAPI) => {
		const state = thunkAPI.getState() as RootState;
		const { languageId, storageIndex } = state.siPackages;
		const dataContext = thunkAPI.extra as DataContext;
		const { storageClients } = dataContext;
		const storageClient = storageClients[storageIndex];
		const storage = state.siPackages.storages[storageIndex];

		if (!storageClient || !storage || (storage.facets.length > 0 && storage.facets.indexOf('tags') === -1)) {
			return;
		}

		let tags = await storageClient.facets.getTagsAsync(languageId);

		if (!storage.useIdentifiers) {
			tags = tags.map((tag, index) => ({ ...tag, id: index }));
		}

		return tags;
	}
);

export const receivePublishers = createAsyncThunk(
	'siPackages/receivePublishers',
	async (arg: void, thunkAPI) => {
		const state = thunkAPI.getState() as RootState;
		const { languageId, storageIndex } = state.siPackages;
		const dataContext = thunkAPI.extra as DataContext;
		const { storageClients } = dataContext;
		const storageClient = storageClients[storageIndex];
		const storage = state.siPackages.storages[storageIndex];

		if (!storageClient || !storage || (storage.facets.length > 0 && storage.facets.indexOf('publishers') === -1)) {
			return;
		}

		const publishers = await storageClient.facets.getPublishersAsync(languageId);
		return publishers;
	}
);

export const receiveLanguages = createAsyncThunk(
	'siPackages/receiveLanguages',
	async (arg: void, thunkAPI) => {
		const state = thunkAPI.getState() as RootState;
		const { storageIndex } = state.siPackages;
		const dataContext = thunkAPI.extra as DataContext;
		const { storageClients } = dataContext;
		const storageClient = storageClients[storageIndex];
		const storage = state.siPackages.storages[storageIndex];
		const currentLanguage = getFullCulture(state as State);

		if (!storageClient || !storage || (storage.facets.length > 0 && storage.facets.indexOf('languages') === -1)) {
			return {
				languages: [{
					id: 0,
					code: currentLanguage,
					name: currentLanguage,
				}],
				currentLanguage,
			};
		}

		const languages = await storageClient.facets.getLanguagesAsync();

		return { languages, currentLanguage };
	}
);

export const receiveRestrictions = createAsyncThunk(
	'siPackages/receiveRestrictions',
	async (arg: void, thunkAPI) => {
		const state = thunkAPI.getState() as RootState;
		const { storageIndex } = state.siPackages;
		const dataContext = thunkAPI.extra as DataContext;
		const { storageClients } = dataContext;
		const storageClient = storageClients[storageIndex];
		const storage = state.siPackages.storages[storageIndex];

		if (!storageClient || !storage || (storage.facets.length > 0 && storage.facets.indexOf('restrictions') === -1)) {
			return;
		}

		const restrictions = await storageClient.facets.getRestrictionsAsync();
		return restrictions;
	}
);

export const searchPackages = createAsyncThunk(
	'siPackages/searchPackages',
	async (arg: any, thunkAPI) => {
		const state = thunkAPI.getState() as RootState;
		const { storageIndex, languageId } = state.siPackages;
		const dataContext = thunkAPI.extra as DataContext;
		const { storageClients } = dataContext;
		const storageClient = storageClients[storageIndex];

		if (!storageClient) {
			return;
		}

		const { filters, selectionParameters } = arg;
		const packagesPage = await storageClient.packages.getPackagesAsync({ ...filters, languageId }, selectionParameters);
		return packagesPage;
	}
);

export const searchPackagesByValueFilters = createAsyncThunk(
	'siPackages/searchPackagesByValueFilters',
	async (arg: any, thunkAPI) => {
		const state = thunkAPI.getState() as RootState;
		const { storageIndex, languageId } = state.siPackages;
		const language = languageId ? state.siPackages.languages[languageId] : null;
		const dataContext = thunkAPI.extra as DataContext;
		const { storageClients } = dataContext;
		const storageClient = storageClients[storageIndex];

		if (!storageClient) {
			return;
		}

		const { valueFilters, selectionParameters } = arg;
		const packagesPage = await storageClient.packages.getPackagesByValueFiltersAsync({ ...valueFilters, language }, selectionParameters);
		return packagesPage;
	}
);

export const siPackagesSlice = createSlice({
	name: 'siPackages',
	initialState,
	reducers: {
		setStorages: (state, action) => {
			state.storages = action.payload;
		},
		setStorageIndex: (state, action) => {
			state.storageIndex = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(receiveAuthors.fulfilled, (state, action) => {
			if (action.payload) {
				state.authors = arrayToValue(action.payload, author => author.id, author => author.name);
			}
		});

		builder.addCase(receiveAuthors.rejected, (state, action) => {
			state.error = getErrorMessage(action.error.message);
		});

		builder.addCase(receiveTags.fulfilled, (state, action) => {
			if (action.payload) {
				state.tags = arrayToValue(action.payload, tag => tag.id, tag => tag.name);
			}
		});

		builder.addCase(receiveTags.rejected, (state, action) => {
			state.error = getErrorMessage(action.error.message);
		});

		builder.addCase(receivePublishers.fulfilled, (state, action) => {
			if (action.payload) {
				state.publishers = arrayToValue(action.payload, publisher => publisher.id, publisher => publisher.name);
			}
		});

		builder.addCase(receivePublishers.rejected, (state, action) => {
			state.error = getErrorMessage(action.error.message);
		});

		builder.addCase(receiveLanguages.fulfilled, (state, action) => {
			if (action.payload) {
				state.languages = arrayToValue(action.payload.languages, language => language.id, language => language.code);

				const language = action.payload.languages.find(l => l.code === action.payload?.currentLanguage);

				if (language) {
					state.languageId = language.id;
				}
			}
		});

		builder.addCase(receiveLanguages.rejected, (state, action) => {
			state.error = getErrorMessage(action.error.message);
		});

		builder.addCase(receiveRestrictions.fulfilled, (state, action) => {
			if (action.payload) {
				state.restrictions = arrayToRecord(action.payload, r => r.id);
			}
		});

		builder.addCase(receiveRestrictions.rejected, (state, action) => {
			state.error = getErrorMessage(action.error.message);
		});

		builder.addCase(searchPackages.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		});

		builder.addCase(searchPackagesByValueFilters.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		});

		builder.addCase(searchPackages.fulfilled, (state, action) => {
			if (action.payload) {
				state.packages = action.payload;
			}

			state.isLoading = false;
		});

		builder.addCase(searchPackagesByValueFilters.fulfilled, (state, action) => {
			if (action.payload) {
				state.packages = action.payload;
			}

			state.isLoading = false;
		});

		builder.addCase(searchPackages.rejected, (state, action) => {
			state.isLoading = false;
			state.error = getErrorMessage(action.error.message);
		});

		builder.addCase(searchPackagesByValueFilters.rejected, (state, action) => {
			state.isLoading = false;
			state.error = getErrorMessage(action.error.message);
		});
	},
});

export const {
	setStorages,
	setStorageIndex,
} = siPackagesSlice.actions;

export default siPackagesSlice.reducer;