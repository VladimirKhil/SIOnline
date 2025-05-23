import { connect } from 'react-redux';
import * as React from 'react';
import roomActionCreators from '../../../state/room/roomActionCreators';
import State from '../../../state/State';
import { Dispatch, Action } from 'redux';
import Constants from '../../../model/enums/Constants';
import { EmojiClickData } from 'emoji-picker-react';
import ChatInputEmojiPicker from '../../common/ChatInputEmojiPicker/ChatInputEmojiPicker';
import localization from '../../../model/resources/localization';
import DownloadLogButton from '../DownloadLogButton/DownloadLogButton';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { addGameLog } from '../../../state/room2Slice';

import './ChatInput.scss';

interface ChatInputProps {
	isConnected: boolean;
	message: string;
	onChatMessageChanged: (message : string) => void;
	onChatMessageSend: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isSIHostConnected,
	message: state.room.chat.message,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onChatMessageSend: () => {
		dispatch((roomActionCreators.runChatMessageSend() as object) as Action);
	},
	onChatMessageChanged: (message: string) => {
		dispatch(roomActionCreators.runChatMessageChanged(message));
	}
});

export const ChatInput: React.FC<ChatInputProps> = (props) => {
	const inputRef = React.useRef<HTMLInputElement>(null);
	const appDispatch = useAppDispatch();
	const myName = useAppSelector(state => state.room2.name);

	React.useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	});

	const onMessageChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		props.onChatMessageChanged(e.target.value);
	};

	const onMessageKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === Constants.KEY_ENTER_NEW) {
			if (props.isConnected) {
				props.onChatMessageSend();
				appDispatch(addGameLog(`${myName}: ${props.message}`));
			}

			e.preventDefault();
		}
	};

	const onEmojiClick = (emojiData: EmojiClickData) => {
		props.onChatMessageChanged(props.message + emojiData.emoji);
	};

	return (
		<div className='roomChatBodyHost'>
			<div className='roomChatInput'>
				<input
					ref={inputRef}
					placeholder={localization.message}
					className={`gameInputBox ${props.isConnected ? '' : 'disconnected'}`}
					value={props.message}
					onChange={onMessageChanged}
					onKeyPress={onMessageKeyPress} />

				<ChatInputEmojiPicker onEmojiClick={onEmojiClick} />
			</div>

			<DownloadLogButton />
		</div>
	);
};

export default connect(mapStateToProps, mapDispatchToProps)(ChatInput);
