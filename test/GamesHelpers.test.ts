import { filterGames } from '../src/utils/GamesHelpers';
import GameInfo from '../src/client/contracts/GameInfo';
import ServerGameType from '../src/client/contracts/ServerGameType';

const All = 1023;
const Classic = 1;
const Simple = 2;
const Quiz = 4;
const TurnTaking = 8;
const PasswordRequired = 16;
const NoPassword = 32;
const OralYes = 64;
const OralNo = 128;
const MyLanguage = 256;
const OtherLanguage = 512;

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

describe('filterGames - defaults', () => {
	test('returns all games when all filters are enabled', () => {
		const games = [makeGame({ GameID: 1 }), makeGame({ GameID: 2 })];
		expect(filterGames(games, All, '')).toHaveLength(2);
	});

	test('returns empty array for empty games list', () => {
		expect(filterGames([], All, '')).toHaveLength(0);
	});
});

describe('filterGames - game type filters', () => {
	test('classic filter includes only classic games', () => {
		const games = [
			makeGame({ GameID: 1, Mode: ServerGameType.Classic }),
			makeGame({ GameID: 2, Mode: ServerGameType.Simple }),
		];
		expect(filterGames(games, Classic, '')).toHaveLength(1);
		expect(filterGames(games, Classic, '')[0].GameID).toBe(1);
	});

	test('simple filter includes only simple games', () => {
		const games = [
			makeGame({ GameID: 1, Mode: ServerGameType.Classic }),
			makeGame({ GameID: 2, Mode: ServerGameType.Simple }),
		];
		expect(filterGames(games, Simple, '')).toHaveLength(1);
		expect(filterGames(games, Simple, '')[0].GameID).toBe(2);
	});

	test('quiz filter includes only quiz games', () => {
		const games = [
			makeGame({ GameID: 1, Mode: ServerGameType.Quiz as any }),
			makeGame({ GameID: 2, Mode: ServerGameType.Simple }),
		];
		expect(filterGames(games, Quiz, '')).toHaveLength(1);
		expect(filterGames(games, Quiz, '')[0].GameID).toBe(1);
	});

	test('turn-taking filter includes only turn-taking games', () => {
		const games = [
			makeGame({ GameID: 1, Mode: ServerGameType.TurnTaking as any }),
			makeGame({ GameID: 2, Mode: ServerGameType.Simple }),
		];
		expect(filterGames(games, TurnTaking, '')).toHaveLength(1);
		expect(filterGames(games, TurnTaking, '')[0].GameID).toBe(1);
	});
});

describe('filterGames - password filters', () => {
	test('password-required filter includes only protected games', () => {
		const games = [
			makeGame({ GameID: 1, PasswordRequired: false }),
			makeGame({ GameID: 2, PasswordRequired: true }),
		];
		expect(filterGames(games, PasswordRequired, '')).toHaveLength(1);
		expect(filterGames(games, PasswordRequired, '')[0].GameID).toBe(2);
	});

	test('no-password filter includes only open games', () => {
		const games = [
			makeGame({ GameID: 1, PasswordRequired: false }),
			makeGame({ GameID: 2, PasswordRequired: true }),
		];
		expect(filterGames(games, NoPassword, '')).toHaveLength(1);
		expect(filterGames(games, NoPassword, '')[0].GameID).toBe(1);
	});
});

describe('filterGames - oral filters', () => {
	test('oral yes filter includes only oral games', () => {
		const games = [
			makeGame({ GameID: 1, Rules: 'Oral' }),
			makeGame({ GameID: 2, Rules: '' }),
		];
		expect(filterGames(games, OralYes, '')).toHaveLength(1);
		expect(filterGames(games, OralYes, '')[0].GameID).toBe(1);
	});

	test('oral no filter includes only non-oral games', () => {
		const games = [
			makeGame({ GameID: 1, Rules: 'Oral' }),
			makeGame({ GameID: 2, Rules: '' }),
		];
		expect(filterGames(games, OralNo, '')).toHaveLength(1);
		expect(filterGames(games, OralNo, '')[0].GameID).toBe(2);
	});
});

