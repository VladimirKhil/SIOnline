import * as React from 'react';
import { createRef } from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from 'redux';
import { EmojiClickData } from 'emoji-picker-react';
import State from '../state/State';
import Constants from '../model/enums/Constants';
import onlineActionCreators from '../state/online/onlineActionCreators';
import ChatMessage from '../model/ChatMessage';
import ChatLog from './common/ChatLog';
import ChatInputEmojiPicker from './common/ChatInputEmojiPicker';
import hasUserMentioned from '../utils/MentionHelpers';

import './Chat.css';

interface ChatOwnProps {
	isConnected: boolean;
	onMessageChanged: (value: string) => void;
	onSendMessage: () => void;
}

interface ChatStateProps {
	currentMessage: string;
	messages: ChatMessage[];
	currentUser: string;
}

interface ChatProps extends ChatStateProps, ChatOwnProps {

}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	currentMessage: state.online.currentMessage,
	messages: state.online.messages,
	currentUser: state.user.login,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onMessageChanged: (value: string) => {
		dispatch(onlineActionCreators.messageChanged(value));
	},
	onSendMessage: () => {
		dispatch((onlineActionCreators.sendMessage() as object) as Action);
	}
});

export class Chat extends React.Component<ChatProps> {
	private readonly inputRef;

	constructor(props: ChatProps) {
		super(props);

		this.inputRef = createRef<HTMLInputElement>();
	}

	componentDidUpdate() {
		if (this.inputRef.current) {
			this.inputRef.current.focus();
		}
	}

	onMessageChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.props.onMessageChanged(e.target.value);
	};

	onMessageKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === Constants.KEY_ENTER_NEW) {
			if (this.props.isConnected) {
				this.props.onSendMessage();
			}

			e.preventDefault();
		}
	};

	onEmojiClick = (emojiData: EmojiClickData) => {
		this.props.onMessageChanged(this.props.currentMessage + emojiData.emoji);
	};

	appendMentionedUser = (nickname: string) => {
		if (hasUserMentioned(this.props.currentMessage, nickname)) {
			return;
		}
		this.props.onMessageChanged(`${this.props.currentMessage} @${nickname} `);
	};

	render(): JSX.Element {
		return (
			<div className="chatBodyHost">
				<ChatLog
					className="chat"
					messages={this.props.messages}
					user={this.props.currentUser}
					message={this.props.currentMessage}
					onNicknameClick={this.appendMentionedUser}
				/>

				<div className='chat_bottom'>
					<ChatInputEmojiPicker onEmojiClick={this.onEmojiClick} />

					<input
						ref={this.inputRef}
						type='text'
						className={`message ${this.props.isConnected ? '' : 'disconnected'}`}
						value={this.props.currentMessage}
						aria-label='Message'
						onChange={this.onMessageChanged}
						onKeyPress={this.onMessageKeyPress}
					/>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
