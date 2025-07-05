import * as React from 'react';
import ChatLog from '../../common/ChatLog/ChatLog';
import hasUserMentioned from '../../../utils/MentionHelpers';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { setChatMessage, setChatScrollPosition } from '../../../state/room2Slice';

import './GameLogView.css';

export default function GameLogView() {
	const room = useAppSelector(state => state.room2);
	const appDispatch = useAppDispatch();

	const appendMentionedUser = (nickname: string) => {
		if (hasUserMentioned(room.chat.message, nickname)) {
			return;
		}

		appDispatch(setChatMessage(`${room.chat.message} @${nickname} `));
	};

	const handleScrollPositionChanged = (position: number) => {
		appDispatch(setChatScrollPosition(position));
	};

	return (
		<div className="game__log">
			<ChatLog
				className="gameLog"
				messages={room.chat.messages}
				user={room.name}
				message={room.chat.message}
				onNicknameClick={appendMentionedUser}
				scrollPosition={room.chatScrollPosition}
				onScrollPositionChanged={handleScrollPositionChanged}
			/>
		</div>
	);
}
