import * as React from 'react';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { approveAnswer, rejectAnswer, setAreSumsEditable } from '../../../state/room2Slice';
import localization from '../../../model/resources/localization';

import './AnswerValidationButtons.scss';

export default function AnswerValidationButtons(): JSX.Element {
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
		<div className='answerValidationButtons'>
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
