import * as React from 'react';
import State from '../../../state/State';
import { connect } from 'react-redux';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';

import './TableText.scss';

interface TableTextProps {
	text: string;
}

const mapStateToProps = (state: State) => ({
	text: state.table.text,
});

export function TableText(props: TableTextProps) {
	return (
		<AutoSizedText className="tableText tableTextCenter margined" maxFontSize={144}>{props.text}</AutoSizedText>
	);
}

export default connect(mapStateToProps)(TableText);
