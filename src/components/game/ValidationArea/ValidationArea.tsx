import * as React from 'react';
import localization from '../../../model/resources/localization';
import ContentGroup from '../../../model/ContentGroup';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import AnswerValidation from '../AnswerValidation/AnswerValidation';
import ClickableAnswer from '../../common/ClickableAnswer/ClickableAnswer';
import { useAppSelector } from '../../../state/hooks';
import PointAnswerHintView from './PointAnswerHintView';
import LayoutMode from '../../../model/enums/LayoutMode';

import './ValidationArea.scss';

function getCompactView(
	answer: string | null,
	comments: string,
	layoutMode: LayoutMode,
	content: ContentGroup[],
	answerDeviation: number,
): React.ReactNode {
	if (layoutMode === LayoutMode.OverlayPoints && answer) {
		return <PointAnswerHintView
			answer={answer}
			content={content}
			answerDeviation={answerDeviation}
			comments={comments}
		/>;
	}

	return <AutoSizedText className={`singleAnswer ${answer || comments ? 'hasHint' : ''}`} maxFontSize={50} title={localization.rightAnswer}>
		{answer ? <ClickableAnswer text={answer} /> : null}
		{comments ? ` (${comments})` : null}
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
	const layoutMode = useAppSelector(state => state.table.layoutMode);
	const content = useAppSelector(state => state.table.content);
	const answerDeviation = useAppSelector(state => state.table.answerDeviation);
	const rightAnswer = validation.rightAnswers.length > 0 ? validation.rightAnswers[0] : null;
	const hint = rightAnswer && hintShowman ? rightAnswer : null;

	return <div className={`validationArea ${props.className || ''}`}>
		{validation.queue.length > 0 && !props.onlyHint
			? <AnswerValidation />
			: getCompactView(hint, hiddenComments, layoutMode, content, answerDeviation)}
	</div>;
}
