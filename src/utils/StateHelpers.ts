import PlayerInfo from '../model/PlayerInfo';
import localization from '../model/resources/localization';
import State from '../state/State';

export function isHost(state: State): boolean {
	return state.room.name === state.room.persons.hostName;
}

export function getCulture(state: State): string {
	return state.settings.appSettings.culture ?? localization.getLanguage();
}

export function getFullCulture(state: State): string {
	return getCulture(state) === 'ru' ? 'ru-RU' : 'en-US';
}

export function getMeAsPlayer(state: State): PlayerInfo | null {
	const { players } = state.room2.persons;

	for (let i = 0; i < players.length; i++) {
		if (players[i].name === state.room.name) {
			return players[i];
		}
	}

	return null;
}
