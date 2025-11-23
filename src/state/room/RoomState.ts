import StakeModes from '../../client/game/StakeModes';

export default interface RoomState {
	stage: {
		name: string;
		roundIndex: number;
		isAfterQuestion: boolean;
		currentPrice: number;
		isQuestion: boolean;
		questionType: string;
	};

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
	bannedVisible: boolean;
	gameInfoVisible: boolean;
	manageGameVisible: boolean;
	avatarViewVivible: boolean;
	hint: string | null;
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

	webCameraUrl: string;
}

export const initialState: RoomState = {
	stage: {
		name: '',
		roundIndex: -1,
		isAfterQuestion: false,
		currentPrice: 0,
		isQuestion: false,
		questionType: '',
	},

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
	bannedVisible: false,
	gameInfoVisible: false,
	manageGameVisible: false,
	avatarViewVivible: false,
	hint: null,
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

	webCameraUrl: '',
};
