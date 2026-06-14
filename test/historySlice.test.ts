import historyReducer, {
	addCurrentGameToHistory,
	historySlice,
	MAX_HISTORY_LENGTH,
	setCurrentGame,
	setGameResults,
	setPackageAuthors,
	setPackageName,
	setShowman,
} from '../src/state/historySlice';

describe('historySlice', () => {
	it('should build current game incrementally', () => {
		let state = historySlice.getInitialState();

		state = historyReducer(state, setCurrentGame('Player'));
		state = historyReducer(state, setShowman('Showman'));
		state = historyReducer(state, setPackageName('Package'));
		state = historyReducer(state, setPackageAuthors(['Author1', 'Author2']));
		state = historyReducer(state, setGameResults({ Player: 100, Opponent: 50 }));

		expect(state.currentGame).toEqual(expect.objectContaining({
			personName: 'Player',
			showman: 'Showman',
			packageName: 'Package',
			packageAuthors: ['Author1', 'Author2'],
			results: {
				Player: 100,
				Opponent: 50,
			},
		}));
	});

	it('should keep only the latest completed games', () => {
		let state = historySlice.getInitialState();

		for (let index = 0; index < MAX_HISTORY_LENGTH + 1; index += 1) {
			state = historyReducer(state, setCurrentGame(`Player ${index}`));
			state = historyReducer(state, setPackageName(`Package ${index}`));
			state = historyReducer(state, addCurrentGameToHistory());
		}

		expect(state.currentGame).toBeNull();
		expect(state.gameHistory).toHaveLength(MAX_HISTORY_LENGTH);
		expect(state.gameHistory[0].packageName).toBe('Package 1');
		expect(state.gameHistory[MAX_HISTORY_LENGTH - 1].packageName).toBe(`Package ${MAX_HISTORY_LENGTH}`);
	});
});
