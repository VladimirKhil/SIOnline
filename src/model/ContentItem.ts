import ContentType from './enums/ContentType';

/** Defines content item. */
export default interface ContentItem {
	/** Content type. */
	type: ContentType;

	/** Text value or content uri. */
	value: string;

	/** Relative content weight (used for calculating content space size). */
	weight: number;

	/** Should be read. */
	read: boolean;
}
