import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import GameInfo from '../client/contracts/GameInfo';
import PersonInfo from '../client/contracts/PersonInfo';
import GamesResponse from 'sistatistics-client/dist/models/GamesResponse';
import GamesStatistic from 'sistatistics-client/dist/models/GamesStatistic';
import PackagesStatistic from 'sistatistics-client/dist/models/PackagesStatistic';
import GamesFilter from '../model/enums/GamesFilter';
import DataContext from '../model/DataContext';
import IGameServerClient from '../client/IGameServerClient';
import { AppDispatch } from './store';
import { userWarnChanged } from './commonSlice';
import getErrorMessage from '../utils/ErrorHelpers';
import StatisticFilter from 'sistatistics-client/dist/models/StatisticFilter';
import GamePlatforms from 'sistatistics-client/dist/models/GamePlatforms';
import localization from '../model/resources/localization';
import SIStatisticsClient from 'sistatistics-client';
import Slice from '../client/contracts/Slice';
import clearUrls from '../utils/clearUrls';

export interface Online2State {
	inProgress: boolean;
	error: string;
	games: Record<number, GameInfo>;
	gamesFilter: GamesFilter;
	gamesSearch: string;
	selectedGameId: number;
	selectedGame: GameInfo | null;
	uploadPackageProgress: boolean;
	uploadPackagePercentage: number;
	latestGames?: GamesResponse;
	gamesStatistics?: GamesStatistic;
	packagesStatistics?: PackagesStatistic;
	password: string;
	newGameShown: boolean;
	gameCreationProgress: boolean;
	joinGameProgress: boolean;
}

const initialState: Online2State = {
	inProgress: false,
	error: '',
	games: {},
	gamesFilter: GamesFilter.NoFilter,
	gamesSearch: '',
	selectedGameId: -1,
	selectedGame: null,
	uploadPackageProgress: false,
	uploadPackagePercentage: 0,
	password: '',
	newGameShown: false,
	gameCreationProgress: false,
	joinGameProgress: false,
};

async function loadGamesAsync(dispatch: AppDispatch, gameClient: IGameServerClient, clear: boolean | undefined) {
	let gamesSlice: Slice<GameInfo> = { Data: [], IsLastSlice: false };
	let whileGuard = 100;

	do {
		const fromId = gamesSlice.Data.length > 0 ? gamesSlice.Data[gamesSlice.Data.length - 1].GameID + 1 : 0;

		gamesSlice = await gameClient.getGamesSliceAsync(fromId);

		dispatch(online2Slice.actions.receiveGames(
			clear ? gamesSlice.Data.map(d => ({ ...d, PackageName: clearUrls(d.PackageName) })) : gamesSlice.Data));

		whileGuard--;
	} while (!gamesSlice.IsLastSlice && whileGuard > 0);
}

async function loadStatisticsAsync(dispatch: AppDispatch, dataContext: DataContext) {
	const siStatisticsClient = new SIStatisticsClient({ serviceUri: dataContext.config.siStatisticsServiceUri });

	const now = new Date();
	const ONE_DAY = 24 * 60 * 60 * 1000;

	const filter: StatisticFilter = {
		platform: GamePlatforms.GameServer,
		from: new Date(now.getTime() - ONE_DAY),
		to: now,
		count: 5,
		languageCode: localization.getLanguage()
	};

	const packagesStatistics = await siStatisticsClient.getLatestTopPackagesAsync({ ...filter, count: 6 });
	dispatch(packagesStatisticsLoaded(packagesStatistics));

	const gamesStatistics = await siStatisticsClient.getLatestGamesStatisticAsync(filter);
	dispatch(gamesStatisticLoaded(gamesStatistics));

	const latestGames = await siStatisticsClient.getLatestGamesInfoAsync({ ...filter, count: 25 });
	dispatch(latestGamesLoaded(latestGames));
}

export const loadLobby = createAsyncThunk(
	'online2/loadLobby',
	async (arg: void, thunkAPI) => {
		const { dispatch } = thunkAPI;
		const dataContext = thunkAPI.extra as DataContext;

		// Games filtering is performed on client
		await loadGamesAsync(dispatch as AppDispatch, dataContext.gameClient, dataContext.config.clearUrls);

		try {
			await loadStatisticsAsync(dispatch as AppDispatch, dataContext);
		} catch (error) {
			dispatch(userWarnChanged(getErrorMessage(error)));
		}
	},
);

