import * as React from 'react';
import State from '../../state/State';
import { connect } from 'react-redux';
import TableBorder from './TableBorder';

import './TableHtml.css';

interface TableHtmlProps {
	text: string;
}

const mapStateToProps = (state: State) => ({
	text: state.run.table.text,
});

export function TableHtml(props: TableHtmlProps) {
	return (
		<TableBorder>
			<embed className='frame' src={props.text} />
		</TableBorder>
	);
}

export default connect(mapStateToProps)(TableHtml);
