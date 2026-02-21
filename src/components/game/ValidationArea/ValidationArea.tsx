import * as React from 'react';
import localization from '../../../model/resources/localization';
import State from '../../../state/State';
import { connect } from 'react-redux';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import AnswerValidation from '../AnswerValidation/AnswerValidation';
import { useAppSelector } from '../../../state/hooks';

import './ValidationArea.scss';

interface ValidationAreaProps {
	hint: string | null;
}

const mapStateToProps = (state: State) => ({
	hint: state.room.hint,
});

function getCompactView(hint: string | null): React.ReactNode {
	return <AutoSizedText className={`singleAnswer ${hint ? 'hasHint' : ''}`} maxFontSize={50} title={localization.rightAnswer}>
		{hint}
	</AutoSizedText>;
}

export function ValidationArea(props: ValidationAreaProps): JSX.Element {
	const validation = useAppSelector(state => state.room2.validation);

	return <div className="validationArea">
		{validation.queue.length > 0
			? <AnswerValidation />
			: getCompactView(props.hint)}
	</div>;
}

export default connect(mapStateToProps)(ValidationArea);