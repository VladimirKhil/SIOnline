import * as React from 'react';
import { connect } from 'react-redux';
import TableAudio from './TableAudio';
import TableBorder from './TableBorder';

export function TableAudioFrame() {
	return (
		<TableBorder>
			<div className="centerBlock">
				<span className="clef rotate">&amp;</span>
			</div>
			<TableAudio />
		</TableBorder>
	);
}

export default connect()(TableAudioFrame);
