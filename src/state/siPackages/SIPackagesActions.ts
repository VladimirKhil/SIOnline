import Restriction from 'sistorage-client/dist/models/Restriction';
import PackagesPage from 'sistorage-client/dist/models/PackagesPage';

export const enum SIPackagesActionTypes {
	SearchPackages = 'SEARCH_PACKAGES',
	SearchPackagesFinished = 'SEARCH_PACKAGES_FINISHED',
	SearchPackagesError = 'SEARCH_PACKAGES_ERROR',
	ReceiveAuthors = 'RECEIVE_AUTHORS',
	ReceiveAuthorsFinished = 'RECEIVE_AUTHORS_FINISHED',
	ReceiveTags = 'RECEIVE_TAGS',
	ReceiveTagsFinished = 'RECEIVE_TAGS_FINISHED',
	ReceivePublishers = 'RECEIVE_PUBLISHERS',
	ReceivePublishersFinished = 'RECEIVE_PUBLISHERS_FINISHED',
	ReceiveLanguages = 'RECEIVE_PUBLISHERS',
	ReceiveLanguagesFinished = 'RECEIVE_LANGUAGES_FINISHED',
	SetLanguage = 'SET_LANGUAGE',
	ReceiveRestrictions = 'RECEIVE_RESTRICTIONS',
	ReceiveRestrictionsFinished = 'RECEIVE_RESTRICTIONS_FINISHED',
}

export type SearchPackagesAction = { type: SIPackagesActionTypes.SearchPackages };
export type SearchPackagesFinishedAction = { type: SIPackagesActionTypes.SearchPackagesFinished, packages: PackagesPage };
export type SearchPackagesErrorAction = { type: SIPackagesActionTypes.SearchPackagesError, error: string | null };
export type ReceiveAuthorsAction = { type: SIPackagesActionTypes.ReceiveAuthors };
export type ReceiveAuthorsFinishedAction = { type: SIPackagesActionTypes.ReceiveAuthorsFinished, authors: Record<number, string> };
export type ReceiveTagsAction = { type: SIPackagesActionTypes.ReceiveTags };
export type ReceiveTagsFinishedAction = { type: SIPackagesActionTypes.ReceiveTagsFinished, tags: Record<number, string> };
export type ReceivePublishersAction = { type: SIPackagesActionTypes.ReceivePublishers };
export type ReceivePublishersFinishedAction = { type: SIPackagesActionTypes.ReceivePublishersFinished, publishers: Record<number, string> };
export type ReceiveLanguagesAction = { type: SIPackagesActionTypes.ReceiveLanguages };
export type ReceiveLanguagesFinishedAction = { type: SIPackagesActionTypes.ReceiveLanguagesFinished, languages: Record<number, string> };
export type SetLanguageAction = { type: SIPackagesActionTypes.SetLanguage, languageId: number };
export type ReceiveRestrictionsAction = { type: SIPackagesActionTypes.ReceiveRestrictions };

export type ReceiveRestrictionsFinishedAction = {
	type: SIPackagesActionTypes.ReceiveRestrictionsFinished,
	restrictions: Record<number, Restriction>; };

export type KnownSIPackagesAction =
	SearchPackagesAction
	| SearchPackagesFinishedAction
	| SearchPackagesErrorAction
	| ReceiveAuthorsAction
	| ReceiveAuthorsFinishedAction
	| ReceiveTagsAction
	| ReceiveTagsFinishedAction
	| ReceivePublishersAction
	| ReceivePublishersFinishedAction
	| ReceiveLanguagesAction
	| ReceiveLanguagesFinishedAction
	| SetLanguageAction
	| ReceiveRestrictionsAction
	| ReceiveRestrictionsFinishedAction;
