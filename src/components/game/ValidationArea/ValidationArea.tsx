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
	return <AutoSizedText className='singleAnswer' maxFontSize={50} title={localization.rightAnswer}>
		{hint}
	</AutoSizedText>;
}

export function ValidationArea(props: ValidationAreaProps): JSX.Element {
	const room2 = useAppSelector(state => state.room2);

	return <div className="validationArea">
		{room2.validation.queue.length > 0
		? <AnswerValidation />
		: getCompactView(props.hint)}
	</div>;
}

export default connect(mapStateToProps)(ValidationArea);