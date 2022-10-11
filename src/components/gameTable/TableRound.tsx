import * as React from 'react';
import State from '../../state/State';
import { connect } from 'react-redux';
import AutoSizedText from '../common/AutoSizedText';

import './TableRound.css';

interface TableRoundProps {
	text: string;
}

const mapStateToProps = (state: State) => ({
	text: state.run.table.text,
});

export function TableRound(props: TableRoundProps) {
	return (
		<AutoSizedText className="tableText tableTextCenter tableRound" maxFontSize={288}>{props.text}</AutoSizedText>
	);
}

export default connect(mapStateToProps)(TableRound);
