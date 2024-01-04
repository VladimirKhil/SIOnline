import GameInfo from '../../client/contracts/GameInfo';
import ChatMessage from '../../model/ChatMessage';
import GamesFilter from '../../model/enums/GamesFilter';
import LobbySideMode from '../../model/enums/LobbySideMode';
import MessageLevel from '../../model/enums/MessageLevel';
import localization from '../../model/resources/localization';
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
	users: string[];
	currentMessage: string;
	messages: ChatMessage[];
	password: string;
	chatMode: LobbySideMode;
	newGameShown: boolean;
	gameCreationProgress: boolean;
	gameCreationError: string | null;
	joinGameProgress: boolean;
	joingGameError: string | null;
	uploadPackageProgress: boolean;
	uploadPackagePercentage: number;
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
	users: [],
	currentMessage: '',
	messages: [
		{
			sender: localization.appUser,
			text: localization.greeting,
			level: MessageLevel.System,
		}
	],
	password: '',
	chatMode: LobbySideMode.Trends,
	newGameShown: false,
	gameCreationProgress: false,
	gameCreationError: null,
	joinGameProgress: false,
	joingGameError: null,
	uploadPackageProgress: false,
	uploadPackagePercentage: 0,
};