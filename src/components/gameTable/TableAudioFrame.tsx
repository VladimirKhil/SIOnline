import * as React from 'react';
import State from '../../state/State';
import { connect } from 'react-redux';
import TableAudio from './TableAudio';
import TableBorder from './TableBorder';

interface TableAudioFrameProps {
	audio: string;
}

const mapStateToProps = (state: State) => ({
	audio: state.run.table.audio,
});

export function TableAudioFrame(props: TableAudioFrameProps) {
	return (
		<TableBorder>
			<div className="centerBlock">
				<span className="clef rotate">&amp;</span>
			</div>
			<TableAudio source={props.audio} />
		</TableBorder>
	);
}

export default connect(mapStateToProps)(TableAudioFrame);
