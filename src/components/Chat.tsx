import * as React from 'react';
import {connect} from 'react-redux';
import {Action, Dispatch} from 'redux';
import EmojiPicker, {EmojiClickData, EmojiStyle, SkinTones} from 'emoji-picker-react';
import State from '../state/State';
import Constants from '../model/enums/Constants';
import actionCreators from '../state/actionCreators';
import ChatMessage from '../model/ChatMessage';
import ChatLog from './common/ChatLog';

import './Chat.css';

interface ChatOwnProps {
	isConnected: boolean;
	onMessageChanged: (value: string) => void;
	onSendMessage: () => void;
}

interface ChatStateProps {
	currentMessage: string;
	messages: ChatMessage[];
}

interface ChatInputEmojiPickerProps {
	isEmojiPickerOpened: boolean;
	onEmojiPickerToggle: (isOpened: boolean) => void;
}

interface ChatProps extends ChatStateProps, ChatOwnProps, ChatInputEmojiPickerProps {

}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	currentMessage: state.online.currentMessage,
	messages: state.online.messages,
	isEmojiPickerOpened: state.online.isEmojiPickerOpened,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onMessageChanged: (value: string) => {
		dispatch(actionCreators.messageChanged(value));
	},
	onSendMessage: () => {
		dispatch((actionCreators.sendMessage() as object) as Action);
	},
	onEmojiPickerToggle: (isOpened: boolean) => {
		dispatch(actionCreators.onEmojiPickerToggle(isOpened));
	}
});

export function Chat(props: ChatProps): JSX.Element {
	const onMessageChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		props.onMessageChanged(e.target.value);
	};

	const onMessageKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === Constants.KEY_ENTER_NEW) {
			if (props.isConnected) {
				props.onSendMessage();
			}

			e.preventDefault();
		}
	};

	const onEmojiPickerButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		props.onEmojiPickerToggle(!props.isEmojiPickerOpened)
	};

	const onEmojiClick = (emojiData: EmojiClickData, e: MouseEvent) => {
		props.onMessageChanged(props.currentMessage + emojiData.emoji);
	};

	return (
		<div className="chatBodyHost">
			<ChatLog className="chat" messages={props.messages} />

			<input
				type='text'
				className={`message ${props.isConnected ? '' : 'disconnected'}`}
				value={props.currentMessage}
				onChange={onMessageChanged}
				onKeyPress={onMessageKeyPress}
			/>

			<button
				type={'button'}
				className={'standard chatEmojiPickerButton'}
				onClick={onEmojiPickerButtonClick}
				title={'Pick an emoji'}
			>🙂
			</button>

			{(() => {
				if (props.isEmojiPickerOpened) {
					return <EmojiPicker
						skinTonesDisabled={true}
						defaultSkinTone={SkinTones.NEUTRAL}
						emojiStyle={EmojiStyle.NATIVE}
						previewConfig={{ showPreview: false }}
						onEmojiClick={onEmojiClick}
						width={'100%'}
					/>;
				} else {
					return null;
				}
			})()}
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
