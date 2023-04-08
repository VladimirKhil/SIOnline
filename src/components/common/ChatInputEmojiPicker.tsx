import * as React from 'react';
import { useState } from 'react';
import EmojiPicker, { EmojiClickData, EmojiStyle, SkinTones } from 'emoji-picker-react';
import localization from '../../model/resources/localization';
import './ChatInputEmojiPicker.css';

interface ChatInputEmojiPickerProps {
	onEmojiClick: (emojiData: EmojiClickData, e: MouseEvent) => void;
}
export default function ChatInputEmojiPicker(props: ChatInputEmojiPickerProps): JSX.Element {
	const [isEmojiPickerOpened, setIsEmojiPickerOpened] = useState(false);

	const onEmojiPickerButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		setIsEmojiPickerOpened(!isEmojiPickerOpened);
	};

	return (
		<div className={'pickerWrapper'}>
			<button
				type={'button'}
				className={'standard chatEmojiPickerButton'}
				onClick={onEmojiPickerButtonClick}
				title={localization.pickAnEmoji}
			>🙂
			</button>

			{(() => {
				if (isEmojiPickerOpened) {
					return <EmojiPicker
						skinTonesDisabled={true}
						defaultSkinTone={SkinTones.NEUTRAL}
						emojiStyle={EmojiStyle.NATIVE}
						previewConfig={{ showPreview: false }}
						onEmojiClick={props.onEmojiClick}
						width={'100%'}
					/>;
				} else {
					return null;
				}
			})()}
		</div>
	);
}
