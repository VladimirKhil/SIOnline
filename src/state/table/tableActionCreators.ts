import * as TableActions from './TableActions';
import { ActionCreator } from 'redux';
import ThemeInfo from '../../model/ThemeInfo';
import ContentGroup from '../../model/ContentGroup';

const showLogo: ActionCreator<TableActions.ShowLogoAction> = () => ({
	type: TableActions.TableActionTypes.ShowLogo
});

const showGameThemes: ActionCreator<TableActions.ShowGameThemesAction> = (gameThemes: string[]) => ({
	type: TableActions.TableActionTypes.ShowGameThemes, gameThemes
});

const showRound: ActionCreator<TableActions.ShowRoundAction> = (roundName: string) => ({
	type: TableActions.TableActionTypes.ShowRound, roundName
});

const showRoundThemes: ActionCreator<TableActions.ShowRoundThemesAction> = (
	roundThemes: ThemeInfo[],
	isFinal: boolean,
	display: boolean
) => ({
	type: TableActions.TableActionTypes.ShowRoundThemes, roundThemes, isFinal, display
});

const showText: ActionCreator<TableActions.ShowTextAction> = (text: string, animateReading: boolean) => ({
	type: TableActions.TableActionTypes.ShowText, text, animateReading
});

const showAnswer: ActionCreator<TableActions.ShowAnswerAction> = (text: string) => ({
	type: TableActions.TableActionTypes.ShowAnswer, text
});

const showRoundTable: ActionCreator<TableActions.ShowRoundTableAction> = () => ({
	type: TableActions.TableActionTypes.ShowRoundTable
});

const blinkQuestion: ActionCreator<TableActions.BlinkQuestionAction> = (
	themeIndex: number,
	questionIndex: number
) => ({
	type: TableActions.TableActionTypes.BlinkQuestion, themeIndex, questionIndex
});

const blinkTheme: ActionCreator<TableActions.BlinkThemeAction> = (themeIndex: number) => ({
	type: TableActions.TableActionTypes.BlinkTheme, themeIndex
});

const updateQuestion: ActionCreator<TableActions.UpdateQuestionAction> = (
	themeIndex: number,
	questionIndex: number,
	price: number,
) => ({
	type: TableActions.TableActionTypes.UpdateQuestion, themeIndex, questionIndex, price
});

const removeTheme: ActionCreator<TableActions.RemoveThemeAction> = (themeIndex: number) => ({
	type: TableActions.TableActionTypes.RemoveTheme, themeIndex
});

const showPartialText: ActionCreator<TableActions.ShowPartialTextAction> = (textShape: string) => ({
	type: TableActions.TableActionTypes.ShowPartialText, textShape
});

const appendPartialText: ActionCreator<TableActions.AppendPartialTextAction> = (text: string) => ({
	type: TableActions.TableActionTypes.AppendPartialText, text
});

const showBackgroundAudio: ActionCreator<TableActions.ShowBackgroundAudioAction> = (uri: string) => ({
	type: TableActions.TableActionTypes.ShowBackgroundAudio, uri
});

const showContent: ActionCreator<TableActions.ShowContentAction> = (content: ContentGroup[]) => ({
	type: TableActions.TableActionTypes.ShowContent, content
});

const showSpecial: ActionCreator<TableActions.ShowSpecialAction> = (text: string, activeThemeIndex = -1) => ({
	type: TableActions.TableActionTypes.ShowSpecial, text, activeThemeIndex
});

const canPressChanged: ActionCreator<TableActions.CanPressChangedAction> = (canPress: boolean) => ({
	type: TableActions.TableActionTypes.CanPressChanged, canPress
});

const isSelectableChanged: ActionCreator<TableActions.IsSelectableChangedAction> = (isSelectable: boolean) => ({
	type: TableActions.TableActionTypes.IsSelectableChanged, isSelectable
});

const resumeMedia: ActionCreator<TableActions.ResumeMediaAction> = () => ({
	type: TableActions.TableActionTypes.ResumeMedia
});

const captionChanged: ActionCreator<TableActions.CaptionChangedAction> = (caption: string) => ({
	type: TableActions.TableActionTypes.CaptionChanged, caption
});

const tableReset: ActionCreator<TableActions.TableResetAction> = () => ({
	type: TableActions.TableActionTypes.TableReset
});

const endQuestion: ActionCreator<TableActions.EndQuestionAction> = () => ({
	type: TableActions.TableActionTypes.EndQuestion
});

const tableActionCreators = {
	showLogo,
	showGameThemes,
	showRound,
	showRoundThemes,
	showText,
	showAnswer,
	showRoundTable,
	blinkQuestion,
	blinkTheme,
	updateQuestion,
	removeTheme,
	showPartialText,
	appendPartialText,
	showBackgroundAudio,
	showContent,
	showSpecial,
	canPressChanged,
	isSelectableChanged,
	resumeMedia,
	captionChanged,
	tableReset,
	endQuestion,
};

export default tableActionCreators;
