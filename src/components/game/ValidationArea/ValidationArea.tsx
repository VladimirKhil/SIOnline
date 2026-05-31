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

interface ValidationAreaProps {
	onlyHint?: boolean;
	className?: string;
}

export default function ValidationArea(props: ValidationAreaProps): JSX.Element {
	const validation = useAppSelector(state => state.room2.validation);
	const hiddenComments = useAppSelector(state => state.room2.hiddenComments);
	const hintShowman = useAppSelector(state => state.settings.appSettings.hintShowman);
	const rightAnswer = validation.rightAnswers.length > 0 ? validation.rightAnswers[0] : null;
	const hint = `${rightAnswer && hintShowman ? rightAnswer : ''}${hiddenComments ? ` (${hiddenComments})` : ''}`;

	return <div className={`validationArea ${props.className || ''}`}>
		{validation.queue.length > 0 && !props.onlyHint
			? <AnswerValidation />
			: getCompactView(hint)}
	</div>;
}
