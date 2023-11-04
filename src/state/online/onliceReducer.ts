import { AnyAction, Reducer } from 'redux';
import OnlineState, { initialState } from './OnlineState';
import { KnownOnlineAction, OnlineActionTypes } from './OnlineActions';
import { create, remove, set } from '../../utils/RecordExtensions';
import MessageLevel from '../../model/enums/MessageLevel';
import { removeFromArray } from '../../utils/ArrayExtensions';

const onlineReducer: Reducer<OnlineState> = (state: OnlineState = initialState, anyAction: AnyAction): OnlineState => {
	const action = anyAction as KnownOnlineAction;

	switch (action.type) {
		case OnlineActionTypes.DropSelectedGame:
			return {
				...state,
				selectedGameId: -1,
			};

		case OnlineActionTypes.UnselectGame:
			return {
				...state,
				selectedGameId: -1,
			};

		case OnlineActionTypes.ResetLobby:
			return {
				...state,
				games: [],
				users: [],
				messages: [],
				inProgress: true,
				error: ''
			};

		case OnlineActionTypes.ClearGames:
			return {
				...state,
				games: {}
			};

		case OnlineActionTypes.ReceiveGames:
			return {
				...state,
				games: { ...state.games, ...create(action.games, game => game.GameID) }
			};

		case OnlineActionTypes.ReceiveUsers:
			return {
				...state,
				users: action.users
			};

		case OnlineActionTypes.ReceiveMessage:
			return {
				...state,
				messages: [
				...state.messages, {
					sender: action.sender,
					text: action.message,
					level: MessageLevel.Information,
				}]
			};

		case OnlineActionTypes.GameCreated:
			return {
				...state,
				games: set(state.games, action.game.GameID, action.game)
			};

		case OnlineActionTypes.GameChanged:
			return {
				...state,
				games: set(state.games, action.game.GameID, action.game)
			};

		case OnlineActionTypes.GameDeleted:
			return {
				...state,
				games: remove(state.games, action.gameId),
				selectedGameId: state.selectedGameId === action.gameId ? -1 : state.selectedGameId
			};

		case OnlineActionTypes.UserJoined:
			if (state.users.indexOf(action.login) > -1) {
				return state;
			}

			return {
				...state,
				users: [...state.users, action.login]
			};

		case OnlineActionTypes.UserLeaved:
			return {
				...state,
				users: removeFromArray(state.users, action.login)
			};

		case OnlineActionTypes.OnlineLoadFinished:
			return {
				...state,
				inProgress: false
			};

		case OnlineActionTypes.OnlineLoadError:
			return {
				...state,
				inProgress: false,
				error: action.error
			};

		case OnlineActionTypes.GamesFilterToggle: {
			return {
				...state,
				gamesFilter: state.gamesFilter ^ action.filter
			};
		}

		case OnlineActionTypes.GamesSearchChanged: {
			return {
				...state,
				gamesSearch: action.search
			};
		}

		case OnlineActionTypes.SelectGame:
			return {
				...state,
				selectedGameId: action.gameId
			};

		case OnlineActionTypes.PasswordChanged: {
			return {
				...state,
				password: action.newPassword
			};
		}

		case OnlineActionTypes.MessageChanged: {
			return {
				...state,
				currentMessage: action.message
			};
		}

		case OnlineActionTypes.ChatModeChanged: {
			return {
				...state,
				chatMode: action.chatMode
			};
		}

		case OnlineActionTypes.NewGame: {
			return {
				...state,
				newGameShown: true,
				gameCreationProgress: false,
				gameCreationError: null
			};
		}

		case OnlineActionTypes.NewGameCancel: {
			return {
				...state,
				newGameShown: false,
				gameCreationError: null,
				gameCreationProgress: false
			};
		}

		case OnlineActionTypes.GameCreationStart: {
			return {
				...state,
				gameCreationProgress: true,
				gameCreationError: null
			};
		}

		case OnlineActionTypes.GameCreationEnd: {
			return {
				...state,
				gameCreationProgress: false,
				gameCreationError: action.error
			};
		}

		case OnlineActionTypes.UploadPackageStarted:
			return {
				...state,
				uploadPackageProgress: true,
				uploadPackagePercentage: 0
			};

		case OnlineActionTypes.UploadPackageFinished:
			return {
				...state,
				uploadPackageProgress: false
			};

		case OnlineActionTypes.UploadPackageProgress:
			return {
				...state,
				uploadPackagePercentage: action.progress
			};

		case OnlineActionTypes.JoinGameStarted: {
			return {
				...state,
				joinGameProgress: true,
				joingGameError: null
			};
		}

		case OnlineActionTypes.JoinGameFinished: {
			return {
				...state,
				joinGameProgress: false,
				joingGameError: action.error
			};
		}

		default:
			return state;
	}
};

export default onlineReducer;