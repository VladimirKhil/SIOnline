import MainView from '../../model/enums/MainView';
import OnlineMode from '../../model/enums/OnlineMode';

export default interface UIState {
	mainView: MainView;
	previousMainView: MainView;
	onlineView: OnlineMode;
	windowWidth: number;
	windowHeight: number;
	areSettingsVisible: boolean;
	isSettingGameButtonKey: boolean;
}

export const initialState: UIState = {
	mainView: MainView.Loading,
	previousMainView: MainView.Loading,
	onlineView: OnlineMode.Games,
	windowWidth: window.innerWidth,
	windowHeight: window.innerHeight,
	areSettingsVisible: false,
	isSettingGameButtonKey: false,
};
