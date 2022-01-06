import * as React from 'react';
import ChatMessage from '../../model/ChatMessage';
import State from '../../state/State';
import { connect } from 'react-redux';
import ChatLog from '../common/ChatLog';

import './GameLogView.css';

interface GameLogViewProps {
	messages: ChatMessage[];
}

const mapStateToProps = (state: State) => ({
	messages: state.run.chat.messages
});

const mapDispatchToProps = () => ({

});

export function GameLogView(props: GameLogViewProps) {
	return (
		<div className="game__log">
			<ChatLog className="gameLog" messages={props.messages} />
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(GameLogView);
