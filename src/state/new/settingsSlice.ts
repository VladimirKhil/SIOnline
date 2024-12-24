import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AppSettings, { initialState as initialAppSettings } from '../../model/AppSettings';
import Constants from '../../model/enums/Constants';
import Sex from '../../model/enums/Sex';
import ButtonPressMode from '../../model/ButtonPressMode';
import TimeSettings from '../../model/TimeSettings';

export interface SettingsState {
	soundVolume: number;
	sound: boolean;
	appSound: boolean;
	mainMenuSound: boolean;
	floatingControls: boolean;
	sex: Sex;
	avatarKey: string | null;
	appSettings: AppSettings;
	gameButtonKey: string | null;
	nextButtonKey: string | null;
	isLobbyChatHidden: boolean;
	bindNextButton: boolean;
	attachContentToTable: boolean;
	showVideoAvatars: boolean;
}

const initialState: SettingsState = {
	soundVolume: 1,
	sound: true,
	appSound: false,
	mainMenuSound: false,
	floatingControls: false,
	sex: Sex.Male,
	avatarKey: null,
	appSettings: initialAppSettings,
	gameButtonKey: Constants.KEY_CTRL,
	nextButtonKey: Constants.KEY_RIGHT,
	isLobbyChatHidden: false,
	bindNextButton: true,
	attachContentToTable: true,
	showVideoAvatars: true,
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
		setLobbyChatVisibility: (state: SettingsState, action: PayloadAction<boolean>) => {
			state.isLobbyChatHidden = !action.payload;
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
		setBindNextButton: (state: SettingsState, action: PayloadAction<boolean>) => {
			state.bindNextButton = action.payload;
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
	setLobbyChatVisibility,
	setPlayAllQuestionsInFinalRound,
	setOralPlayersActions,
	setAllowEveryoneToPlayHiddenStakes,
	setDisplaySources,
	setFloatingControls,
	setBindNextButton,
	setAttachContentToTable,
	setShowVideoAvatars,
	setDisplayAnswerOptionsOneByOne,
	setDisplayAnswerOptionsLabels,
	setNextButtonKey,
	resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
