import Sex from '../../model/enums/Sex';
import AppSettings from '../../model/AppSettings';
import Constants from '../../model/enums/Constants';

export default interface SettingsState {
	soundVolume: number;
	showPersonsAtBottomOnWideScreen: boolean;
	sex: Sex;
	appSettings: AppSettings;
	gameButtonKey: string | null;
	isLobbyChatHidden: boolean;
}

export const initialState: SettingsState = {
	soundVolume: 1,
	showPersonsAtBottomOnWideScreen: true,
	sex: Sex.Male,
	appSettings: {
		culture: null,
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
		},
		usePingPenalty: false,
		preloadRoundContent: true,
	},
	gameButtonKey: Constants.KEY_CTRL,
	isLobbyChatHidden: false
};
