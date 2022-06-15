import MainView from '../model/enums/MainView';
import GamesFilter from '../model/enums/GamesFilter';
import OnlineMode from '../model/enums/OnlineMode';
import ChatMessage from '../model/ChatMessage';
import ChatMode from '../model/enums/ChatMode';
import GameType from '../client/contracts/GameType';
import Role from '../client/contracts/Role';
import RunState, { initialState as runInitialState } from './run/RunState';
import GameInfo from '../client/contracts/GameInfo';
import localization from '../model/resources/localization';
import SettingsState, { initialState as settingsInitialState } from './settings/SettingsState';
import PackageType from '../model/enums/PackageType';
import { SIPackageInfo } from '../model/SIPackageInfo';
import { SearchEntity } from '../model/SearchEntity';

export default interface State {
	user: {
		login: string;
		avatar: string | null;
	};
	login: {
		inProgress: boolean;
		errorMessage: string | null;
	};
	ui: {
		mainView: MainView;
		previousMainView: MainView;
		onlineView: OnlineMode;
		windowWidth: number;
		windowHeight: number;
		areSettingsVisible: boolean;
		isSettingGameButtonKey: boolean;
	};
	online: {
		inProgress: boolean;
		error: string;
		gamesFilter: GamesFilter;
		gamesSearch: string;
		games: Record<number, GameInfo>;
		selectedGameId: number;
		users: string[];
		currentMessage: string;
		messages: ChatMessage[];
		password: string;
		chatMode: ChatMode;
		newGameShown: boolean;
		gameCreationProgress: boolean;
		gameCreationError: string | null;
		joinGameProgress: boolean;
		joingGameError: string | null;
		uploadPackageProgress: boolean;
		uploadPackagePercentage: number;
	};
	game: {
		name: string;
		password: string;
		package: {
			type: PackageType;
			name: string;
			data: File | null;
			id: string | null;
		};
		type: GameType;
		role: Role;
		isShowmanHuman: boolean;
		playersCount: number;
		humanPlayersCount: number;
		id: number;
		isAutomatic: boolean;
	};
	run: RunState;
	common: {
		computerAccounts: string[] | null;
		isConnected: boolean;
		serverName: string | null;
		serverLicense: string | null;
		error: string | null;
		avatarLoadProgress: boolean;
		avatarLoadError: string | null;
	};
	siPackages: {
		packages: SIPackageInfo[];
		authors: SearchEntity[];
		tags: SearchEntity[];
		publishers: SearchEntity[];
		isLoading: boolean;
	};
	settings: SettingsState;
}

export const initialState: State = {
	user: {
		login: '',
		avatar: null
	},
	login: {
		inProgress: false,
		errorMessage: null
	},
	ui: {
		mainView: MainView.Loading,
		previousMainView: MainView.Loading,
		onlineView: OnlineMode.Games,
		windowWidth: window.innerWidth,
		windowHeight: window.innerHeight,
		areSettingsVisible: false,
		isSettingGameButtonKey: false
	},
	online: {
		inProgress: false,
		error: '',
		gamesFilter: GamesFilter.NoFilter,
		gamesSearch: '',
		games: {},
		selectedGameId: -1,
		users: [],
		currentMessage: '',
		messages: [
			{
				sender: localization.appUser,
				text: localization.greeting
			}
		],
		password: '',
		chatMode: ChatMode.Chat,
		newGameShown: false,
		gameCreationProgress: false,
		gameCreationError: null,
		joinGameProgress: false,
		joingGameError: null,
		uploadPackageProgress: false,
		uploadPackagePercentage: 0
	},
	game: {
		name: '',
		password: '',
		package: {
			type: PackageType.Random,
			name: '',
			data: null,
			id: null
		},
		type: GameType.Simple,
		role: Role.Player,
		isShowmanHuman: false,
		playersCount: 3,
		humanPlayersCount: 0,
		id: -1,
		isAutomatic: false
	},
	siPackages: {
		authors: [],
		isLoading: false,
		packages: [],
		publishers: [],
		tags: []
	},
	run: runInitialState,
	common: {
		computerAccounts: null,
		isConnected: true,
		serverName: null,
		serverLicense: null,
		error: null,
		avatarLoadProgress: false,
		avatarLoadError: null
	},
	settings: settingsInitialState
};
