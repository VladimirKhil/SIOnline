import ContentType from './enums/ContentType';

/** Defines content item. */
export default interface ContentItem {
	/** Content type. */
	type: ContentType;

	/** Text value or content uri. */
	value: string;

	/** Should be read. */
	read: boolean;

	/** Should be output partially. */
	partial: boolean;
}
