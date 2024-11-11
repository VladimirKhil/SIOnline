/* eslint-disable react/no-array-index-key */
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import State from '../../../state/State';
import localization from '../../../model/resources/localization';
import roomActionCreators from '../../../state/room/roomActionCreators';
import Dialog from '../../common/Dialog/Dialog';
import { useAppDispatch } from '../../../state/new/hooks';
import { approveAnswer, rejectAnswer } from '../../../state/new/room2Slice';
import { setValidationAnswersVisibility } from '../../../state/new/settingsSlice';

import './AnswerValidationDialog.scss';

interface AnswerValidationDialogProps {
	isConnected: boolean;
	header: string;
	name: string;
	answer: string;
	rightAnswers: string[];
	wrongAnswers: string[];
	showExtraRightButtons: boolean;
	areAnswersVisible: boolean;
	clearDecisions: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isSIHostConnected,
	header: state.room.validation.header,
	name: state.room.validation.name,
	answer: state.room.validation.answer,
	rightAnswers: state.room.validation.rightAnswers,
	wrongAnswers: state.room.validation.wrongAnswers,
	showExtraRightButtons: state.room.validation.showExtraRightButtons,
	areAnswersVisible: !state.settings.areValidationAnswersHidden,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	clearDecisions: () => {
		dispatch(roomActionCreators.clearDecisions());
	},
});

export function AnswerValidationDialog(props: AnswerValidationDialogProps): JSX.Element {
	const appDispatch = useAppDispatch();

	const onApprove = (factor: number) => {
		appDispatch(approveAnswer(factor));
		props.clearDecisions();
	};

	const onReject = (factor: number) => {
		appDispatch(rejectAnswer(factor));
		props.clearDecisions();
	};

	return (
		<Dialog
			className='answerValidationDialog'
			title={props.header}
			onClose={() => onReject(1.0)}>
			<div className='answerValidationDialogBody'>
				<div className='answersPanel'>
					<div className="answers">
						<p>{localization.rightAnswers}</p>

						<ul>
							{props.rightAnswers.map((answer, index) => <li key={index}><span>{answer}</span></li>)}
						</ul>
					</div>

					<div className="answers">
						<p>{localization.wrongAnswers}</p>

						<ul>
							{props.wrongAnswers.map((answer, index) => <li key={index}><span>{answer}</span></li>)}
						</ul>
					</div>
				</div>

				<div className='validationHeader'>
					<div className='mainMessage'>
						<p className='playerTitle'>{localization.validateAnswer}<b>{props.name}</b>{localization.validateAnswerEnd}</p>
						<p className='playerAnswer'>{props.answer}</p>
					</div>
				</div>

				{props.showExtraRightButtons ? <div className='buttonsPanel'>
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
							disabled={!props.isConnected}
							onClick={() => onApprove(1.0)}>
							{localization.yes}
						</button>

						{props.showExtraRightButtons ? (<>
							<button
								type="button"
								className='standard halfPrice extraButton acceptButton'
								disabled={!props.isConnected}
								onClick={() => onApprove(0.5)}>
								×0.5
							</button>

							<button
								type="button"
								className='standard doublePrice extraButton acceptButton'
								disabled={!props.isConnected}
								onClick={() => onApprove(2.0)}>
								×2
							</button>
						</>) : null}
					</div>

					<div className='buttonsArea'>
						<button
							type="button"
							className='standard validationButton rejectButton'
							disabled={!props.isConnected}
							onClick={() => onReject(1.0)}>
							{localization.no}
						</button>

						{props.showExtraRightButtons ? (<>
							<button
								type="button"
								className='standard halfPrice extraButton rejectButton'
								disabled={!props.isConnected}
								onClick={() => onReject(0.5)}>
								×0.5
							</button>

							<button
								type="button"
								className='standard doublePrice extraButton rejectButton'
								disabled={!props.isConnected}
								onClick={() => onReject(2.0)}>
								×2
							</button>
						</>) : null}
					</div>
				</div>
			</div>
		</Dialog>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(AnswerValidationDialog);
