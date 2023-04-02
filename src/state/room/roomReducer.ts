import { AnyAction, Reducer } from 'redux';
import RoomState, { initialState } from './RoomState';
import { KnownRoomAction, RoomActionTypes } from './RoomActions';
import { replace, swap } from '../../utils/ArrayExtensions';
import { removeS, set } from '../../utils/RecordExtensions';
import PlayerStates from '../../model/enums/PlayerStates';
import Constants from '../../model/enums/Constants';
import { updateTimers } from '../../utils/TimerInfoHelpers';
import TimerStates from '../../model/enums/TimeStates';
import MessageLevel from '../../model/enums/MessageLevel';

const roomReducer: Reducer<RoomState> = (state: RoomState = initialState, anyAction: AnyAction): RoomState => {
	const action = anyAction as KnownRoomAction;

	switch (action.type) {
		case RoomActionTypes.RoomChatModeChanged:
			return {
				...state,
				chat: {
					...state.chat,
					mode: action.chatMode
				}
			};

		case RoomActionTypes.RoomChatMessageChanged:
			return {
				...state,
				chat: {
					...state.chat,
					message: action.message
				}
			};

		case RoomActionTypes.RoomChatVisibilityChanged:
			return {
				...state,
				chat: {
					...state.chat,
					isVisible: action.isOpen,
					isActive: action.isOpen ? false : state.chat.isActive
				}
			};

		case RoomActionTypes.RoomShowPersons:
			return {
				...state,
				personsVisible: true
			};

		case RoomActionTypes.RoomHidePersons:
			return {
				...state,
				personsVisible: false
			};

		case RoomActionTypes.RoomShowTables:
			return {
				...state,
				tablesVisible: true
			};

		case RoomActionTypes.RoomHideTables:
			return {
				...state,
				tablesVisible: false
			};

		case RoomActionTypes.RoomShowBanned:
			return {
				...state,
				bannedVisible: true
			};

		case RoomActionTypes.RoomHideBanned:
			return {
				...state,
				bannedVisible: false
			};

		case RoomActionTypes.RoomShowGameInfo:
			return {
				...state,
				gameInfoVisible: true
			};

		case RoomActionTypes.RoomHideGameInfo:
			return {
				...state,
				gameInfoVisible: false
			};

		case RoomActionTypes.RoomShowManageGame:
			return {
				...state,
				manageGameVisible: true
			};

		case RoomActionTypes.RoomHideManageGame:
			return {
				...state,
				manageGameVisible: false
			};

		case RoomActionTypes.ChatMessageAdded:
			return {
				...state,
				chat: {
					...state.chat,
					messages: [...state.chat.messages, action.chatMessage]
				}
			};

		case RoomActionTypes.LastReplicChanged:
			return {
				...state,
				lastReplic: action.chatMessage,
				chat: {
					...state.chat,
					isActive: action.chatMessage ? true : state.chat.isActive
				}
			};

		case RoomActionTypes.ActivateChat:
			return {
				...state,
				chat: {
					...state.chat,
					isActive: true
				}
			};

		case RoomActionTypes.ShowmanReplicChanged:
			return {
				...state,
				persons: {
					...state.persons,
					showman: {
						...state.persons.showman,
						replic: action.replic
					},
					players: state.persons.players.map(p => ({ ...p, replic: null }))
				}
			};

		case RoomActionTypes.PlayerReplicChanged:
			return {
				...state,
				persons: {
					...state.persons,
					showman: {
						...state.persons.showman,
						replic: null
					},
					players: state.persons.players.map((p, i) => ({ ...p, replic: i === action.playerIndex ? action.replic : null }))
				}
			};

		case RoomActionTypes.InfoChanged:
			return {
				...state,
				persons: {
					...state.persons,
					all: action.all,
					showman: action.showman,
					players: action.players
				}
			};

		case RoomActionTypes.ChatPersonSelected:
			return {
				...state,
				chat: {
					...state.chat,
					selectedPersonName: action.personName
				}
			};

		case RoomActionTypes.TableSelected:
			return {
				...state,
				selectedTableIndex: action.tableIndex
			};

		case RoomActionTypes.PersonAvatarChanged:
			if (Object.keys(state.persons.all).indexOf(action.personName) === -1) {
				return state;
			}

			return {
				...state,
				persons: {
					...state.persons,
					all: {
						...state.persons.all,
						[action.personName]: { ...state.persons.all[action.personName], avatar: action.avatarUri }
					}
				}
			};

		case RoomActionTypes.GameStarted:
			return {
				...state,
				stage: {
					...state.stage,
					isGameStarted: true
				}
			};

		case RoomActionTypes.StageChanged:
			return {
				...state,
				stage: {
					...state.stage,
					name: action.stageName,
					roundIndex: action.roundIndex
				}
			};

		case RoomActionTypes.PlayersStateCleared:
			return {
				...state,
				persons: {
					...state.persons,
					players: state.persons.players.map(p => ({
						...p,
						state: PlayerStates.None,
						stake: 0,
						mediaLoaded: false,
					}))
				}
			};

		case RoomActionTypes.GameStateCleared:
			return {
				...state,
				stage: {
					...state.stage,
					isAfterQuestion: false,
					isAnswering: false,
					isDecisionNeeded: false
				},
				persons: {
					...state.persons,
					players: state.persons.players.map(p => ({
						...p,
						canBeSelected: false,
						mediaLoaded: false,
					}))
				},
				validation: {
					...state.validation,
					isVisible: false
				},
				stakes: {
					...state.stakes,
					areVisible: false,
					areSimple: false
				},
			};

		case RoomActionTypes.SumsChanged:
			return {
				...state,
				persons: {
					...state.persons,
					players: state.persons.players.map((p, i) => ({ ...p, sum: i < action.sums.length ? action.sums[i] : 0 }))
				}
			};

		case RoomActionTypes.AfterQuestionStateChanged:
			return {
				...state,
				stage: {
					...state.stage,
					isAfterQuestion: action.isAfterQuestion,
				}
			};

		case RoomActionTypes.CurrentPriceChanged:
			return {
				...state,
				stage: {
					...state.stage,
					currentPrice: action.currentPrice
				}
			};

		case RoomActionTypes.PersonAdded:
			if (state.persons.all[action.person.name]) {
				console.log(`Person ${action.person.name} already exists!`);
			}

			return {
				...state,
				persons: {
					...state.persons,
					all: set(state.persons.all, action.person.name, action.person)
				}
			};

		case RoomActionTypes.PersonRemoved:
			return {
				...state,
				persons: {
					...state.persons,
					all: removeS(state.persons.all, action.name)
				}
			};

		case RoomActionTypes.ShowmanChanged:
			return {
				...state,
				persons: {
					...state.persons,
					showman: {
						...state.persons.showman,
						name: action.name,
						isHuman: action.isHuman ?? state.persons.showman.isHuman,
						isReady: action.isReady ?? state.persons.showman.isReady
					}
				}
			};

		case RoomActionTypes.PlayerAdded:
			return {
				...state,
				persons: {
					...state.persons,
					players: [...state.persons.players, {
						name: Constants.ANY_NAME,
						sum: 0,
						stake: 0,
						state: PlayerStates.None,
						canBeSelected: false,
						isReady: false,
						replic: null,
						isDeciding: false,
						isHuman: true,
						isChooser: false,
						inGame: true,
						mediaLoaded: false,
					}]
				}
			};

		case RoomActionTypes.PlayerChanged:
			if (action.index < 0 || action.index >= state.persons.players.length) {
				console.log(`PlayerChanged: Wrong index ${action.index}!`);
				return state;
			}

			return {
				...state,
				persons: {
					...state.persons,
					players: replace(
						state.persons.players,
						action.index,
						{
							...state.persons.players[action.index],
							name: action.name,
							isHuman: action.isHuman ?? state.persons.players[action.index].isHuman,
							isReady: action.isReady ?? state.persons.players[action.index].isReady
						}
					)
				}
			};

		case RoomActionTypes.PlayerDeleted:
			if (action.index < 0 || action.index >= state.persons.players.length) {
				console.log(`PlayerDeleted: Wrong index ${action.index}!`);
				return state;
			}

			return {
				...state,
				persons: {
					...state.persons,
					players: [...state.persons.players.slice(0, action.index), ...state.persons.players.slice(action.index + 1)]
				}
			};

		case RoomActionTypes.PlayersSwap:
			return {
				...state,
				persons: {
					...state.persons,
					players: swap(state.persons.players, action.index1, action.index2)
				}
			};

		case RoomActionTypes.RoleChanged:
			return {
				...state,
				role: action.role
			};

		case RoomActionTypes.PlayerStateChanged:
			return {
				...state,
				persons: {
					...state.persons,
					players: replace(state.persons.players, action.index, {
						...state.persons.players[action.index],
						state: action.state
					})
				}
			};

		case RoomActionTypes.PlayerLostStateDropped:
			if (action.index < 0 || action.index >= state.persons.players.length) {
				console.log(`PlayerLostStateDropped: Wrong index ${action.index}!`);
				return state;
			}

			if (state.persons.players[action.index].state !== PlayerStates.Lost) {
				return state;
			}

			return {
				...state,
				persons: {
					...state.persons,
					players: replace(state.persons.players, action.index, {
						...state.persons.players[action.index],
						state: PlayerStates.None
					})
				}
			};

		case RoomActionTypes.IsPausedChanged:
			return {
				...state,
				stage: {
					...state.stage,
					isGamePaused: action.isPaused,
					isEditEnabled: action.isPaused && state.stage.isEditEnabled,
				}
			};

		case RoomActionTypes.PlayerStakeChanged:
			return {
				...state,
				persons: {
					...state.persons,
					players: replace(state.persons.players, action.index, {
						...state.persons.players[action.index],
						stake: action.stake
					})
				}
			};

		case RoomActionTypes.DecisionNeededChanged:
			return {
				...state,
				stage: {
					...state.stage,
					isDecisionNeeded: action.decisionNeeded
				}
			};

		case RoomActionTypes.ClearDecisions:
			return {
				...state,
				persons: {
					...state.persons,
					players: state.persons.players.map(p => ({
						...p,
						canBeSelected: false
					}))
				},
				stage: {
					...state.stage,
					isAnswering: false,
					isDecisionNeeded: false
				},
				validation: {
					...state.validation,
					isVisible: false
				},
				selection: {
					...state.selection,
					isEnabled: false
				},
				stakes: {
					...state.stakes,
					areSimple: false,
					areVisible: false
				},
				answer: null,
				hint: null
			};

		case RoomActionTypes.IsGameButtonEnabledChanged:
			return {
				...state,
				isGameButtonEnabled: action.isGameButtonEnabled
			};

		case RoomActionTypes.IsAnswering:
			return {
				...state,
				stage: {
					...state.stage,
					isAnswering: true,
					isDecisionNeeded: true
				},
				answer: null
			};

		case RoomActionTypes.AnswerChanged:
			return {
				...state,
				answer: action.answer
			};

		case RoomActionTypes.Validate:
			return {
				...state,
				answer: action.answer,
				validation: {
					...state.validation,
					isVisible: true,
					rightAnswers: action.rightAnswers,
					wrongAnswers: action.wrongAnswers,
					header: action.header,
					name: action.name,
					message: action.message
				}
			};

		case RoomActionTypes.SetStakes:
			return {
				...state,
				stakes: {
					areVisible: true,
					areSimple: action.areSimple,
					allowedStakeTypes: action.allowedStakeTypes,
					minimum: action.minimum,
					maximum: action.maximum,
					stake: action.stake,
					step: action.step,
					message: action.message
				}
			};

		case RoomActionTypes.StakeChanged:
			return {
				...state,
				stakes: {
					...state.stakes,
					stake: action.stake
				}
			};

		case RoomActionTypes.SelectionEnabled:
			return {
				...state,
				persons: {
					...state.persons,
					players: state.persons.players.map((p, i) => ({
						...p,
						canBeSelected: action.allowedIndices.includes(i)
					}))
				},
				selection: {
					isEnabled: true,
					message: action.message
				},
				stage: {
					...state.stage,
					isDecisionNeeded: true
				}
			};

		case RoomActionTypes.AreSumsEditableChanged:
			return {
				...state,
				areSumsEditable: action.areSumsEditable
			};

		case RoomActionTypes.ReadingSpeedChanged:
			return {
				...state,
				readingSpeed: action.readingSpeed
			};

		case RoomActionTypes.RunTimer:
			return {
				...state,
				timers: updateTimers(state.timers, action.timerIndex, timer => ({
					state: TimerStates.Running,
					isPausedByUser: action.runByUser ? false : timer.isPausedByUser,
					isPausedBySystem: !action.runByUser ? false : timer.isPausedBySystem,
					maximum: action.maximumTime,
					value: 0
				}))
			};

		case RoomActionTypes.PauseTimer:
			return {
				...state,
				timers: updateTimers(state.timers, action.timerIndex, timer => ({
					...timer,
					state: timer.state === TimerStates.Running ? TimerStates.Paused : timer.state,
					isPausedByUser: action.pausedByUser ? true : timer.isPausedByUser,
					isPausedBySystem: !action.pausedByUser ? true : timer.isPausedBySystem,
					value: timer.state === TimerStates.Running ? action.currentTime : timer.value
				}))
			};

		case RoomActionTypes.ResumeTimer:
			return {
				...state,
				timers: updateTimers(state.timers, action.timerIndex, timer => ({
					...timer,
					state: TimerStates.Running,
					isPausedByUser: action.runByUser ? false : timer.isPausedByUser,
					isPausedBySystem: !action.runByUser ? false : timer.isPausedBySystem
				}))
			};

		case RoomActionTypes.StopTimer:
			return {
				...state,
				timers: updateTimers(state.timers, action.timerIndex, timer => ({
					...timer,
					state: TimerStates.Stopped,
					isPausedByUser: false,
					isPausedBySystem: true,
					value: 0
				}))
			};

		case RoomActionTypes.TimerMaximumChanged:
			return {
				...state,
				timers: updateTimers(state.timers, action.timerIndex, timer => ({
					...timer,
					maximum: action.maximumTime
				}))
			};

		case RoomActionTypes.ActivateShowmanDecision:
			return {
				...state,
				persons: {
					...state.persons,
					showman: {
						...state.persons.showman,
						isDeciding: true
					}
				}
			};

		case RoomActionTypes.ActivatePlayerDecision:
			return {
				...state,
				persons: {
					...state.persons,
					players: replace(state.persons.players, action.playerIndex, {
						...state.persons.players[action.playerIndex],
						isDeciding: true
					})
				}
			};

		case RoomActionTypes.ShowMainTimer:
			return {
				...state,
				showMainTimer: true
			};

		case RoomActionTypes.ClearDecisionsAndMainTimer:
			return {
				...state,
				showMainTimer: false,
				persons: {
					...state.persons,
					showman: {
						...state.persons.showman,
						isDeciding: false
					},
					players: state.persons.players.map(p => ({
						...p,
						isDeciding: false
					}))
				}
			};

		case RoomActionTypes.HintChanged:
			return {
				...state,
				hint: action.hint
			};

		case RoomActionTypes.OperationError:
			return {
				...state,
				chat: {
					...state.chat,
					messages: [...state.chat.messages, {
						sender: '',
						text: action.error,
						level: MessageLevel.Warning,
					}]
				}
			};

		case RoomActionTypes.HostNameChanged:
			return {
				...state,
				persons: {
					...state.persons,
					hostName: action.hostName
				}
			};

		case RoomActionTypes.ThemeNameChanged:
			return {
				...state,
				stage: {
					...state.stage,
					themeName: action.themeName
				}
			};

		case RoomActionTypes.IsReadyChanged:
			if (action.personIndex === -1) {
				return {
					...state,
					persons: {
						...state.persons,
						showman: {
							...state.persons.showman,
							isReady: action.isReady
						}
					}
				};
			}

			return {
				...state,
				persons: {
					...state.persons,
					players: replace(state.persons.players, action.personIndex, {
						...state.persons.players[action.personIndex],
						isReady: action.isReady
					})
				}
			};

		case RoomActionTypes.RoundsNamesChanged:
			return {
				...state,
				roundsNames: action.roundsNames
			};

		case RoomActionTypes.ChooserChanged:
			return {
				...state,
				persons: {
					...state.persons,
					players: state.persons.players.map((player, index) => ({
						...player,
						isChooser: index === action.chooserIndex
					}))
				}
			};

		case RoomActionTypes.PlayerInGameChanged:
			return {
				...state,
				persons: {
					...state.persons,
					players: replace(state.persons.players, action.playerIndex, {
						...state.persons.players[action.playerIndex],
						inGame: action.inGame
					})
				}
			};

		case RoomActionTypes.AreApellationsEnabledChanged:
			return {
				...state,
				areApellationsEnabled: action.areApellationsEnabled
			};

		case RoomActionTypes.ButtonBlockingTimeChanged:
			return {
				...state,
				buttonBlockingTimeSeconds: action.buttonBlockingTime
			};

		case RoomActionTypes.GameMetadataChanged:
			return {
				...state,
				metadata: {
					gameName: action.gameName,
					packageName: action.packageName,
					contactUri: action.contactUri,
				}
			};

		case RoomActionTypes.BannedListChanged:
			return {
				...state,
				banned: {
					entries: action.bannedList,
					selectedIp: null,
				}
			};

		case RoomActionTypes.Banned:
			return {
				...state,
				banned: {
					...state.banned,
					entries: {
						...state.banned.entries,
						[action.ip]: action.name
					}
				},
			};

		case RoomActionTypes.Unbanned:
			return {
				...state,
				banned: {
					...state.banned,
					entries: removeS(state.banned.entries, action.ip)
				},
			};

		case RoomActionTypes.SelectBannedItem:
			return {
				...state,
				banned: {
					...state.banned,
					selectedIp: action.ip
				},
			};

		case RoomActionTypes.PlayerMediaLoaded:
			return {
				...state,
				persons: {
					...state.persons,
					players: replace(state.persons.players, action.playerIndex, {
						...state.persons.players[action.playerIndex],
						mediaLoaded: true
					})
				}
			};

		case RoomActionTypes.EditTable:
			return {
				...state,
				stage: {
					...state.stage,
					isEditEnabled: !state.stage.isEditEnabled,
				}
			};

		default:
			return state;
	}
};

export default roomReducer;
