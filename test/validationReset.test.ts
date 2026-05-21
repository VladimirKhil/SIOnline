import room2Reducer, {
	DecisionType,
	questionAnswersChanged,
	resetValidationState,
	stopValidation,
	validate,
} from '../src/state/room2Slice';
import { initialState } from '../src/state/State';

describe('validation reset', () => {
	it('should keep known answers when validation is stopped', () => {
		const stateWithValidation = room2Reducer(
			room2Reducer(
				room2Reducer(
					initialState.room2,
					questionAnswersChanged({ rightAnswers: ['Correct answer'], wrongAnswers: ['Wrong answer'] })
				),
				validate({
					header: 'Validation',
					name: 'Player 1',
					answer: 'Answer',
					message: 'Check answer',
					rightAnswers: ['Correct answer'],
					wrongAnswers: ['Wrong answer'],
					showExtraRightButtons: true,
				})
			),
			stopValidation()
		);

		expect(stateWithValidation.validation.header).toBe('');
		expect(stateWithValidation.validation.message).toBe('');
		expect(stateWithValidation.validation.rightAnswers).toEqual(['Correct answer']);
		expect(stateWithValidation.validation.wrongAnswers).toEqual(['Wrong answer']);
		expect(stateWithValidation.validation.queue).toEqual([]);
		expect(stateWithValidation.validation.showExtraRightButtons).toBe(false);
		expect(stateWithValidation.validation.newVersion).toBe(false);
		expect(stateWithValidation.stage.decisionType).toBe(DecisionType.None);
	});

	it('should clear known answers when room state is reinitialized', () => {
		const stateWithValidation = room2Reducer(
			room2Reducer(
				room2Reducer(
					initialState.room2,
					questionAnswersChanged({ rightAnswers: ['Correct answer'], wrongAnswers: ['Wrong answer'] })
				),
				validate({
					header: 'Validation',
					name: 'Player 1',
					answer: 'Answer',
					message: 'Check answer',
					rightAnswers: ['Correct answer'],
					wrongAnswers: ['Wrong answer'],
					showExtraRightButtons: true,
				})
			),
			resetValidationState()
		);

		expect(stateWithValidation.validation.header).toBe('');
		expect(stateWithValidation.validation.message).toBe('');
		expect(stateWithValidation.validation.rightAnswers).toEqual([]);
		expect(stateWithValidation.validation.wrongAnswers).toEqual([]);
		expect(stateWithValidation.validation.queue).toEqual([]);
		expect(stateWithValidation.validation.showExtraRightButtons).toBe(false);
		expect(stateWithValidation.validation.newVersion).toBe(false);
		expect(stateWithValidation.stage.decisionType).toBe(DecisionType.None);
	});
});