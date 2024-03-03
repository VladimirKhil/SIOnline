import { createSlice } from '@reduxjs/toolkit';
import AnswerOption from '../../model/AnswerOption';
import ContentGroup from '../../model/ContentGroup';
import ThemeInfo from '../../model/ThemeInfo';
import LayoutMode from '../../model/enums/LayoutMode';
import TableMode from '../../model/enums/TableMode';

interface TableState {
	mode: TableMode;
	layoutMode: LayoutMode;
	caption: string;
	text: string;
	tail: string;
	audio: string;
	animateReading: boolean;
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
}

const initialState: TableState = {
	mode: TableMode.Logo,
	layoutMode: LayoutMode.Simple,
	caption: '',
	text: '',
	tail: '',
	audio: '',
	animateReading: false,
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
};

export const tableSlice = createSlice({
	name: 'table',
	initialState,
	reducers: {
	}
});

export const {
} = tableSlice.actions;

export default tableSlice.reducer;