import reducer, { addComplexAnswer, resetQuestion, SIQuesterState } from '../src/state/siquesterSlice';
import { createDefaultPackage } from '../src/model/siquester/packageGenerator';

describe('siquesterSlice', () => {
	test('addComplexAnswer initializes answer content with waitForFinish enabled', () => {
		const state: SIQuesterState = {
			pack: createDefaultPackage({
				packageName: '',
				authorName: '',
				roundCount: 1,
				themeCount: 1,
				questionCount: 1,
				includeFinalRound: false,
				finalThemeCount: 0,
			}),
		};

		const nextState = reducer(state, addComplexAnswer({
			roundIndex: 0,
			themeIndex: 0,
			questionIndex: 0,
		}));

		expect(nextState.pack?.rounds[0].themes[0].questions[0].params.answer?.items).toEqual([
			{
				type: 'text',
				value: '',
				isRef: false,
				placement: 'screen',
				waitForFinish: true,
			},
		]);
	});

	test('resetQuestion voids and unvoids a question back to default state', () => {
		const state: SIQuesterState = {
			pack: createDefaultPackage({
				packageName: '',
				authorName: '',
				roundCount: 1,
				themeCount: 1,
				questionCount: 1,
				includeFinalRound: false,
				finalThemeCount: 0,
			}),
		};

		state.pack!.rounds[0].themes[0].questions[0] = {
			price: 100,
			type: 'secret',
			params: {
				question: {
					items: [{
						type: 'text',
						value: 'Filled',
						isRef: false,
						placement: 'screen',
					}]
				},
				answerType: 'number',
				answerDeviation: '2',
			},
			right: {
				answer: ['42']
			},
			wrong: {
				answer: ['41']
			},
		};

		const voidedState = reducer(state, resetQuestion({
			roundIndex: 0,
			themeIndex: 0,
			questionIndex: 0,
		}));

		expect(voidedState.pack?.rounds[0].themes[0].questions[0]).toEqual({
			price: -1,
			params: {
				question: {
					items: [{
						type: 'text',
						value: '',
						isRef: false,
						placement: 'screen',
					}]
				}
			},
			right: {
				answer: ['']
			}
		});

		const restoredState = reducer(voidedState, resetQuestion({
			roundIndex: 0,
			themeIndex: 0,
			questionIndex: 0,
		}));

		expect(restoredState.pack?.rounds[0].themes[0].questions[0]).toEqual({
			price: 0,
			params: {
				question: {
					items: [{
						type: 'text',
						value: '',
						isRef: false,
						placement: 'screen',
					}]
				}
			},
			right: {
				answer: ['']
			}
		});
	});
});