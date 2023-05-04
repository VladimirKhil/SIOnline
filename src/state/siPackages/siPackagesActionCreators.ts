import { Action, ActionCreator, Dispatch } from 'redux';
import getErrorMessage from '../../utils/ErrorHelpers';
import * as SIPackagesActions from './SIPackagesActions';
import { SearchEntity } from '../../model/SearchEntity';
import State from '../State';
import DataContext from '../../model/DataContext';
import { ThunkAction } from 'redux-thunk';
import { PackageFilters } from '../../model/PackageFilters';
import { SIPackageInfo } from '../../model/SIPackageInfo';

const searchPackages: ActionCreator<SIPackagesActions.SearchPackagesAction> = () => ({
	type: SIPackagesActions.SIPackagesActionTypes.SearchPackages
});

const searchPackagesFinished: ActionCreator<SIPackagesActions.SearchPackagesFinishedAction> = (packages: SIPackageInfo[]) => ({
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

const receiveAuthorsFinished: ActionCreator<SIPackagesActions.ReceiveAuthorsFinishedAction> = (authors: SearchEntity[]) => ({
	type: SIPackagesActions.SIPackagesActionTypes.ReceiveAuthorsFinished,
	authors
});

const receiveTags: ActionCreator<SIPackagesActions.ReceiveTagsAction> = () => ({ type: SIPackagesActions.SIPackagesActionTypes.ReceiveTags });

const receiveTagsFinished: ActionCreator<SIPackagesActions.ReceiveTagsFinishedAction> = (tags: SearchEntity[]) => ({
	type: SIPackagesActions.SIPackagesActionTypes.ReceiveTagsFinished,
	tags
});

const receivePublishers: ActionCreator<SIPackagesActions.ReceivePublishersAction> = () => ({
	type: SIPackagesActions.SIPackagesActionTypes.ReceivePublishers
});

const receivePublishersFinished: ActionCreator<SIPackagesActions.ReceivePublishersFinishedAction> = (
	publishers: SearchEntity[]
) => ({
	type: SIPackagesActions.SIPackagesActionTypes.ReceivePublishersFinished,
	publishers
});

const receiveAuthorsThunk: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		try {
			dispatch(receiveAuthors());
			const { apiUri } = dataContext.config;
			const response = await fetch(`${apiUri}/Authors`);

			if (!response.ok) {
				console.error(response.statusText);
				return;
			}

			const data = await response.json();
			dispatch(receiveAuthorsFinished(data));
		} catch (error) {
			dispatch(searchPackagesError(getErrorMessage(error)));
		}
	};

const receiveTagsThunk: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		try {
			dispatch(receiveTags());
			const { apiUri } = dataContext.config;
			const response = await fetch(`${apiUri}/Tags`);

			if (!response.ok) {
				console.error(response.statusText);
				return;
			}

			const data = await response.json();
			dispatch(receiveTagsFinished(data));
		} catch (error) {
			dispatch(searchPackagesError(getErrorMessage(error)));
		}
	};

const receivePublishersThunk: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		try {
			dispatch(receivePublishers());
			const { apiUri } = dataContext.config;
			const response = await fetch(`${apiUri}/Publishers`);

			if (!response.ok) {
				console.error(response.statusText);
				return;
			}

			const data = await response.json();
			dispatch(receivePublishersFinished(data));
		} catch (error) {
			dispatch(searchPackagesError(getErrorMessage(error)));
		}
	};

const searchPackagesThunk: ActionCreator<ThunkAction<void, State, DataContext, Action>> = 
	(filters: PackageFilters = {
		difficultyRelation: 0,
		difficulty: 1,
		sortMode: 0,
		sortAscending: true,
		authorId: null,
		publisherId: null,
		tagId: null,
		restriction: null
	}) => async (dispatch: Dispatch<any>, _: () => State, dataContext: DataContext) => {
	try {
		dispatch(searchPackages());
		const { apiUri } = dataContext.config;

		const response = await fetch(
			`${apiUri}/FilteredPackages?${new URLSearchParams(
				Object.entries(filters)
					.filter(([, value]: [string, PackageFilters[keyof PackageFilters]]) => value ?? false)
					.reduce(
						(acc, [key, value]) => ({
							...acc,
							[key]: value
						}),
						{}
					))}`);

		if (!response.ok) {
			console.error(response.statusText);
			return;
		}

		const data = await response.json();
		dispatch(searchPackagesFinished(data));
	} catch (error) {
		dispatch(searchPackagesError(getErrorMessage(error)));
	}
};

const siPackagesActionCreators = {
	searchPackagesThunk,
	receiveAuthorsThunk,
	receiveTagsThunk,
	receivePublishersThunk,
};

export default siPackagesActionCreators;
