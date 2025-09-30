/* eslint-disable react/no-array-index-key */
import * as React from 'react';
import localization from '../../../model/resources/localization';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { approveAnswer, rejectAnswer, setAreSumsEditable } from '../../../state/room2Slice';

import './AnswerValidation.scss';

export default function AnswerValidation(): JSX.Element {
	const appDispatch = useAppDispatch();
	const validation = useAppSelector(state => state.room2.validation);
	const common = useAppSelector(state => state.common);

	const [firstValidationItem] = validation.queue;

	const [buttonsBlocked, setButtonsBlocked] = React.useState(false);

	const blockButtons = () => {
		setButtonsBlocked(true);
		setTimeout(() => setButtonsBlocked(false), 500);
	};

	const onApprove = (factor: number) => {
		appDispatch(approveAnswer({ answer: firstValidationItem.answer, factor }));
		appDispatch(setAreSumsEditable(false));
		blockButtons();
	};

	const onReject = (factor: number) => {
		appDispatch(rejectAnswer({ answer: firstValidationItem.answer, factor }));
		appDispatch(setAreSumsEditable(false));
		blockButtons();
	};

	return (
		<div className='answerValidation'>
			<div className='answersPanel'>
				<div className="answers">
					<ul className='rightAnswers' title={localization.rightAnswers}>
						{validation.rightAnswers.map((answer, index) => <li key={index}><span>{answer}</span></li>)}
					</ul>
				</div>

				{validation.wrongAnswers.length > 0
				? <div className="answers">
						<ul className='wrongAnswers' title={localization.wrongAnswers}>
							{validation.wrongAnswers.map((answer, index) => <li key={index}><span>{answer}</span></li>)}
						</ul>
					</div>
				: null}
			</div>

			<div className='validationHeader'>
				{buttonsBlocked ? null : <div className='mainMessage'>
					<p className='playerTitle'>{localization.validateAnswer}<b>{firstValidationItem.name}</b>{localization.validateAnswerEnd}</p>
					<p className='playerAnswer'>{firstValidationItem.answer}</p>
				</div>}
			</div>

			{validation.showExtraRightButtons ? <div className='buttonsPanel'>
				<button
					type='button'
					className='standard cancelAnswer'
					title={localization.cancelAnswer}
					onClick={() => onReject(0)}
				>
					−0
				</button>
			</div> : null}

			<div className="buttonsPanel">
				<div className='buttonsArea'>
					<button
						type="button"
						className='standard validationButton acceptButton'
						disabled={!common.isSIHostConnected || buttonsBlocked}
						onClick={() => onApprove(1.0)}>
						{localization.yes}
					</button>

					{validation.showExtraRightButtons ? (<>
						<button
							type="button"
							className='standard halfPrice extraButton acceptButton'
							disabled={!common.isSIHostConnected || buttonsBlocked}
							onClick={() => onApprove(0.5)}>
							×0.5
						</button>

						<button
							type="button"
							className='standard doublePrice extraButton acceptButton'
							disabled={!common.isSIHostConnected || buttonsBlocked}
							onClick={() => onApprove(2.0)}>
							×2
						</button>
					</>) : null}
				</div>

				<div className='buttonsArea'>
					<button
						type="button"
						className='standard validationButton rejectButton'
						disabled={!common.isSIHostConnected || buttonsBlocked}
						onClick={() => onReject(1.0)}>
						{localization.no}
					</button>

					{validation.showExtraRightButtons ? (<>
						<button
							type="button"
							className='standard halfPrice extraButton rejectButton'
							disabled={!common.isSIHostConnected || buttonsBlocked}
							onClick={() => onReject(0.5)}>
							×0.5
						</button>

						<button
							type="button"
							className='standard doublePrice extraButton rejectButton'
							disabled={!common.isSIHostConnected || buttonsBlocked}
							onClick={() => onReject(2.0)}>
							×2
						</button>
					</>) : null}
				</div>
			</div>
		</div>
	);
}
