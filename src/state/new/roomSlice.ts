import { createSlice } from '@reduxjs/toolkit';
import ChatMessage from '../../model/ChatMessage';
import DataContext from '../../model/DataContext';
import ChatMode from '../../model/enums/ChatMode';
import Role from '../../model/Role';
import StakeTypes from '../../model/enums/StakeTypes';
import PersonInfo from '../../model/PersonInfo';
import Persons from '../../model/Persons';
import PlayerInfo from '../../model/PlayerInfo';
import Timers from '../../model/Timers';
import { AppDispatch, RootState } from './store';
import TimerStates from '../../model/enums/TimeStates';
import JoinMode from '../../client/game/JoinMode';

interface RoomState {
	persons: {
		all: Persons;
		showman: PersonInfo;
		players: PlayerInfo[];
		hostName: string | null;
	};
	role: Role;
	answer: string | null;
	lastReplic: ChatMessage | null;
	stage: {
		name: string;
		roundIndex: number;
		isGamePaused: boolean;
		isEditEnabled: boolean;
		isGameStarted: boolean;
		isDecisionNeeded: boolean;
		isAnswering: boolean;
		isAfterQuestion: boolean;
		themeIndex: number;
		currentPrice: number;
		themeName: string;
	};
	timers: Timers;
	showMainTimer: boolean;
	selection: {
		isEnabled: boolean;
		message: string;
	};
	stakes: {
		areVisible: boolean;
		areSimple: boolean;
		allowedStakeTypes: Record<StakeTypes, boolean>;
		minimum: number;
		maximum: number;
		step: number;
		stake: number;
		message: string;
	};
	validation: {
		isVisible: boolean;
		header: string;
		name: string;
		message: string;
		rightAnswers: string[];
		wrongAnswers: string[];
		showExtraRightButtons: boolean;
	};
	chat: {
		isVisible: boolean;
		isActive: boolean;
		mode: ChatMode;
		message: string;
		messages: ChatMessage[];
		selectedPersonName: string | null;
	};
	selectedTableIndex: number; // 0 for showman; {N} for player {N - 1}
	personsVisible: boolean;
	tablesVisible: boolean;
	bannedVisible: boolean;
	gameInfoVisible: boolean;
	manageGameVisible: boolean;
	isGameButtonEnabled: boolean;
	areSumsEditable: boolean;
	readingSpeed: number;
	areApellationsEnabled: boolean;
	hint: string | null;
	roundsNames: string[] | null;
	buttonBlockingTimeSeconds: number;

	metadata: {
		gameName: string | null;
		packageName: string | null;
		contactUri: string | null;
		voiceChatUri: string | null;
	};

	banned: {
		entries: Record<string, string>;
		selectedIp: string | null;
	};

	joinMode: JoinMode;
}

const initialState: RoomState = {
	persons: {
		all: {},
		showman: {
			name: '',
			isReady: false,
			replic: null,
			isDeciding: false,
			isHuman: true
		},
		players: [],
		hostName: null
	},
	role: Role.Player,
	answer: null,
	lastReplic: null,
	stage: {
		name: '',
		roundIndex: -1,
		isGamePaused: false,
		isEditEnabled: false,
		isGameStarted: false,
		isDecisionNeeded: false,
		isAnswering: false,
		isAfterQuestion: false,
		themeIndex: -1,
		currentPrice: 0,
		themeName: ''
	},
	timers: {
		round: {
			state: TimerStates.Stopped,
			isPausedBySystem: true,
			isPausedByUser: false,
			value: 0,
			maximum: 0,
		},
		press: {
			state: TimerStates.Stopped,
			isPausedBySystem: true,
			isPausedByUser: false,
			value: 0,
			maximum: 0
		},
		decision: {
			state: TimerStates.Stopped,
			isPausedBySystem: true,
			isPausedByUser: false,
			value: 0,
			maximum: 0
		}
	},
	showMainTimer: false,
	selection: {
		isEnabled: false,
		message: ''
	},
	stakes: {
		areVisible: false,
		areSimple: false,
		allowedStakeTypes: {
			[StakeTypes.Nominal]: false,
			[StakeTypes.Sum]: false,
			[StakeTypes.Pass]: false,
			[StakeTypes.AllIn]: false
		},
		minimum: 0,
		maximum: 0,
		step: 0,
		stake: 0,
		message: ''
	},
	validation: {
		isVisible: false,
		header: '',
		name: '',
		message: '',
		rightAnswers: [],
		wrongAnswers: [],
		showExtraRightButtons: false,
	},
	chat: {
		isVisible: false,
		isActive: false,
		mode: ChatMode.Chat,
		message: '',
		messages: [],
		selectedPersonName: null
	},
	selectedTableIndex: -1,
	personsVisible: false,
	tablesVisible: false,
	bannedVisible: false,
	gameInfoVisible: false,
	manageGameVisible: false,
	isGameButtonEnabled: true,
	areSumsEditable: false,
	readingSpeed: 20,
	areApellationsEnabled: true,
	hint: null,
	roundsNames: null,
	buttonBlockingTimeSeconds: 3,

	metadata: {
		gameName: null,
		packageName: null,
		contactUri: null,
		voiceChatUri: null,
	},

	banned: {
		entries: {},
		selectedIp: null,
	},

	joinMode: JoinMode.AnyRole,
};

export const roomSlice = createSlice({
	name: 'room',
	initialState,
	reducers: {
		clearDecisions: (state: RoomState) => {
			state.persons.players.forEach(p => p.canBeSelected = false);
			state.stage.isAnswering = false;
			state.stage.isDecisionNeeded = false;
			state.validation.isVisible = false;
			state.selection.isEnabled = false;
			state.stakes.areSimple = false;
			state.stakes.areVisible = false;
			state.answer = null;
			state.hint = null;
		}
	}
});

export const {
	clearDecisions
} = roomSlice.actions;

export const sendStake = (stake: number) => async (dispatch: AppDispatch, _getState: () => RootState, dataContext: DataContext) : Promise<void> => {
	if (await dataContext.gameClient.msgAsync('STAKE', stake)) {
		dispatch(clearDecisions());
	}
};

export default roomSlice.reducer;