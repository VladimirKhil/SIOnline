import { AnyAction, Reducer } from 'redux';
import RoomState, { initialState } from './RoomState';
import { KnownRoomAction, RoomActionTypes } from './RoomActions';
import { removeS } from '../../utils/RecordExtensions';
import { updateTimers } from '../../utils/TimerInfoHelpers';
import TimerStates from '../../model/enums/TimeStates';

const roomReducer: Reducer<RoomState> = (state: RoomState = initialState, anyAction: AnyAction): RoomState => {
	const action = anyAction as KnownRoomAction;

	switch (action.type) {
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

		case RoomActionTypes.TableSelected:
			return {
				...state,
				selectedTableIndex: action.tableIndex
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

		case RoomActionTypes.GameStateCleared:
			return {
				...state,
				stage: {
					...state.stage,
					isAfterQuestion: false,
				},
				stakes: {
					...state.stakes,
					areVisible: false,
				}
			};

		case RoomActionTypes.AfterQuestionStateChanged:
			return {
				...state,
				stage: {
					...state.stage,
					isAfterQuestion: action.isAfterQuestion,
				},
				hint: action.isAfterQuestion ? null : state.hint,
			};

		case RoomActionTypes.CurrentPriceChanged:
			return {
				...state,
				stage: {
					...state.stage,
					currentPrice: action.currentPrice
				}
			};

		case RoomActionTypes.ClearDecisions:
			return {
				...state,
				selection: {
					...state.selection,
					isEnabled: false
				},
				stakes: {
					...state.stakes,
					areVisible: false
				},
				answer: null,
			};

		case RoomActionTypes.IsAnswering:
			return {
				...state,
				answer: null
			};

		case RoomActionTypes.AnswerChanged:
			return {
				...state,
				answer: action.answer
			};

		case RoomActionTypes.SetStakes:
			return {
				...state,
				stakes: {
					areVisible: true,
					stakeModes: action.stakeModes,
					minimum: action.minimum,
					maximum: action.maximum,
					stake: action.minimum,
					step: action.step,
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
				selection: {
					isEnabled: true,
				},
			};

		case RoomActionTypes.AreSumsEditableChanged:
			return {
				...state,
				areSumsEditable: action.areSumsEditable
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

		case RoomActionTypes.ShowMainTimer:
			return {
				...state,
				showMainTimer: true
			};

		case RoomActionTypes.ClearDecisionsAndMainTimer:
			return {
				...state,
				showMainTimer: false,
			};

		case RoomActionTypes.HintChanged:
			return {
				...state,
				hint: action.hint
			};

		case RoomActionTypes.ThemeNameChanged:
			return {
				...state,
				stage: {
					...state.stage,
					themeName: action.themeName
				}
			};

		case RoomActionTypes.RoundsNamesChanged:
			return {
				...state,
				roundsNames: action.roundsNames
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
					voiceChatUri: action.voiceChatUri,
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

		case RoomActionTypes.Kicked:
			return {
				...state,
				kicked: action.kicked,
			};

		case RoomActionTypes.WebCameraUrlChanged:
			return {
				...state,
				webCameraUrl: action.webCameraUrl,
			};

		case RoomActionTypes.IsQuestionChanged:
			return {
				...state,
				stage: {
					...state.stage,
					isQuestion: action.isQuestion,
					questionType: action.questionType,
				}
			};

		default:
			return state;
	}
};

export default roomReducer;
