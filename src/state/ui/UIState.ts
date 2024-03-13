import Role from '../../model/Role';
import OnlineMode from '../../model/enums/OnlineMode';
import Path from '../../model/enums/Path';
import Sex from '../../model/enums/Sex';

export interface INavigationState {
	path: Path;
	returnToLobby?: boolean;
	packageUri?: string;
	packageName?: string;
	gameId?: number;
	newGameMode?: 'single' | 'multi';
	callbackState?: INavigationState;
	role?: Role;
	sex?: Sex;
	password?: string;
	isAutomatic?: boolean;
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
		path: Path.Root,
	}
};
