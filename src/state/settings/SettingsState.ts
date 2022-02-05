import Sex from '../../model/enums/Sex';
import AppSettings from '../../model/AppSettings';

export default interface SettingsState {
	isSoundEnabled: boolean;
	showPersonsAtBottomOnWideScreen: boolean;
	sex: Sex;
	appSettings: AppSettings;
}

export const initialState: SettingsState = {
	isSoundEnabled: false,
	showPersonsAtBottomOnWideScreen: true,
	sex: Sex.Male,
	appSettings: {
		oral: false,
		falseStart: true,
		hintShowman: false,
		partialText: false,
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
		}
	}
};
