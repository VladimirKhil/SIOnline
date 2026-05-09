import { filterGames } from '../src/utils/GamesHelpers';
import GameInfo from '../src/client/contracts/GameInfo';
import ServerGameType from '../src/client/contracts/ServerGameType';

// GamesFilter is a const enum; use numeric values directly
// NoFilter = 0, New = 1, Sport = 2, Tv = 4, NoPassword = 8, MyLanguage = 16
const NoFilter = 0;
const New = 1;
const Sport = 2;
const Tv = 4;
const NoPassword = 8;

// In GamesHelpers: game.Mode === ServerGameType.Simple → matches "Sport" bit filter
// ServerGameType.Simple = 'Sport' (confusingly), ServerGameType.Classic = 'Tv'

// GameStage is a const enum with string values; use string literal to avoid import issues
const GameStageCreated = 'Created' as any;

function makeGame(overrides: Partial<GameInfo> = {}): GameInfo {
	return {
		GameID: 1,
		GameName: 'Test Game',
		Mode: ServerGameType.Simple,
		PasswordRequired: false,
		Started: false,
		Language: 'en',
		Owner: 'host',
		RealStartTime: '',
		StartTime: '',
		HostUri: '',
		PackageName: '',
		Persons: [],
		ProgressCurrent: 0,
		ProgressTotal: 0,
		Rules: '',
		Stage: GameStageCreated,
		StageName: '',
		...overrides,
	};
}

describe('filterGames - no filter', () => {
	test('returns all games with no filter and no search', () => {
		const games = [makeGame({ GameID: 1 }), makeGame({ GameID: 2 })];
		expect(filterGames(games, NoFilter, '')).toHaveLength(2);
	});

	test('returns empty array for empty games list', () => {
		expect(filterGames([], NoFilter, '')).toHaveLength(0);
	});
});

describe('filterGames - New filter', () => {
	test('excludes started games when New filter is active', () => {
		const games = [
			makeGame({ GameID: 1, Started: false }),
			makeGame({ GameID: 2, Started: true }),
		];
		expect(filterGames(games, New, '')).toHaveLength(1);
		expect(filterGames(games, New, '')[0].GameID).toBe(1);
	});

	test('includes all non-started games', () => {
		const games = [
			makeGame({ GameID: 1, Started: false }),
			makeGame({ GameID: 2, Started: false }),
		];
		expect(filterGames(games, New, '')).toHaveLength(2);
	});
});

describe('filterGames - NoPassword filter', () => {
	test('excludes password-required games', () => {
		const games = [
			makeGame({ GameID: 1, PasswordRequired: false }),
			makeGame({ GameID: 2, PasswordRequired: true }),
		];
		expect(filterGames(games, NoPassword, '')).toHaveLength(1);
		expect(filterGames(games, NoPassword, '')[0].GameID).toBe(1);
	});
});

describe('filterGames - Sport/Tv mode filters', () => {
	test('Sport filter includes only Simple mode games', () => {
		const games = [
			makeGame({ GameID: 1, Mode: ServerGameType.Simple }),
			makeGame({ GameID: 2, Mode: ServerGameType.Classic }),
		];
		// Sport-only: sport=true, tv=false → ServerGameType.Simple matches
		expect(filterGames(games, Sport, '')).toHaveLength(1);
		expect(filterGames(games, Sport, '')[0].GameID).toBe(1);
	});

	test('Tv filter includes only Classic mode games', () => {
		const games = [
			makeGame({ GameID: 1, Mode: ServerGameType.Simple }),
			makeGame({ GameID: 2, Mode: ServerGameType.Classic }),
		];
		// Tv-only: tv=true, sport=false → ServerGameType.Classic matches
		expect(filterGames(games, Tv, '')).toHaveLength(1);
		expect(filterGames(games, Tv, '')[0].GameID).toBe(2);
	});

	test('Both Sport and Tv filter shows all modes', () => {
		const games = [
			makeGame({ GameID: 1, Mode: ServerGameType.Simple }),
			makeGame({ GameID: 2, Mode: ServerGameType.Classic }),
		];
		// allModes = sport && tv → both match
		expect(filterGames(games, Sport | Tv, '')).toHaveLength(2);
	});

	test('No mode filter shows all modes', () => {
		const games = [
			makeGame({ GameID: 1, Mode: ServerGameType.Simple }),
			makeGame({ GameID: 2, Mode: ServerGameType.Classic }),
		];
		// allModes = !sport && !tv → both match
		expect(filterGames(games, NoFilter, '')).toHaveLength(2);
	});
});

describe('filterGames - search filter', () => {
	test('filters games by name (case-insensitive)', () => {
		const games = [
			makeGame({ GameID: 1, GameName: 'Alpha Game' }),
			makeGame({ GameID: 2, GameName: 'Beta Game' }),
			makeGame({ GameID: 3, GameName: 'ALPHA SPECIAL' }),
		];
		const result = filterGames(games, NoFilter, 'alpha');
		expect(result).toHaveLength(2);
		expect(result.map(g => g.GameID).sort()).toEqual([1, 3]);
	});

	test('returns all games when search is empty', () => {
		const games = [makeGame({ GameID: 1 }), makeGame({ GameID: 2 })];
		expect(filterGames(games, NoFilter, '')).toHaveLength(2);
	});

	test('returns no games when search matches nothing', () => {
		const games = [makeGame({ GameName: 'Alpha' }), makeGame({ GameName: 'Beta' })];
		expect(filterGames(games, NoFilter, 'gamma')).toHaveLength(0);
	});
});

describe('filterGames - combined filters', () => {
	test('combines New and NoPassword filters', () => {
		const games = [
			makeGame({ GameID: 1, Started: false, PasswordRequired: false }),
			makeGame({ GameID: 2, Started: true, PasswordRequired: false }),
			makeGame({ GameID: 3, Started: false, PasswordRequired: true }),
			makeGame({ GameID: 4, Started: true, PasswordRequired: true }),
		];
		const result = filterGames(games, New | NoPassword, '');
		expect(result).toHaveLength(1);
		expect(result[0].GameID).toBe(1);
	});

	test('combines search with New filter', () => {
		const games = [
			makeGame({ GameID: 1, GameName: 'Quiz A', Started: false }),
			makeGame({ GameID: 2, GameName: 'Quiz B', Started: true }),
			makeGame({ GameID: 3, GameName: 'Other', Started: false }),
		];
		const result = filterGames(games, New, 'quiz');
		expect(result).toHaveLength(1);
		expect(result[0].GameID).toBe(1);
	});
});
