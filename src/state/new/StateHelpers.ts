import { saveState } from '../SavedState';
import { RootState } from './store';

export function saveStateToStorage(state: RootState): void {
	saveState({
		login: state.user.login,
		game: {
			name: state.game.name,
			password: state.game.password,
			role: state.game.role,
			type: state.game.type,
			playersCount: state.game.playersCount
		},
		settings: state.settings
	});
}