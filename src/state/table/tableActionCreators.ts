import * as TableActions from './TableActions';
import { ActionCreator } from 'redux';
import ThemeInfo from '../../model/ThemeInfo';

const showLogo: ActionCreator<TableActions.ShowLogoAction> = () => ({
	type: TableActions.TableActionTypes.ShowLogo
});

const showGameThemes: ActionCreator<TableActions.ShowGameThemesAction> = (gameThemes: string[]) => ({
	type: TableActions.TableActionTypes.ShowGameThemes, gameThemes
});

const showRoundThemes: ActionCreator<TableActions.ShowRoundThemesAction> = (
	roundThemes: ThemeInfo[],
	isFinal: boolean,
	display: boolean) => ({
		type: TableActions.TableActionTypes.ShowRoundThemes, roundThemes, isFinal, display
	});

const showText: ActionCreator<TableActions.ShowTextAction> = (text: string) => ({
	type: TableActions.TableActionTypes.ShowText, text
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

const removeQuestion: ActionCreator<TableActions.RemoveQuestionAction> = (
	themeIndex: number,
	questionIndex: number
) => ({
	type: TableActions.TableActionTypes.RemoveQuestion, themeIndex, questionIndex
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

const showImage: ActionCreator<TableActions.ShowImageAction> = (uri: string) => ({
	type: TableActions.TableActionTypes.ShowImage, uri
});

const showAudio: ActionCreator<TableActions.ShowAudioAction> = (uri: string) => ({
	type: TableActions.TableActionTypes.ShowAudio, uri
});

const showVideo: ActionCreator<TableActions.ShowVideoAction> = (uri: string) => ({
	type: TableActions.TableActionTypes.ShowVideo, uri
});

const showSpecial: ActionCreator<TableActions.ShowSpecialAction> = (text: string, activeThemeIndex: number = -1) => ({
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

const tableActionCreators = {
	showLogo,
	showGameThemes,
	showRoundThemes,
	showText,
	showAnswer,
	showRoundTable,
	blinkQuestion,
	blinkTheme,
	removeQuestion,
	removeTheme,
	showPartialText,
	appendPartialText,
	showImage,
	showAudio,
	showVideo,
	showSpecial,
	canPressChanged,
	isSelectableChanged,
	resumeMedia
};

export default tableActionCreators;
