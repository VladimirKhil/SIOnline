import AnswerOption from '../../model/AnswerOption';
import ContentGroup from '../../model/ContentGroup';
import LayoutMode from '../../model/enums/LayoutMode';
import TableMode from '../../model/enums/TableMode';
import ThemeInfo from '../../model/ThemeInfo';

export default interface TableState {
	mode: TableMode;
	layoutMode: LayoutMode;
	caption: string;
	header: string;
	text: string;
	tail: string;
	hint: string;
	audio: string;
	rotate: boolean;
	canPress: boolean;
	canPressUpdateTime: number;
	gameThemes: string[];
	roundInfo: ThemeInfo[];
	isSelectable: boolean;
	activeThemeIndex: number;
	actionQuestionIndex: number;
	isMediaStopped: boolean;
	content: ContentGroup[];
	answerOptions: AnswerOption[];
	prependText: string;
	appendText: string;
	contentLoadProgress: number;
	isAnswer: boolean;
}

export const initialState: TableState = {
	mode: TableMode.Logo,
	layoutMode: LayoutMode.Simple,
	caption: '',
	header: '',
	text: '',
	tail: '',
	hint: '',
	audio: '',
	rotate: false,
	canPress: false,
	canPressUpdateTime: 0,
	gameThemes: [],
	roundInfo: [],
	isSelectable: false,
	activeThemeIndex: -1,
	actionQuestionIndex: -1,
	isMediaStopped: false,
	content: [],
	answerOptions: [],
	prependText: '',
	appendText: '',
	contentLoadProgress: 1,
	isAnswer: false,
};
