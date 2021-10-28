import RestrictionType from './enums/RestrictionType';

export interface SIPackageInfo {
	authors: string;
	description: string;
	difficulty: number;
	guid: string;
	restriction: RestrictionType;
	id: number;
	logo: string;
	publishedDate: string;
	publisher: string;
	tags: string;
}
