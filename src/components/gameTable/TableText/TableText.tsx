import * as React from 'react';
import State from '../../../state/State';
import { connect } from 'react-redux';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import ClickableAnswer from '../../common/ClickableAnswer/ClickableAnswer';

import './TableText.scss';

interface TableTextProps {
	text: string;
	isAnswer: boolean;
}

const mapStateToProps = (state: State) => ({
	text: state.table.text,
	isAnswer: state.table.isAnswer,
});

export function TableText(props: TableTextProps) {
	return (
		<AutoSizedText className="tableText fadeIn tableTextCenter margined" maxFontSize={72}>
			{props.isAnswer ? <ClickableAnswer text={props.text} /> : props.text}
		</AutoSizedText>
	);
}

export default connect(mapStateToProps)(TableText);
