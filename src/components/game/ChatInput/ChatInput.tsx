import { connect } from 'react-redux';
import * as React from 'react';
import { createRef } from 'react';
import roomActionCreators from '../../../state/room/roomActionCreators';
import State from '../../../state/State';
import { Dispatch, Action } from 'redux';
import Constants from '../../../model/enums/Constants';
import { EmojiClickData } from 'emoji-picker-react';
import ChatInputEmojiPicker from '../../common/ChatInputEmojiPicker/ChatInputEmojiPicker';
import localization from '../../../model/resources/localization';

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

export class ChatInput extends React.Component<ChatInputProps> {
	private readonly inputRef;

	constructor(props: ChatInputProps) {
		super(props);

		this.inputRef = createRef<HTMLInputElement>();
	}

	componentDidUpdate() {
		if (this.inputRef.current) {
			this.inputRef.current.focus();
		}
	}

	onMessageChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.props.onChatMessageChanged(e.target.value);
	};

	onMessageKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === Constants.KEY_ENTER_NEW) {
			if (this.props.isConnected) {
				this.props.onChatMessageSend();
			}

			e.preventDefault();
		}
	};

	onEmojiClick = (emojiData: EmojiClickData) => {
		this.props.onChatMessageChanged(this.props.message + emojiData.emoji);
	};

	render(): JSX.Element {
		return (
			<div className='roomChatBodyHost'>
				<input
					ref={this.inputRef}
					placeholder={localization.message}
					className={`gameInputBox ${this.props.isConnected ? '' : 'disconnected'}`}
					value={this.props.message}
					onChange={this.onMessageChanged}
					onKeyPress={this.onMessageKeyPress} />

				<ChatInputEmojiPicker onEmojiClick={this.onEmojiClick} />
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatInput);
