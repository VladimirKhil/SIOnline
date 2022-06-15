import { Reducer, AnyAction } from 'redux';
import TableState, { initialState } from './TableState';
import { KnownTableAction, TableActionTypes } from './TableActions';
import TableMode from '../../model/enums/TableMode';
import { replace } from '../../utils/ArrayExtensions';

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

		case TableActionTypes.RemoveQuestion:
			return {
				...state,
				roundInfo: replace(state.roundInfo, action.themeIndex, {
					name: state.roundInfo[action.themeIndex].name,
					questions: replace(state.roundInfo[action.themeIndex].questions, action.questionIndex, -1)
				})
			};

		case TableActionTypes.RemoveTheme:
			return {
				...state,
				activeThemeIndex: -1,
				roundInfo: replace(state.roundInfo, action.themeIndex, {
					name: '',
					questions: state.roundInfo[action.themeIndex].questions
				})
			};

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
				text: action.uri
			};

		case TableActionTypes.ShowAudio:
			return {
				...state,
				mode: TableMode.Audio,
				text: action.uri,
				isMediaStopped: false
			};

		case TableActionTypes.ShowVideo:
			return {
				...state,
				mode: TableMode.Video,
				text: action.uri,
				isMediaStopped: false
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
				isMediaStopped: true
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

		default:
			return state;
	}
};

export default tableReducer;
