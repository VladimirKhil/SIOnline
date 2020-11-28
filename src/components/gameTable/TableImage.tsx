import * as React from 'react';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import TableBorder from './TableBorder';

interface TableImageProps {
	text: string;
}

const mapStateToProps = (state: State) => ({
	text: state.run.table.text
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({

});

export function TableImage(props: TableImageProps) {
	return (
		<TableBorder>
			<img className="inGameImg" src={props.text} />
		</TableBorder>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(TableImage);
