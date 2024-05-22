import * as React from 'react';
import AutoSizedText from '../../common/AutoSizedText';
import { connect } from 'react-redux';
import State from '../../../state/State';

import './ObjectView.css';

interface ObjectViewProps {
	header: string;
	text: string;
	hint: string;
	rotate: boolean;
}

const mapStateToProps = (state: State) => ({
	header: state.table.header,
	text: state.table.text,
	hint: state.table.hint,
	rotate: state.table.rotate,
});

export function ObjectView(props: ObjectViewProps) {
	return (
		<div className='objectView'>
			<div className='objectHeader'>{props.header}</div>

			<AutoSizedText
				className={`tableText tableTextCenter objectName ${props.rotate ? 'rotate' : ''}`}
				maxFontSize={288}>
				{props.text}
			</AutoSizedText>

			<div className={`objectHint ${props.hint.length === 0 ? 'empty' : ''} `}>{props.hint}</div>
		</div>
	);
}

export default connect(mapStateToProps)(ObjectView);
