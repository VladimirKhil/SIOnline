/* eslint-disable react/no-array-index-key */
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import State from '../../state/State';
import localization from '../../model/resources/localization';
import roomActionCreators from '../../state/room/roomActionCreators';
import Dialog from '../common/Dialog';
import settingsActionCreators from '../../state/settings/settingsActionCreators';

import './AnswerValidationDialog.css';

interface AnswerValidationDialogProps {
	isConnected: boolean;
	header: string;
	message: string;
	rightAnswers: string[];
	wrongAnswers: string[];
	showExtraRightButtons: boolean;
	areAnswersVisible: boolean;
	onApprove: (factor: number) => void;
	onReject: () => void;
	onAnswersVisibilityChanged: (areAnswersVisible: boolean) => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isSIHostConnected,
	header: state.room.validation.header,
	message: state.room.validation.message,
	rightAnswers: state.room.validation.rightAnswers,
	wrongAnswers: state.room.validation.wrongAnswers,
	showExtraRightButtons: state.room.validation.showExtraRightButtons,
	areAnswersVisible: !state.settings.areValidationAnswersHidden,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onApprove: (factor: number) => {
		dispatch(roomActionCreators.approveAnswer(factor) as unknown as Action);
	},
	onReject: () => {
		dispatch(roomActionCreators.rejectAnswer() as unknown as Action);
	},
	onAnswersVisibilityChanged: (areAnswersVisible: boolean) => {
		dispatch(settingsActionCreators.onValidationAnswersVisibilityChanged(areAnswersVisible));
	}
});

export function AnswerValidationDialog(props: AnswerValidationDialogProps): JSX.Element {
	return (
		<Dialog
			className={`answerValidationDialog ${props.areAnswersVisible ? '' : 'short'}`}
			title={props.header}
			onClose={props.onReject}>
			<div className='validationHeader'>
				<p>{props.message}</p>

				<button
					className='validationAnswersVisibilityButton'
					title={props.areAnswersVisible ? localization.hideAnswers : localization.showAnswers}
					onClick={() => props.onAnswersVisibilityChanged(!props.areAnswersVisible)}
				>
					👁
				</button>
			</div>

			{props.areAnswersVisible
				? (
				<div id="answersPanel">
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
				</div>)
				: null}

			<div className="buttonsPanel">
				<div className='rightPanel'>
					<button
						type="button"
						className='standard validationButton'
						disabled={!props.isConnected}
						onClick={() => props.onApprove(1.0)}>
						{localization.yes}
					</button>

					{props.showExtraRightButtons ? (<>
						<button
							type="button"
							className='standard halfPrice extraButton'
							disabled={!props.isConnected}
							onClick={() => props.onApprove(0.5)}>
							×0.5
						</button>

						<button
							type="button"
							className='standard doublePrice extraButton'
							disabled={!props.isConnected}
							onClick={() => props.onApprove(2.0)}>
							×2
						</button>
					</>) : null}
				</div>

				<button
					type="button"
					className='standard validationButton'
					disabled={!props.isConnected}
					onClick={() => props.onReject()}>
					{localization.no}
				</button>
			</div>
		</Dialog>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(AnswerValidationDialog);
