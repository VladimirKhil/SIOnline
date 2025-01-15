import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import PackagesPage from 'sistorage-client/dist/models/PackagesPage';
import Restriction from 'sistorage-client/dist/models/Restriction';
import DataContext from '../model/DataContext';
import { RootState } from './store';
import getErrorMessage from '../utils/ErrorHelpers';
import { arrayToRecord, arrayToValue } from '../utils/ArrayExtensions';
import { getFullCulture } from '../utils/StateHelpers';
import State from './State';

export interface SIPackagesState {
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

export const receiveAuthors = createAsyncThunk(
	'siPackages/receiveAuthors',
	async (arg: void, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		const { storageClient } = dataContext;

		if (!storageClient) {
			return;
		}

		const { languageId } = (thunkAPI.getState() as RootState).siPackages;
		const authors = await storageClient.facets.getAuthorsAsync(languageId);
		return authors;
	}
);

export const receiveTags = createAsyncThunk(
	'siPackages/receiveTags',
	async (arg: void, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		const { storageClient } = dataContext;

		if (!storageClient) {
			return;
		}

		const { languageId } = (thunkAPI.getState() as RootState).siPackages;
		const tags = await storageClient.facets.getTagsAsync(languageId);
		return tags;
	}
);

export const receivePublishers = createAsyncThunk(
	'siPackages/receivePublishers',
	async (arg: void, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		const { storageClient } = dataContext;

		if (!storageClient) {
			return;
		}

		const { languageId } = (thunkAPI.getState() as RootState).siPackages;
		const publishers = await storageClient.facets.getPublishersAsync(languageId);
		return publishers;
	}
);

export const receiveLanguages = createAsyncThunk(
	'siPackages/receiveLanguages',
	async (arg: void, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		const { storageClient } = dataContext;

		if (!storageClient) {
			return;
		}

		const languages = await storageClient.facets.getLanguagesAsync();
		const currentLanguage = getFullCulture(thunkAPI.getState() as State);

		return { languages, currentLanguage };
	}
);

export const receiveRestrictions = createAsyncThunk(
	'siPackages/receiveRestrictions',
	async (arg: void, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		const { storageClient } = dataContext;

		if (!storageClient) {
			return;
		}

		const restrictions = await storageClient.facets.getRestrictionsAsync();
		return restrictions;
	}
);

export const searchPackages = createAsyncThunk(
	'siPackages/searchPackages',
	async (arg: any, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		const { storageClient } = dataContext;

		if (!storageClient) {
			return;
		}

		const { languageId } = (thunkAPI.getState() as RootState).siPackages;
		const { filters, selectionParameters } = arg;
		const packagesPage = await storageClient.packages.getPackagesAsync({ ...filters, languageId }, selectionParameters);
		return packagesPage;
	}
);

export const siPackagesSlice = createSlice({
	name: 'siPackages',
	initialState,
	reducers: { },
	extraReducers: (builder) => {
		builder.addCase(receiveAuthors.fulfilled, (state, action) => {
			if (action.payload) {
				state.authors = arrayToValue(action.payload, author => author.id, author => author.name);
			}
		});

		builder.addCase(receiveAuthors.rejected, (state, action) => {
			state.error = getErrorMessage(action.error);
		});

		builder.addCase(receiveTags.fulfilled, (state, action) => {
			if (action.payload) {
				state.tags = arrayToValue(action.payload, tag => tag.id, tag => tag.name);
			}
		});

		builder.addCase(receiveTags.rejected, (state, action) => {
			state.error = getErrorMessage(action.error);
		});

		builder.addCase(receivePublishers.fulfilled, (state, action) => {
			if (action.payload) {
				state.publishers = arrayToValue(action.payload, publisher => publisher.id, publisher => publisher.name);
			}
		});

		builder.addCase(receivePublishers.rejected, (state, action) => {
			state.error = getErrorMessage(action.error);
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
			state.error = getErrorMessage(action.error);
		});

		builder.addCase(receiveRestrictions.fulfilled, (state, action) => {
			if (action.payload) {
				state.restrictions = arrayToRecord(action.payload, r => r.id);
			}
		});

		builder.addCase(receiveRestrictions.rejected, (state, action) => {
			state.error = getErrorMessage(action.error);
		});

		builder.addCase(searchPackages.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		});

		builder.addCase(searchPackages.fulfilled, (state, action) => {
			if (action.payload) {
				state.packages = action.payload;
			}

			state.isLoading = false;
		});

		builder.addCase(searchPackages.rejected, (state, action) => {
			state.isLoading = false;
			state.error = getErrorMessage(action.error);
		});
	},
});

export default siPackagesSlice.reducer;