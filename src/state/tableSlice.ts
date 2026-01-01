import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import AnswerOption from '../model/AnswerOption';
import ContentGroup from '../model/ContentGroup';
import ThemeInfo from '../model/ThemeInfo';
import LayoutMode from '../model/enums/LayoutMode';
import TableMode from '../model/enums/TableMode';
import ContentType from '../model/enums/ContentType';
import ItemState from '../model/enums/ItemState';
import TimerInfo from '../model/TimerInfo';
import TimerStates from '../model/enums/TimeStates';
import PlayerStatistics from '../model/PlayerStatistics';

export interface TableState {
	mode: TableMode;
	layoutMode: LayoutMode;
	caption: string;
	header: string;
	largeHeader: boolean;
	text: string;
	tail: string;
	hint: string;
	contentHint: string;
	audio: string;
	rotate: boolean;
	animate: boolean;
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
	answerDeviation: number;
	statistics: PlayerStatistics[];
	externalMediaUris: string[];
	useStackedAnswerLayout: boolean;
	contentWeight: number;
	optionsWeight: number;
	optionsRowCount: number;
	optionsColumnCount: number;
}

const initialState: TableState = {
	mode: TableMode.Logo,
	layoutMode: LayoutMode.Simple,
	caption: ' ',
	header: '',
	largeHeader: false,
	text: '',
	tail: '',
	hint: '',
	contentHint: '',
	audio: '',
	rotate: false,
	animate: false,
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
	answerDeviation: 0,
	statistics: [],
	externalMediaUris: [],
	useStackedAnswerLayout: false,
	contentWeight: 2,
	optionsWeight: 1,
	optionsRowCount: 1,
	optionsColumnCount: 1,
};

export const tableSlice = createSlice({
	name: 'table',
	initialState,
	reducers: {
		showLogo: (state: TableState) => {
			state.mode = TableMode.Logo;
			state.caption = '';
			state.audio = '';
		},
		showGameThemes: (state: TableState, action: PayloadAction<string[]>) => {
			state.gameThemes = action.payload;
			state.mode = TableMode.GameThemes;
		},
		showObject: (state: TableState, action: PayloadAction<{ header: string, text: string, hint: string, large: boolean, animate: boolean }>) => {
			state.mode = TableMode.Object;
			state.header = action.payload.header;
			state.largeHeader = action.payload.large;
			state.text = action.payload.text;
			state.hint = action.payload.hint;
			state.rotate = false;
			state.animate = action.payload.animate;
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
		clearRoundThemes: (state: TableState) => {
			state.roundInfo = [];
		},
		addRoundTheme: (state: TableState, action: PayloadAction<{ name: string, comment: string }>) => {
			state.roundInfo.push({ name: action.payload.name, comment: action.payload.comment, questions: [] });
		},
		setRoundThemes: (state: TableState, action: PayloadAction<ThemeInfo[]>) => {
			state.roundInfo = action.payload;
		},
		showThemeStack: (state: TableState) => {
			state.mode = TableMode.ThemeStack;
		},
		setThemesComments: (state: TableState, action: PayloadAction<string[]>) => {
			state.roundInfo.forEach((t, i) => {
				t.comment = i < action.payload.length ? action.payload[i] : '';
			});
		},
		showText: (state: TableState, action: PayloadAction<string>) => {
			state.text = action.payload;
			state.audio = '';
			state.mode = TableMode.Text;
		},
		showWelcome: (state: TableState) => {
			state.mode = TableMode.Welcome;
		},
		showRoundTable: (state: TableState) => {
			state.activeThemeIndex = -1;
			state.actionQuestionIndex = -1;
			state.mode = TableMode.RoundTable;
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
			state.audio = action.payload;
			state.isMediaStopped = false;
			state.mode = TableMode.Content;
		},
		clearAudio: (state: TableState) => {
			state.audio = '';
		},
		showContent: (state: TableState, action: PayloadAction<ContentGroup[]>) => {
			state.content = action.payload;
			state.isMediaStopped = false;
			state.mode = TableMode.Content;
		},
		switchToContent: (state: TableState) => {
			state.mode = TableMode.Content;
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
			state.answerDeviation = 0;
			state.externalMediaUris = [];
			state.useStackedAnswerLayout = false;
		},
		answerOptions: (state, action: PayloadAction<{ questionHasScreenContent: boolean, options: AnswerOption[], useStackedAnswerLayout: boolean, contentWeight: number, optionsWeight: number, optionsRowCount: number, optionsColumnCount: number }>) => {
			state.layoutMode = LayoutMode.AnswerOptions;
			state.answerOptions = action.payload.options;
			state.mode = TableMode.Content;
			
			// Enable stacked layout based on information from Layout message
			// The flag is set when question has no screen content (text-only or audio-only)
			state.useStackedAnswerLayout = action.payload.useStackedAnswerLayout;
			
			// Set weights for proportional allocation
			state.contentWeight = action.payload.contentWeight;
			state.optionsWeight = action.payload.optionsWeight;
			
			// Set row and column count for answer options layout
			state.optionsRowCount = action.payload.optionsRowCount;
			state.optionsColumnCount = action.payload.optionsColumnCount;
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
			// Do not reset content so that it will be preserved in answer options mode
			if (action.payload.length > 0) {
				state.content = [];
			}

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
		showStatistics: (state, action: PayloadAction<PlayerStatistics[]>) => {
			state.statistics = action.payload;
			state.mode = TableMode.Statistics;
		},
		setExternalMediaWarning: (state, action: PayloadAction<string[]>) => {
			state.externalMediaUris = action.payload;
		},
		appendExternalMediaWarning: (state, action: PayloadAction<string>) => {
			if (!state.externalMediaUris.includes(action.payload)) {
				state.externalMediaUris.push(action.payload);
			}
		},
		setAnswerDeviation: (state, action: PayloadAction<number>) => {
			state.answerDeviation = action.payload;
		},
	}
});

export const {
	showLogo,
	showGameThemes,
	showObject,
	showQuestionType,
	clearRoundThemes,
	addRoundTheme,
	setRoundThemes,
	showThemeStack,
	setThemesComments,
	showText,
	showWelcome,
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
	switchToContent,
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
	showStatistics,
	setExternalMediaWarning,
	appendExternalMediaWarning,
	setAnswerDeviation,
} = tableSlice.actions;

export default tableSlice.reducer;