import * as React from 'react';
import localization from '../../../model/resources/localization';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import AnswerValidation from '../AnswerValidation/AnswerValidation';
import { useAppSelector } from '../../../state/hooks';

import './ValidationArea.scss';

function getCompactView(hint: string | null): React.ReactNode {
	return <AutoSizedText className={`singleAnswer ${hint ? 'hasHint' : ''}`} maxFontSize={50} title={localization.rightAnswer}>
		{hint}
	</AutoSizedText>;
}

export default function ValidationArea(): JSX.Element {
	const validation = useAppSelector(state => state.room2.validation);
	const hiddenComments = useAppSelector(state => state.room2.hiddenComments);
	const rightAnswer = validation.rightAnswers.length > 0 ? validation.rightAnswers[validation.rightAnswers.length - 1] : null;
	const hint = `${rightAnswer ? rightAnswer : ''}${hiddenComments ? ` (${hiddenComments})` : ''}`;

	return <div className="validationArea">
		{validation.queue.length > 0
			? <AnswerValidation />
			: getCompactView(hint)}
	</div>;
}