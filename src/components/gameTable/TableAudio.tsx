import * as React from 'react';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import runActionCreators from '../../state/run/runActionCreators';

interface TableAudioProps {
	canTry: boolean;
	text: string;
	onMediaEnded: () => void;
}

const mapStateToProps = (state: State) => ({
	canTry: state.run.table.canPress,
	text: state.run.table.text
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onMediaEnded: () => {
		dispatch(runActionCreators.onMediaEnded() as object as Action);
	}
});

// tslint:disable-next-line: function-name
export function TableAudio(props: TableAudioProps) {
	const style: React.CSSProperties = {
		borderColor: props.canTry ? '#FFE682' : 'transparent'
	};

	return (
		<div className="tableBorder tableBorderCentered" style={style}>
			<audio autoPlay onEnded={e => props.onMediaEnded()}><source src={props.text} /></audio>
			<div className="centerBlock">
				<span className="clef rotate">&amp;</span>
			</div>
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(TableAudio);
