import { Reducer } from 'redux';
import State, { initialState } from './State';
import { KnownAction, ActionTypes } from './Actions';
import MainView from '../model/enums/MainView';
import { create, remove, set } from '../utils/RecordExtensions';
import { removeFromArray } from '../utils/ArrayExtensions';
import localization from '../model/resources/localization';
import { KnownRunAction } from './run/runActions';
import runReducer from './run/runReducer';
import OnlineMode from '../model/enums/OnlineMode';
import * as runState from './run/RunState';
import settingsReducer from './settings/settingsReducer';
import { KnownSettingsAction } from './settings/SettingsActions';
import Role from '../model/enums/Role';

const reducer: Reducer<State> = (state: State = initialState, action: KnownAction | KnownRunAction | KnownSettingsAction): State => {
	switch (action.type) {
		case ActionTypes.IsConnectedChanged:
			return {
				...state,
				common: {
					...state.common,
					isConnected: action.isConnected
				}
			};

		case ActionTypes.ComputerAccountsChanged:
			return {
				...state,
				common: {
					...state.common,
					computerAccounts: action.computerAccounts
				}
			};

		case ActionTypes.NavigateToLogin:
			return {
				...state,
				ui: {
					...state.ui,
					mainView: MainView.Login,
					previousMainView: state.ui.mainView
				}
			};

		case ActionTypes.ShowSettings:
			return {
				...state,
				ui: {
					...state.ui,
					areSettingsVisible: action.show
				}
			};

		case ActionTypes.NavigateToHowToPlay:
			return {
				...state,
				ui: {
					...state.ui,
					mainView: MainView.HowToPlay,
					previousMainView: state.ui.mainView
				}
			};

		case ActionTypes.NavigateBack:
			return {
				...state,
				ui: {
					...state.ui,
					mainView: state.ui.previousMainView
				}
			};

		case ActionTypes.LoginChanged:
			return {
				...state,
				user: {
					...state.user,
					login: action.newLogin
				}
			};

		case ActionTypes.LoginStart:
			return {
				...state,
				login: {
					...state.login,
					inProgress: true,
					errorMessage: ''
				}
			};

		case ActionTypes.LoginEnd:
			return {
				...state,
				login: {
					...state.login,
					inProgress: false,
					errorMessage: action.error
				}
			};

		case ActionTypes.NavigateToGamesList:
			return {
				...state,
				ui: {
					...state.ui,
					mainView: MainView.OnlineView,
					previousMainView: state.ui.mainView
				},
				online: {
					...state.online,
					games: [],
					users: [],
					messages: [],
					inProgress: true,
					error: ''
				}
			};

		case ActionTypes.ClearGames:
			return {
				...state,
				online: {
					...state.online,
					games: {}
				}
			};

		case ActionTypes.ReceiveGames:
			return {
				...state,
				online: {
					...state.online,
					games: { ...state.online.games, ...create(action.games, game => game.gameID) }
				}
			};

		case ActionTypes.ReceiveUsers:
			return {
				...state,
				online: {
					...state.online,
					users: action.users
				}
			};

		case ActionTypes.ReceiveMessage:
			return {
				...state,
				online: {
					...state.online,
					messages: [
						...state.online.messages, {
							sender: action.sender,
							text: action.message
						}]
				}
			};

		case ActionTypes.GameCreated:
			return {
				...state,
				online: {
					...state.online,
					games: set(state.online.games, action.game.gameID, action.game)
				}
			};

		case ActionTypes.GameChanged:
			return {
				...state,
				online: {
					...state.online,
					games: set(state.online.games, action.game.gameID, action.game)
				}
			};

		case ActionTypes.GameDeleted:
			return {
				...state,
				online: {
					...state.online,
					games: remove(state.online.games, action.gameId),
					selectedGameId: state.online.selectedGameId === action.gameId ? -1 : state.online.selectedGameId
				}
			};

		case ActionTypes.UserJoined:
			if (state.online.users.indexOf(action.login) > -1) {
				console.error(`User ${action.login} already exists in users list!`);
				return state;
			}

			return {
				...state,
				online: {
					...state.online,
					users: [...state.online.users, action.login]
				}
			};

		case ActionTypes.UserLeaved:
			return {
				...state,
				online: {
					...state.online,
					users: removeFromArray(state.online.users, action.login)
				}
			};

		case ActionTypes.OnlineLoadFinished:
			return {
				...state,
				online: {
					...state.online,
					inProgress: false
				}
			};

		case ActionTypes.OnlineLoadError:
			return {
				...state,
				online: {
					...state.online,
					inProgress: false,
					error: action.error
				}
			};

		case ActionTypes.GamesFilterToggle: {
			return {
				...state,
				online: {
					...state.online,
					gamesFilter: state.online.gamesFilter ^ action.filter
				}
			};
		}

		case ActionTypes.GamesSearchChanged: {
			return {
				...state,
				online: {
					...state.online,
					gamesSearch: action.search
				}
			};
		}

		case ActionTypes.SelectGame:
			return {
				...state,
				online: {
					...state.online,
					selectedGameId: action.gameId
				},
				ui: {
					...state.ui,
					onlineView: action.showInfo ? OnlineMode.GameInfo : state.ui.onlineView
				}
			};

		case ActionTypes.CloseGameInfo:
			return {
				...state,
				ui: {
					...state.ui,
					onlineView: OnlineMode.Games
				}
			};

		case ActionTypes.PasswordChanged: {
			return {
				...state,
				online: {
					...state.online,
					password: action.newPassword
				}
			};
		}

		case ActionTypes.MessageChanged: {
			return {
				...state,
				online: {
					...state.online,
					currentMessage: action.message
				}
			};
		}

		case ActionTypes.ChatModeChanged: {
			return {
				...state,
				online: {
					...state.online,
					chatMode: action.chatMode
				}
			};
		}

		case ActionTypes.OnlineModeChanged: {
			return {
				...state,
				ui: {
					...state.ui,
					onlineView: action.mode
				}
			};
		}

		case ActionTypes.WindowWidthChanged: {
			return {
				...state,
				ui: {
					...state.ui,
					windowWidth: action.width
				}
			};
		}

		case ActionTypes.NewGame: {
			return {
				...state,
				online: {
					...state.online,
					newGameShown: true,
					gameCreationProgress: false,
					gameCreationError: null
				},
				game: {
					...state.game,
					name: state.game.name || `${localization.gameOf} ${state.user.login}`
				}
			};
		}

		case ActionTypes.NewGameCancel: {
			return {
				...state,
				online: {
					...state.online,
					newGameShown: false,
					gameCreationError: null,
					gameCreationProgress: false
				}
			};
		}

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
					role: action.gameRole
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

		case ActionTypes.GameCreationStart: {
			return {
				...state,
				online: {
					...state.online,
					gameCreationProgress: true,
					gameCreationError: null
				}
			};
		}

		case ActionTypes.GameCreationEnd: {
			return {
				...state,
				online: {
					...state.online,
					gameCreationProgress: false,
					gameCreationError: action.error
				}
			};
		}

		case ActionTypes.GameSet: {
			return {
				...state,
				game: {
					...state.game,
					id: action.id,
					isHost: action.isHost,
					isAutomatic: action.isAutomatic
				},
				ui: {
					...state.ui,
					mainView: MainView.Game,
					previousMainView: state.ui.mainView
				},
				run: {
					...runState.initialState,
					role: action.role
				}
			};
		}

		case ActionTypes.JoinGameStarted: {
			return {
				...state,
				online: {
					...state.online,
					joinGameProgress: true,
					joingGameError: null
				}
			};
		}

		case ActionTypes.JoinGameFinished: {
			return {
				...state,
				online: {
					...state.online,
					joinGameProgress: false,
					joingGameError: action.error
				}
			};
		}

		case ActionTypes.UploadPackageStarted:
			return {
				...state,
				online: {
					...state.online,
					uploadPackageProgress: true,
					uploadPackagePercentage: 0
				}
			};

		case ActionTypes.UploadPackageFinished:
			return {
				...state,
				online: {
					...state.online,
					uploadPackageProgress: false
				}
			};

		case ActionTypes.UploadPackageProgress:
			return {
				...state,
				online: {
					...state.online,
					uploadPackagePercentage: action.progress
				}
			};
	}

	return {...state,
		run: runReducer(state.run, action as KnownRunAction),
		settings: settingsReducer(state.settings, action as KnownSettingsAction)
	};
};

export default reducer;
