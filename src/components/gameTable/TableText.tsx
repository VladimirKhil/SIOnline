import * as React from 'react';
import State from '../../state/State';
import { connect } from 'react-redux';
import AutoSizedText from '../common/AutoSizedText';

import './TableText.css';

interface TableTextProps {
	text: string;
	animateReading: boolean;
	readingSpeed: number;
}

const mapStateToProps = (state: State) => ({
	text: state.table.text,
	animateReading: state.table.animateReading,
	readingSpeed: state.room.readingSpeed,
});

export function TableText(props: TableTextProps) {
	return (
		<AutoSizedText className="tableText tableTextCenter margined" maxFontSize={144}>{props.text}</AutoSizedText>
	);
}

export default connect(mapStateToProps)(TableText);
