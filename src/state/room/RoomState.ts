import Timers from '../../model/Timers';
import TimerStates from '../../model/enums/TimeStates';
import StakeModes from '../../client/game/StakeModes';

export default interface RoomState {
	answer: string | null;

	stage: {
		name: string;
		roundIndex: number;
		isAfterQuestion: boolean;
		themeIndex: number;
		currentPrice: number;
		themeName: string;
		isQuestion: boolean;
		questionType: string;
	};

	timers: Timers;
	showMainTimer: boolean;

	selection: {
		isEnabled: boolean;
	};

	stakes: {
		areVisible: boolean;
		stakeModes: StakeModes;
		minimum: number;
		maximum: number;
		step: number;
		stake: number;
	};

	selectedTableIndex: number; // 0 for showman; {N} for player {N - 1}
	personsVisible: boolean;
	tablesVisible: boolean;
	bannedVisible: boolean;
	gameInfoVisible: boolean;
	manageGameVisible: boolean;
	avatarViewVivible: boolean;
	areSumsEditable: boolean;
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

	kicked: boolean;
	webCameraUrl: string;
}

export const initialState: RoomState = {
	answer: null,

	stage: {
		name: '',
		roundIndex: -1,
		isAfterQuestion: false,
		themeIndex: -1,
		currentPrice: 0,
		themeName: '',
		isQuestion: false,
		questionType: '',
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
	},

	stakes: {
		areVisible: false,
		stakeModes: StakeModes.None,
		minimum: 0,
		maximum: 0,
		step: 0,
		stake: 0,
	},

	selectedTableIndex: -1,
	personsVisible: false,
	tablesVisible: false,
	bannedVisible: false,
	gameInfoVisible: false,
	manageGameVisible: false,
	avatarViewVivible: false,
	areSumsEditable: false,
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

	kicked: false,
	webCameraUrl: '',
};
