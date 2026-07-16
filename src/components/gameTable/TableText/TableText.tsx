import * as React from 'react';
import State from '../../../state/State';
import { connect } from 'react-redux';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import Link from '../../common/Link/Link';
import searchOnlineUri from '../../../utils/searchOnlineUri';

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
			{props.isAnswer
				? (
					<Link className="clickableAnswer" href={searchOnlineUri(props.text)} target="_blank" rel="noopener noreferrer">
						{props.text}
					</Link>
				)
				: props.text}
		</AutoSizedText>
	);
}

export default connect(mapStateToProps)(TableText);
