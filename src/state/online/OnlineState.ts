import GameInfo from '../../client/contracts/GameInfo';
import GamesFilter from '../../model/enums/GamesFilter';
import LobbySideMode from '../../model/enums/LobbySideMode';
import GamesResponse from 'sistatistics-client/dist/models/GamesResponse';
import GamesStatistic from 'sistatistics-client/dist/models/GamesStatistic';
import PackagesStatistic from 'sistatistics-client/dist/models/PackagesStatistic';

export default interface OnlineState {
	inProgress: boolean;
	error: string;
	gamesFilter: GamesFilter;
	gamesSearch: string;
	games: Record<number, GameInfo>;
	selectedGameId: number;
	password: string;
	chatMode: LobbySideMode;
	newGameShown: boolean;
	gameCreationProgress: boolean;
	joinGameProgress: boolean;
	latestGames?: GamesResponse;
	gamesStatistics?: GamesStatistic;
	packagesStatistics?: PackagesStatistic;
}

export const initialState: OnlineState = {
	inProgress: false,
	error: '',
	gamesFilter: GamesFilter.NoFilter,
	gamesSearch: '',
	games: {},
	selectedGameId: -1,
	password: '',
	chatMode: LobbySideMode.Trends,
	newGameShown: false,
	gameCreationProgress: false,
	joinGameProgress: false,
};