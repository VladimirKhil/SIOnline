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

const reducer: Reducer<State> = (state: State = initialState, action: KnownAction | KnownRunAction): State => {
	switch (action.type) {
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

		case ActionTypes.SexChanged:
			return {
				...state,
				user: {
					...state.user,
					sex: action.newSex
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
					selectedGameId: -1,
					games: [],
					users: [],
					messages: [],
					inProgress: true
				}
			};

		case ActionTypes.ReceiveGames:
			return {
				...state,
				online: {
					...state.online,
					games: create(action.games, game => game.gameID)
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

		case ActionTypes.GamesFilterToggle: {
			return {
				...state,
				online: {
					...state.online,
					gamesFilter: state.online.gamesFilter ^ action.filter
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
					playersCount: action.playersCount
				}
			};
		}

		case ActionTypes.GameCreationStart: {
			return {
				...state,
				online: {
					...state.online,
					gameCreationProgress: true
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
	}

	return {...state,
		run: runReducer(state.run, action as KnownRunAction)
	};
};

export default reducer;
