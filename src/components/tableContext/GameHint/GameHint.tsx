import * as React from 'react';
import State from '../../../state/State';
import { connect } from 'react-redux';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import localization from '../../../model/resources/localization';

import './GameHint.css';

interface GameHintProps {
	hint: string | null;
}

const mapStateToProps = (state: State) => ({
	hint: state.room.hint,
});

export function GameHint(props: GameHintProps) {
	return props.hint ? (
		<AutoSizedText className="gameHint" maxFontSize={31} title={localization.rightAnswer}>{props.hint}</AutoSizedText>
	) : null;
}

export default connect(mapStateToProps)(GameHint);
