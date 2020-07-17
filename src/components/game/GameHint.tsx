import * as React from 'react';
import ChatMessage from '../../model/ChatMessage';
import State from '../../state/State';
import { connect } from 'react-redux';
import { Action, Dispatch } from 'redux';

import './GameHint.css';
import AutoSizedText from '../autoSizedText/AutoSizedText';

interface GameHintProps {
	hint: string | null;
}

const mapStateToProps = (state: State) => ({
	hint: state.run.hint
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({

});

// tslint:disable-next-line: function-name
export function GameHint(props: GameHintProps) {
	return props.hint ? (
		<AutoSizedText className="gameHint" maxFontSize={31} text={props.hint} />
	) : null;
}

export default connect(mapStateToProps, mapDispatchToProps)(GameHint);
