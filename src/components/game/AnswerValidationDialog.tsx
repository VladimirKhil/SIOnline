import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import State from '../../state/State';
import localization from '../../model/resources/localization';
import runActionCreators from '../../state/run/runActionCreators';
import Dialog from '../common/Dialog';

import './AnswerValidationDialog.css';

interface AnswerValidationDialogProps {
	header: string;
	message: string;
	rightAnswers: string[];
	wrongAnswers: string[];
	onApprove: () => void;
	onReject: () => void;
}

const mapStateToProps = (state: State) => ({
	header: state.run.validation.header,
	message: state.run.validation.message,
	rightAnswers: state.run.validation.rightAnswers,
	wrongAnswers: state.run.validation.wrongAnswers
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onApprove: () => {
		dispatch(runActionCreators.approveAnswer() as object as Action);
	},
	onReject: () => {
		dispatch(runActionCreators.rejectAnswer() as object as Action);
	}
});

export class AnswerValidationDialog extends React.Component<AnswerValidationDialogProps> {
	constructor(props: AnswerValidationDialogProps) {
		super(props);
	}

	render() {
		return (
			<Dialog id="answerValidationDialog" title={this.props.header} onClose={this.props.onReject}>
				<p>{this.props.message}</p>
				<div id="answersPanel">
					<div className="answers">
						<p>{localization.rightAnswers}</p>
						<ul>
							{this.props.rightAnswers.map((answer, index) => <li key={index}><span>{answer}</span></li>)}
						</ul>
					</div>
					<div className="answers">
						<p>{localization.wrongAnswers}</p>
						<ul>
							{this.props.wrongAnswers.map((answer, index) => <li key={index}><span>{answer}</span></li>)}
						</ul>
					</div>
				</div>
				<div className="buttonsPanel">
					<button onClick={() => this.props.onApprove()}>{localization.yes}</button>
					<button onClick={() => this.props.onReject()}>{localization.no}</button>
				</div>
			</Dialog>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(AnswerValidationDialog);
