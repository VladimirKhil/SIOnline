import { SIPackageInfo } from '../../model/SIPackageInfo';
import { SearchEntity } from '../../model/SearchEntity';

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
}

export type SearchPackagesAction = { type: SIPackagesActionTypes.SearchPackages };
export type SearchPackagesFinishedAction = { type: SIPackagesActionTypes.SearchPackagesFinished, packages: SIPackageInfo[] };
export type SearchPackagesErrorAction = { type: SIPackagesActionTypes.SearchPackagesError, error: string | null };
export type ReceiveAuthorsAction = { type: SIPackagesActionTypes.ReceiveAuthors };
export type ReceiveAuthorsFinishedAction = { type: SIPackagesActionTypes.ReceiveAuthorsFinished, authors: SearchEntity[] };
export type ReceiveTagsAction = { type: SIPackagesActionTypes.ReceiveTags };
export type ReceiveTagsFinishedAction = { type: SIPackagesActionTypes.ReceiveTagsFinished, tags: SearchEntity[] };
export type ReceivePublishersAction = { type: SIPackagesActionTypes.ReceivePublishers };
export type ReceivePublishersFinishedAction = { type: SIPackagesActionTypes.ReceivePublishersFinished, publishers: SearchEntity[] };

export type KnownSIPackagesAction =
	SearchPackagesAction
	| SearchPackagesFinishedAction
	| SearchPackagesErrorAction
	| ReceiveAuthorsAction
	| ReceiveAuthorsFinishedAction
	| ReceiveTagsAction
	| ReceiveTagsFinishedAction
	| ReceivePublishersAction
	| ReceivePublishersFinishedAction;