describe('filterGames - language filters', () => {
	test('my language filter includes only local language games', () => {
		const games = [
			makeGame({ GameID: 1, Language: 'en-US' }),
			makeGame({ GameID: 2, Language: 'ru-RU' }),
		];
		expect(filterGames(games, MyLanguage, '')).toHaveLength(1);
		expect(filterGames(games, MyLanguage, '')[0].GameID).toBe(1);
	});

	test('other language filter includes only foreign language games', () => {
		const games = [
			makeGame({ GameID: 1, Language: 'en-US' }),
			makeGame({ GameID: 2, Language: 'ru-RU' }),
		];
		expect(filterGames(games, OtherLanguage, '')).toHaveLength(1);
		expect(filterGames(games, OtherLanguage, '')[0].GameID).toBe(2);
	});
});

describe('filterGames - search filter', () => {
	test('filters games by name (case-insensitive)', () => {
		const games = [
			makeGame({ GameID: 1, GameName: 'Alpha Game' }),
			makeGame({ GameID: 2, GameName: 'Beta Game' }),
			makeGame({ GameID: 3, GameName: 'ALPHA SPECIAL' }),
		];
		const result = filterGames(games, All, 'alpha');
		expect(result).toHaveLength(2);
		expect(result.map(g => g.GameID).sort()).toEqual([1, 3]);
	});

	test('returns all games when search is empty', () => {
		const games = [makeGame({ GameID: 1 }), makeGame({ GameID: 2 })];
		expect(filterGames(games, All, '')).toHaveLength(2);
	});

	test('returns no games when search matches nothing', () => {
		const games = [makeGame({ GameName: 'Alpha' }), makeGame({ GameName: 'Beta' })];
		expect(filterGames(games, All, 'gamma')).toHaveLength(0);
	});
});

describe('filterGames - combined filters', () => {
	test('combines filters across groups', () => {
		const games = [
			makeGame({ GameID: 1, Mode: ServerGameType.Classic, PasswordRequired: false, Rules: '', Language: 'en-US' }),
			makeGame({ GameID: 2, Mode: ServerGameType.Classic, PasswordRequired: true, Rules: '', Language: 'en-US' }),
			makeGame({ GameID: 3, Mode: ServerGameType.Simple, PasswordRequired: false, Rules: 'Oral', Language: 'ru-RU' }),
			makeGame({ GameID: 4, Mode: ServerGameType.Quiz as any, PasswordRequired: false, Rules: '', Language: 'en-US' }),
		];
		const result = filterGames(games, Classic | NoPassword | OralNo | MyLanguage, '');
		expect(result).toHaveLength(1);
		expect(result[0].GameID).toBe(1);
	});

	test('allows multiple filters within a group', () => {
		const games = [
			makeGame({ GameID: 1, Mode: ServerGameType.Classic }),
			makeGame({ GameID: 2, Mode: ServerGameType.Simple }),
			makeGame({ GameID: 3, Mode: ServerGameType.Quiz as any }),
		];
		const result = filterGames(games, Classic | Quiz, '');
		expect(result.map(g => g.GameID).sort()).toEqual([1, 3]);
	});

	test('combines search with filter groups', () => {
		const games = [
			makeGame({ GameID: 1, GameName: 'Quiz A', Mode: ServerGameType.Classic }),
			makeGame({ GameID: 2, GameName: 'Quiz B', Mode: ServerGameType.Simple }),
			makeGame({ GameID: 3, GameName: 'Other', Mode: ServerGameType.Classic }),
		];
		const result = filterGames(games, Classic, 'quiz');
		expect(result).toHaveLength(1);
		expect(result[0].GameID).toBe(1);
	});
});
