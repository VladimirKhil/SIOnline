import Role from '../model/Role';
import GameType from '../model/GameType';
import { SettingsState } from './settingsSlice';

const STATE_KEY = 'SIOnline_State';

export default interface SavedState {
	login: string;

	game: {
		name: string;
		password: string;
		role: Role;
		type: GameType;
		playersCount: number;
		humanPlayersCount: number;
	};

	settings: SettingsState;
}

export function loadState(): SavedState | null {
	const savedState = localStorage.getItem(STATE_KEY);

	if (!savedState) {
		return null;
	}

	return JSON.parse(savedState);
}

export function saveState(state: SavedState) {
	localStorage.setItem(STATE_KEY, JSON.stringify(state));
}
