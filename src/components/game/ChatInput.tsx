import { connect } from 'react-redux';
import * as React from 'react';
import roomActionCreators from '../../state/room/roomActionCreators';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import Constants from '../../model/enums/Constants';

import './ChatInput.css';
import EmojiPicker, { EmojiClickData, EmojiStyle, SkinTones } from 'emoji-picker-react';

interface ChatInputProps {
	isConnected: boolean;
	message: string;
	onChatMessageChanged: (message : string) => void;
	onChatMessageSend: () => void;
}

interface ChatInputEmojiPickerProps {
	isEmojiPickerOpened: boolean;
	onChatEmojiPickerToggle: (isOpened: boolean) => void;
}

interface RoomChatProps extends ChatInputProps, ChatInputEmojiPickerProps {

}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	message: state.room.chat.message,
	isEmojiPickerOpened: state.room.chat.isEmojiPickerOpened
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onChatMessageSend: () => {
		dispatch((roomActionCreators.runChatMessageSend() as object) as Action);
	},
	onChatMessageChanged: (message: string) => {
		dispatch(roomActionCreators.runChatMessageChanged(message));
	},
	onChatEmojiPickerToggle: (isOpened: boolean) => {
		dispatch(roomActionCreators.runEmojiPickerToggle(isOpened));
	},
});

export function ChatInput(props: RoomChatProps) {
	const onMessageChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		props.onChatMessageChanged(e.target.value);
	};

	const onMessageKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === Constants.KEY_ENTER_NEW) {
			if (props.isConnected) {
				props.onChatMessageSend();
			}

			e.preventDefault();
		}
	};

	const onEmojiPickerButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		props.onChatEmojiPickerToggle(!props.isEmojiPickerOpened)
	};

	const onEmojiClick = (emojiData: EmojiClickData, e: MouseEvent) => {
		props.onChatMessageChanged(props.message + emojiData.emoji);
	};

	return (
		<div className={'roomChatBodyHost'}>
			<input
				className={`gameInputBox gameMessage ${props.isConnected ? '' : 'disconnected'}`}
				value={props.message}
				onChange={onMessageChanged}
				onKeyPress={onMessageKeyPress} />

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

export default connect(mapStateToProps, mapDispatchToProps)(ChatInput);
