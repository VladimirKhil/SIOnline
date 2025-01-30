import React from 'react';
import localization from '../../../model/resources/localization';

import './OralAnswer.scss';

const OralAnswer: React.FC = () => (
	<div className='oral__answer'>{localization.oralAnswerHint}</div>
);

export default OralAnswer;