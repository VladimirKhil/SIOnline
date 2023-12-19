import ContentItem from './ContentItem';

/** Defines content group. */
export default interface ContentGroup {
	/** Group content. */
	content: ContentItem[];

	/** Relative group weight (used for calculating group space size). */
	weight: number;

	/** Group row count. */
	columnCount: number;
}
