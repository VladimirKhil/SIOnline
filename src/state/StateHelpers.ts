import { saveState } from './SavedState';
import { MAX_HISTORY_LENGTH } from './historySlice';
import { RootState } from './store';

export function saveStateToStorage(state: RootState): void {
	saveState({
		login: state.user.login,
		game: {
			name: state.game.name,
			password: state.game.password,
			voiceChat: state.game.voiceChat,
			role: state.game.role,
			type: state.game.type,
			playersCount: state.game.playersCount,
		},
			history: {
				currentGame: state.history.currentGame,
				gameHistory: state.history.gameHistory.slice(-MAX_HISTORY_LENGTH),
			},
		settings: state.settings
	});
}