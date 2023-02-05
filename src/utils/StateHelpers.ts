import localization from '../model/resources/localization';
import State from '../state/State';

export function isHost(state: State): boolean {
	return state.user.login === state.room.persons.hostName;
}

export function getCulture(state: State): string {
	return state.settings.appSettings.culture ?? localization.getLanguage();
}

export function getFullCulture(state: State): string {
	return getCulture(state) === 'ru' ? 'ru-RU' : 'en-US';
}
