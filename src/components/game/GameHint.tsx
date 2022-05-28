import * as React from 'react';
import State from '../../state/State';
import { connect } from 'react-redux';
import AutoSizedText from '../common/AutoSizedText';

import './GameHint.css';

interface GameHintProps {
	hint: string | null;
}

const mapStateToProps = (state: State) => ({
	hint: state.run.hint
});

const mapDispatchToProps = () => ({

});

export function GameHint(props: GameHintProps) {
	return props.hint ? (
		<AutoSizedText className="gameHint" maxFontSize={31}>{props.hint}</AutoSizedText>
	) : null;
}

export default connect(mapStateToProps, mapDispatchToProps)(GameHint);
