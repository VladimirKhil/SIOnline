import QuestionStats from 'sistatistics-client/dist/models/QuestionStats';
import ThemeInfo from '../model/ThemeInfo';

/** Minimum number of completed games required to display package question statistics. */
export const MIN_COMPLETED_GAME_COUNT = 20;

/** Question position inside a round. Indices are -1 when unknown. */
export interface QuestionStatsPosition {
	themeIndex: number;
	questionIndex: number;
}

/** Question answer percentages. */
export interface QuestionStatsPercents {
	triesPercent: number;
	rightPercent: number;
}

const UNKNOWN_POSITION: QuestionStatsPosition = { themeIndex: -1, questionIndex: -1 };

export function getQuestionStatsKey(roundIndex: number, themeIndex: number, questionIndex: number): string {
	return `${roundIndex}:${themeIndex}:${questionIndex}`;
}

/** Resolves the position of the currently played question inside the round.
 * The server reports it for round table questions only, so theme list questions are resolved by theme name,
 * and only when the name matches a single theme holding no question prices.
 */
export function getQuestionStatsPosition(
	roundInfo: ThemeInfo[],
	themeName: string,
	activeThemeIndex: number,
	actionQuestionIndex: number,
): QuestionStatsPosition {
	if (actionQuestionIndex > -1) {
		return { themeIndex: activeThemeIndex, questionIndex: actionQuestionIndex };
	}

	if (themeName.length === 0) {
		return UNKNOWN_POSITION;
	}

	const matchedIndices = roundInfo.reduce<number[]>(
		(indices, theme, themeIndex) => (theme.name === themeName && theme.questions.length === 0
			? [...indices, themeIndex]
			: indices),
		[],
	);

	return matchedIndices.length === 1 ? { themeIndex: matchedIndices[0], questionIndex: 0 } : UNKNOWN_POSITION;
}

/** Calculates question answer percentages. Returns null when there is nothing to display. */
export function getQuestionStatsPercents(
	packageStats: Record<string, QuestionStats>,
	completedGameCount: number,
	roundIndex: number,
	position: QuestionStatsPosition,
): QuestionStatsPercents | null {
	const { themeIndex, questionIndex } = position;

	if (completedGameCount < MIN_COMPLETED_GAME_COUNT || roundIndex < 0 || themeIndex < 0 || questionIndex < 0) {
		return null;
	}

	const stats = packageStats[getQuestionStatsKey(roundIndex, themeIndex, questionIndex)];

	if (!stats || stats.shownCount <= 0 || stats.playerSeenCount <= 0) {
		return null;
	}

	const tryCount = stats.correctCount + stats.wrongCount;

	return {
		triesPercent: Math.round((stats.answeredCount / stats.shownCount) * 100),
		rightPercent: tryCount > 0 ? Math.round((stats.correctCount / tryCount) * 100) : 0,
	};
}
