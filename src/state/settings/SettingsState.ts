import Sex from '../../model/enums/Sex';
import AppSettings, { initialState as initialAppSettings } from '../../model/AppSettings';
import Constants from '../../model/enums/Constants';

export default interface SettingsState {
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

export const initialState: SettingsState = {
	soundVolume: 1,
	sound: true,
	appSound: false,
	mainMenuSound: false,
	showPersonsAtBottomOnWideScreen: true,
	floatingControls: false,
	sex: Sex.Male,
	avatarKey: null,
	appSettings: initialAppSettings,
	gameButtonKey: Constants.KEY_CTRL,
	nextButtonKey: Constants.KEY_RIGHT,
	isLobbyChatHidden: false,
	areValidationAnswersHidden: false,
	bindNextButton: true,
	attachContentToTable: true,
	showVideoAvatars: true,
};
