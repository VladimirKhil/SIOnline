import React from 'react';
import localization from '../../../model/resources/localization';
import WrongAnswerButton from '../WrongAnswerButton/WrongAnswerButton';

import './OralAnswer.scss';

const OralAnswer: React.FC = () => (
	<div className='oral__answer'>
		<WrongAnswerButton />
		<span className='oral__answer__hint'>{localization.oralAnswerHint}</span>
	</div>
);

export default OralAnswer;