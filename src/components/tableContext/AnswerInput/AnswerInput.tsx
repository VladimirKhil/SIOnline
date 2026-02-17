import * as React from 'react';
import Constants from '../../../model/enums/Constants';
import localization from '../../../model/resources/localization';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { sendAnswer, updateAnswer } from '../../../state/room2Slice';

import './AnswerInput.scss';

export default function AnswerInput(): JSX.Element | null {
	const appDispatch = useAppDispatch();

	const { isConnected, answer, answerType } = useAppSelector(state => ({
		isConnected: state.common.isSIHostConnected,
		answer: state.room2.answer,
		answerType: state.room2.answerType,
	}));

	const onAnswerChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		appDispatch(updateAnswer(e.target.value));
	};

	const sendAnswer2 = () => {
		appDispatch(sendAnswer(answer));
	};

	const onAnswerKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === Constants.KEY_ENTER_NEW) {
			if (isConnected) {
				sendAnswer2();
			}

			e.preventDefault();
		}
	};

	return <div className='answerInputHost'>
		<input
			type={answerType === 'number' ? 'number' : 'text'}
			autoFocus
			className="answerInput"
			value={answer}
			onChange={onAnswerChanged}
			onKeyPress={onAnswerKeyPress}
			maxLength={250}
			placeholder={answerType === 'number' ? localization.inputNumber : localization.inputAnswer}
			autoComplete='off'
		/>

		<button
			type='button'
			className='sendAnswer mainAction active'
			title={localization.send}
			onClick={sendAnswer2}>
			<svg width="14" height="13" viewBox="0 0 14 13" fill="none">
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M8.85337 7.88091H0V5.11911H8.85337L5.77101 1.95288L7.67216 0L14 6.5L7.67216 13L5.77101 11.0471L8.85337 7.88091Z"
					fill="white"/>
			</svg>
		</button>
	</div>;
}
