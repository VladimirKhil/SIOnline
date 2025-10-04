/* eslint-disable react/no-array-index-key */
import * as React from 'react';
import AnswerValidationBody from '../AnswerValidationBody/AnswerValidationBody';
import AnswerValidationButtons from '../AnswerValidationButtons/AnswerValidationButtons';

import './AnswerValidation.scss';

export default function AnswerValidation(): JSX.Element {
	return (
		<div className='answerValidation'>
			<AnswerValidationBody />
			<AnswerValidationButtons />
		</div>
	);
}
