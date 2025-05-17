import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AppSettings, { initialState as initialAppSettings } from '../model/AppSettings';
import Constants from '../model/enums/Constants';
import Sex from '../model/enums/Sex';
import ButtonPressMode from '../model/ButtonPressMode';
import TimeSettings from '../model/TimeSettings';
import ThemeSettings from '../model/ThemeSettings';

export interface SettingsState {
	soundVolume: number;
	sound: boolean;
	appSound: boolean;
	mainMenuSound: boolean;
	floatingControls: boolean;
	fullScreen: boolean;
	sex: Sex;
	avatarKey: string | null;
	appSettings: AppSettings;
	gameButtonKey: string | null;
	passButtonKey: string | null;
	nextButtonKey: string | null;
	yesButtonKey: string | null;
	noButtonKey: string | null;
	pauseButtonKey: string | null;
	attachContentToTable: boolean;
	showVideoAvatars: boolean;
	theme: ThemeSettings;
	writeGameLog: boolean;
}

const initialState: SettingsState = {
	soundVolume: 1,
	sound: true,
	appSound: false,
	mainMenuSound: false,
	floatingControls: false,
	fullScreen: false,
	sex: Sex.Male,
	avatarKey: null,
	appSettings: initialAppSettings,
	gameButtonKey: Constants.KEY_CTRL,
	passButtonKey: '/',
	nextButtonKey: Constants.KEY_RIGHT,
	yesButtonKey: '+',
	noButtonKey: '-',
	pauseButtonKey: 'F9',
	attachContentToTable: true,
	showVideoAvatars: true,
	theme: {
		table: {
			textColor: '#FFFFFF',
			backgroundColor: '#0A0E30',
		},
		room: {
			backgroundImageKey: null,
		},
	},
	writeGameLog: false,
};

