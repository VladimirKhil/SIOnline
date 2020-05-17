import * as React from 'react';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';

interface TableImageProps {
	canTry: boolean;
	text: string;
}

const mapStateToProps = (state: State) => ({
	canTry: state.run.table.canPress,
	text: state.run.table.text
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({

});

// tslint:disable-next-line: function-name
export function TableImage(props: TableImageProps) {
	const style: React.CSSProperties = {
		borderColor: props.canTry ? '#FFE682' : 'transparent'
	};

	return (
		<div className="tableBorder tableBorderCentered" style={style}>
			<img className="inGameImg" src={props.text} />
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(TableImage);
