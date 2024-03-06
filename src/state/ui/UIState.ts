import OnlineMode from '../../model/enums/OnlineMode';
import Path from '../../model/enums/Path';

export interface INavigationState {
	path: Path;
	returnToLobby?: boolean;
	packageUri?: string;
	packageName?: string;
	gameId?: number;
	newGameMode?: 'single' | 'multi';
	callbackState?: INavigationState;
}

export default interface UIState {
	onlineView: OnlineMode;
	windowWidth: number;
	windowHeight: number;
	areSettingsVisible: boolean;
	isSettingGameButtonKey: boolean;
	isVisible: boolean;
	navigation: INavigationState;
}

export const initialState: UIState = {
	onlineView: OnlineMode.Games,
	windowWidth: window.innerWidth,
	windowHeight: window.innerHeight,
	areSettingsVisible: false,
	isSettingGameButtonKey: false,
	isVisible: true,
	navigation: {
		path: Path.Login,
	}
};
