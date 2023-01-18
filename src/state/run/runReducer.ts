import { Reducer, AnyAction } from 'redux';
import RunState, { initialState } from './RunState';
import { KnownRunAction, RunActionTypes } from './RunActions';
import { replace, swap } from '../../utils/ArrayExtensions';
import tableReducer from '../table/tableReducer';
import { KnownTableAction } from '../table/TableActions';
import { set, removeS } from '../../utils/RecordExtensions';
import PlayerStates from '../../model/enums/PlayerStates';
import Constants from '../../model/enums/Constants';
import { updateTimers } from '../../utils/TimerInfoHelpers';
import TimerStates from '../../model/enums/TimeStates';
import MessageLevel from '../../model/enums/MessageLevel';

const runReducer: Reducer<RunState> = (state: RunState = initialState, anyAction: AnyAction): RunState => {
	const action = anyAction as KnownRunAction;

	switch (action.type) {
		case RunActionTypes.RunChatModeChanged:
			return {
				...state,
				chat: {
					...state.chat,
					mode: action.chatMode
				}
			};

		case RunActionTypes.RunChatMessageChanged:
			return {
				...state,
				chat: {
					...state.chat,
					message: action.message
				}
			};

		case RunActionTypes.RunChatVisibilityChanged:
			return {
				...state,
				chat: {
					...state.chat,
					isVisible: action.isOpen,
					isActive: action.isOpen ? false : state.chat.isActive
				}
			};

		case RunActionTypes.RunShowPersons:
			return {
				...state,
				personsVisible: true
			};

		case RunActionTypes.RunHidePersons:
			return {
				...state,
				personsVisible: false
			};

		case RunActionTypes.RunShowTables:
			return {
				...state,
				tablesVisible: true
			};

		case RunActionTypes.RunHideTables:
			return {
				...state,
				tablesVisible: false
			};

		case RunActionTypes.RunShowBanned:
			return {
				...state,
				bannedVisible: true
			};

		case RunActionTypes.RunHideBanned:
			return {
				...state,
				bannedVisible: false
			};

		case RunActionTypes.RunShowGameInfo:
			return {
				...state,
				gameInfoVisible: true
			};

		case RunActionTypes.RunHideGameInfo:
			return {
				...state,
				gameInfoVisible: false
			};

		case RunActionTypes.RunShowManageGame:
			return {
				...state,
				manageGameVisible: true
			};

		case RunActionTypes.RunHideManageGame:
			return {
				...state,
				manageGameVisible: false
			};

		case RunActionTypes.ChatMessageAdded:
			return {
				...state,
				chat: {
					...state.chat,
					messages: [...state.chat.messages, action.chatMessage]
				}
			};

		case RunActionTypes.LastReplicChanged:
			return {
				...state,
				lastReplic: action.chatMessage,
				chat: {
					...state.chat,
					isActive: action.chatMessage ? true : state.chat.isActive
				}
			};

		case RunActionTypes.ActivateChat:
			return {
				...state,
				chat: {
					...state.chat,
					isActive: true
				}
			};

		case RunActionTypes.ShowmanReplicChanged:
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

		case RunActionTypes.PlayerReplicChanged:
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

		case RunActionTypes.InfoChanged:
			return {
				...state,
				persons: {
					...state.persons,
					all: action.all,
					showman: action.showman,
					players: action.players
				}
			};

		case RunActionTypes.ChatPersonSelected:
			return {
				...state,
				chat: {
					...state.chat,
					selectedPersonName: action.personName
				}
			};

		case RunActionTypes.TableSelected:
			return {
				...state,
				selectedTableIndex: action.tableIndex
			};

		case RunActionTypes.PersonAvatarChanged:
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

		case RunActionTypes.GameStarted:
			return {
				...state,
				stage: {
					...state.stage,
					isGameStarted: true
				}
			};

		case RunActionTypes.StageChanged:
			return {
				...state,
				stage: {
					...state.stage,
					name: action.stageName,
					roundIndex: action.roundIndex
				}
			};

		case RunActionTypes.PlayersStateCleared:
			return {
				...state,
				persons: {
					...state.persons,
					players: state.persons.players.map(p => ({
						...p,
						state: PlayerStates.None,
						stake: 0
					}))
				}
			};

		case RunActionTypes.GameStateCleared:
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
						canBeSelected: false
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
				table: { // ? -> tableReducer?
					...state.table,
					isSelectable: false,
					caption: ''
				}
			};

		case RunActionTypes.SumsChanged:
			return {
				...state,
				persons: {
					...state.persons,
					players: state.persons.players.map((p, i) => ({ ...p, sum: i < action.sums.length ? action.sums[i] : 0 }))
				}
			};

		case RunActionTypes.AfterQuestionStateChanged:
			return {
				...state,
				stage: {
					...state.stage,
					isAfterQuestion: action.isAfterQuestion,
				}
			};

		case RunActionTypes.CurrentPriceChanged:
			return {
				...state,
				stage: {
					...state.stage,
					currentPrice: action.currentPrice
				}
			};

		case RunActionTypes.PersonAdded:
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

		case RunActionTypes.PersonRemoved:
			return {
				...state,
				persons: {
					...state.persons,
					all: removeS(state.persons.all, action.name)
				}
			};

		case RunActionTypes.ShowmanChanged:
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

		case RunActionTypes.PlayerAdded:
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
						inGame: true
					}]
				}
			};

		case RunActionTypes.PlayerChanged:
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

		case RunActionTypes.PlayerDeleted:
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

		case RunActionTypes.PlayersSwap:
			return {
				...state,
				persons: {
					...state.persons,
					players: swap(state.persons.players, action.index1, action.index2)
				}
			};

		case RunActionTypes.RoleChanged:
			return {
				...state,
				role: action.role
			};

		case RunActionTypes.PlayerStateChanged:
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

		case RunActionTypes.PlayerLostStateDropped:
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

		case RunActionTypes.IsPausedChanged:
			return {
				...state,
				stage: {
					...state.stage,
					isGamePaused: action.isPaused
				}
			};

		case RunActionTypes.PlayerStakeChanged:
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

		case RunActionTypes.DecisionNeededChanged:
			return {
				...state,
				stage: {
					...state.stage,
					isDecisionNeeded: action.decisionNeeded
				}
			};

		case RunActionTypes.ClearDecisions:
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
				table: {
					...state.table,
					isSelectable: false
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

		case RunActionTypes.IsGameButtonEnabledChanged:
			return {
				...state,
				isGameButtonEnabled: action.isGameButtonEnabled
			};

		case RunActionTypes.IsAnswering:
			return {
				...state,
				stage: {
					...state.stage,
					isAnswering: true,
					isDecisionNeeded: true
				},
				answer: null
			};

		case RunActionTypes.AnswerChanged:
			return {
				...state,
				answer: action.answer
			};

		case RunActionTypes.Validate:
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

		case RunActionTypes.SetStakes:
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

		case RunActionTypes.StakeChanged:
			return {
				...state,
				stakes: {
					...state.stakes,
					stake: action.stake
				}
			};

		case RunActionTypes.SelectionEnabled:
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

		case RunActionTypes.AreSumsEditableChanged:
			return {
				...state,
				areSumsEditable: action.areSumsEditable
			};

		case RunActionTypes.ReadingSpeedChanged:
			return {
				...state,
				readingSpeed: action.readingSpeed
			};

		case RunActionTypes.RunTimer:
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

		case RunActionTypes.PauseTimer:
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

		case RunActionTypes.ResumeTimer:
			return {
				...state,
				timers: updateTimers(state.timers, action.timerIndex, timer => ({
					...timer,
					state: TimerStates.Running,
					isPausedByUser: action.runByUser ? false : timer.isPausedByUser,
					isPausedBySystem: !action.runByUser ? false : timer.isPausedBySystem
				}))
			};

		case RunActionTypes.StopTimer:
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

		case RunActionTypes.TimerMaximumChanged:
			return {
				...state,
				timers: updateTimers(state.timers, action.timerIndex, timer => ({
					...timer,
					maximum: action.maximumTime
				}))
			};

		case RunActionTypes.ActivateShowmanDecision:
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

		case RunActionTypes.ActivatePlayerDecision:
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

		case RunActionTypes.ShowMainTimer:
			return {
				...state,
				showMainTimer: true
			};

		case RunActionTypes.ClearDecisionsAndMainTimer:
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

		case RunActionTypes.HintChanged:
			return {
				...state,
				hint: action.hint
			};

		case RunActionTypes.OperationError:
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

		case RunActionTypes.HostNameChanged:
			return {
				...state,
				persons: {
					...state.persons,
					hostName: action.hostName
				}
			};

		case RunActionTypes.ThemeNameChanged:
			return {
				...state,
				stage: {
					...state.stage,
					themeName: action.themeName
				}
			};

		case RunActionTypes.IsReadyChanged:
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

		case RunActionTypes.RoundsNamesChanged:
			return {
				...state,
				roundsNames: action.roundsNames
			};

		case RunActionTypes.ChooserChanged:
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

		case RunActionTypes.PlayerInGameChanged:
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

		case RunActionTypes.AreApellationsEnabledChanged:
			return {
				...state,
				areApellationsEnabled: action.areApellationsEnabled
			};

		case RunActionTypes.ButtonBlockingTimeChanged:
			return {
				...state,
				buttonBlockingTimeSeconds: action.buttonBlockingTime
			};

		case RunActionTypes.GameMetadataChanged:
			return {
				...state,
				metadata: {
					gameName: action.gameName,
					packageName: action.packageName,
					contactUri: action.contactUri,
				}
			};

		case RunActionTypes.BannedListChanged:
			return {
				...state,
				banned: {
					entries: action.bannedList,
					selectedIp: null,
				}
			};

		case RunActionTypes.Banned:
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

		case RunActionTypes.Unbanned:
			return {
				...state,
				banned: {
					...state.banned,
					entries: removeS(state.banned.entries, action.ip)
				},
			};

		case RunActionTypes.SelectBannedItem:
			return {
				...state,
				banned: {
					...state.banned,
					selectedIp: action.ip
				},
			};

		default:
			return {
				...state,
				table: tableReducer(state.table, action as KnownTableAction)
			};
	}
};

export default runReducer;
