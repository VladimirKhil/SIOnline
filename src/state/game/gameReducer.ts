import { AnyAction, Reducer } from 'redux';
import GameState, { initialState } from './GameState';
import { GameActionTypes, KnownGameAction } from './GameActions';
import Role from '../../client/contracts/Role';
import localization from '../../model/resources/localization';

const gameReducer: Reducer<GameState> = (state: GameState = initialState, anyAction: AnyAction): GameState => {
	const action = anyAction as KnownGameAction;

	switch (action.type) {
		case GameActionTypes.GameNameChanged: {
			return {
				...state,
				name: action.gameName
			};
		}

		case GameActionTypes.GamePasswordChanged: {
			return {
				...state,
				password: action.gamePassword
			};
		}

		case GameActionTypes.GameVoiceChatChanged: {
			return {
				...state,
				voiceChat: action.gameVoiceChat
			};
		}

		case GameActionTypes.GamePackageTypeChanged: {
			return {
				...state,
				package: {
					...state.package,
					type: action.packageType
				}
			};
		}

		case GameActionTypes.GamePackageDataChanged: {
			return {
				...state,
				package: {
					...state.package,
					name: action.packageName,
					data: action.packageData
				}
			};
		}

		case GameActionTypes.GamePackageLibraryChanged: {
			return {
				...state,
				package: {
					...state.package,
					name: action.name,
					id: action.id,
					uri: action.uri,
				}
			};
		}

		case GameActionTypes.GameTypeChanged: {
			return {
				...state,
				type: action.gameType
			};
		}

		case GameActionTypes.GameRoleChanged: {
			return {
				...state,
				role: action.gameRole,
				humanPlayersCount: Math.min(state.playersCount - (action.gameRole === Role.Player ? 1 : 0), state.humanPlayersCount)
			};
		}

		case GameActionTypes.ShowmanTypeChanged: {
			return {
				...state,
				isShowmanHuman: action.isHuman
			};
		}

		case GameActionTypes.PlayersCountChanged: {
			return {
				...state,
				playersCount: action.playersCount,
				humanPlayersCount: Math.min(state.humanPlayersCount, action.playersCount - (state.role === Role.Player ? 1 : 0))
			};
		}

		case GameActionTypes.HumanPlayersCountChanged: {
			return {
				...state,
				humanPlayersCount: action.humanPlayersCount
			};
		}

		case GameActionTypes.GameSet: {
			return {
				...state,
				id: action.id,
				isAutomatic: action.isAutomatic
			};
		}

		case GameActionTypes.NewGame2: {
			return {
				...state,
				name: state.name || `${localization.gameOf} ${action.userName}`
			};
		}

		default:
			return state;
	}
};

export default gameReducer;
