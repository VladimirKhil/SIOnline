import { Reducer, AnyAction } from 'redux';
import TableState, { initialState } from './TableState';
import { KnownTableAction, RemoveThemeAction, TableActionTypes, UpdateQuestionAction } from './TableActions';
import TableMode from '../../model/enums/TableMode';
import { replace } from '../../utils/ArrayExtensions';
import LayoutMode from '../../model/enums/LayoutMode';
import ItemState from '../../model/enums/ItemState';

function updateQuestion(state: TableState, action: UpdateQuestionAction) {
	const activeTheme = state.roundInfo[action.themeIndex];

	return activeTheme
		? {
			...state,
			roundInfo: replace(state.roundInfo, action.themeIndex, {
				name: activeTheme.name,
				questions: replace(activeTheme.questions, action.questionIndex, action.price)
			})
		} : state;
}

function removeTheme(state: TableState, action: RemoveThemeAction) {
	const activeTheme = state.roundInfo[action.themeIndex];

	return activeTheme
		? {
			...state,
			activeThemeIndex: -1,
			roundInfo: replace(state.roundInfo, action.themeIndex, {
				name: '',
				questions: activeTheme.questions
			})
		} : state;
}

const tableReducer: Reducer<TableState> = (state: TableState = initialState, anyAction: AnyAction): TableState => {
	const action = anyAction as KnownTableAction;

	switch (action.type) {
		case TableActionTypes.ShowLogo:
			return {
				...state,
				mode: TableMode.Logo
			};

		case TableActionTypes.ShowGameThemes:
			return {
				...state,
				mode: TableMode.GameThemes,
				gameThemes: action.gameThemes
			};

		case TableActionTypes.ShowObject:
			return {
				...state,
				mode: TableMode.Object,
				header: action.header,
				text: action.text,
				hint: action.hint,
				rotate: false,
				content: [],
				appendText: '',
				prependText: '',
			};

		case TableActionTypes.ShowQuestionType:
			return {
				...state,
				mode: TableMode.QuestionType,
				header: action.header,
				text: action.text,
				hint: action.hint,
				rotate: true,
				content: [],
				appendText: '',
				prependText: '',
			};

		case TableActionTypes.ShowRoundThemes:
			return {
				...state,
				mode: action.display ? (action.isFinal ? TableMode.Final : TableMode.RoundThemes) : state.mode,
				roundInfo: action.roundThemes
			};

		case TableActionTypes.ShowText:
			return {
				...state,
				mode: TableMode.Text,
				text: action.text,
				audio: '',
			};

		case TableActionTypes.ShowRoundTable:
			return {
				...state,
				mode: TableMode.RoundTable,
				activeThemeIndex: -1,
				actionQuestionIndex: -1
			};

		case TableActionTypes.BlinkQuestion:
			return {
				...state,
				activeThemeIndex: action.themeIndex,
				actionQuestionIndex: action.questionIndex
			};

		case TableActionTypes.BlinkTheme:
			return {
				...state,
				activeThemeIndex: action.themeIndex
			};

		case TableActionTypes.UpdateQuestion:
			return updateQuestion(state, action);

		case TableActionTypes.RemoveTheme:
			return removeTheme(state, action);

		case TableActionTypes.ShowPartialText:
			return {
				...state,
				text: '',
				tail: action.textShape
			};

		case TableActionTypes.AppendPartialText:
			return {
				...state,
				text: state.text + action.text,
				tail: state.tail.substring(action.text.length)
			};

		case TableActionTypes.ShowBackgroundAudio:
			return {
				...state,
				mode: TableMode.Content,
				audio: action.uri,
				isMediaStopped: false,
			};

		case TableActionTypes.ShowContent:
			return {
				...state,
				mode: TableMode.Content,
				content: action.content,
				isMediaStopped: false,
			};

		case TableActionTypes.CanPressChanged:
			return {
				...state,
				canPress: action.canPress,
				canPressUpdateTime: action.updateTime,
				isMediaStopped: action.canPress ? state.isMediaStopped : true,
			};

		case TableActionTypes.IsSelectableChanged:
			return {
				...state,
				isSelectable: action.isSelectable
			};

		case TableActionTypes.ResumeMedia:
			return {
				...state,
				isMediaStopped: false
			};

		case TableActionTypes.CaptionChanged:
			return {
				...state,
				caption: action.caption
			};

		case TableActionTypes.TableReset:
			return initialState;

		case TableActionTypes.EndQuestion:
			return {
				...state,
				content: [],
				prependText: '',
				appendText: '',
				audio: '',
				layoutMode: LayoutMode.Simple,
				isSelectable: false,
				isAnswer: false,
			};

		case TableActionTypes.AnswerOptions:
			return {
				...state,
				mode: TableMode.Content,
				layoutMode: LayoutMode.AnswerOptions,
				answerOptions: action.options,
			};

		case TableActionTypes.UpdateOption:
			return {
				...state,
				answerOptions: replace(state.answerOptions, action.index, {
					label: action.label,
					state: state.answerOptions[action.index].state,
					content: {
						type: action.contentType,
						value: action.value,
						read: state.answerOptions[action.index].content.read,
						partial: state.answerOptions[action.index].content.partial
					}
				})
			};

		case TableActionTypes.UpdateOptionState:
			return {
				...state,
				answerOptions: replace(state.answerOptions, action.index, {
					...state.answerOptions[action.index],
					state: action.state,
				})
			};

		case TableActionTypes.RightOption:
			return {
				...state,
				answerOptions: state.answerOptions.map(o => ({
					...o,
					state: o.label === action.label ? ItemState.Right : (o.state === ItemState.Active ? ItemState.Normal : o.state)
				}))
			};

		case TableActionTypes.PrependTextChanged:
			return {
				...state,
				prependText: action.text,
			};

		case TableActionTypes.QuestionReset:
			return {
				...state,
				prependText: '',
				appendText: '',
				isAnswer: false,
			};

		case TableActionTypes.SetAnswerView:
			return {
				...state,
				prependText: '',
				content: [],
				appendText: action.rightAnswer,
				isAnswer: true,
			};

		default:
			return state;
	}
};

export default tableReducer;
