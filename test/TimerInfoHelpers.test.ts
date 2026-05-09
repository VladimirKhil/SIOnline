import { updateTimers, isRunning } from '../src/utils/TimerInfoHelpers';
import TimerInfo from '../src/model/TimerInfo';
import Timers from '../src/model/Timers';

// TimerStates is a const enum; use numeric values directly
// Running = 0, Stopped = 1, Paused = 2
const Running = 0;
const Stopped = 1;

function makeTimer(state: number, isPausedBySystem = false, isPausedByUser = false): TimerInfo {
	return { state, isPausedBySystem, isPausedByUser, value: 0, maximum: 100 };
}

function makeTimers(overrides: Partial<Timers> = {}): Timers {
	return {
		round: makeTimer(Stopped),
		press: makeTimer(Stopped),
		decision: makeTimer(Stopped),
		...overrides,
	};
}

describe('updateTimers', () => {
	test('updates round timer (index 0)', () => {
		const timers = makeTimers();
		const result = updateTimers(timers, 0, t => ({ ...t, value: 42 }));
		expect(result.round.value).toBe(42);
		expect(result.press.value).toBe(0);
		expect(result.decision.value).toBe(0);
	});

	test('updates press timer (index 1)', () => {
		const timers = makeTimers();
		const result = updateTimers(timers, 1, t => ({ ...t, value: 77 }));
		expect(result.press.value).toBe(77);
		expect(result.round.value).toBe(0);
		expect(result.decision.value).toBe(0);
	});

	test('updates decision timer (index 2)', () => {
		const timers = makeTimers();
		const result = updateTimers(timers, 2, t => ({ ...t, value: 99 }));
		expect(result.decision.value).toBe(99);
		expect(result.round.value).toBe(0);
		expect(result.press.value).toBe(0);
	});

	test('returns unchanged timers for unknown index', () => {
		const timers = makeTimers();
		const result = updateTimers(timers, 99, t => ({ ...t, value: 999 }));
		expect(result).toBe(timers);
	});

	test('does not mutate original timers', () => {
		const timers = makeTimers();
		const originalRound = timers.round;
		updateTimers(timers, 0, t => ({ ...t, value: 42 }));
		expect(timers.round).toBe(originalRound);
	});
});

describe('isRunning', () => {
	test('returns true when state is Running and not paused', () => {
		expect(isRunning(makeTimer(Running, false, false))).toBe(true);
	});

	test('returns false when state is Stopped', () => {
		expect(isRunning(makeTimer(Stopped, false, false))).toBe(false);
	});

	test('returns false when paused by system', () => {
		expect(isRunning(makeTimer(Running, true, false))).toBe(false);
	});

	test('returns false when paused by user', () => {
		expect(isRunning(makeTimer(Running, false, true))).toBe(false);
	});

	test('returns false when paused by both system and user', () => {
		expect(isRunning(makeTimer(Running, true, true))).toBe(false);
	});
});
