import { Reducer, AnyAction } from 'redux';
import SIPackagesState, { initialState } from './SIPackagesState';
import { KnownSIPackagesAction, SIPackagesActionTypes } from './SIPackagesActions';

const siPackagesReducer: Reducer<SIPackagesState> = (state: SIPackagesState = initialState, anyAction: AnyAction): SIPackagesState => {
	const action = anyAction as KnownSIPackagesAction;

	switch (action.type) {
		case SIPackagesActionTypes.SearchPackages:
			return {
				...state,
				isLoading: true,
				error: null
			};

		case SIPackagesActionTypes.SearchPackagesFinished:
			return {
				...state,
				packages: action.packages,
				isLoading: false
			};

		case SIPackagesActionTypes.SearchPackagesError:
			return {
				...state,
				isLoading: false,
				error: action.error,
			};

		case SIPackagesActionTypes.ReceiveAuthorsFinished:
			return {
				...state,
				authors: action.authors
			};

		case SIPackagesActionTypes.ReceiveTagsFinished:
			return {
				...state,
				tags: action.tags
			};

		case SIPackagesActionTypes.ReceivePublishersFinished:
			return {
				...state,
				publishers: action.publishers
			};

		case SIPackagesActionTypes.ReceiveLanguagesFinished:
			return {
				...state,
				languages: action.languages
			};

		case SIPackagesActionTypes.SetLanguage:
			return {
				...state,
				languageId: action.languageId,
			};

		case SIPackagesActionTypes.ReceiveRestrictionsFinished:
			return {
				...state,
				restrictions: action.restrictions
			};

		default:
			return state;
	}
};

export default siPackagesReducer;
