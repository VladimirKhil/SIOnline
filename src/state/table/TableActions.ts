import ThemeInfo from '../../model/ThemeInfo';

export const enum TableActionTypes {
	ShowLogo = 'SHOW_LOGO',
	ShowGameThemes = 'SHOW_GAME_THEMES',
	ShowRound = 'SHOW_ROUND',
	ShowRoundThemes = 'SHOW_ROUND_THEMES',
	ShowText = 'SHOW_TEXT',
	ShowAnswer = 'SHOW_ANSWER',
	ShowRoundTable = 'SHOW_ROUND_TABLE',
	BlinkQuestion = 'BLINK_QUESTION',
	BlinkTheme = 'BLINK_THEME',
	UpdateQuestion = 'UPDATE_QUESTION',
	RemoveTheme = 'REMOVE_THEME',
	ShowPartialText = 'SHOW_PARTIAL_TEXT',
	AppendPartialText = 'APPEND_PARTIAL_TEXT',
	ShowImage = 'SHOW_IMAGE',
	ShowAudio = 'SHOW_AUDIO',
	ShowBackgroundAudio = 'SHOW_BACKGROUND_AUDIO',
	ShowVideo = 'SHOW_VIDEO',
	ShowHtml = 'SHOW_HTML',
	ShowSpecial = 'SHOW_SPECIAL',
	CanPressChanged = 'CAN_PRESS_CHANGED',
	IsSelectableChanged = 'IS_SELECTABLE_CHANGED',
	ResumeMedia = 'RESUME_MEDIA',
	CaptionChanged = 'CAPTION_CHANGED'
}

export type ShowLogoAction = { type: TableActionTypes.ShowLogo };
export type ShowGameThemesAction = { type: TableActionTypes.ShowGameThemes, gameThemes: string[] };
export type ShowRoundAction = { type: TableActionTypes.ShowRound, roundName: string };
export type ShowRoundThemesAction = {
	type: TableActionTypes.ShowRoundThemes,
	roundThemes: ThemeInfo[],
	isFinal: boolean,
	display: boolean
};
export type ShowTextAction = { type: TableActionTypes.ShowText, text: string, animateReading: boolean };
export type ShowAnswerAction = { type: TableActionTypes.ShowAnswer, text: string };
export type ShowRoundTableAction = { type: TableActionTypes.ShowRoundTable };
export type BlinkQuestionAction = { type: TableActionTypes.BlinkQuestion, themeIndex: number, questionIndex: number };
export type BlinkThemeAction = { type: TableActionTypes.BlinkTheme, themeIndex: number };
export type UpdateQuestionAction = { type: TableActionTypes.UpdateQuestion, themeIndex: number, questionIndex: number, price: number };
export type RemoveThemeAction = { type: TableActionTypes.RemoveTheme, themeIndex: number };
export type ShowPartialTextAction = { type: TableActionTypes.ShowPartialText, textShape: string };
export type AppendPartialTextAction = { type: TableActionTypes.AppendPartialText, text: string };
export type ShowImageAction = { type: TableActionTypes.ShowImage, uri: string };
export type ShowAudioAction = { type: TableActionTypes.ShowAudio, uri: string };
export type ShowBackgroundAudioAction = { type: TableActionTypes.ShowBackgroundAudio, uri: string };
export type ShowVideoAction = { type: TableActionTypes.ShowVideo, uri: string };
export type ShowHtmlAction = { type: TableActionTypes.ShowHtml, uri: string };
export type ShowSpecialAction = { type: TableActionTypes.ShowSpecial, text: string, activeThemeIndex: number };
export type CanPressChangedAction = { type: TableActionTypes.CanPressChanged, canPress: boolean };
export type IsSelectableChangedAction = { type: TableActionTypes.IsSelectableChanged, isSelectable: boolean };
export type ResumeMediaAction = { type: TableActionTypes.ResumeMedia };
export type CaptionChangedAction = { type: TableActionTypes.CaptionChanged, caption: string };

export type KnownTableAction =
	ShowLogoAction
	| ShowGameThemesAction
	| ShowRoundAction
	| ShowRoundThemesAction
	| ShowTextAction
	| ShowAnswerAction
	| ShowRoundTableAction
	| BlinkQuestionAction
	| BlinkThemeAction
	| UpdateQuestionAction
	| RemoveThemeAction
	| ShowPartialTextAction
	| AppendPartialTextAction
	| ShowImageAction
	| ShowAudioAction
	| ShowBackgroundAudioAction
	| ShowVideoAction
	| ShowHtmlAction
	| ShowSpecialAction
	| CanPressChangedAction
	| IsSelectableChangedAction
	| ResumeMediaAction
	| CaptionChangedAction;
