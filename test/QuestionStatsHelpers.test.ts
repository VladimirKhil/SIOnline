import QuestionStats from 'sistatistics-client/dist/models/QuestionStats';
import ThemeInfo from '../src/model/ThemeInfo';
import {
	MIN_COMPLETED_GAME_COUNT,
	getQuestionStatsKey,
	getQuestionStatsPercents,
	getQuestionStatsPosition,
} from '../src/utils/QuestionStatsHelpers';

/** Themes of a theme list round: they hold no question prices. */
function makeThemeListRound(...names: string[]): ThemeInfo[] {
	return names.map(name => ({ name, comment: '', questions: [] }));
}

/** Themes of a round table round: they hold question prices. */
function makeTableRound(...names: string[]): ThemeInfo[] {
	return names.map(name => ({ name, comment: '', questions: [100, 200, 300] }));
}

function makeStats(overrides: Partial<QuestionStats> = {}): QuestionStats {
	return {
		shownCount: 100,
		playerSeenCount: 100,
		answeredCount: 80,
		correctCount: 40,
		wrongCount: 40,
		...overrides,
	};
}

function makePackageStats(stats: QuestionStats, key = '0:0:0'): Record<string, QuestionStats> {
	return { [key]: stats };
}

describe('getQuestionStatsKey', () => {
	test('builds key from round, theme and question indices', () => {
		expect(getQuestionStatsKey(0, 2, 3)).toBe('0:2:3');
	});
});

describe('getQuestionStatsPosition', () => {
	test('uses position reported by the server for round table questions', () => {
		const round = makeTableRound('Кино', 'Музыка');
		expect(getQuestionStatsPosition(round, 'Музыка', 1, 3)).toEqual({ themeIndex: 1, questionIndex: 3 });
	});

	test('resolves theme list question by theme name, as the server reports no position', () => {
		const round = makeThemeListRound('Кино', 'Музыка', 'Спорт');
		expect(getQuestionStatsPosition(round, 'Спорт', -1, -1)).toEqual({ themeIndex: 2, questionIndex: 0 });
	});

	test('resolves the surviving theme when played out themes are already blanked', () => {
		const round = makeThemeListRound('', 'Музыка', '');
		expect(getQuestionStatsPosition(round, 'Музыка', -1, -1)).toEqual({ themeIndex: 1, questionIndex: 0 });
	});

	test('gives up when the theme name is ambiguous', () => {
		const round = makeThemeListRound('Кино', 'Кино');
		expect(getQuestionStatsPosition(round, 'Кино', -1, -1)).toEqual({ themeIndex: -1, questionIndex: -1 });
	});

	test('gives up when the theme name is unknown', () => {
		const round = makeThemeListRound('Кино', 'Музыка');
		expect(getQuestionStatsPosition(round, 'Спорт', -1, -1)).toEqual({ themeIndex: -1, questionIndex: -1 });
	});

	test('never matches blanked themes by an empty name', () => {
		const round = makeThemeListRound('', 'Музыка');
		expect(getQuestionStatsPosition(round, '', -1, -1)).toEqual({ themeIndex: -1, questionIndex: -1 });
	});

	test('does not guess round table questions by name, as their position must come from the server', () => {
		const round = makeTableRound('Кино', 'Музыка');
		expect(getQuestionStatsPosition(round, 'Музыка', -1, -1)).toEqual({ themeIndex: -1, questionIndex: -1 });
	});
});

describe('getQuestionStatsPercents', () => {
	test('calculates tries percent of shown count and right percent of tries', () => {
		const result = getQuestionStatsPercents(makePackageStats(makeStats()), MIN_COMPLETED_GAME_COUNT, 0, { themeIndex: 0, questionIndex: 0 });
		expect(result).toEqual({ triesPercent: 80, rightPercent: 50 });
	});

	test('rounds percentages', () => {
		const stats = makeStats({ shownCount: 3, answeredCount: 1, correctCount: 1, wrongCount: 2 });
		expect(getQuestionStatsPercents(makePackageStats(stats), 100, 0, { themeIndex: 0, questionIndex: 0 })).toEqual({ triesPercent: 33, rightPercent: 33 });
	});

	test('reads statistics of the requested question only', () => {
		const packageStats = {
			...makePackageStats(makeStats(), '0:0:0'),
			...makePackageStats(makeStats({ answeredCount: 10, correctCount: 1, wrongCount: 9 }), '1:2:3'),
		};

		expect(getQuestionStatsPercents(packageStats, 100, 1, { themeIndex: 2, questionIndex: 3 })).toEqual({ triesPercent: 10, rightPercent: 10 });
	});

	test('returns null when the question has no statistics', () => {
		expect(getQuestionStatsPercents(makePackageStats(makeStats()), 100, 5, { themeIndex: 5, questionIndex: 5 })).toBeNull();
	});

	test('returns null when the package has not been completed enough times', () => {
		expect(getQuestionStatsPercents(makePackageStats(makeStats()), MIN_COMPLETED_GAME_COUNT - 1, 0, { themeIndex: 0, questionIndex: 0 })).toBeNull();
	});

	test('returns null when the question position is unknown', () => {
		const packageStats = makePackageStats(makeStats(), '0:-1:-1');
		expect(getQuestionStatsPercents(packageStats, 100, 0, { themeIndex: -1, questionIndex: -1 })).toBeNull();
	});

	test('returns null when the round is unknown', () => {
		expect(getQuestionStatsPercents(makePackageStats(makeStats(), '-1:0:0'), 100, -1, { themeIndex: 0, questionIndex: 0 })).toBeNull();
	});

	test('returns null when the question has never been shown (would divide by zero)', () => {
		expect(getQuestionStatsPercents(makePackageStats(makeStats({ shownCount: 0 })), 100, 0, { themeIndex: 0, questionIndex: 0 })).toBeNull();
	});

	test('returns null when no player has seen the question', () => {
		expect(getQuestionStatsPercents(makePackageStats(makeStats({ playerSeenCount: 0 })), 100, 0, { themeIndex: 0, questionIndex: 0 })).toBeNull();
	});

	test('returns zero right percent when nobody tried to answer', () => {
		const stats = makeStats({ answeredCount: 0, correctCount: 0, wrongCount: 0 });
		expect(getQuestionStatsPercents(makePackageStats(stats), 100, 0, { themeIndex: 0, questionIndex: 0 })).toEqual({ triesPercent: 0, rightPercent: 0 });
	});

	test('handles real service data', () => {
		const stats = makeStats({ shownCount: 23858, playerSeenCount: 78893, answeredCount: 19057, correctCount: 16928, wrongCount: 3601 });
		expect(getQuestionStatsPercents(makePackageStats(stats), 16083, 0, { themeIndex: 0, questionIndex: 0 })).toEqual({ triesPercent: 80, rightPercent: 82 });
	});
});
