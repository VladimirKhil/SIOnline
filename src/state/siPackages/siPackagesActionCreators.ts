import { Action, ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import getErrorMessage from '../../utils/ErrorHelpers';
import * as SIPackagesActions from './SIPackagesActions';
import State from '../State';
import DataContext from '../../model/DataContext';
import PackageFilters from 'sistorage-client/dist/models/PackageFilters';
import PackageSelectionParameters from 'sistorage-client/dist/models/PackageSelectionParameters';
import Restriction from 'sistorage-client/dist/models/Restriction';
import PackagesPage from 'sistorage-client/dist/models/PackagesPage';
import { arrayToRecord, arrayToValue } from '../../utils/ArrayExtensions';
import localization from '../../model/resources/localization';
import { getFullCulture } from '../../utils/StateHelpers';

const searchPackages: ActionCreator<SIPackagesActions.SearchPackagesAction> = () => ({
	type: SIPackagesActions.SIPackagesActionTypes.SearchPackages
});

const searchPackagesFinished: ActionCreator<SIPackagesActions.SearchPackagesFinishedAction> = (packages: PackagesPage) => ({
	type: SIPackagesActions.SIPackagesActionTypes.SearchPackagesFinished,
	packages
});

const searchPackagesError: ActionCreator<SIPackagesActions.SearchPackagesErrorAction> = (error: string | null) => ({
	type: SIPackagesActions.SIPackagesActionTypes.SearchPackagesError,
	error
});

const receiveAuthors: ActionCreator<SIPackagesActions.ReceiveAuthorsAction> = () => ({
	type: SIPackagesActions.SIPackagesActionTypes.ReceiveAuthors
});

const receiveAuthorsFinished: ActionCreator<SIPackagesActions.ReceiveAuthorsFinishedAction> = (authors: Record<number, string>) => ({
	type: SIPackagesActions.SIPackagesActionTypes.ReceiveAuthorsFinished,
	authors
});

const receiveTags: ActionCreator<SIPackagesActions.ReceiveTagsAction> = () => ({ type: SIPackagesActions.SIPackagesActionTypes.ReceiveTags });

const receiveTagsFinished: ActionCreator<SIPackagesActions.ReceiveTagsFinishedAction> = (tags: Record<number, string>) => ({
	type: SIPackagesActions.SIPackagesActionTypes.ReceiveTagsFinished,
	tags
});

const receivePublishers: ActionCreator<SIPackagesActions.ReceivePublishersAction> = () => ({
	type: SIPackagesActions.SIPackagesActionTypes.ReceivePublishers
});

const receivePublishersFinished: ActionCreator<SIPackagesActions.ReceivePublishersFinishedAction> = (
	publishers: Record<number, string>
) => ({
	type: SIPackagesActions.SIPackagesActionTypes.ReceivePublishersFinished,
	publishers
});

const receiveLanguagesFinished: ActionCreator<SIPackagesActions.ReceiveLanguagesFinishedAction> = (
	languages: Record<number, string>
) => ({
	type: SIPackagesActions.SIPackagesActionTypes.ReceiveLanguagesFinished,
	languages
});

const receiveRestrictionsFinished: ActionCreator<SIPackagesActions.ReceiveRestrictionsFinishedAction> = (
	restrictions: Record<number, Restriction>
) => ({
	type: SIPackagesActions.SIPackagesActionTypes.ReceiveRestrictionsFinished,
	restrictions
});

const receiveAuthorsThunk: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (dispatch: Dispatch<any>, _: () => State, dataContext: DataContext) => {
		try {
			if (!dataContext.storageClient) {
				return;
			}

			dispatch(receiveAuthors());
			const authors = await dataContext.storageClient.facets.getAuthorsAsync();
			dispatch(receiveAuthorsFinished(arrayToValue(authors, author => author.id, author => author.name)));
		} catch (error) {
			dispatch(searchPackagesError(getErrorMessage(error)));
		}
	};

const receiveTagsThunk: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (dispatch: Dispatch<any>, _getState: () => State, dataContext: DataContext) => {
		try {
			if (!dataContext.storageClient) {
				return;
			}

			dispatch(receiveTags());
			const tags = await dataContext.storageClient.facets.getTagsAsync();
			dispatch(receiveTagsFinished(arrayToValue(tags, tag => tag.id, tag => tag.name)));
		} catch (error) {
			dispatch(searchPackagesError(getErrorMessage(error)));
		}
	};

const receivePublishersThunk: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (dispatch: Dispatch<any>, _getState: () => State, dataContext: DataContext) => {
		try {
			if (!dataContext.storageClient) {
				return;
			}

			dispatch(receivePublishers());
			const publishers = await dataContext.storageClient.facets.getPublishersAsync();
			dispatch(receivePublishersFinished(arrayToValue(publishers, publisher => publisher.id, publisher => publisher.name)));
		} catch (error) {
			dispatch(searchPackagesError(getErrorMessage(error)));
		}
	};

const setLanguage: ActionCreator<SIPackagesActions.SetLanguageAction> = (
	languageId: number
) => ({
	type: SIPackagesActions.SIPackagesActionTypes.SetLanguage,
	languageId
});

const receiveLanguagesThunk: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		try {
			if (!dataContext.storageClient) {
				return;
			}

			const languages = await dataContext.storageClient.facets.getLanguagesAsync();
			dispatch(receiveLanguagesFinished(arrayToValue(languages, language => language.id, language => language.code)));

			const currentLanguage = getFullCulture(getState());
			const language = languages.find(l => l.code === currentLanguage);

			if (language) {
				dispatch(setLanguage(language.id));
			}
		} catch (error) {
			dispatch(searchPackagesError(getErrorMessage(error)));
		}
	};

const receiveRestrictionsThunk: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		try {
			if (!dataContext.storageClient) {
				return;
			}

			const restrictions = await dataContext.storageClient.facets.getRestrictionsAsync();
			dispatch(receiveRestrictionsFinished(arrayToRecord(restrictions, r => r.id)));
		} catch (error) {
			dispatch(searchPackagesError(getErrorMessage(error)));
		}
	};

const searchPackagesThunk: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(filters: PackageFilters, selectionParameters: PackageSelectionParameters) => async (
		dispatch: Dispatch<any>,
		getState: () => State,
		dataContext: DataContext
	) => {
	try {
		const { storageClient } = dataContext;

		if (!storageClient) {
			return;
		}

		const { languageId } = getState().siPackages;

		dispatch(searchPackages());
		const packagesPage = await storageClient.packages.getPackagesAsync({ ...filters, languageId }, selectionParameters);
		dispatch(searchPackagesFinished(packagesPage));
	} catch (error) {
		dispatch(searchPackagesError(getErrorMessage(error)));
	}
};

const siPackagesActionCreators = {
	searchPackagesThunk,
	receiveAuthorsThunk,
	receiveTagsThunk,
	receivePublishersThunk,
	receiveLanguagesThunk,
	receiveRestrictionsThunk,
};

export default siPackagesActionCreators;
