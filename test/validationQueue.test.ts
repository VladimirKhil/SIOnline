import room2Reducer, {
	approveAnswer,
	askValidation,
	playerAdded,
	playerChanged,
	rejectAnswer,
} from '../src/state/room2Slice';
import { initialState } from '../src/state/State';

function buildRoomWithPlayers(names: string[]) {
	return names.reduce(
		(state, name, index) => room2Reducer(room2Reducer(state, playerAdded()), playerChanged({ index, name })),
		initialState.room2);
}

describe('validation queue', () => {
	it('should keep equal answers of different players', () => {
		let state = buildRoomWithPlayers(['Player 1', 'Player 2', 'Player 3']);

		state = room2Reducer(state, askValidation({ playerIndex: 0, answer: 'Answer 1', showExtraRightButtons: false }));
		state = room2Reducer(state, askValidation({ playerIndex: 1, answer: 'Answer 2', showExtraRightButtons: false }));
		state = room2Reducer(state, askValidation({ playerIndex: 2, answer: 'Answer 1', showExtraRightButtons: false }));

		expect(state.validation.queue).toEqual([
			{ name: 'Player 1', answer: 'Answer 1' },
			{ name: 'Player 2', answer: 'Answer 2' },
			{ name: 'Player 3', answer: 'Answer 1' },
		]);
	});

	it('should remove all equal answers after approval', () => {
		let state = buildRoomWithPlayers(['Player 1', 'Player 2', 'Player 3']);

		state = room2Reducer(state, askValidation({ playerIndex: 0, answer: 'Answer 1', showExtraRightButtons: false }));
		state = room2Reducer(state, askValidation({ playerIndex: 1, answer: 'Answer 2', showExtraRightButtons: false }));
		state = room2Reducer(state, askValidation({ playerIndex: 2, answer: 'Answer 1', showExtraRightButtons: false }));

		state = room2Reducer(state, approveAnswer.fulfilled(undefined, 'requestId', { answer: 'Answer 1', factor: 1.0 }));

		expect(state.validation.queue).toEqual([{ name: 'Player 2', answer: 'Answer 2' }]);
	});

	it('should remove all equal answers after rejection', () => {
		let state = buildRoomWithPlayers(['Player 1', 'Player 2']);

		state = room2Reducer(state, askValidation({ playerIndex: 0, answer: 'Answer', showExtraRightButtons: false }));
		state = room2Reducer(state, askValidation({ playerIndex: 1, answer: 'Answer', showExtraRightButtons: false }));

		state = room2Reducer(state, rejectAnswer.fulfilled(undefined, 'requestId', { answer: 'Answer', factor: 1.0 }));

		expect(state.validation.queue).toEqual([]);
	});
});
