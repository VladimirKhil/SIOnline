import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import localization from '../../../model/resources/localization';
import { sendAnswer } from '../../../state/room2Slice';

import './WrongAnswerButton.scss';

/**
 * Allows the answering player to admit a wrong answer without waiting for the showman decision.
 */
const WrongAnswerButton: React.FC = () => {
	const isConnected = useAppSelector(state => state.common.isSIHostConnected);
	const appDispatch = useAppDispatch();

	// Server treats an empty answer as a wrong one
	const onWrongAnswer = () => appDispatch(sendAnswer(''));

	return (
		<button
			type="button"
			className='wrongAnswerButton'
			disabled={!isConnected}
			onClick={onWrongAnswer}
		>
			{localization.wrongAnswer.toLocaleUpperCase()}
		</button>
	);
};

export default WrongAnswerButton;
