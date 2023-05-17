import { Reducer, AnyAction } from 'redux';
import TableState, { initialState } from './TableState';
import { KnownTableAction, RemoveThemeAction, TableActionTypes, UpdateQuestionAction } from './TableActions';
import TableMode from '../../model/enums/TableMode';
import { replace } from '../../utils/ArrayExtensions';

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

		case TableActionTypes.ShowRound:
			return {
				...state,
				mode: TableMode.Round,
				text: action.roundName,
				animateReading: false
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
				animateReading: action.animateReading
			};

		case TableActionTypes.ShowAnswer:
			return {
				...state,
				mode: TableMode.Answer,
				text: action.text
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
				mode: TableMode.PartialText,
				text: '',
				tail: action.textShape
			};

		case TableActionTypes.AppendPartialText:
			return {
				...state,
				text: state.text + action.text,
				tail: state.tail.substring(action.text.length)
			};

		case TableActionTypes.ShowImage:
			return {
				...state,
				mode: TableMode.Image,
				text: action.uri,
				audio: '',
			};

		case TableActionTypes.ShowAudio:
			return {
				...state,
				mode: TableMode.Audio,
				audio: action.uri,
				isMediaStopped: false
			};

		case TableActionTypes.ShowBackgroundAudio:
			return {
				...state,
				audio: action.uri,
				isMediaStopped: false
			};

		case TableActionTypes.ShowVideo:
			return {
				...state,
				mode: TableMode.Video,
				text: action.uri,
				isMediaStopped: false
			};

		case TableActionTypes.ShowHtml:
			return {
				...state,
				mode: TableMode.Html,
				text: action.uri,
			};

		case TableActionTypes.ShowSpecial:
			return {
				...state,
				mode: TableMode.Special,
				text: action.text,
				activeThemeIndex: action.activeThemeIndex
			};

		case TableActionTypes.CanPressChanged:
			return {
				...state,
				canPress: action.canPress,
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

		default:
			return state;
	}
};

export default tableReducer;
