import * as React from 'react';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import AutoSizedText from '../autoSizedText/AutoSizedText';

interface TablePartialTextProps {
	canTry: boolean;
	text: string;
	tail: string;
}

const mapStateToProps = (state: State) => ({
	canTry: state.run.table.canPress,
	text: state.run.table.text,
	tail: state.run.table.tail
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({

});

// tslint:disable-next-line: function-name
export function TablePartialText(props: TablePartialTextProps) {
	const style: React.CSSProperties = {
		borderColor: props.canTry ? '#FFE682' : 'transparent'
	};

	const innerText = <><span>{props.text}</span><span className="invisible">{props.tail}</span></>;

	return (
		<div className="tableBorder tableBorderCentered" style={style}>
			<AutoSizedText className="tableText" content={innerText} maxFontSize={72} />
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(TablePartialText);
