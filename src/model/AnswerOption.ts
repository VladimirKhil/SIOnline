import ContentItem from './ContentItem';
import ItemState from './enums/ItemState';

/** Defines answer option. */
export default interface AnswerOption {
	/** Option state. */
	state: ItemState;

	/** Option label. */
	label: string;

	/** Option content. */
	content: ContentItem;
}
