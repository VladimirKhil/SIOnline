import * as React from 'react';
import ChatMessage from '../../../model/ChatMessage';
import State from '../../../state/State';
import { connect } from 'react-redux';
import ChatLog from '../../common/ChatLog/ChatLog';
import hasUserMentioned from '../../../utils/MentionHelpers';
import roomActionCreators from '../../../state/room/roomActionCreators';
import { Action, Dispatch } from 'redux';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { setChatScrollPosition } from '../../../state/room2Slice';

import './GameLogView.css';

interface GameLogViewProps {
	messages: ChatMessage[];
	message: string;
	onMention: (message: string) => void;
}

const mapStateToProps = (state: State) => ({
	messages: state.room.chat.messages,
	message: state.room.chat.message,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onMention: (value: string) => {
		dispatch(roomActionCreators.runChatMessageChanged(value));
	}
});

export function GameLogView(props: GameLogViewProps) {
	const room = useAppSelector(state => state.room2);
	const appDispatch = useAppDispatch();

	const appendMentionedUser = (nickname: string) => {
		if (hasUserMentioned(props.message, nickname)) {
			return;
		}

		props.onMention(`${props.message} @${nickname} `);
	};

	const handleScrollPositionChanged = (position: number) => {
		appDispatch(setChatScrollPosition(position));
	};

	return (
		<div className="game__log">
			<ChatLog
				className="gameLog"
				messages={props.messages}
				user={room.name}
				message={props.message}
				onNicknameClick={appendMentionedUser}
				scrollPosition={room.chatScrollPosition}
				onScrollPositionChanged={handleScrollPositionChanged}
			/>
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(GameLogView);