export const settingsSlice = createSlice({
	name: 'settings',
	initialState,
	reducers: {
		setSoundVolume: (state: SettingsState, action: PayloadAction<number>) => {
			state.soundVolume = action.payload;
		},
		setSound: (state: SettingsState, action: PayloadAction<boolean>) => {
			state.sound = action.payload;
		},
		setAppSound: (state: SettingsState, action: PayloadAction<boolean>) => {
			state.appSound = action.payload;
		},
		setMainMenuSound: (state: SettingsState, action: PayloadAction<boolean>) => {
			state.mainMenuSound = action.payload;
		},
		setSex: (state: SettingsState, action: PayloadAction<Sex>) => {
			state.sex = action.payload;
		},
		setAvatarKey: (state: SettingsState, action: PayloadAction<string | null>) => {
			state.avatarKey = action.payload;
		},
		setStudiaBackgroundImageKey: (state: SettingsState, action: PayloadAction<string | null>) => {
			state.theme.room.backgroundImageKey = action.payload;
		},
		setOral: (state: SettingsState, action: PayloadAction<boolean>) => {
			state.appSettings.oral = action.payload;
		},
		setFalseStarts: (state: SettingsState, action: PayloadAction<boolean>) => {
			state.appSettings.falseStart = action.payload;
		},
		setHintShowman: (state: SettingsState, action: PayloadAction<boolean>) => {
			state.appSettings.hintShowman = action.payload;
		},
		setPartialText: (state: SettingsState, action: PayloadAction<boolean>) => {
			state.appSettings.partialText = action.payload;
		},
		setPartialImages: (state: SettingsState, action: PayloadAction<boolean>) => {
			state.appSettings.partialImages = action.payload;
		},
		setReadingSpeed: (state: SettingsState, action: PayloadAction<number>) => {
			state.appSettings.readingSpeed = action.payload;
		},
		setManaged: (state: SettingsState, action: PayloadAction<boolean>) => {
			state.appSettings.managed = action.payload;
		},
		setUseApellations: (state: SettingsState, action: PayloadAction<boolean>) => {
			state.appSettings.useApellations = action.payload;
		},
		setIgnoreWrong: (state: SettingsState, action: PayloadAction<boolean>) => {
			state.appSettings.ignoreWrong = action.payload;
		},
		setUsePingPenalty: (state: SettingsState, action: PayloadAction<boolean>) => {
			state.appSettings.usePingPenalty = action.payload;
		},
		setButtonPressMode: (state: SettingsState, action: PayloadAction<ButtonPressMode>) => {
			state.appSettings.buttonPressMode = action.payload;
		},
		setPreloadRoundContent: (state: SettingsState, action: PayloadAction<boolean>) => {
			state.appSettings.preloadRoundContent = action.payload;
		},
		setTimeSetting: (state: SettingsState, action: PayloadAction<{ name: keyof TimeSettings, value: number }>) => {
			state.appSettings.timeSettings[action.payload.name] = action.payload.value;
		},
		languageChanged: (state: SettingsState, action: PayloadAction<string | null>) => {
			state.appSettings.culture = action.payload;
		},
		setGameButtonKey: (state: SettingsState, action: PayloadAction<string | null>) => {
			state.gameButtonKey = action.payload;
		},
		setPassButtonKey: (state: SettingsState, action: PayloadAction<string | null>) => {
			state.passButtonKey = action.payload;
		},
		setPlayAllQuestionsInFinalRound: (state: SettingsState, action: PayloadAction<boolean>) => {
			state.appSettings.playAllQuestionsInFinalRound = action.payload;
		},
		setOralPlayersActions: (state: SettingsState, action: PayloadAction<boolean>) => {
			state.appSettings.oralPlayersActions = action.payload;
		},
		setAllowEveryoneToPlayHiddenStakes: (state: SettingsState, action: PayloadAction<boolean>) => {
			state.appSettings.allowEveryoneToPlayHiddenStakes = action.payload;
		},
		setDisplaySources: (state: SettingsState, action: PayloadAction<boolean>) => {
			state.appSettings.displaySources = action.payload;
		},
		setFloatingControls: (state: SettingsState, action: PayloadAction<boolean>) => {
			state.floatingControls = action.payload;
		},
		setFullScreen: (state: SettingsState, action: PayloadAction<boolean>) => {
			state.fullScreen = action.payload;
		},
		setAttachContentToTable: (state: SettingsState, action: PayloadAction<boolean>) => {
			state.attachContentToTable = action.payload;
		},
		setShowVideoAvatars: (state: SettingsState, action: PayloadAction<boolean>) => {
			state.showVideoAvatars = action.payload;
		},
		setDisplayAnswerOptionsOneByOne: (state: SettingsState, action: PayloadAction<boolean>) => {
			state.appSettings.displayAnswerOptionsOneByOne = action.payload;
		},
		setDisplayAnswerOptionsLabels: (state: SettingsState, action: PayloadAction<boolean>) => {
			state.appSettings.displayAnswerOptionsLabels = action.payload;
		},
		setNextButtonKey: (state: SettingsState, action: PayloadAction<string | null>) => {
			state.nextButtonKey = action.payload;
		},
		setYesButtonKey: (state: SettingsState, action: PayloadAction<string | null>) => {
			state.yesButtonKey = action.payload;
		},
		setNoButtonKey: (state: SettingsState, action: PayloadAction<string | null>) => {
			state.noButtonKey = action.payload;
		},
		setPauseButtonKey: (state: SettingsState, action: PayloadAction<string | null>) => {
			state.pauseButtonKey = action.payload;
		},
		setTableTextColor: (state: SettingsState, action: PayloadAction<string>) => {
			state.theme.table.textColor = action.payload;
		},
		setTableBackgroundColor: (state: SettingsState, action: PayloadAction<string>) => {
			state.theme.table.backgroundColor = action.payload;
		},
		setWriteGameLog: (state: SettingsState, action: PayloadAction<boolean>) => {
			state.writeGameLog = action.payload;
		},
		resetSettings: (state: SettingsState) => {
			const { culture } = state.appSettings;
			Object.assign(state, initialState, { appSettings: { ...initialAppSettings, culture } });
		}
	}
});

export const {
	setSoundVolume,
	setSound,
	setAppSound,
	setMainMenuSound,
	setSex,
	setAvatarKey,
	setStudiaBackgroundImageKey,
	setOral,
	setFalseStarts,
	setHintShowman,
	setPartialText,
	setPartialImages,
	setReadingSpeed,
	setManaged,
	setUseApellations,
	setIgnoreWrong,
	setUsePingPenalty,
	setButtonPressMode,
	setPreloadRoundContent,
	setTimeSetting,
	languageChanged,
	setGameButtonKey,
	setPassButtonKey,
	setPlayAllQuestionsInFinalRound,
	setOralPlayersActions,
	setAllowEveryoneToPlayHiddenStakes,
	setDisplaySources,
	setFloatingControls,
	setFullScreen,
	setAttachContentToTable,
	setShowVideoAvatars,
	setDisplayAnswerOptionsOneByOne,
	setDisplayAnswerOptionsLabels,
	setNextButtonKey,
	setYesButtonKey,
	setNoButtonKey,
	setPauseButtonKey,
	setTableTextColor,
	setTableBackgroundColor,
	setWriteGameLog,
	resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
