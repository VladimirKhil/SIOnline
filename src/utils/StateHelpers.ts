import PlayerInfo from '../model/PlayerInfo';
import localization from '../model/resources/localization';
import State from '../state/State';

export function isHost(state: State): boolean {
	return state.room2.name === state.room2.persons.hostName;
}

export function getCulture(state: State): string {
	return state.settings.appSettings.culture ?? localization.getLanguage();
}

export function getFullCulture(state: State): string {
	const culture = getCulture(state);

	switch (culture) {
		case 'ru':
			return 'ru-RU';
		case 'sr':
			return 'sr-RS';
		default:
			return 'en-US';
	}
}

export function getMeAsPlayer(state: State): PlayerInfo | null {
	const { players } = state.room2.persons;

	for (let i = 0; i < players.length; i++) {
		if (players[i].name === state.room2.name) {
			return players[i];
		}
	}

	return null;
}
