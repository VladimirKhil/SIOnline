import * as React from 'react';
import ChatLog from '../../common/ChatLog/ChatLog';
import hasUserMentioned from '../../../utils/MentionHelpers';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { setChatMessage, setChatScrollPosition } from '../../../state/room2Slice';

import './GameLogView.css';

export default function GameLogView() {
	const { name, chat, chatScrollPosition } = useAppSelector(state => ({
		name: state.room2.name,
		chat: state.room2.chat,
		chatScrollPosition: state.room2.chatScrollPosition
	}));

	const appDispatch = useAppDispatch();

	const appendMentionedUser = (nickname: string) => {
		if (hasUserMentioned(chat.message, nickname)) {
			return;
		}

		appDispatch(setChatMessage(`${chat.message} @${nickname} `));
	};

	const handleScrollPositionChanged = (position: number) => {
		appDispatch(setChatScrollPosition(position));
	};

	return (
		<div className="game__log">
			<ChatLog
				className="gameLog"
				messages={chat.messages}
				user={name}
				message={chat.message}
				onNicknameClick={appendMentionedUser}
				scrollPosition={chatScrollPosition}
				onScrollPositionChanged={handleScrollPositionChanged}
			/>
		</div>
	);
}
