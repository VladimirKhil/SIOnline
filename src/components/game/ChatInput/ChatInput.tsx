import * as React from 'react';
import Constants from '../../../model/enums/Constants';
import { EmojiClickData } from 'emoji-picker-react';
import ChatInputEmojiPicker from '../../common/ChatInputEmojiPicker/ChatInputEmojiPicker';
import localization from '../../../model/resources/localization';
import DownloadLogButton from '../DownloadLogButton/DownloadLogButton';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { addGameLog } from '../../../state/globalActions';
import { sendChatMessage, setChatMessage } from '../../../state/room2Slice';

import './ChatInput.scss';

export default function ChatInput() {
	const inputRef = React.useRef<HTMLInputElement>(null);
	const appDispatch = useAppDispatch();
	const room = useAppSelector(state => state.room2);
	const common = useAppSelector(state => state.common);

	const onMessageChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		appDispatch(setChatMessage(e.target.value));
	};

	const onMessageKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === Constants.KEY_ENTER_NEW) {
			if (common.isSIHostConnected) {
				appDispatch(sendChatMessage());
				appDispatch(addGameLog(`${room.name}: ${room.chat.message}`));
			}

			e.preventDefault();
		}
	};

	const onEmojiClick = (emojiData: EmojiClickData) => {
		appDispatch(setChatMessage(room.chat.message + emojiData.emoji));
	};

	return (
		<div className='roomChatBodyHost'>
			<div className='roomChatInput'>
				<input
					ref={inputRef}
					placeholder={localization.message}
					className={`gameInputBox ${common.isSIHostConnected ? '' : 'disconnected'}`}
					value={room.chat.message}
					onChange={onMessageChanged}
					onKeyPress={onMessageKeyPress} />

				<ChatInputEmojiPicker onEmojiClick={onEmojiClick} />
			</div>

			<DownloadLogButton />
		</div>
	);
}
