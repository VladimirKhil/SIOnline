import reducer, { addComplexAnswer, resetQuestion, SIQuesterState, undo, redo, updatePackageProperty, updateRoundProperty, addRound } from '../src/state/siquesterSlice';
import { createDefaultPackage } from '../src/model/siquester/packageGenerator';
import JSZip from 'jszip';

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

	describe('undo/redo functionality', () => {
		let initialState: SIQuesterState;

		beforeEach(() => {
			initialState = {
				pack: createDefaultPackage({
					packageName: 'Initial Name',
					authorName: 'Author',
					roundCount: 1,
					themeCount: 1,
					questionCount: 1,
					includeFinalRound: false,
					finalThemeCount: 0,
				}),
				roundIndex: 0,
				themeIndex: 0,
				questionIndex: 0,
				isPackageSelected: false,
			};
		});

		test('undo and redo revert and reapply state correctly', () => {
			// Perform edit
			const state1 = reducer(initialState, updatePackageProperty({
				property: 'name',
				value: 'Modified Name'
			}));

			expect(state1.pack?.name).toBe('Modified Name');
			expect(state1.history?.past.length).toBe(1);
			expect(state1.history?.past[0].pack.name).toBe('Initial Name');
			expect(state1.history?.future.length).toBe(0);

			// Perform second edit
			const state2 = reducer(state1, updatePackageProperty({
				property: 'name',
				value: 'Second Modification'
			}));

			expect(state2.pack?.name).toBe('Second Modification');
			expect(state2.history?.past.length).toBe(2);
			expect(state2.history?.past[1].pack.name).toBe('Modified Name');

			// Undo once
			const state3 = reducer(state2, undo());
			expect(state3.pack?.name).toBe('Modified Name');
			expect(state3.history?.past.length).toBe(1);
			expect(state3.history?.future.length).toBe(1);
			expect(state3.history?.future[0].pack.name).toBe('Second Modification');

			// Undo twice
			const state4 = reducer(state3, undo());
			expect(state4.pack?.name).toBe('Initial Name');
			expect(state4.history?.past.length).toBe(0);
			expect(state4.history?.future.length).toBe(2);
			expect(state4.history?.future[1].pack.name).toBe('Modified Name');

			// Redo once
			const state5 = reducer(state4, redo());
			expect(state5.pack?.name).toBe('Modified Name');
			expect(state5.history?.past.length).toBe(1);
			expect(state5.history?.future.length).toBe(1);

			// Redo twice
			const state6 = reducer(state5, redo());
			expect(state6.pack?.name).toBe('Second Modification');
			expect(state6.history?.past.length).toBe(2);
			expect(state6.history?.future.length).toBe(0);
		});

		test('undo/redo limits past history to 100 entries', () => {
			let state = initialState;
			for (let i = 1; i <= 105; i++) {
				state = reducer(state, updatePackageProperty({
					property: 'name',
					value: `Edit ${i}`
				}));
			}

			expect(state.pack?.name).toBe('Edit 105');
			expect(state.history?.past.length).toBe(100);
			// The oldest item remaining should be Edit 5 (since Edit 105 is current, past has Edit 5 to Edit 104)
			expect(state.history?.past[0].pack.name).toBe('Edit 5');
		});

		test('undo/redo restores selection state', () => {
			// Initially roundIndex is 0
			// Add a round
			const state1 = reducer(initialState, addRound());
			
			// Select round 1, then edit its name
			const stateWithSelection = {
				...state1,
				roundIndex: 1
			};
			const state2 = reducer(stateWithSelection, updateRoundProperty({
				roundIndex: 1,
				property: 'name',
				value: 'Round Two'
			}));

			// Change selection back to round 0
			const stateWithSelection2 = {
				...state2,
				roundIndex: 0
			};

			// Undo editing round 1's name
			const state3 = reducer(stateWithSelection2, undo());

			// The selection should be restored to roundIndex: 1 (where the edit happened)
			expect(state3.roundIndex).toBe(1);
			expect(state3.pack?.rounds[1].name).toBe('');
		});

		test('undo/redo restores zip files state', () => {
			const mockZip = new JSZip();
			mockZip.file('Images/test.png', 'test content');

			const stateWithZip = {
				...initialState,
				zip: mockZip
			};

			// Perform edit
			const state1 = reducer(stateWithZip, updatePackageProperty({
				property: 'name',
				value: 'New Name'
			}));

			// Simulate baseReducer's mutation of zip.files (adding a new file)
			mockZip.file('Audio/sound.mp3', 'sound content');

			// Perform second edit to snapshot the state with the added file
			const state2 = reducer(state1, updatePackageProperty({
				property: 'name',
				value: 'Another Name'
			}));

			expect(mockZip.file('Audio/sound.mp3')).not.toBeNull();

			// Undo the name change that happened after adding the file
			const state3 = reducer(state2, undo());

			// The zip files should still have 'Audio/sound.mp3'
			expect(mockZip.file('Audio/sound.mp3')).not.toBeNull();

			// Undo the name change that happened before adding the file
			const state4 = reducer(state3, undo());

			// The zip files should be restored to the state before sound.mp3 was added
			expect(mockZip.file('Audio/sound.mp3')).toBeNull();
			expect(mockZip.file('Images/test.png')).not.toBeNull();
		});
	});
});