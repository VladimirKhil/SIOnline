import * as React from 'react';
import { useAppSelector } from '../../../state/hooks';
import localization from '../../../model/resources/localization';

import './QuestionCounter.scss';

export function QuestionCounter(): JSX.Element | null {
	const questionCounter = useAppSelector(state => state.room2.stage.questionCounter);

	return questionCounter > 0 ? (
		<div className='questionCounter' title={localization.questionsPlayed}>
			{questionCounter}
		</div>
	) : null;
}

export default QuestionCounter;