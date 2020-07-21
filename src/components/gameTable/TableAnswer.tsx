import * as React from 'react';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import AutoSizedText from '../common/AutoSizedText';

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
			<AutoSizedText id="tableText" className="tableText tableTextCenter" maxFontSize={144}>
				{props.text}
			</AutoSizedText>
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(TableAnswer);
