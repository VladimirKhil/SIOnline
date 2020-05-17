import TableMode from '../../model/enums/TableMode';
import ThemeInfo from '../../model/ThemeInfo';
import localization from '../../model/resources/localization';

export default interface TableState {
	mode: TableMode;
	text: string;
	tail: string;
	canPress: boolean;
	gameThemes: string[];
	roundInfo: ThemeInfo[];
	isSelectable: boolean;
	activeThemeIndex: number;
	actionQuestionIndex: number;
	isMediaStopped: boolean;
}

export const initialState: TableState = {
	mode: TableMode.Text,
	text: localization.tableHint,
	tail: '',
	canPress: false,
	gameThemes: [],
	roundInfo: [],
	isSelectable: false,
	activeThemeIndex: -1,
	actionQuestionIndex: -1,
	isMediaStopped: false
};
