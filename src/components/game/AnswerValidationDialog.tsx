/* eslint-disable react/no-array-index-key */
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import State from '../../state/State';
import localization from '../../model/resources/localization';
import runActionCreators from '../../state/run/runActionCreators';
import Dialog from '../common/Dialog';
import settingsActionCreators from '../../state/settings/settingsActionCreators';

import './AnswerValidationDialog.css';

interface AnswerValidationDialogProps {
	isConnected: boolean;
	header: string;
	message: string;
	rightAnswers: string[];
	wrongAnswers: string[];
	areAnswersVisible: boolean;
	onApprove: () => void;
	onReject: () => void;
	onAnswersVisibilityChanged: (areAnswersVisible: boolean) => void; 
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	header: state.run.validation.header,
	message: state.run.validation.message,
	rightAnswers: state.run.validation.rightAnswers,
	wrongAnswers: state.run.validation.wrongAnswers,
	areAnswersVisible: !state.settings.areValidationAnswersHidden,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onApprove: () => {
		dispatch(runActionCreators.approveAnswer() as unknown as Action);
	},
	onReject: () => {
		dispatch(runActionCreators.rejectAnswer() as unknown as Action);
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
				<button type="button" className='standard' disabled={!props.isConnected} onClick={() => props.onApprove()}>{localization.yes}</button>
				<button type="button" className='standard' disabled={!props.isConnected} onClick={() => props.onReject()}>{localization.no}</button>
			</div>
		</Dialog>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(AnswerValidationDialog);
