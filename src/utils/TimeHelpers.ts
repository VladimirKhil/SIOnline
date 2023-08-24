import localization from '../model/resources/localization';


function getLocalizedHours(hours: number) : string {
	if (hours == 1) {
		return localization.hour;
	}

	if (hours < 5) {
		return localization.hours2;
	}

	return localization.hours5;
}

function getLocalizedMinutes(minutes: number) : string {
	if (minutes % 10 == 1 && minutes != 11) {
		return localization.minute;
	}

	if (minutes % 10 > 1 && minutes % 10 < 5 && (minutes < 11 || minutes > 14)) {
		return localization.minutes2;
	}

	return localization.minutes5;
}

function getLocalizedSeconds(seconds: number) : string {
	if (seconds % 10 == 1 && seconds != 11) {
		return localization.second;
	}

	if (seconds % 10 > 1 && seconds % 10 < 5 && (seconds < 11 || seconds > 14)) {
		return localization.seconds2;
	}

	return localization.seconds5;
}

export function getReadableTimeSpan(timeSpan: number): string {
	const hours = Math.floor(timeSpan / 3600 / 1000);
	const minutes = Math.floor(timeSpan % (3600 * 1000) / 60 / 1000);
	const seconds = Math.floor(timeSpan % (60 * 1000) / 1000);

	if (hours > 0) {
		return hours + ' ' + getLocalizedHours(hours) + (minutes > 0 ? ' ' + minutes + ' ' + getLocalizedMinutes(minutes) : '');
	}

	return minutes > 0 ? minutes + ' ' + getLocalizedMinutes(minutes) : seconds + ' ' + getLocalizedSeconds(seconds);
}