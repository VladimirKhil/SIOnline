import OnlineMode from '../../model/enums/OnlineMode';

export default interface UIState {
	onlineView: OnlineMode;
	windowWidth: number;
	windowHeight: number;
	areSettingsVisible: boolean;
	isSettingGameButtonKey: boolean;
	isVisible: boolean;
}

export const initialState: UIState = {
	onlineView: OnlineMode.Games,
	windowWidth: window.innerWidth,
	windowHeight: window.innerHeight,
	areSettingsVisible: false,
	isSettingGameButtonKey: false,
	isVisible: true,
};
