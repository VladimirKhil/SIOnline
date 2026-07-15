import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import GameInfo from '../client/contracts/GameInfo';
import PersonInfo from '../client/contracts/PersonInfo';
import GamesResponse from 'sistatistics-client/dist/models/GamesResponse';
import PackageStatistic from 'sistatistics-client/dist/models/PackageStatistic';
import PackageInfo from 'sistatistics-client/dist/models/PackageInfo';
import GamesFilter from '../model/enums/GamesFilter';
import DataContext from '../model/DataContext';
import IGameServerClient from '../client/IGameServerClient';
import { AppDispatch, RootState } from './store';
import { userWarnChanged } from './commonSlice';
import getErrorMessage from '../utils/ErrorHelpers';
import StatisticFilter from 'sistatistics-client/dist/models/StatisticFilter';
import GamePlatforms from 'sistatistics-client/dist/models/GamePlatforms';
import localization from '../model/resources/localization';
import SIStatisticsClient from 'sistatistics-client';
import Slice from '../client/contracts/Slice';
import clearUrls from '../utils/clearUrls';
import { filterGames } from '../utils/GamesHelpers';

/** Defines a top package statistic extended with a package link in an alternative package storage. */
export interface TopPackage extends PackageStatistic {
	/** Package link in an alternative package storage. */
	alternativeSource?: string;
}

/** Defines a top packages statistic. */
export interface TopPackages {
	packages: TopPackage[];
}

export interface Online2State {
	inProgress: boolean;
	error: string;
	games: Record<number, GameInfo>;
	gamesFilter: GamesFilter;
	gamesSearch: string;
	selectedGameId: number;
	selectedGame: GameInfo | null;
	downloadPackageProgress: boolean;
	uploadPackageProgress: boolean;
	uploadPackagePercentage: number;
	latestGames?: GamesResponse;
	packagesStatistics?: TopPackages;
	password: string;
	newGameShown: boolean;
	gameCreationProgress: boolean;
	joinGameProgress: boolean;
}

const initialState: Online2State = {
	inProgress: false,
	error: '',
	games: {},
	gamesFilter: GamesFilter.All,
	gamesSearch: '',
	selectedGameId: -1,
	selectedGame: null,
	downloadPackageProgress: false,
	uploadPackageProgress: false,
	uploadPackagePercentage: 0,
	password: '',
	newGameShown: false,
	gameCreationProgress: false,
	joinGameProgress: false,
};

export const loadGames = createAsyncThunk(
	'online2/loadGames',
	async (arg: void, thunkAPI) => {
		const { dispatch } = thunkAPI;
		const dataContext = thunkAPI.extra as DataContext;
		const state = thunkAPI.getState() as RootState;
		const { gameClient } = dataContext;
		const clear = state.common.clearUrls;

		let gamesSlice: Slice<GameInfo> = { Data: [], IsLastSlice: false };
		let whileGuard = 100;

		dispatch(clearGames());

		do {
			const fromId = gamesSlice.Data.length > 0 ? gamesSlice.Data[gamesSlice.Data.length - 1].GameID + 1 : 0;

			gamesSlice = await gameClient.getGamesSliceAsync(fromId);

			dispatch(online2Slice.actions.receiveGames(
				clear ? gamesSlice.Data.map(d => ({ ...d, PackageName: clearUrls(d.PackageName) })) : gamesSlice.Data));

			whileGuard--;
		} while (!gamesSlice.IsLastSlice && whileGuard > 0);
	},
);

/** Identifies a package across package storages. Package hash is not provided by the statistics service, so name and authors are used. */
function getPackageKey(info: PackageInfo): string {
	return `${info.name}\n${info.authors.join(',')}`;
}

async function loadStatisticsAsync(dispatch: AppDispatch, dataContext: DataContext) {
	const siStatisticsClient = new SIStatisticsClient({ serviceUri: dataContext.config.siStatisticsServiceUri });

	const now = new Date();
	const FIVE_MINUTES = 5 * 60 * 1000;
	const ONE_DAY = 24 * 60 * 60 * 1000;
	const ONE_WEEK = 7 * ONE_DAY;

	const packagesFilter: StatisticFilter = {
		platform: GamePlatforms.GameServer,
		from: new Date(now.getTime() - ONE_WEEK),
		to: now,
		count: 11,
		languageCode: localization.getLanguage()
	};

	const gamesFilter: StatisticFilter = {
		platform: GamePlatforms.GameServer,
		from: new Date(now.getTime() - FIVE_MINUTES),
		to: now,
		count: 25,
		languageCode: localization.getLanguage()
	};

	const alternativeSource = dataContext.host.getAlternativePackageSource();

	// The service resolves a single link per package, so an alternative package storage is requested separately.
	// Alternative links are optional: their loading error must not hide the whole statistics
	const [packagesStatistics, alternativePackages] = await Promise.all([
		siStatisticsClient.getLatestTopPackagesAsync({
			statisticFilter: packagesFilter,
			packageSource: dataContext.host.getPackageSource(),
		}),
		alternativeSource
			? siStatisticsClient.getLatestTopPackagesAsync({
				statisticFilter: packagesFilter,
				packageSource: alternativeSource,
			}).catch(error => {
				console.warn('Could not load alternative package sources:', error);
				return null;
			})
			: null,
	]);

	const alternativeSources = new Map<string, string>();

	alternativePackages?.packages.forEach(p => {
		if (p.package.source) {
			alternativeSources.set(getPackageKey(p.package), p.package.source);
		}
	});

	dispatch(packagesStatisticsLoaded({
		packages: packagesStatistics.packages.map(p => ({
			...p,
			alternativeSource: alternativeSources.get(getPackageKey(p.package)),
		})),
	}));

	const latestGames = await siStatisticsClient.getLatestGamesInfoAsync(gamesFilter);
	dispatch(latestGamesLoaded(latestGames));
}

export const loadLobby = createAsyncThunk(
	'online2/loadLobby',
	async (arg: void, thunkAPI) => {
		const { dispatch } = thunkAPI;
		const dataContext = thunkAPI.extra as DataContext;

		// Games filtering is performed on client
		dispatch(loadGames());

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
		clearGames: (state) => {
			state.games = {};
		},
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
		downloadPackageStarted: (state: Online2State) => {
			state.downloadPackageProgress = true;
		},
		downloadPackageFinished: (state: Online2State) => {
			state.downloadPackageProgress = false;
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
		packagesStatisticsLoaded: (state: Online2State, action: PayloadAction<TopPackages>) => {
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
	clearGames,
	gameCreated,
	gameChanged,
	gameDeleted,
	selectGameById,
	selectGame,
	onGameFilterToggle,
	onGamesSearchChanged,
	onGamePersonsChanged,
	downloadPackageStarted,
	downloadPackageFinished,
	uploadPackageStarted,
	uploadPackageFinished,
	uploadPackageProgress,
	latestGamesLoaded,
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