export const online2Slice = createSlice({
	name: 'online2',
	initialState,
	reducers: {
		gameCreated: (state: Online2State, action: PayloadAction<GameInfo>) => {
			state.games[action.payload.GameID] = action.payload;
		},
		gameChanged: (state: Online2State, action: PayloadAction<GameInfo>) => {
			state.games[action.payload.GameID] = action.payload;
		},
		gameDeleted: (state: Online2State, action: PayloadAction<number>) => {
			delete state.games[action.payload];
			if (state.selectedGameId === action.payload) {
				state.selectedGameId = -1;
			}
		},
		selectGameById: (state: Online2State, action: PayloadAction<number>) => {
			state.selectedGameId = action.payload;
		},
		selectGame: (state: Online2State, action: PayloadAction<GameInfo>) => {
			state.selectedGame = action.payload;
		},
		onGameFilterToggle: (state: Online2State, action: PayloadAction<GamesFilter>) => {
			state.gamesFilter ^= action.payload;
		},
		onGamesSearchChanged: (state: Online2State, action: PayloadAction<string>) => {
			state.gamesSearch = action.payload;
		},
		receiveGames: (state: Online2State, action: PayloadAction<GameInfo[]>) => {
			action.payload.forEach(game => {
				state.games[game.GameID] = game;
			});
		},
		onGamePersonsChanged: (state: Online2State, action: PayloadAction<{ gameId: number, persons: PersonInfo[] }>) => {
			if (state.selectedGame?.GameID === action.payload.gameId) {
				state.selectedGame.Persons = action.payload.persons;
			}
		},
		uploadPackageStarted: (state: Online2State) => {
			state.uploadPackageProgress = true;
		},
		uploadPackageFinished: (state: Online2State) => {
			state.uploadPackageProgress = false;
		},
		uploadPackageProgress: (state: Online2State, action: PayloadAction<number>) => {
			state.uploadPackagePercentage = action.payload;
		},
		latestGamesLoaded: (state: Online2State, action: PayloadAction<GamesResponse>) => {
			state.latestGames = action.payload;
		},
		gamesStatisticLoaded: (state: Online2State, action: PayloadAction<GamesStatistic>) => {
			state.gamesStatistics = action.payload;
		},
		packagesStatisticsLoaded: (state: Online2State, action: PayloadAction<PackagesStatistic>) => {
			state.packagesStatistics = action.payload;
		},
		passwordChanged: (state: Online2State, action: PayloadAction<string>) => {
			state.password = action.payload;
		},
		gameCreationStart: (state: Online2State) => {
			state.gameCreationProgress = true;
		},
		gameCreationEnd: (state: Online2State) => {
			state.gameCreationProgress = false;
		},
		joinGameStarted: (state: Online2State) => {
			state.joinGameProgress = true;
		},
		joinGameFinished: (state: Online2State) => {
			state.joinGameProgress = false;
		},
		newGame: (state: Online2State) => {
			state.newGameShown = true;
			state.gameCreationProgress = false;
		},
		newGameCancel: (state: Online2State) => {
			state.newGameShown = false;
			state.gameCreationProgress = false;
		}
	},
	extraReducers: (builder) => {
		builder.addCase(loadLobby.pending, (state) => {
			state.inProgress = true;
			state.error = '';
			state.games = {};
		});
		builder.addCase(loadLobby.fulfilled, (state) => {
			state.inProgress = false;
		});
		builder.addCase(loadLobby.rejected, (state, action) => {
			state.inProgress = false;
			state.error = action.error.message ?? '';
		});
	}
});

export const {
	gameCreated,
	gameChanged,
	gameDeleted,
	selectGameById,
	selectGame,
	onGameFilterToggle,
	onGamesSearchChanged,
	onGamePersonsChanged,
	uploadPackageStarted,
	uploadPackageFinished,
	uploadPackageProgress,
	latestGamesLoaded,
	gamesStatisticLoaded,
	packagesStatisticsLoaded,
	passwordChanged,
	gameCreationStart,
	gameCreationEnd,
	joinGameStarted,
	joinGameFinished,
	newGame,
	newGameCancel,
} = online2Slice.actions;


export default online2Slice.reducer;