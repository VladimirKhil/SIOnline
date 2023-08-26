import { AnyAction, Reducer } from 'redux';
import State, { initialState } from './State';
import { ActionTypes } from './Actions';
import localization from '../model/resources/localization';
import { KnownRoomAction } from './room/RoomActions';
import roomReducer from './room/roomReducer';
import settingsReducer from './settings/settingsReducer';
import { KnownSettingsAction } from './settings/SettingsActions';
import Role from '../client/contracts/Role';
import tableReducer from './table/tableReducer';
import { KnownTableAction } from './table/TableActions';
import userReducer from './user/userReducer';
import { KnownUserAction } from './user/UserActions';
import loginReducer from './login/loginReducer';
import { KnownLoginAction } from './login/LoginActions';
import commonReducer from './common/commonReducer';
import { KnownCommonAction } from './common/CommonActions';
import siPackagesReducer from './siPackages/siPackagesReducer';
import { KnownSIPackagesAction } from './siPackages/SIPackagesActions';
import uiReducer from './ui/uiReducer';
import { KnownUIAction } from './ui/UIActions';
import onlineReducer from './online/onliceReducer';
import { KnownOnlineAction } from './online/OnlineActions';

const reducer: Reducer<State> = (
	state: State = initialState,
	action: AnyAction): State => {
	switch (action.type) {
		case ActionTypes.GameNameChanged: {
			return {
				...state,
				game: {
					...state.game,
					name: action.gameName
				}
			};
		}

		case ActionTypes.GamePasswordChanged: {
			return {
				...state,
				game: {
					...state.game,
					password: action.gamePassword
				}
			};
		}

		case ActionTypes.GamePackageTypeChanged: {
			return {
				...state,
				game: {
					...state.game,
					package: {
						...state.game.package,
						type: action.packageType
					}
				}
			};
		}

		case ActionTypes.GamePackageDataChanged: {
			return {
				...state,
				game: {
					...state.game,
					package: {
						...state.game.package,
						name: action.packageName,
						data: action.packageData
					}
				}
			};
		}

		case ActionTypes.GamePackageLibraryChanged: {
			return {
				...state,
				game: {
					...state.game,
					package: {
						...state.game.package,
						name: action.name,
						id: action.id
					}
				}
			};
		}

		case ActionTypes.GameTypeChanged: {
			return {
				...state,
				game: {
					...state.game,
					type: action.gameType
				}
			};
		}

		case ActionTypes.GameRoleChanged: {
			return {
				...state,
				game: {
					...state.game,
					role: action.gameRole,
					humanPlayersCount: Math.min(state.game.playersCount - (action.gameRole === Role.Player ? 1 : 0), state.game.humanPlayersCount)
				}
			};
		}

		case ActionTypes.ShowmanTypeChanged: {
			return {
				...state,
				game: {
					...state.game,
					isShowmanHuman: action.isHuman
				}
			};
		}

		case ActionTypes.PlayersCountChanged: {
			return {
				...state,
				game: {
					...state.game,
					playersCount: action.playersCount,
					humanPlayersCount: Math.min(state.game.humanPlayersCount, action.playersCount - (state.game.role === Role.Player ? 1 : 0))
				}
			};
		}

		case ActionTypes.HumanPlayersCountChanged: {
			return {
				...state,
				game: {
					...state.game,
					humanPlayersCount: action.humanPlayersCount
				}
			};
		}

		case ActionTypes.GameSet: {
			return {
				...state,
				game: {
					...state.game,
					id: action.id,
					isAutomatic: action.isAutomatic
				}
			};
		}

		case ActionTypes.NewGame2: {
			return {
				...state,
				game: {
					...state.game,
					name: state.game.name || `${localization.gameOf} ${state.user.login}`
				}
			};
		}

		default:
			return {
				...state,
				user: userReducer(state.user, action as KnownUserAction),
				login: loginReducer(state.login, action as KnownLoginAction),
				room: roomReducer(state.room, action as KnownRoomAction),
				common: commonReducer(state.common, action as KnownCommonAction),
				settings: settingsReducer(state.settings, action as KnownSettingsAction),
				table: tableReducer(state.table, action as KnownTableAction),
				siPackages: siPackagesReducer(state.siPackages, action as KnownSIPackagesAction),
				ui: uiReducer(state.ui, action as KnownUIAction),
				online: onlineReducer(state.online, action as KnownOnlineAction),
			};
	}
};

export default reducer;
