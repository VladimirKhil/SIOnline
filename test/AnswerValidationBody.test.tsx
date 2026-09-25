import * as React from 'react';
import { Provider } from 'react-redux';
import { renderToStaticMarkup } from 'react-dom/server';
import AnswerValidationBody from '../src/components/gameTable/AnswerValidationBody/AnswerValidationBody';
import localization from '../src/model/resources/localization';
import { useAppDispatch, useAppSelector } from '../src/state/hooks';

jest.mock('../src/state/hooks', () => ({
	useAppDispatch: jest.fn(),
	useAppSelector: jest.fn(),
}));

function render(queue: { name: string, answer: string }[]) {
	const state = {
		common: { clipboardSupported: false, fontsReady: true },
		room2: {
			validation: {
				queue,
				rightAnswers: ['Париж'],
				wrongAnswers: [],
			},
		},
	};

	(useAppDispatch as unknown as jest.Mock).mockReturnValue(jest.fn());
	(useAppSelector as unknown as jest.Mock).mockImplementation((selector: (s: unknown) => unknown) => selector(state));

	const store = {
		getState: () => state,
		subscribe: () => () => {},
		dispatch: (action: unknown) => action,
	};

	return renderToStaticMarkup(
		<Provider store={store as never}>
			<AnswerValidationBody />
		</Provider>);
}

describe('AnswerValidationBody', () => {
	it('joins the names of the players having provided the same answer', () => {
		const markup = render([
			{ name: 'Игрок 1', answer: 'Париж' },
			{ name: 'Игрок 2', answer: 'Париж' },
			{ name: 'Игрок 3', answer: 'Лондон' },
		]);

		expect(markup).toContain(localization.playerAnswerLabel.replace('{0}', 'Игрок 1, Игрок 2'));
		expect(markup).not.toContain('Игрок 3');
	});

	it('shows a single name when the answer is unique', () => {
		const markup = render([{ name: 'Игрок 1', answer: 'Париж' }]);

		expect(markup).toContain(localization.playerAnswerLabel.replace('{0}', 'Игрок 1'));
	});
});
