import * as React from 'react';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import AutoSizedText from '../autoSizedText/AutoSizedText';
import TableBorder from './TableBorder';

interface TablePartialTextProps {
	text: string;
	tail: string;
}

const mapStateToProps = (state: State) => ({
	text: state.run.table.text,
	tail: state.run.table.tail
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({

});

// tslint:disable-next-line: function-name
export function TablePartialText(props: TablePartialTextProps) {
	const innerText = <><span>{props.text}</span><span className="invisible">{props.tail}</span></>;

	return (
		<TableBorder>
			<AutoSizedText className="tableText" content={innerText} maxFontSize={144} />
		</TableBorder>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(TablePartialText);
