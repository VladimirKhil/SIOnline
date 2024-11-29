import * as React from 'react';
import localization from '../../../model/resources/localization';
import State from '../../../state/State';
import { connect } from 'react-redux';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import AnswerValidation from '../AnswerValidation/AnswerValidation';

import './ValidationArea.scss';

interface ValidationAreaProps {
	isCompact: boolean;
	rightAnswers: string[];
	wrongAnswers: string[];
	hint: string | null;
	isAnswerValidationDialogVisible: boolean;
}

const mapStateToProps = (state: State) => ({
	isCompact: state.room.validation.isCompact,
	rightAnswers: state.room.validation.rightAnswers,
	wrongAnswers: state.room.validation.wrongAnswers,
	hint: state.room.hint,
	isAnswerValidationDialogVisible: state.room.validation.isVisible,
});

function getCompactView(hint: string | null): React.ReactNode {
	return <AutoSizedText className='singleAnswer' maxFontSize={50} title={localization.rightAnswer}>
		{hint}
	</AutoSizedText>;
}

export function ValidationArea(props: ValidationAreaProps): JSX.Element {
	return <div className="validationArea">
		{props.isAnswerValidationDialogVisible
		? <AnswerValidation />
		: getCompactView(props.hint)}
	</div>;
}

export default connect(mapStateToProps)(ValidationArea);