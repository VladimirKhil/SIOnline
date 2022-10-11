import Timers from '../model/Timers';
import TimerInfo from '../model/TimerInfo';
import TimerStates from '../model/enums/TimeStates';

export function updateTimers(timers: Timers, timerIndex: number, updater: (timerInfo: TimerInfo) => TimerInfo): Timers {
	switch (timerIndex) {
		case 0:
			return { ...timers, round: updater(timers.round) };
		case 1:
			return { ...timers, press: updater(timers.press) };
		case 2:
			return { ...timers, decision: updater(timers.decision) };

		default:
			return timers;
	}
}

export function isRunning(timerInfo: TimerInfo): boolean {
	return timerInfo.state === TimerStates.Running && !timerInfo.isPausedBySystem && !timerInfo.isPausedByUser;
}
