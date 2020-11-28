import { connect } from 'react-redux';
import * as React from 'react';
import runActionCreators from '../../state/run/runActionCreators';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import Constants from '../../model/enums/Constants';

interface AnswerInputProps {
	isConnected: boolean;
	id: string;
	isAnswering: boolean;
	answer: string;
	onAnswerChanged: (answer: string) => void;
	sendAnswer: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	isAnswering: state.run.stage.isAnswering,
	answer: state.run.answer || ''
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onAnswerChanged: (answer: string) => {
		dispatch((runActionCreators.onAnswerChanged(answer) as object) as Action);
	},
	sendAnswer: () => {
		dispatch((runActionCreators.sendAnswer() as object) as Action);
	}
});

export function AnswerInput(props: AnswerInputProps) {
	const onAnswerChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		props.onAnswerChanged(e.target.value);
	};

	const onAnswerKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.charCode === Constants.KEY_ENTER) {
			if (props.isConnected) {
				props.sendAnswer();
			}

			e.preventDefault();
		}
	};

	return props.isAnswering ? (
		<input id={props.id} autoFocus className="gameInputBox" value={props.answer}
			onChange={onAnswerChanged} onKeyPress={onAnswerKeyPress} maxLength={250} />
	) : null;
}

export default connect(mapStateToProps, mapDispatchToProps)(AnswerInput);
