import * as React from 'react';
import { useState } from 'react';
import EmojiPicker, { EmojiClickData, EmojiStyle, SkinTones, Theme } from 'emoji-picker-react';
import localization from '../../../model/resources/localization';
import { connect } from 'react-redux';
import State from '../../../state/State';

import './ChatInputEmojiPicker.css';

interface ChatInputEmojiPickerProps {
	emojiCultures?: string[];

	onEmojiClick: (emojiData: EmojiClickData, e: MouseEvent) => void;
}

const mapStateToProps = (state: State) => ({
	emojiCultures: state.common.emojiCultures,
});

export function ChatInputEmojiPicker(props: ChatInputEmojiPickerProps): JSX.Element | null {
	const [isEmojiPickerOpened, setIsEmojiPickerOpened] = useState(false);

	const onEmojiPickerButtonClick = () => {
		setIsEmojiPickerOpened(!isEmojiPickerOpened);
	};

	if (props.emojiCultures && !props.emojiCultures.includes(localization.getLanguage())) {
		return null;
	}

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
						onEmojiClick={(d, e) => { props.onEmojiClick(d, e); setIsEmojiPickerOpened(false); }}
						width={'100%'}
						autoFocusSearch={false}
						theme={Theme.DARK}
					/>;
				} else {
					return null;
				}
			})()}
		</div>
	);
}

export default connect(mapStateToProps)(ChatInputEmojiPicker);
