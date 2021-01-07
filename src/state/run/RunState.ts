import TableState, { initialState as tableInitialState } from '../table/TableState';
import ChatMode from '../../model/enums/ChatMode';
import ChatMessage from '../../model/ChatMessage';
import PersonInfo from '../../model/PersonInfo';
import PlayerInfo from '../../model/PlayerInfo';
import Persons from '../../model/Persons';
import Role from '../../model/enums/Role';
import StakeTypes from '../../model/enums/StakeTypes';
import Timers from '../../model/Timers';

export default interface RunState {
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
		isGamePaused: boolean;
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
	table: TableState;
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
	isGameButtonEnabled: boolean;
	areSumsEditable: boolean;
	readingSpeed: number;
	hint: string | null;
}

export const initialState: RunState = {
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
		isGamePaused: false,
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
			isPausedBySystem: true,
			isPausedByUser: false,
			value: 0,
			maximum: 0
		},
		press: {
			isPausedBySystem: true,
			isPausedByUser: false,
			value: 0,
			maximum: 0
		},
		decision: {
			isPausedBySystem: true,
			isPausedByUser: false,
			value: 0,
			maximum: 0
		}
	},
	showMainTimer: false,
	table: tableInitialState,
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
		wrongAnswers: []
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
	isGameButtonEnabled: true,
	areSumsEditable: false,
	readingSpeed: 20,
	hint: null
};
