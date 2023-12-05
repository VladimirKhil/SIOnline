import AnswerOption from '../../model/AnswerOption';
import ContentItem from '../../model/ContentItem';
import LayoutMode from '../../model/enums/LayoutMode';
import TableMode from '../../model/enums/TableMode';
import ThemeInfo from '../../model/ThemeInfo';

export default interface TableState {
	mode: TableMode;
	layoutMode: LayoutMode;
	caption: string;
	text: string;
	tail: string;
	audio: string;
	animateReading: boolean;
	canPress: boolean;
	gameThemes: string[];
	roundInfo: ThemeInfo[];
	isSelectable: boolean;
	activeThemeIndex: number;
	actionQuestionIndex: number;
	isMediaStopped: boolean;
	content: ContentItem[];
	answerOptions: AnswerOption[];
}

export const initialState: TableState = {
	mode: TableMode.Logo,
	layoutMode: LayoutMode.Simple,
	caption: '',
	text: '',
	tail: '',
	audio: '',
	animateReading: false,
	canPress: false,
	gameThemes: [],
	roundInfo: [],
	isSelectable: false,
	activeThemeIndex: -1,
	actionQuestionIndex: -1,
	isMediaStopped: false,
	content: [],
	answerOptions: [],
};
