import TableState, { initialState as tableInitialState } from '../table/TableState';
import ChatMode from '../../model/enums/ChatMode';
import ChatMessage from '../../model/ChatMessage';
import ShowmanInfo from '../../model/ShowmanInfo';
import PlayerInfo from '../../model/PlayerInfo';
import Persons from '../../model/Persons';
import Role from '../../model/enums/Role';
import StakeTypes from '../../model/enums/StakeTypes';

export default interface RunState {
	persons: {
		all: Persons;
		showman: ShowmanInfo;
		players: PlayerInfo[];
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
	};
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
	personsVisible: boolean;
	isGameButtonEnabled: boolean;
}

export const initialState: RunState = {
	persons: {
		all: {},
		showman: { name: '', isReady: false, replic: null },
		players: []
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
		currentPrice: 0
	},
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
		message: '',
		rightAnswers: [],
		wrongAnswers: []
	},
	chat: {
		isVisible: true,
		isActive: false,
		mode: ChatMode.Chat,
		message: '',
		messages: [],
		selectedPersonName: null
	},
	personsVisible: false,
	isGameButtonEnabled: true
};
