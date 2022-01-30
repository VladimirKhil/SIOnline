import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AppSettings from '../../model/AppSettings';
import Sex from '../../model/enums/Sex';

export interface SettingsState {
	isSoundEnabled: boolean;
	showPersonsAtBottomOnWideScreen: boolean;
	sex: Sex;
	appSettings: AppSettings;
}

const initialState: SettingsState = {
	isSoundEnabled: false,
	showPersonsAtBottomOnWideScreen: true,
	sex: Sex.Male,
	appSettings: {
		oral: false,
		falseStart: true,
		hintShowman: false,
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
		}
	}
};

export const settingsSlice = createSlice({
	name: 'settings',
	initialState,
	reducers: {
		setIsSoundEnabled: (state: SettingsState, action: PayloadAction<boolean>) => {
			state.isSoundEnabled = action.payload;
		}
	}
});

export const {
	setIsSoundEnabled
} = settingsSlice.actions;

export default settingsSlice.reducer;