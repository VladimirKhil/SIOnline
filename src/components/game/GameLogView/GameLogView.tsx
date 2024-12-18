import * as React from 'react';
import ChatMessage from '../../../model/ChatMessage';
import State from '../../../state/State';
import { connect } from 'react-redux';
import ChatLog from '../../common/ChatLog/ChatLog';
import hasUserMentioned from '../../../utils/MentionHelpers';
import roomActionCreators from '../../../state/room/roomActionCreators';
import { Action, Dispatch } from 'redux';

import './GameLogView.css';

interface GameLogViewProps {
	messages: ChatMessage[];
	user: string;
	message: string;
	onMention: (message: string) => void;
}

const mapStateToProps = (state: State) => ({
	messages: state.room.chat.messages,
	user: state.room.name,
	message: state.room.chat.message,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onMention: (value: string) => {
		dispatch(roomActionCreators.runChatMessageChanged(value));
	}
});

export function GameLogView(props: GameLogViewProps) {
	const appendMentionedUser = (nickname: string) => {
		if (hasUserMentioned(props.message, nickname)) {
			return;
		}

		props.onMention(`${props.message} @${nickname} `)
	};

	return (
		<div className="game__log">
			<ChatLog
				className="gameLog"
				messages={props.messages}
				user={props.user}
				message={props.message}
				onNicknameClick={appendMentionedUser}
			/>
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(GameLogView);
