import * as React from 'react';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import AutoSizedText from '../common/AutoSizedText';
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
export class TablePartialText extends React.Component<TablePartialTextProps> {
	constructor(props: TablePartialTextProps) {
		super(props);
	}

	render() {
		return (
			<TableBorder>
				<AutoSizedText className="tableText" maxFontSize={144}>
					<span>{this.props.text}</span><span className="invisible">{this.props.tail}</span>
				</AutoSizedText>
			</TableBorder>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(TablePartialText);
