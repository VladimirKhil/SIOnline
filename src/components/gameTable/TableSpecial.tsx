import * as React from 'react';
import State from '../../state/State';
import { connect } from 'react-redux';
import AutoSizedText from '../common/AutoSizedText';

interface TableSpecialProps {
	text: string;
}

const mapStateToProps = (state: State) => ({
	text: state.table.text,
});

export function TableSpecial(props: TableSpecialProps) {
	return (
		<div className="specialTable">
			<AutoSizedText className="centerBlock specialHost rotate" maxFontSize={288}>{props.text}</AutoSizedText>
		</div>
	);
}

export default connect(mapStateToProps)(TableSpecial);
