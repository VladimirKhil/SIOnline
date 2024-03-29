﻿import * as React from 'react';
import State from '../../state/State';
import { connect } from 'react-redux';
import AutoSizedText from '../common/AutoSizedText';
import TableBorder from './TableBorder';

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
		<TableBorder>
			<AutoSizedText className="tableText tableTextCenter" maxFontSize={144}>{props.text}</AutoSizedText>
		</TableBorder>
	);
}

export default connect(mapStateToProps)(TableText);
