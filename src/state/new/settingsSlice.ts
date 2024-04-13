import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AppSettings from '../../model/AppSettings';
import Constants from '../../model/enums/Constants';
import Sex from '../../model/enums/Sex';
import ButtonPressMode from '../../model/ButtonPressMode';

export interface SettingsState {
	soundVolume: number;
	sound: boolean;
	appSound: boolean;
	mainMenuSound: boolean;
	showPersonsAtBottomOnWideScreen: boolean;
	floatingControls: boolean;
	sex: Sex;
	avatarKey: string | null;
	appSettings: AppSettings;
	gameButtonKey: string | null;
	nextButtonKey: string | null;
	isLobbyChatHidden: boolean;
	areValidationAnswersHidden: boolean;
	bindNextButton: boolean;
	attachContentToTable: boolean;
	showVideoAvatars: boolean;
}

const initialState: SettingsState = {
	soundVolume: 1,
	sound: true,
	appSound: false,
	mainMenuSound: false,
	showPersonsAtBottomOnWideScreen: true,
	floatingControls: false,
	sex: Sex.Male,
	avatarKey: null,
	appSettings: {
		culture: null,
		oral: false,
		oralPlayersActions: true,
		falseStart: true,
		hintShowman: false,
		partialText: false,
		allowEveryoneToPlayHiddenStakes: true,
		playAllQuestionsInFinalRound: false,
		displaySources: false,
		readingSpeed: 20,
		managed: false,
		ignoreWrong: false,
		timeSettings: {
			timeForChoosingQuestion: 30,
			timeForThinkingOnQuestion: 5,
			timeForPrintingAnswer: 25,
			timeForGivingACat: 30,
			timeForMakingStake: 30,
			timeForThinkingOnSpecial: 25,
			timeOfRound: 660,
			timeForChoosingFinalTheme: 30,
			timeForFinalThinking: 45,
			timeForShowmanDecisions: 30,
			timeForRightAnswer: 2,
			timeForMediaDelay: 0,
			timeForBlockingButton: 3
		},
		usePingPenalty: false,
		buttonPressMode: ButtonPressMode.RandomWithinInterval,
		preloadRoundContent: true,
		useApellations: true
	},
	gameButtonKey: Constants.KEY_CTRL,
	nextButtonKey: Constants.KEY_RIGHT,
	isLobbyChatHidden: false,
	areValidationAnswersHidden: false,
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
		}
	}
});

export const { setSoundVolume } = settingsSlice.actions;

export default settingsSlice.reducer;
