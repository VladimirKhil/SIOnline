import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import AnswerOption from '../../model/AnswerOption';
import ContentGroup from '../../model/ContentGroup';
import ThemeInfo from '../../model/ThemeInfo';
import LayoutMode from '../../model/enums/LayoutMode';
import TableMode from '../../model/enums/TableMode';
import ContentType from '../../model/enums/ContentType';
import ItemState from '../../model/enums/ItemState';
import TimerInfo from '../../model/TimerInfo';
import TimerStates from '../../model/enums/TimeStates';

export interface TableState {
	mode: TableMode;
	layoutMode: LayoutMode;
	caption: string;
	header: string;
	text: string;
	tail: string;
	hint: string;
	contentHint: string;
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
	loadTimer: TimerInfo;
	isAnswer: boolean;
}

const initialState: TableState = {
	mode: TableMode.Logo,
	layoutMode: LayoutMode.Simple,
	caption: '',
	header: '',
	text: '',
	tail: '',
	hint: '',
	contentHint: '',
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
	loadTimer: {
		state: TimerStates.Stopped,
		value: 1,
		maximum: 1,
		isPausedBySystem: true,
		isPausedByUser: false,
	},
	isAnswer: false,
};

export const tableSlice = createSlice({
	name: 'table',
	initialState,
	reducers: {
		showLogo: (state: TableState) => {
			state.mode = TableMode.Logo;
			state.caption = '';
		},
		showGameThemes: (state: TableState, action: PayloadAction<string[]>) => {
			state.mode = TableMode.GameThemes;
			state.gameThemes = action.payload;
		},
		showObject: (state: TableState, action: PayloadAction<{ header: string, text: string, hint: string }>) => {
			state.mode = TableMode.Object;
			state.header = action.payload.header;
			state.text = action.payload.text;
			state.hint = action.payload.hint;
			state.rotate = false;
			state.content = [];
			state.appendText = '';
			state.prependText = '';
		},
		showQuestionType: (state: TableState, action: PayloadAction<{ header: string, text: string, hint: string }>) => {
			state.mode = TableMode.QuestionType;
			state.header = action.payload.header;
			state.text = action.payload.text;
			state.hint = action.payload.hint;
			state.rotate = true;
			state.content = [];
			state.appendText = '';
			state.prependText = '';
		},
		showRoundThemes: (state: TableState, action: PayloadAction<{ roundThemes: ThemeInfo[], isFinal: boolean, display: boolean }>) => {
			state.mode = action.payload.display ? (action.payload.isFinal ? TableMode.Final : TableMode.RoundThemes) : state.mode;
			state.roundInfo = action.payload.roundThemes;
		},
		showText: (state: TableState, action: PayloadAction<string>) => {
			state.mode = TableMode.Text;
			state.text = action.payload;
			state.audio = '';
		},
		showRoundTable: (state: TableState) => {
			state.mode = TableMode.RoundTable;
			state.activeThemeIndex = -1;
			state.actionQuestionIndex = -1;
		},
		blinkQuestion: (state: TableState, action: PayloadAction<{ themeIndex: number, questionIndex: number }>) => {
			state.activeThemeIndex = action.payload.themeIndex;
			state.actionQuestionIndex = action.payload.questionIndex;
		},
		blinkTheme: (state: TableState, action: PayloadAction<number>) => {
			state.activeThemeIndex = action.payload;
		},
		updateQuestion: (state: TableState, action: PayloadAction<{ themeIndex: number, questionIndex: number, price: number }>) => {
			const theme = state.roundInfo[action.payload.themeIndex];

			if (theme) {
				if (action.payload.questionIndex > -1 && action.payload.questionIndex < theme.questions.length) {
					theme.questions[action.payload.questionIndex] = action.payload.price;
				}
			}
		},
		removeTheme: (state: TableState, action: PayloadAction<number>) => {
			state.activeThemeIndex = -1;
			const theme = state.roundInfo[action.payload];

			if (theme) {
				theme.name = '';
			}
		},
		showPartialText: (state: TableState, action: PayloadAction<string>) => {
			state.text = '';
			state.tail = action.payload;
		},
		appendPartialText: (state: TableState, action: PayloadAction<string>) => {
			state.text += action.payload;
			state.tail = state.tail.substring(action.payload.length);
		},
		showBackgroundAudio: (state: TableState, action: PayloadAction<string>) => {
			state.mode = TableMode.Content;
			state.audio = action.payload;
			state.isMediaStopped = false;
		},
		clearAudio: (state: TableState) => {
			state.audio = '';
		},
		showContent: (state: TableState, action: PayloadAction<ContentGroup[]>) => {
			state.mode = TableMode.Content;
			state.content = action.payload;
			state.isMediaStopped = false;
		},
		canPressChanged: (state: TableState, action: PayloadAction<boolean>) => {
			state.canPress = action.payload;
			state.canPressUpdateTime = Date.now();

			if (!action.payload) {
				state.isMediaStopped = true;
			}
		},
		isSelectableChanged: (state: TableState, action: PayloadAction<boolean>) => {
			state.isSelectable = action.payload;
		},
		resumeMedia: (state: TableState) => {
			state.isMediaStopped = false;
		},
		captionChanged: (state: TableState, action: PayloadAction<string>) => {
			state.caption = action.payload;
		},
		clearActiveState: (state: TableState) => {
			state.activeThemeIndex = -1;
			state.actionQuestionIndex = -1;
		},
		tableReset: (state: TableState) => {
			Object.assign(state, initialState);
		},
		endQuestion: (state: TableState) => {
			state.content = [];
			state.prependText = '';
			state.appendText = '';
			state.audio = '';
			state.layoutMode = LayoutMode.Simple;
			state.isSelectable = false;
			state.isAnswer = false;
		},
		answerOptions: (state, action: PayloadAction<{ questionHasScreenContent: boolean, options: AnswerOption[] }>) => {
			state.mode = TableMode.Content;
			state.layoutMode = LayoutMode.AnswerOptions;
			state.answerOptions = action.payload.options;
		},
		updateOption: (state, action: PayloadAction<{ index: number, label: string, contentType: ContentType, value: string }>) => {
			const option = state.answerOptions[action.payload.index];

			if (!option) {
				return;
			}

			option.label = action.payload.label;
			option.content.type = action.payload.contentType;
			option.content.value = action.payload.value;
		},
		updateOptionState: (state, action: PayloadAction<{ index: number, state: ItemState }>) => {
			const option = state.answerOptions[action.payload.index];

			if (!option) {
				return;
			}

			option.state = action.payload.state;
		},
		rightOption: (state, action: PayloadAction<string>) => {
			state.answerOptions.forEach(o => {
				if (o.label === action.payload) {
					o.state = ItemState.Right;
				} else if (o.state === ItemState.Active) {
					o.state = ItemState.Normal;
				}
			});
		},
		prependTextChanged: (state, action: PayloadAction<string>) => {
			state.prependText = action.payload;
		},
		questionReset: state => {
			state.prependText = '';
			state.appendText = '';
			state.isAnswer = false;
			state.loadTimer.value = 1;
			state.loadTimer.state = TimerStates.Stopped;
		},
		setAnswerView: (state, action: PayloadAction<string>) => {
			state.content = [];
			state.prependText = '';
			state.appendText = action.payload;
			state.audio = '';
			state.isAnswer = true;
			state.loadTimer.value = 1;
			state.loadTimer.state = TimerStates.Stopped;
		},
		startLoadTimer: (state) => {
			state.loadTimer.state = TimerStates.Running;
			state.loadTimer.value = 0;
			state.loadTimer.isPausedBySystem = false;
		},
		pauseLoadTimer: (state, action: PayloadAction<number>) => {
			state.loadTimer.state = TimerStates.Paused;
			state.loadTimer.isPausedBySystem = true;
			state.loadTimer.value = action.payload;
		},
		resumeLoadTimer: (state) => {
			state.loadTimer.state = TimerStates.Running;
			state.loadTimer.isPausedBySystem = false;
		},
		showContentHint: (state, action: PayloadAction<string>) => {
			state.contentHint = action.payload;
		},
	}
});

export const {
	showLogo,
	showGameThemes,
	showObject,
	showQuestionType,
	showRoundThemes,
	showText,
	showRoundTable,
	blinkQuestion,
	blinkTheme,
	updateQuestion,
	removeTheme,
	showPartialText,
	appendPartialText,
	showBackgroundAudio,
	clearAudio,
	showContent,
	canPressChanged,
	isSelectableChanged,
	resumeMedia,
	captionChanged,
	clearActiveState,
	tableReset,
	endQuestion,
	answerOptions,
	updateOption,
	updateOptionState,
	rightOption,
	prependTextChanged,
	questionReset,
	setAnswerView,
	startLoadTimer,
	pauseLoadTimer,
	resumeLoadTimer,
	showContentHint,
} = tableSlice.actions;

export default tableSlice.reducer;