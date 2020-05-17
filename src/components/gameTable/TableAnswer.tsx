import * as React from 'react';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import AutoSizedText from '../autoSizedText/AutoSizedText';

interface TableAnswerProps {
	text: string;
}

const mapStateToProps = (state: State) => ({
	text: state.run.table.text
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({

});

// tslint:disable-next-line: function-name
export function TableAnswer(props: TableAnswerProps) {
	return (
		<div className="answerBlock">
			<AutoSizedText id="tableText" className="tableText tableTextCenter" text={props.text} maxFontSize={72} />
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(TableAnswer);
