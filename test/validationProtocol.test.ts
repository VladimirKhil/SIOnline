/**
 * Wire-level test for the answer validation protocol.
 *
 * It feeds the raw ASK_VALIDATE messages (exactly as the game server sends them)
 * into the real message processing pipeline and checks both the resulting state
 * and the VALIDATE message sent back to the server.
 */

import { applyMiddleware, createStore } from 'redux';
import { withExtraArgument } from 'redux-thunk';
import ClientController from '../src/logic/ClientController';
import MessageHandler from '../src/logic/messageProcessor';
import DataContext from '../src/model/DataContext';
import Role from '../src/model/Role';
import reducer from '../src/state/reducer';
import { approveAnswer, playerAdded, playerChanged, setRoomRole } from '../src/state/room2Slice';
import { AppDispatch } from '../src/state/store';

function createShowmanRoom() {
	const validateAnswer = jest.fn().mockResolvedValue(true);
	const dataContext = { game: { validateAnswer } } as unknown as DataContext;
	const store = createStore(reducer, applyMiddleware(withExtraArgument(dataContext)));

	store.dispatch(setRoomRole(Role.Showman));

	['Игрок 1', 'Игрок 2'].forEach((name, index) => {
		store.dispatch(playerAdded());
		store.dispatch(playerChanged({ index, name }));
	});

	const controller = new ClientController(
		store.dispatch,
		store.dispatch as unknown as AppDispatch,
		store.getState,
		dataContext);

	const messageHandler = new MessageHandler(controller);

	const receive = (...args: string[]) => messageHandler.processMessage({
		IsSystem: true,
		Sender: '@',
		Text: args.join('\n'),
	});

	return { store, receive, validateAnswer };
}

describe('answer validation protocol', () => {
	it('shows the answers of all the players even when the answers are equal', () => {
		const { store, receive } = createShowmanRoom();

		receive('ASK_VALIDATE', '0', 'Париж', '+');
		receive('ASK_VALIDATE', '1', 'Париж', '+');

		expect(store.getState().room2.validation.queue).toEqual([
			{ name: 'Игрок 1', answer: 'Париж' },
			{ name: 'Игрок 2', answer: 'Париж' },
		]);
	});

	it('sends a single verdict for equal answers and empties the queue', async () => {
		const { store, receive, validateAnswer } = createShowmanRoom();

		receive('ASK_VALIDATE', '0', 'Париж', '+');
		receive('ASK_VALIDATE', '1', 'Париж', '+');

		await (store.dispatch as unknown as AppDispatch)(approveAnswer({ answer: 'Париж', factor: 1.0 }));

		expect(validateAnswer).toHaveBeenCalledTimes(1);
		expect(validateAnswer).toHaveBeenCalledWith('Париж', true, 1.0);
		expect(store.getState().room2.validation.queue).toEqual([]);
	});

	it('keeps validating different answers one by one', async () => {
		const { store, receive, validateAnswer } = createShowmanRoom();

		receive('ASK_VALIDATE', '0', 'Париж', '+');
		receive('ASK_VALIDATE', '1', 'Лондон', '+');

		await (store.dispatch as unknown as AppDispatch)(approveAnswer({ answer: 'Париж', factor: 1.0 }));

		expect(validateAnswer).toHaveBeenCalledWith('Париж', true, 1.0);
		expect(store.getState().room2.validation.queue).toEqual([{ name: 'Игрок 2', answer: 'Лондон' }]);
	});

	it('works with an unpatched server sending a single validation request', () => {
		const { store, receive } = createShowmanRoom();

		receive('ASK_VALIDATE', '0', 'Париж', '+');

		expect(store.getState().room2.validation.queue).toEqual([{ name: 'Игрок 1', answer: 'Париж' }]);
	});
});
